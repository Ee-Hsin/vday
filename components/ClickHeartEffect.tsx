"use client"

import { useEffect, useRef, useCallback } from "react"
import { VERT, FRAG } from "@/lib/webGL/ClickHeartEffect/shaders"
import { useWebGL } from "@/hooks/useWebGL"

// particle data on cpu side
interface ClickHeart {
  ox: number
  oy: number
  dx: number
  dy: number
  startTime: number
  duration: number
  initialScale: number
  initialRotation: number
  targetRotation: number
}

const MAX_PARTICLES = 300
const HEART_SIZE = 36

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export default function ClickHeartEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ClickHeart[]>([])
  const bufferRef = useRef<WebGLBuffer | null>(null)
  const rafRef = useRef<number>(0)
  const hasParticlesRef = useRef(false)
  const vertexDataRef = useRef<Float32Array | null>(null)
  const dprRef = useRef<number>(1)
  const unmountedRef = useRef(false)

  const { glRef, programRef, locRef, glReady } = useWebGL(canvasRef, VERT, FRAG)

  useEffect(() => {
    if (!glReady || !glRef.current) return
    const gl = glRef.current

    bufferRef.current = gl.createBuffer()
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const FLOATS_PER_VERT = 7
    const VERTS_PER_HEART = 6
    vertexDataRef.current = new Float32Array(
      MAX_PARTICLES * VERTS_PER_HEART * FLOATS_PER_VERT,
    )

    return () => {
      if (bufferRef.current) gl.deleteBuffer(bufferRef.current)
    }
  }, [glReady, glRef])

  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      dprRef.current = dpr
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const FLOATS_PER_VERT = 7
  const VERTS_PER_HEART = 6
  const FLOATS_PER_HEART = VERTS_PER_HEART * FLOATS_PER_VERT
  const DEG2RAD = Math.PI / 180
  const QUAD_VERTS = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]

  const loop = useCallback(
    (now: number) => {
      const particles = particlesRef.current
      const gl = glRef.current
      const canvas = canvasRef.current

      if (!gl || !canvas || !programRef.current) return

      let writeIdx = 0
      for (let i = 0; i < particles.length; i++) {
        const elapsed = (now - particles[i].startTime) / 1000
        if (elapsed < particles[i].duration) {
          particles[writeIdx++] = particles[i]
        }
      }
      particles.length = writeIdx

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      if (particles.length === 0) {
        hasParticlesRef.current = false
        return
      }

      rafRef.current = requestAnimationFrame(loop)

      gl.useProgram(programRef.current)
      gl.uniform2f(
        locRef.current.u_resolution as WebGLUniformLocation,
        canvas.width,
        canvas.height,
      )

      const dpr = dprRef.current
      const data = vertexDataRef.current!

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const t = Math.min((now - p.startTime) / 1000 / p.duration, 1)
        const e = easeOut(t)

        const cx = (p.ox + p.dx * e) * dpr
        const cy = (p.oy + p.dy * e) * dpr
        const scale = p.initialScale * (1 - e)
        const rotation =
          (p.initialRotation + (p.targetRotation - p.initialRotation) * e) *
          DEG2RAD
        const size = HEART_SIZE * scale * dpr
        const opacity = 1 - t * t

        const base = i * FLOATS_PER_HEART
        for (let v = 0; v < 6; v++) {
          const off = base + v * FLOATS_PER_VERT
          data[off] = QUAD_VERTS[v * 2]
          data[off + 1] = QUAD_VERTS[v * 2 + 1]
          data[off + 2] = cx
          data[off + 3] = cy
          data[off + 4] = size
          data[off + 5] = opacity
          data[off + 6] = rotation
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        data.subarray(0, particles.length * FLOATS_PER_HEART),
        gl.DYNAMIC_DRAW,
      )

      const stride = FLOATS_PER_VERT * 4
      const enable = (name: string, size: number, offset: number) => {
        const loc = locRef.current[name] as number
        // check if loc exists (hook safety)
        if (loc !== undefined && loc !== -1) {
          gl.enableVertexAttribArray(loc)
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4)
        }
      }

      enable("a_position", 2, 0)
      enable("a_center", 2, 2)
      enable("a_size", 1, 4)
      enable("a_opacity", 1, 5)
      enable("a_rotation", 1, 6)

      gl.drawArrays(gl.TRIANGLES, 0, particles.length * 6)
    },
    [glRef, programRef, locRef],
  )

  useEffect(() => {
    unmountedRef.current = false

    const handleClick = (e: MouseEvent) => {
      const now = performance.now()
      const particles = particlesRef.current

      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + Math.random() * 0.5
        const distance = 100 + Math.random() * 100
        const duration = 1.8 + Math.random() * 0.7
        const initialScale = 0.5 + Math.random() * 1

        const heart: ClickHeart = {
          ox: e.clientX,
          oy: e.clientY,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          startTime: now,
          duration,
          initialScale,
          initialRotation: Math.random() * 360,
          targetRotation: Math.random() * 720 - 360,
        }

        if (particles.length < MAX_PARTICLES) {
          particles.push(heart)
        } else {
          // recycle oldest
          let oldestIdx = 0
          let oldestTime = Infinity
          for (let j = 0; j < particles.length; j++) {
            const remaining =
              particles[j].duration - (now - particles[j].startTime) / 1000
            if (remaining < oldestTime) {
              oldestTime = remaining
              oldestIdx = j
            }
          }
          particles[oldestIdx] = heart
        }
      }

      // start render loop if not already running
      if (!hasParticlesRef.current) {
        hasParticlesRef.current = true
        if (!unmountedRef.current) {
          rafRef.current = requestAnimationFrame(loop)
        }
      }
    }

    window.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("click", handleClick)
      cancelAnimationFrame(rafRef.current)
      unmountedRef.current = true
    }
  }, [loop])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  )
}
