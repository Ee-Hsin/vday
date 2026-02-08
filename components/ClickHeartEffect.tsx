"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Particle data (CPU side) ────────────────────────────────────────────────
interface ClickHeart {
  ox: number; // origin x (px)
  oy: number; // origin y (px)
  dx: number; // target offset x (px)
  dy: number; // target offset y (px)
  startTime: number; // ms timestamp
  duration: number; // seconds
  initialScale: number;
  initialRotation: number; // degrees
  targetRotation: number; // degrees
}

const MAX_PARTICLES = 300; // caps memory even with rapid clicking
const HEART_SIZE = 36;

// ── Shaders ─────────────────────────────────────────────────────────────────
const VERT = `
  attribute vec2 a_position;   // unit quad (0‑1)
  attribute vec2 a_center;     // heart center in pixels
  attribute float a_size;      // size in pixels (36 * scale)
  attribute float a_opacity;
  attribute float a_rotation;  // radians

  uniform vec2 u_resolution;   // canvas width, height

  varying float v_opacity;
  varying vec2 v_uv;

  void main() {
    v_opacity = a_opacity;
    v_uv = a_position;

    // rotate around centre
    vec2 offset = a_position - 0.5;
    float c = cos(a_rotation);
    float s = sin(a_rotation);
    offset = vec2(offset.x * c - offset.y * s,
                  offset.x * s + offset.y * c);

    // pixel → clip‑space
    vec2 pixelPos = a_center + offset * a_size;
    vec2 clipPos = (pixelPos / u_resolution) * 2.0 - 1.0;
    clipPos.y = -clipPos.y; // flip Y (pixel Y‑down → GL Y‑up)

    gl_Position = vec4(clipPos, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  varying float v_opacity;
  varying vec2 v_uv;

  float heartSDF(vec2 p) {
    p = vec2(abs(p.x), p.y);
    float d;
    if (p.y + p.x > 1.0)
      d = sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    else
      d = sqrt(min(dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)),
                    dot(p - vec2(0.5, 0.5), p - vec2(0.5, 0.5)))) *
          sign(p.x - p.y);
    return d;
  }

  void main() {
    vec2 p = (v_uv - 0.5) * 2.4;
    p.y = -p.y + 0.2;

    float d = heartSDF(p);
    float alpha = 1.0 - smoothstep(-0.02, 0.02, d);

    // #b35151 = rgb(179, 81, 81)
    vec4 color = vec4(179.0/255.0, 81.0/255.0, 81.0/255.0, 1.0);
    color.a *= v_opacity * alpha;
    color.rgb *= color.a; // premultiply
    gl_FragColor = color;
  }
`;

// ── Easing: cubic‑bezier(0, 0, 0.58, 1) approximation ──────────────────────
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ── Component ───────────────────────────────────────────────────────────────
export default function ClickHeartEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ClickHeart[]>([]);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);
  const locRef = useRef<Record<string, number | WebGLUniformLocation | null>>(
    {},
  );
  const rafRef = useRef<number>(0);
  const hasParticlesRef = useRef(false);
  const vertexDataRef = useRef<Float32Array | null>(null);
  const dprRef = useRef<number>(1);
  const unmountedRef = useRef(false);

  const compileShader = useCallback(
    (gl: WebGLRenderingContext, src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    },
    [],
  );

  // ── Init WebGL ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    })!;
    glRef.current = gl;

    const vs = compileShader(gl, VERT, gl.VERTEX_SHADER);
    const fs = compileShader(gl, FRAG, gl.FRAGMENT_SHADER);
    const pgm = gl.createProgram()!;
    gl.attachShader(pgm, vs);
    gl.attachShader(pgm, fs);
    gl.linkProgram(pgm);
    gl.useProgram(pgm);
    programRef.current = pgm;

    locRef.current = {
      a_position: gl.getAttribLocation(pgm, "a_position"),
      a_center: gl.getAttribLocation(pgm, "a_center"),
      a_size: gl.getAttribLocation(pgm, "a_size"),
      a_opacity: gl.getAttribLocation(pgm, "a_opacity"),
      a_rotation: gl.getAttribLocation(pgm, "a_rotation"),
      u_resolution: gl.getUniformLocation(pgm, "u_resolution"),
    };

    bufferRef.current = gl.createBuffer();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Pre‑allocate vertex data
    const FLOATS_PER_VERT = 7;
    const VERTS_PER_HEART = 6;
    vertexDataRef.current = new Float32Array(
      MAX_PARTICLES * VERTS_PER_HEART * FLOATS_PER_VERT,
    );

    return () => {
      gl.deleteProgram(pgm);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (bufferRef.current) gl.deleteBuffer(bufferRef.current);
    };
  }, [compileShader]);

  // ── Resize (DPR‑aware for retina sharpness) ─────────────────────────
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Click handler (spawns 12 hearts) ────────────────────────────────────
  useEffect(() => {
    unmountedRef.current = false; // reset for StrictMode re-mount

    const handleClick = (e: MouseEvent) => {
      const now = performance.now();
      const particles = particlesRef.current;

      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + Math.random() * 0.5;
        const distance = 100 + Math.random() * 100;
        const duration = 1.8 + Math.random() * 0.7;
        const initialScale = 0.5 + Math.random() * 1;

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
        };

        if (particles.length < MAX_PARTICLES) {
          particles.push(heart);
        } else {
          // recycle oldest
          let oldestIdx = 0;
          let oldestTime = Infinity;
          for (let j = 0; j < particles.length; j++) {
            const remaining =
              particles[j].duration - (now - particles[j].startTime) / 1000;
            if (remaining < oldestTime) {
              oldestTime = remaining;
              oldestIdx = j;
            }
          }
          particles[oldestIdx] = heart;
        }
      }

      // Start render loop if not already running
      if (!hasParticlesRef.current) {
        hasParticlesRef.current = true;
        if (!unmountedRef.current) {
          rafRef.current = requestAnimationFrame(loop);
        }
      }
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafRef.current);
      unmountedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render loop (only runs while particles exist) ───────────────────────
  // Hoisted constants to avoid per‑frame allocation
  const FLOATS_PER_VERT = 7;
  const VERTS_PER_HEART = 6;
  const FLOATS_PER_HEART = VERTS_PER_HEART * FLOATS_PER_VERT;
  const DEG2RAD = Math.PI / 180;
  const QUAD_VERTS = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];

  const loop = useCallback((now: number) => {
    const particles = particlesRef.current;
    const gl = glRef.current;
    const canvas = canvasRef.current;

    if (!gl || !canvas) return;

    // ── Update & cull dead particles ────────────────────────────────────
    let writeIdx = 0;
    for (let i = 0; i < particles.length; i++) {
      const elapsed = (now - particles[i].startTime) / 1000;
      if (elapsed < particles[i].duration) {
        particles[writeIdx++] = particles[i];
      }
    }
    particles.length = writeIdx;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (particles.length === 0) {
      hasParticlesRef.current = false;
      return; // stop loop — no particles, no rAF
    }

    rafRef.current = requestAnimationFrame(loop);

    gl.useProgram(programRef.current);
    gl.uniform2f(
      locRef.current.u_resolution as WebGLUniformLocation,
      canvas.width,
      canvas.height,
    );

    const dpr = dprRef.current;
    const data = vertexDataRef.current!;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const t = Math.min((now - p.startTime) / 1000 / p.duration, 1);
      const e = easeOut(t);

      const cx = (p.ox + p.dx * e) * dpr;
      const cy = (p.oy + p.dy * e) * dpr;
      const scale = p.initialScale * (1 - e); // shrinks to 0
      const rotation =
        (p.initialRotation + (p.targetRotation - p.initialRotation) * e) *
        DEG2RAD;
      const size = HEART_SIZE * scale * dpr;
      const opacity = 1 - t * t; // gentle fade near end

      const base = i * FLOATS_PER_HEART;
      for (let v = 0; v < 6; v++) {
        const off = base + v * FLOATS_PER_VERT;
        data[off] = QUAD_VERTS[v * 2];
        data[off + 1] = QUAD_VERTS[v * 2 + 1];
        data[off + 2] = cx;
        data[off + 3] = cy;
        data[off + 4] = size;
        data[off + 5] = opacity;
        data[off + 6] = rotation;
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      data.subarray(0, particles.length * FLOATS_PER_HEART),
      gl.DYNAMIC_DRAW,
    );

    const stride = FLOATS_PER_VERT * 4;
    const enable = (name: string, size: number, offset: number) => {
      const loc = locRef.current[name] as number;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset * 4);
    };

    enable("a_position", 2, 0);
    enable("a_center", 2, 2);
    enable("a_size", 1, 4);
    enable("a_opacity", 1, 5);
    enable("a_rotation", 1, 6);

    gl.drawArrays(gl.TRIANGLES, 0, particles.length * 6);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: "block" }}
      />
    </div>
  );
}
