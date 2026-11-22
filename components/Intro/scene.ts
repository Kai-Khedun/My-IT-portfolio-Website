// WebGL intro scene (brief §5.2), ported from reference/current-prototype.html. Raw WebGL 1, no libraries.
// Background pass (glow, grain, vignette, post-hero grid), a dome grid that twists into a tunnel, and the
// LED coil whose dots stream into a three-arm thermal spiral as the hero scrolls.
import type { IntroState } from "./Intro";

// TODO(kai): to sample a photo instead of the coil, set this to its URL (front-facing, plain dark background).
const PORTRAIT: string = "";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const TAN = Math.tan((25 * Math.PI) / 180); // FOV 50°

const COMMON = `
vec3 rotXY(vec3 p,vec2 t){float cy=cos(t.x);float sy=sin(t.x);p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);float cx=cos(t.y);float sx=sin(t.y);return vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);}
vec3 iron(float h){
  h=clamp(h,0.0,1.0)*6.0;
  vec3 c0=vec3(0.06,0.08,0.20);vec3 c1=vec3(0.20,0.10,0.42);vec3 c2=vec3(0.55,0.10,0.52);
  vec3 c3=vec3(0.90,0.24,0.30);vec3 c4=vec3(1.00,0.50,0.14);vec3 c5=vec3(1.00,0.80,0.32);vec3 c6=vec3(1.00,0.97,0.88);
  if(h<1.0)return mix(c0,c1,h);
  if(h<2.0)return mix(c1,c2,h-1.0);
  if(h<3.0)return mix(c2,c3,h-2.0);
  if(h<4.0)return mix(c3,c4,h-3.0);
  if(h<5.0)return mix(c4,c5,h-4.0);
  return mix(c5,c6,h-5.0);
}`;

const BG_VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
const bgFs = (prec: string) => `precision ${prec} float;
uniform vec2 uRes;uniform float uTime;uniform float uDpr;uniform float uScroll;uniform float uGrid;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float gline(vec2 q,float cell){vec2 g=abs(fract(q/cell+0.5)-0.5)*cell*uDpr;return 1.0-smoothstep(0.0,max(1.0,uDpr*0.9),min(g.x,g.y));}
void main(){
  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);
  vec2 uv=p/uRes;
  vec2 c=(uv-0.5)*vec2(uRes.x/uRes.y,1.0);
  vec3 col=vec3(0.010,0.013,0.022);
  col+=vec3(0.030,0.045,0.085)*exp(-dot(c,c)*3.0);
  vec2 q=(p+vec2(0.0,uScroll))/uDpr;
  col+=vec3(0.34,0.48,0.74)*(gline(q,24.0)*0.035+gline(q,120.0)*0.065)*uGrid;
  float fr=mod(floor(uTime*24.0),61.0);
  col+=(hash(floor(p)+vec2(fr*7.13,fr*3.71))-0.5)*0.026;
  col*=1.0-0.38*pow(length(uv-0.5)*1.35,3.0);
  gl_FragColor=vec4(max(col,vec3(0.0)),1.0);
}`;

const LN_VS = `attribute vec2 aUV;
uniform float uE;uniform float uRot;uniform float uTwist;uniform float uAspect;uniform float uTanF;uniform float uCamZ;uniform vec2 uTilt;uniform float uA;
varying float vA;varying float vD;
${COMMON}
void main(){
  float lam=(aUV.x-0.5)*2.7;float phi=(aUV.y-0.5)*1.9;
  vec3 ps=7.0*vec3(sin(lam)*cos(phi),sin(phi),-cos(lam)*cos(phi));
  ps=rotXY(ps,uTilt*0.45);
  float th=aUV.x*6.2831853+aUV.y*uTwist+uRot;
  vec3 pt=vec3(2.3*cos(th),2.3*sin(th),mix(2.0,-18.0,aUV.y));
  pt=rotXY(pt,uTilt*0.15);
  vec3 pos=mix(ps,pt,uE);
  float zc=max(uCamZ-pos.z,0.05);
  vec2 ndc=pos.xy/(zc*uTanF);ndc.x/=uAspect;
  gl_Position=vec4(ndc,0.0,1.0);
  vA=uA*mix(smoothstep(14.0,4.5,zc),smoothstep(21.0,1.2,zc),uE);
  vD=clamp((zc-1.0)/19.0,0.0,1.0)*uE;
}`;
const LN_FS = `precision mediump float;
varying float vA;varying float vD;
void main(){gl_FragColor=vec4(mix(vec3(0.50,0.62,0.92),vec3(1.0,0.66,0.38),vD*0.7)*vA,1.0);}`;

const PT_VS = `attribute vec3 aBase;attribute vec4 aData;
uniform float uE;uniform float uFlow;uniform float uRot;uniform float uAspect;uniform float uTanF;uniform float uCamZ;uniform vec2 uTilt;
uniform float uSubW;uniform float uLed;uniform float uPx;uniform float uBoot;uniform vec2 uMouse;uniform float uA;uniform float uTime;
varying vec3 vC;varying float vA;
${COMMON}
float h1(float n){return fract(sin(n)*43758.5453);}
void main(){
  float b=aData.x;float s=aData.y;float ang=aData.z;float dl=aData.w;
  float extra=step(b,-0.5);
  vec3 p0=vec3(aBase.xy*uSubW,aBase.z*uSubW*0.24);
  p0.z+=sin(uTime*1.4+aBase.x*11.0+aBase.y*7.0)*0.010*uSubW;
  p0=rotXY(p0,uTilt);
  float sf=fract(s+uFlow);
  float z=mix(-18.0,2.2,sf);
  float rr=1.3+(h1(s*91.7+ang*13.1)-0.5)*1.0;
  float th=ang-z*0.45+uRot;
  vec3 p1=rotXY(vec3(rr*cos(th),rr*sin(th),z),uTilt*0.15);
  float k=clamp((uE-dl)/0.5,0.0,1.0);k=k*k*(3.0-2.0*k);
  k=max(k,extra);
  vec3 pos=mix(p0,p1,k);
  float sw=sin(k*3.14159)*0.45;
  pos.xy=vec2(pos.x*cos(sw)-pos.y*sin(sw),pos.x*sin(sw)+pos.y*cos(sw));
  float zc=uCamZ-pos.z;
  if(zc<0.12){gl_Position=vec4(2.0,2.0,2.0,1.0);gl_PointSize=0.0;vA=0.0;vC=vec3(0.0);return;}
  vec2 ndc=pos.xy/(zc*uTanF);ndc.x/=uAspect;
  vec2 dm=(ndc-uMouse)*vec2(uAspect,1.0);float md=length(dm);
  if(md<0.2&&md>0.0001){ndc+=(dm/md)*(0.2-md)*0.55*vec2(1.0/uAspect,1.0)*(1.0-k);}
  gl_Position=vec4(ndc,0.0,1.0);
  float sz=mix(uLed/zc,uPx*(5.0+3.5*h1(s*17.3))/zc,k);
  gl_PointSize=clamp(sz,1.0,60.0);
  float boot=step(h1(ang*37.1+s*11.3+3.7),uBoot);
  vec3 cSub=mix(vec3(0.28,0.38,0.62),vec3(0.90,0.94,1.0),b);
  float aSub=(0.16+0.84*b)*boot*(1.0-extra);
  vec3 cSp=iron(mix(0.98,0.22,sf));
  float aSp=smoothstep(0.0,0.14,sf)*(1.0-smoothstep(0.84,1.0,sf));
  aSp*=mix(1.0,smoothstep(0.15,0.9,uE),extra);
  vC=mix(cSub,cSp,k);
  vA=mix(aSub,aSp,k)*uA;
}`;
const PT_FS = `precision mediump float;
varying vec3 vC;varying float vA;uniform float uSq;
void main(){
  vec2 c=gl_PointCoord-0.5;
  float r=length(c);float d=max(abs(c.x),abs(c.y));
  float m=mix(1.0-smoothstep(0.18,0.5,r),1.0-smoothstep(0.33,0.47,d),uSq);
  if(m<=0.001)discard;
  gl_FragColor=vec4(vC*vA*m,1.0);
}`;

type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };

/**
 * Runs the scene on `canvas`, reading hero geometry and intro timing from `s`.
 * Calls `onReady(true)` after the first frame, or `onReady(false)` if WebGL is unavailable. Returns a stop function.
 */
export function startScene(canvas: HTMLCanvasElement, s: IntroState, onReady: (ok: boolean) => void): () => void {
  const root = document.documentElement;
  let ctx: WebGLRenderingContext | null = null;
  try {
    ctx = canvas.getContext("webgl", {
      antialias: true, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: "high-performance",
    });
  } catch {}
  if (!ctx) {
    onReady(false);
    return () => {};
  }
  const gl = ctx;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  const program = (vs: string, fs: string, names: string[]): Prog | null => {
    const v = compile(gl.VERTEX_SHADER, vs);
    const f = compile(gl.FRAGMENT_SHADER, fs);
    const p = gl.createProgram();
    if (!v || !f || !p) return null;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(p));
      return null;
    }
    return { p, u: Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) };
  };
  const hpf = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const bg = program(BG_VS, bgFs(hpf && hpf.precision > 0 ? "highp" : "mediump"), ["uRes", "uTime", "uDpr", "uScroll", "uGrid"]);
  const ln = program(LN_VS, LN_FS, ["uE", "uRot", "uTwist", "uAspect", "uTanF", "uCamZ", "uTilt", "uA"]);
  const pt = program(PT_VS, PT_FS, [
    "uE", "uFlow", "uRot", "uAspect", "uTanF", "uCamZ", "uTilt", "uSubW", "uLed", "uPx", "uBoot", "uMouse", "uA", "uTime", "uSq",
  ]);
  if (!bg || !ln || !pt) {
    onReady(false);
    return () => {};
  }
  const BG = bg, LN = ln, PT = pt;

  const buffer = (data: Float32Array) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  };
  const triBuf = buffer(new Float32Array([-1, -1, 3, -1, -1, 3]));

  // Dome grid: meridians and parallels as line segments in (u, v).
  const lv: number[] = [];
  const K = 28, SEG = 64, M = 15, SEGU = 80;
  for (let k = 0; k <= K; k++) for (let i = 0; i < SEG; i++) lv.push(k / K, i / SEG, k / K, (i + 1) / SEG);
  for (let m = 0; m <= M; m++) for (let i = 0; i < SEGU; i++) lv.push(i / SEGU, m / M, (i + 1) / SEGU, m / M);
  const lnBuf = buffer(new Float32Array(lv));
  const lnCount = lv.length / 2;

  let alive = true;
  let ptBase: WebGLBuffer | null = null;
  let ptData: WebGLBuffer | null = null;
  let ptCount = 0;
  let gridN = 116;

  // LED icon: draw the coil (or the portrait) offscreen and sample it into a G×G dot grid.
  function subjectPixels(G: number, done: (px: Uint8ClampedArray | null, portrait: boolean) => void) {
    const S = G * 4;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d")!;
    x.fillStyle = "#000";
    x.fillRect(0, 0, S, S);
    const drawCoil = () => {
      const T = 4.25, R = S * 0.4, sp = R / T, w = sp * 0.46;
      x.save();
      x.translate(S / 2, S / 2);
      x.beginPath();
      for (let a = 0; a <= Math.PI * 2 * T; a += 0.02) {
        const r = (sp * a) / (Math.PI * 2);
        if (a === 0) x.moveTo(r * Math.cos(a), r * Math.sin(a));
        else x.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      x.lineCap = "butt";
      x.lineJoin = "round";
      x.strokeStyle = "#fff";
      x.shadowColor = "rgba(255,255,255,.85)";
      x.shadowBlur = w * 0.75;
      x.lineWidth = w;
      x.stroke();
      x.shadowBlur = 0;
      x.lineWidth = w * 0.45;
      x.stroke();
      x.restore();
    };
    const finish = (portrait: boolean) => {
      const d = document.createElement("canvas");
      d.width = d.height = G;
      const dx = d.getContext("2d", { willReadFrequently: true })!;
      dx.imageSmoothingEnabled = true;
      dx.imageSmoothingQuality = "high";
      dx.drawImage(c, 0, 0, G, G);
      let px: Uint8ClampedArray | null = null;
      try {
        px = dx.getImageData(0, 0, G, G).data;
      } catch {}
      done(px, portrait);
    };
    if (!PORTRAIT) {
      drawCoil();
      finish(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const sc = Math.max(S / img.naturalWidth, S / img.naturalHeight);
      const w = img.naturalWidth * sc, h = img.naturalHeight * sc;
      x.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      finish(true);
    };
    img.onerror = () => {
      drawCoil();
      finish(false);
    };
    img.src = PORTRAIT;
  }

  function buildPoints(done: () => void) {
    gridN = innerWidth < 700 ? 88 : 116;
    const G = gridN;
    subjectPixels(G, (px, portrait) => {
      if (!alive) return;
      const base: number[] = [], dat: number[] = [];
      if (px) {
        for (let j = 0; j < G; j++)
          for (let i = 0; i < G; i++) {
            const o = (j * G + i) * 4;
            let b = (0.2126 * px[o] + 0.7152 * px[o + 1] + 0.0722 * px[o + 2]) / 255;
            const ux = (i + 0.5) / G - 0.5, uy = 0.5 - (j + 0.5) / G;
            if (portrait) b = clamp01((b - 0.08) * 1.45) * (1 - clamp01((Math.hypot(ux, uy) - 0.36) / 0.14));
            if (b < 0.1) continue;
            const arm = Math.floor(Math.random() * 3);
            base.push(ux, uy, b);
            dat.push(b, Math.random(), arm * 2.0944 + (Math.random() - 0.5) * 0.5, Math.random() * 0.32 + Math.hypot(ux, uy) * 0.4);
          }
      }
      // Spiral-only particles that fade in as the hero scrolls.
      const extras = innerWidth < 700 ? 3200 : 7000;
      for (let n = 0; n < extras; n++) {
        const arm = Math.floor(Math.random() * 3);
        base.push(0, 0, 0);
        dat.push(-1, Math.random(), arm * 2.0944 + (Math.random() - 0.5) * 0.6, 0);
      }
      if (ptBase) gl.deleteBuffer(ptBase);
      if (ptData) gl.deleteBuffer(ptData);
      ptBase = buffer(new Float32Array(base));
      ptData = buffer(new Float32Array(dat));
      ptCount = base.length / 3;
      done();
    });
  }

  const attr = (prog: Prog, name: string, buf: WebGLBuffer | null, size: number) => {
    const loc = gl.getAttribLocation(prog.p, name);
    if (loc < 0) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  const resetAttrs = () => {
    for (let i = 0; i < 4; i++) gl.disableVertexAttribArray(i);
  };

  let scale = 1, quality = 1, raf = 0, frames = 0, acc = 0, lastNow = 0;
  let ready = false, lost = false, shown = false;
  const t0 = performance.now();
  const heroP = () => clamp01((scrollY - s.top) / s.range);
  const st = { p: heroP(), rot: 0, flow: 0, kick: 0, lastSy: scrollY, tx: 0, ty: 0 };
  const ptr = { nx: 0, ny: 0, has: false };

  function resize() {
    scale = Math.max(0.5, Math.min(devicePixelRatio || 1, 1.75) * quality);
    canvas.width = Math.max(1, Math.round(innerWidth * scale));
    canvas.height = Math.max(1, Math.round(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    kick();
  }
  function kick() {
    if (!raf && alive && !lost && ready && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function frame(now: number) {
    raf = 0;
    const t = (now - t0) / 1000;
    const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 1 / 60;
    const sy = scrollY, vh = innerHeight;

    // Scroll drives icon -> spiral; the spiral keeps moving on its own.
    st.p += (heroP() - st.p) * Math.min(1, dt * 6);
    const e = easeIO(clamp01(st.p));
    const after = clamp01((sy - s.top - s.range) / (vh * 0.8));
    const vel = (sy - st.lastSy) / Math.max(dt, 0.001);
    st.lastSy = sy;
    st.kick += (Math.min(2, Math.abs(vel) * 0.003) - st.kick) * Math.min(1, dt * 4);
    if (s.done) {
      st.rot += (0.05 + 0.32 * e + st.kick * 0.5) * dt;
      st.flow += (0.01 + 0.045 * e + st.kick * 0.04) * dt;
    }
    const tx = (ptr.has ? ptr.nx * 0.38 : 0) + Math.sin(t * 0.4) * 0.1;
    const ty = (ptr.has ? -ptr.ny * 0.24 : 0) + Math.sin(t * 0.31) * 0.04;
    st.tx += (tx - st.tx) * Math.min(1, dt * 3);
    st.ty += (ty - st.ty) * Math.min(1, dt * 3);
    const boot = clamp01((now - s.at - 120) / 1100);
    const aspect = innerWidth / vh;
    const camZ = lerp(4.2, 2.6, e);
    const subW = Math.min(2.6, 2 * 4.2 * TAN * aspect * 0.78);
    const dim = lerp(1, 0.42, after);

    resetAttrs();
    gl.disable(gl.BLEND);
    gl.useProgram(BG.p);
    attr(BG, "a", triBuf, 2);
    gl.uniform2f(BG.u.uRes, canvas.width, canvas.height);
    gl.uniform1f(BG.u.uTime, t);
    gl.uniform1f(BG.u.uDpr, scale);
    gl.uniform1f(BG.u.uScroll, sy * scale);
    gl.uniform1f(BG.u.uGrid, after);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    resetAttrs();
    gl.useProgram(LN.p);
    attr(LN, "aUV", lnBuf, 2);
    gl.uniform1f(LN.u.uE, e);
    gl.uniform1f(LN.u.uRot, st.rot);
    gl.uniform1f(LN.u.uTwist, 9.1);
    gl.uniform1f(LN.u.uAspect, aspect);
    gl.uniform1f(LN.u.uTanF, TAN);
    gl.uniform1f(LN.u.uCamZ, camZ);
    gl.uniform2f(LN.u.uTilt, st.tx, st.ty);
    gl.uniform1f(LN.u.uA, 0.24 * dim * clamp01((now - s.at) / 900));
    gl.drawArrays(gl.LINES, 0, lnCount);

    resetAttrs();
    gl.useProgram(PT.p);
    attr(PT, "aBase", ptBase, 3);
    attr(PT, "aData", ptData, 4);
    gl.uniform1f(PT.u.uE, e);
    gl.uniform1f(PT.u.uFlow, st.flow);
    gl.uniform1f(PT.u.uRot, st.rot);
    gl.uniform1f(PT.u.uAspect, aspect);
    gl.uniform1f(PT.u.uTanF, TAN);
    gl.uniform1f(PT.u.uCamZ, camZ);
    gl.uniform2f(PT.u.uTilt, st.tx, st.ty);
    gl.uniform1f(PT.u.uSubW, subW);
    gl.uniform1f(PT.u.uLed, (((subW / gridN) * (canvas.height / 2)) / TAN) * 0.82);
    gl.uniform1f(PT.u.uPx, scale);
    gl.uniform1f(PT.u.uBoot, boot);
    gl.uniform2f(PT.u.uMouse, ptr.has ? ptr.nx : 9, ptr.has ? ptr.ny : 9);
    gl.uniform1f(PT.u.uA, dim);
    gl.uniform1f(PT.u.uTime, t);
    gl.uniform1f(PT.u.uSq, 1 - e);
    gl.drawArrays(gl.POINTS, 0, ptCount);

    if (!shown) {
      shown = true;
      root.classList.add("gl-on");
      onReady(true);
    }

    // Adaptive quality: drop the render scale 20% if frames average over 24ms across 90 frames.
    if (lastNow) {
      const fdt = now - lastNow;
      if (fdt < 250) {
        acc += fdt;
        frames++;
      }
      if (frames >= 90) {
        if (acc / frames > 24 && quality > 0.5) {
          quality *= 0.8;
          resize();
        }
        frames = acc = 0;
      }
    }
    lastNow = now;
    kick();
  }

  const onPointer = (ev: PointerEvent) => {
    ptr.nx = (ev.clientX / innerWidth) * 2 - 1;
    ptr.ny = 1 - (ev.clientY / innerHeight) * 2;
    ptr.has = ev.pointerType === "mouse";
  };
  const onLeave = () => {
    ptr.has = false;
  };
  let lastW = innerWidth;
  const onResize = () => {
    const crossed = innerWidth < 700 !== lastW < 700;
    lastW = innerWidth;
    resize();
    if (crossed) buildPoints(kick);
  };
  const onVisible = () => {
    if (!document.hidden) kick();
  };
  const onLost = (ev: Event) => {
    ev.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove("gl-on");
    if (!shown) onReady(false);
  };

  addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisible);
  canvas.addEventListener("webglcontextlost", onLost);
  buildPoints(() => {
    ready = true;
    resize();
  });

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    removeEventListener("pointermove", onPointer);
    document.removeEventListener("pointerleave", onLeave);
    removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisible);
    canvas.removeEventListener("webglcontextlost", onLost);
    root.classList.remove("gl-on");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
