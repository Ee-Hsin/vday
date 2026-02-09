export const VERT = /* glsl */ `
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
`

export const FRAG = /* glsl */ `
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
`
