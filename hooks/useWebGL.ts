import { useRef, useEffect, useState } from "react"

export const useWebGL = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  VERT: string,
  FRAG: string,
) => {
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const locRef = useRef<Record<string, number | WebGLUniformLocation | null>>(
    {},
  )

  // We need a state to trigger the consumer's useEffect once GL is ready
  const [glReady, setGlReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true, // Added to match your original quality
    })!
    glRef.current = gl

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const vs = createShader(gl.VERTEX_SHADER, VERT)
    const fs = createShader(gl.FRAGMENT_SHADER, FRAG)

    const pgm = gl.createProgram()!
    gl.attachShader(pgm, vs)
    gl.attachShader(pgm, fs)
    gl.linkProgram(pgm)
    gl.useProgram(pgm)
    programRef.current = pgm

    // Added all attributes used in your specific shaders
    locRef.current = {
      u_resolution: gl.getUniformLocation(pgm, "u_resolution"),
      a_position: gl.getAttribLocation(pgm, "a_position"),
      a_center: gl.getAttribLocation(pgm, "a_center"),
      a_size: gl.getAttribLocation(pgm, "a_size"),
      a_opacity: gl.getAttribLocation(pgm, "a_opacity"),
      a_rotation: gl.getAttribLocation(pgm, "a_rotation"),
    }

    setGlReady(true)

    return () => {
      gl.deleteProgram(pgm)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [canvasRef, VERT, FRAG])

  return { glRef, programRef, locRef, glReady }
}
