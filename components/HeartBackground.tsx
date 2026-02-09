"use client"

import { useEffect, useRef, useCallback } from "react"
import { VERT, FRAG } from "@/lib/webGL/HeartBackground/shaders"
import { useWebGL } from "@/hooks/useWebGL"

// particle data on cpu side
interface Heart {
  x: number // 0‑100  (percent of viewport width)
  y: number // 0‑100  (percent of viewport height)
  size: number // 15‑45  px
  opacity: number // 1 -> 0
  rotation: number // degrees
}

const MAX_HEARTS = 400

export default function HeartBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const heartsRef = useRef<Heart[]>([])
  const bufferRef = useRef<WebGLBuffer | null>(null)
  const rafRef = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)
  const prevTimeRef = useRef<number>(0)
  const vertexDataRef = useRef<Float32Array | null>(null)
  const dprRef = useRef<number>(1)

  const { glRef, programRef, locRef, glReady } = useWebGL(canvasRef, VERT, FRAG)

  const loop = useCallback(
    (now: number) => {
      rafRef.current = requestAnimationFrame(loop)

      const gl = glRef.current
      const canvas = canvasRef.current
      if (!gl || !canvas || !programRef.current) return

      const dt = Math.min((now - (prevTimeRef.current || now)) / 1000, 0.1)
      prevTimeRef.current = now

      const hearts = heartsRef.current

      const SPAWN_INTERVAL = 500
      if (now - lastSpawnRef.current >= SPAWN_INTERVAL) {
        lastSpawnRef.current = now
        if (hearts.length < MAX_HEARTS) {
          hearts.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 30 + 15,
            opacity: 1,
            rotation: Math.random() * 360,
          })
        } else {
          let minIdx = 0
          for (let i = 1; i < hearts.length; i++) {
            if (hearts[i].opacity < hearts[minIdx].opacity) minIdx = i
          }
          const h = hearts[minIdx]
          h.x = Math.random() * 100
          h.y = Math.random() * 100
          h.size = Math.random() * 30 + 15
          h.opacity = 1
          h.rotation = Math.random() * 360
        }
      }

      const DY_PER_S = 4
      const D_OPACITY_PER_S = 0.1
      const D_ROTATION_PER_S = 10
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

      const FLOATS_PER_VERT = 7
      const FLOATS_PER_HEART = 42
      const DEG2RAD = Math.PI / 180
      const quadVerts = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]

      const data = vertexDataRef.current!
      const dpr = dprRef.current

      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i]
        const cx = (h.x / 100) * 2 - 1
        const cy = 1 - (h.y / 100) * 2
        const rad = h.rotation * DEG2RAD
        const base = i * FLOATS_PER_HEART

        for (let v = 0; v < 6; v++) {
          const off = base + v * FLOATS_PER_VERT
          data[off] = quadVerts[v * 2]
          data[off + 1] = quadVerts[v * 2 + 1]
          data[off + 2] = cx
          data[off + 3] = cy
          data[off + 4] = h.size * dpr
          data[off + 5] = h.opacity
          data[off + 6] = rad
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        data.subarray(0, hearts.length * FLOATS_PER_HEART),
        gl.DYNAMIC_DRAW,
      )

      const stride = FLOATS_PER_VERT * 4
      const enable = (name: string, size: number, offset: number) => {
        const loc = locRef.current[name] as number
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

      gl.drawArrays(gl.TRIANGLES, 0, hearts.length * 6)
    },
    [glRef, programRef, locRef],
  )

  // setup buffers and start loop
  useEffect(() => {
    if (!glReady || !glRef.current) return
    const gl = glRef.current

    bufferRef.current = gl.createBuffer()
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const FLOATS_PER_HEART = 42
    vertexDataRef.current = new Float32Array(MAX_HEARTS * FLOATS_PER_HEART)

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (bufferRef.current) gl.deleteBuffer(bufferRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [glReady, glRef, loop])

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
