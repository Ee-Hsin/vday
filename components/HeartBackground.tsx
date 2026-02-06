"use client"

import { useEffect, useRef, useCallback } from "react"

// ── Heart particle data (CPU side) ──────────────────────────────────────────
interface Heart {
  x: number      // 0‑100  (percent of viewport width)
  y: number      // 0‑100  (percent of viewport height)
  size: number   // 10‑30  px
  opacity: number // 1 → 0
  rotation: number // degrees
}

const MAX_HEARTS = 400 // recycle pool – caps memory

// ── Shaders ─────────────────────────────────────────────────────────────────
const VERT = `
  attribute vec2 a_position;   // unit quad  (0‑1)
  attribute vec2 a_center;     // heart center in clip‑space (−1…1)
  attribute float a_size;      // size in pixels
  attribute float a_opacity;
  attribute float a_rotation;  // radians

  uniform vec2 u_resolution;   // canvas width, height

  varying float v_opacity;
  varying vec2 v_uv;

  void main() {
    v_opacity = a_opacity;
    v_uv = a_position;             // 0‑1 UV for heart SDF

    // rotate around centre
    vec2 offset = a_position - 0.5;
    float c = cos(a_rotation);
    float s = sin(a_rotation);
    offset = vec2(offset.x * c - offset.y * s,
                  offset.x * s + offset.y * c);

    // scale from pixels → clip‑space
    vec2 pixelSize = a_size / u_resolution * 2.0;
    vec2 pos = a_center + offset * pixelSize;

    gl_Position = vec4(pos, 0.0, 1.0);
  }
`

const FRAG = `
  precision mediump float;
  varying float v_opacity;
  varying vec2 v_uv;

  // Heart SDF matching the SVG path – centred on (0,0), unit radius ≈1
  float heartSDF(vec2 p) {
    p = vec2(abs(p.x), p.y);
    float d;
    if (p.y + p.x > 1.0)
      d = sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    else
      d = sqrt(min(dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)),
                    dot(p - vec2(0.5, 0.5) * 1.0, p - vec2(0.5, 0.5) * 1.0))) *
          sign(p.x - p.y);
    return d;
  }

  void main() {
    // Map UV (0‑1) to SDF space (≈ −1…1), flip Y so point faces down
    vec2 p = (v_uv - 0.5) * 2.4;
    p.y = -p.y + 0.2;            // shift so heart is centred nicely

    float d = heartSDF(p);
    float alpha = 1.0 - smoothstep(-0.02, 0.02, d);

    // rgba(217, 143, 143, 0.7) premultiplied with per‑heart opacity
    vec4 color = vec4(217.0/255.0, 143.0/255.0, 143.0/255.0, 0.7);
    color.a *= v_opacity * alpha;
    color.rgb *= color.a;         // premultiply for correct blending
    gl_FragColor = color;
  }
`

// ── Component ───────────────────────────────────────────────────────────────
export default function HeartBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // All mutable state lives in refs so we never trigger React re‑renders
  const heartsRef = useRef<Heart[]>([])
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const bufferRef = useRef<WebGLBuffer | null>(null)
  const locRef = useRef<Record<string, number | WebGLUniformLocation | null>>({})
  const rafRef = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)
  const prevTimeRef = useRef<number>(0)
  const vertexDataRef = useRef<Float32Array | null>(null) // pre‑allocated

  // ── Compile helper ──────────────────────────────────────────────────────
  const compileShader = useCallback(
    (gl: WebGLRenderingContext, src: string, type: number) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    },
    [],
  )

  // ── Init WebGL once ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    })!
    glRef.current = gl

    // Program
    const vs = compileShader(gl, VERT, gl.VERTEX_SHADER)
    const fs = compileShader(gl, FRAG, gl.FRAGMENT_SHADER)
    const pgm = gl.createProgram()!
    gl.attachShader(pgm, vs)
    gl.attachShader(pgm, fs)
    gl.linkProgram(pgm)
    gl.useProgram(pgm)
    programRef.current = pgm

    // Locations
    locRef.current = {
      a_position: gl.getAttribLocation(pgm, "a_position"),
      a_center: gl.getAttribLocation(pgm, "a_center"),
      a_size: gl.getAttribLocation(pgm, "a_size"),
      a_opacity: gl.getAttribLocation(pgm, "a_opacity"),
      a_rotation: gl.getAttribLocation(pgm, "a_rotation"),
      u_resolution: gl.getUniformLocation(pgm, "u_resolution"),
    }

    // Single interleaved VBO (dynamic)
    bufferRef.current = gl.createBuffer()

    // Blend for transparent hearts over transparent canvas
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    return () => {
      gl.deleteProgram(pgm)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      if (bufferRef.current) gl.deleteBuffer(bufferRef.current)
    }
  }, [compileShader])

  // ── Resize handler ──────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // ── Simulation + render loop ────────────────────────────────────────────
  useEffect(() => {
    const SPAWN_INTERVAL = 500       // ms between new hearts

    // Original rates: 0.2% / 50ms, 0.005 / 50ms, 0.5° / 50ms
    // Converted to per‑second for smooth delta‑time interpolation:
    const DY_PER_S = 0.2 / 0.05     // = 4 %/s
    const D_OPACITY_PER_S = 0.005 / 0.05 // = 0.1 /s
    const D_ROTATION_PER_S = 0.5 / 0.05  // = 10 °/s
    const DEG2RAD = Math.PI / 180

    const FLOATS_PER_VERT = 7
    const VERTS_PER_HEART = 6
    const FLOATS_PER_HEART = VERTS_PER_HEART * FLOATS_PER_VERT // 42

    // Pre‑allocate vertex buffer for MAX_HEARTS
    vertexDataRef.current = new Float32Array(MAX_HEARTS * FLOATS_PER_HEART)

    const quadVerts = [
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1,
    ] // flattened pairs

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop)

      // Delta time in seconds, capped to avoid spiral-of-death on tab switch
      const dt = Math.min((now - (prevTimeRef.current || now)) / 1000, 0.1)
      prevTimeRef.current = now

      const hearts = heartsRef.current

      // ── Spawn ───────────────────────────────────────────────────────────
      if (now - lastSpawnRef.current >= SPAWN_INTERVAL) {
        lastSpawnRef.current = now
        if (hearts.length < MAX_HEARTS) {
          hearts.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 20 + 10,
            opacity: 1,
            rotation: Math.random() * 360,
          })
        } else {
          // recycle lowest‑opacity heart
          let minIdx = 0
          for (let i = 1; i < hearts.length; i++) {
            if (hearts[i].opacity < hearts[minIdx].opacity) minIdx = i
          }
          const h = hearts[minIdx]
          h.x = Math.random() * 100
          h.y = Math.random() * 100
          h.size = Math.random() * 20 + 10
          h.opacity = 1
          h.rotation = Math.random() * 360
        }
      }

      // ── Physics (continuous delta‑time — updates every frame) ───────────
      let writeIdx = 0
      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i]
        h.y = (h.y - DY_PER_S * dt + 100) % 100
        h.opacity -= D_OPACITY_PER_S * dt
        h.rotation += D_ROTATION_PER_S * dt
        if (h.opacity > 0) {
          hearts[writeIdx++] = h
        }
      }
      hearts.length = writeIdx

      // ── Render ──────────────────────────────────────────────────────────
      const gl = glRef.current
      const canvas = canvasRef.current
      if (!gl || !canvas) return

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      if (hearts.length === 0) return

      gl.useProgram(programRef.current)
      gl.uniform2f(
        locRef.current.u_resolution as WebGLUniformLocation,
        canvas.width,
        canvas.height,
      )

      // Fill pre‑allocated vertex buffer (no allocation per frame)
      const data = vertexDataRef.current!
      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i]
        const cx = (h.x / 100) * 2 - 1
        const cy = 1 - (h.y / 100) * 2
        const rad = h.rotation * DEG2RAD
        const base = i * FLOATS_PER_HEART

        for (let v = 0; v < 6; v++) {
          const off = base + v * FLOATS_PER_VERT
          data[off    ] = quadVerts[v * 2]     // a_position.x
          data[off + 1] = quadVerts[v * 2 + 1] // a_position.y
          data[off + 2] = cx
          data[off + 3] = cy
          data[off + 4] = h.size
          data[off + 5] = h.opacity
          data[off + 6] = rad
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current)
      // Upload only the portion we actually use
      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, hearts.length * FLOATS_PER_HEART), gl.DYNAMIC_DRAW)

      const stride = FLOATS_PER_VERT * 4

      const enable = (name: string, size: number, offset: number) => {
        const loc = locRef.current[name] as number
        gl.enableVertexAttribArray(loc)
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4)
      }

      enable("a_position", 2, 0)
      enable("a_center", 2, 2)
      enable("a_size", 1, 4)
      enable("a_opacity", 1, 5)
      enable("a_rotation", 1, 6)

      gl.drawArrays(gl.TRIANGLES, 0, hearts.length * 6)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  )
}

