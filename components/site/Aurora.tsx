"use client";

import { useEffect, useRef, useState } from "react";

// A living aurora behind the hero, drawn with a WebGL fragment shader:
//  - four liquid glows (teal left, blue top-right, one under the highlights, one
//    roaming) drift on Lissajous paths while domain-warped noise keeps their
//    edges swirling like ink in water;
//  - every glow cycles through a cosmic palette (teal, mint, cyan, electric
//    blue, violet), each at its own offset, and the palette shifts with scroll;
//  - a flowing aurora ribbon with light rays crosses the top;
//  - the field bends towards the cursor, a soft light follows it, and a click
//    sends a ripple through it;
//  - it softens behind the hero text block (measured every frame), so the
//    headline and lede stay readable while the colour wraps around them.
// It renders at a fraction of the screen resolution (the glows are soft
// anyway), pauses when off-screen or in a background tab, lowers its resolution
// if frames get slow, and falls back to the CSS glows without WebGL.
// Under prefers-reduced-motion nothing moves: the colours just keep slowly
// shifting in place.

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uMoveTime;   // advances only while motion is allowed
uniform float uColorTime;  // always advances
uniform vec2 uMouse;       // 0..1 in canvas space, y up
uniform float uMouseOn;    // 0..1
uniform vec3 uClick;       // x, y (0..1), seconds since the click
uniform float uDark;       // 0 light .. 1 dark (eased)
uniform float uScroll;     // page scroll, in viewport heights
uniform vec4 uCalm;        // hero text block in canvas pixels (x0, y0, x1, y1), y up

// 2D simplex noise: Ian McEwan & Stefan Gustavson (Ashima Arts), MIT licence.
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    s += a * snoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return s;
}

// Cosmic palette, looped: teal, mint, cyan, electric blue, violet, indigo.
vec3 palette(float t) {
  t = fract(t) * 6.0;
  float f = smoothstep(0.0, 1.0, fract(t));
  float i = floor(t);
  vec3 teal = vec3(0.078, 0.659, 0.580);
  vec3 mint = vec3(0.184, 0.839, 0.627);
  vec3 cyan = vec3(0.133, 0.780, 0.933);
  vec3 blue = vec3(0.231, 0.482, 0.961);
  vec3 violet = vec3(0.600, 0.360, 0.960);
  vec3 indigo = vec3(0.376, 0.400, 0.945);
  vec3 a = teal;
  vec3 b = mint;
  if (i > 4.5) { a = indigo; b = teal; }
  else if (i > 3.5) { a = violet; b = indigo; }
  else if (i > 2.5) { a = blue; b = violet; }
  else if (i > 1.5) { a = cyan; b = blue; }
  else if (i > 0.5) { a = mint; b = cyan; }
  return mix(a, b, f);
}

float glow(vec2 q, vec2 c, float r) {
  vec2 d = q - c;
  return exp(-dot(d, d) / (r * r));
}

// 1 inside the hero text block, fading to 0 over a soft feathered edge.
float calmZone(vec2 px) {
  vec2 center = (uCalm.xy + uCalm.zw) * 0.5;
  vec2 halfSize = (uCalm.zw - uCalm.xy) * 0.5;
  vec2 d = abs(px - center) - halfSize;
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  return 1.0 - smoothstep(-0.04 * uRes.y, 0.1 * uRes.y, dist);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float t = uMoveTime * 1.35;

  // Liquid edges: warp the space with slowly flowing noise.
  vec2 w = vec2(fbm(p * 1.1 + vec2(0.0, t * 0.07)), fbm(p * 1.1 + vec2(5.2, 3.7 - t * 0.06)));
  vec2 q = p + w * 0.32;

  // The cursor gently pulls the field towards itself.
  vec2 m = vec2(uMouse.x * asp, uMouse.y);
  vec2 dm = q - m;
  float md2 = dot(dm, dm);
  q -= dm * 0.24 * exp(-md2 * 5.0) * uMouseOn;

  // Click ripple: an expanding ring that pushes the field outwards.
  float ring = 0.0;
  if (uClick.z < 3.0) {
    vec2 cp = vec2(uClick.x * asp, uClick.y);
    vec2 dc = p - cp;
    float d = length(dc);
    ring = exp(-pow((d - uClick.z * 0.6) / 0.08, 2.0)) * exp(-uClick.z * 1.3);
    q += (dc / max(d, 0.0001)) * ring * 0.06;
  }

  // Four glows on Lissajous paths, breathing in size.
  vec2 c1 = vec2(0.02 * asp, 0.72) + vec2(0.20 * sin(t * 0.31), 0.14 * cos(t * 0.23));
  vec2 c2 = vec2(0.99 * asp, 0.97) + vec2(0.22 * cos(t * 0.27 + 1.3), 0.12 * sin(t * 0.35 + 0.4));
  vec2 c3 = vec2(0.52 * asp, 0.40) + vec2(0.30 * sin(t * 0.19 + 2.1), 0.14 * sin(t * 0.41 + 0.7));
  vec2 c4 = vec2(0.80 * asp, 0.52) + vec2(0.26 * cos(t * 0.23 + 4.0), 0.18 * sin(t * 0.17 + 2.5));
  float b1 = glow(q, c1, 0.42 + 0.06 * sin(t * 0.50));
  float b2 = glow(q, c2, 0.44 + 0.06 * cos(t * 0.45 + 1.0));
  float b3 = glow(q, c3, 0.30 + 0.05 * sin(t * 0.60 + 2.0)) * 0.7;
  float b4 = glow(q, c4, 0.26 + 0.05 * cos(t * 0.55 + 3.0)) * 0.55;
  float bm = exp(-md2 / 0.03) * uMouseOn;

  // Aurora ribbon with vertical light rays across the top.
  float ry = 0.80 + 0.07 * sin(p.x * 1.8 + t * 0.40) + 0.05 * snoise(vec2(p.x * 0.9 - t * 0.10, t * 0.07));
  float band = exp(-pow((q.y - ry) / 0.075, 2.0));
  float rays = 0.55 + 0.45 * snoise(vec2(p.x * 7.0 + t * 0.25, q.y * 2.0 - t * 0.10));
  float rib = band * rays * 0.55;

  // Every glow cycles through the palette at its own offset; scrolling shifts it.
  float k = uColorTime * 0.036 + uScroll * 0.18;
  vec3 col = palette(k) * b1
           + palette(k + 0.42) * b2
           + palette(k + 0.21) * b3
           + palette(k + 0.66) * b4
           + palette(k + 0.30 + p.x * 0.12) * rib;
  float a = b1 + b2 + b3 + b4 + rib;

  vec3 c = col / max(a, 0.0001);
  float alpha = (1.0 - exp(-a * 1.25)) * mix(0.40, 0.62, uDark);

  // Cursor light and click ripple sit on top, so they show even over bright glows.
  float lit = bm * mix(0.22, 0.32, uDark) + ring * 0.45;
  vec3 lightCol = mix(palette(k + 0.12), vec3(1.0), 0.35);
  c = mix(c, lightCol, clamp(lit / max(alpha + lit, 0.0001), 0.0, 1.0));
  alpha += lit * (1.0 - alpha);

  // Keep the hero text readable: the aurora wraps around it instead of washing it out.
  alpha *= 1.0 - calmZone(gl_FragCoord.xy) * mix(0.8, 0.58, uDark);
  c = mix(mix(c, vec3(1.0), 0.10), c, uDark);

  // Interleaved-gradient-noise dither: no banding in the dark gradients.
  float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  alpha = clamp(alpha + (n - 0.5) / 255.0, 0.0, 1.0);
  c += (n - 0.5) / 255.0;

  gl_FragColor = vec4(c * alpha, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[aurora] shader failed to compile:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[aurora] program failed to link:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Frame-rate independent easing towards a target. */
const approach = (value: number, target: number, rate: number, dt: number) =>
  value + (target - value) * (1 - Math.exp(-rate * dt));

export function Aurora({ fallback }: { fallback: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    const program = gl ? createProgram(gl) : null;
    if (!gl || !program) {
      setFailed(true);
      return;
    }

    // One triangle that covers the whole canvas.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes");
    const uMoveTime = u("uMoveTime");
    const uColorTime = u("uColorTime");
    const uMouse = u("uMouse");
    const uMouseOn = u("uMouseOn");
    const uClick = u("uClick");
    const uDark = u("uDark");
    const uScroll = u("uScroll");
    const uCalm = u("uCalm");
    const heroCopy = document.querySelector<HTMLElement>(".hero-copy");

    // ---- state
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isDark = () => document.documentElement.getAttribute("data-theme") !== "light";
    let reduced = reducedQuery.matches;
    let motion = reduced ? 0 : 1;
    let dark = isDark() ? 1 : 0;
    let moveTime = 0;
    let colorTime = Math.random() * 60; // a different colour mood on every visit
    const mouse = { x: 0.5, y: 0.6, on: 0, tx: 0.5, ty: 0.6, ton: 0 };
    const click = { x: 0.5, y: 0.5, age: 99 };
    let inView = true;
    let scale = window.innerWidth < 700 ? 0.34 : 0.45;
    let slowFrames = 0;
    let lastDraw = 0;
    let raf = 0;
    let ready = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * scale));
      const h = Math.max(1, Math.round(rect.height * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    resize();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!inView || document.hidden) {
        lastDraw = now;
        return;
      }
      // Reduced motion: only the colours change, so a slow frame rate is plenty.
      if (reduced && now - lastDraw < 66) return;
      const dt = lastDraw ? Math.min((now - lastDraw) / 1000, 0.1) : 1 / 60;
      lastDraw = now;

      // Adaptive quality: if frames stay slow, render at a lower resolution.
      slowFrames = dt > 1 / 38 && !reduced ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && scale > 0.22) {
        scale *= 0.8;
        slowFrames = 0;
        resize();
      }

      motion = approach(motion, reduced ? 0 : 1, 2.5, dt);
      dark = approach(dark, isDark() ? 1 : 0, 4, dt);
      mouse.x = approach(mouse.x, mouse.tx, 5, dt);
      mouse.y = approach(mouse.y, mouse.ty, 5, dt);
      mouse.on = approach(mouse.on, reduced ? 0 : mouse.ton, 3, dt);
      moveTime = (moveTime + dt * motion) % 3600;
      colorTime = (colorTime + dt * (reduced ? 0.6 : 1)) % 3600;
      click.age += dt;

      // Where the hero text sits, in canvas pixels (y up). Read before writing styles.
      const cRect = canvas.getBoundingClientRect();
      const tRect = heroCopy?.getBoundingClientRect();
      const sx = canvas.width / Math.max(1, cRect.width);
      const sy = canvas.height / Math.max(1, cRect.height);
      const calm = tRect
        ? [
            (tRect.left - cRect.left) * sx,
            (cRect.bottom - tRect.bottom) * sy,
            (tRect.right - cRect.left) * sx,
            (cRect.bottom - tRect.top) * sy,
          ]
        : [-9999, -9999, -9998, -9998];

      const scroll = window.scrollY / Math.max(1, window.innerHeight);
      // Parallax: the aurora drifts a little slower than the page.
      canvas.style.transform = motion > 0.01 ? `translate3d(0, ${(window.scrollY * 0.3 * motion).toFixed(1)}px, 0)` : "";

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uMoveTime, moveTime);
      gl.uniform1f(uColorTime, colorTime);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uMouseOn, mouse.on);
      gl.uniform3f(uClick, click.x, click.y, reduced ? 99 : click.age);
      gl.uniform1f(uDark, dark);
      gl.uniform1f(uScroll, scroll);
      gl.uniform4f(uCalm, calm[0], calm[1], calm[2], calm[3]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!ready) {
        ready = true;
        canvas.classList.add("is-ready");
      }
    };
    raf = requestAnimationFrame(draw);

    // ---- inputs
    const toCanvas = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      return { x, y, inside: x >= 0 && x <= 1 && y >= 0 && y <= 1 };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const pt = toCanvas(e.clientX, e.clientY);
      mouse.tx = pt.x;
      mouse.ty = pt.y;
      mouse.ton = pt.inside ? 1 : 0;
    };
    const onPointerDown = (e: PointerEvent) => {
      const pt = toCanvas(e.clientX, e.clientY);
      if (!pt.inside) return;
      click.x = pt.x;
      click.y = pt.y;
      click.age = 0;
    };
    const onLeave = () => {
      mouse.ton = 0;
    };
    const onReducedChange = () => {
      reduced = reducedQuery.matches;
    };
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFailed(true);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    reducedQuery.addEventListener("change", onReducedChange);
    canvas.addEventListener("webglcontextlost", onContextLost);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      reducedQuery.removeEventListener("change", onReducedChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      resizeObserver.disconnect();
      io.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  if (failed) return <>{fallback}</>;
  return <canvas ref={canvasRef} className="aurora" />;
}
