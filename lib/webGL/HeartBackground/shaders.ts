export const VERT = /* glsl */ `
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
`;

export const FRAG = /* glsl */ `
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
`;