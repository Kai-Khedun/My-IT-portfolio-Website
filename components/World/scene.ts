// The road-trip world: a soft, painted valley in the spirit of hand-drawn summer films. A country road winds
// from a meadow, over a hilltop lookout, down to the sea. Scroll drives the car; the hilltop is where the
// project ring turns around you; the road ends at a lighthouse. Day and night share one scene.
// Plain three.js, no post-processing. Everything is generated here: no models, no textures to download.
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  Float32BufferAttribute,
  FogExp2,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RedFormat,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SpotLight,
  Vector3,
  WebGLRenderer,
  BoxGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/** What the page asks for. The world eases towards these every frame. */
export type Drive = {
  d: number; // car distance along the road, 0 (meadow) → D_END (sea)
  hill: number; // 0..1 blend into the hilltop lookout camera
  sea: number; // 0..1 blend into the sea overlook camera
  yaw: number; // radians the lookout camera has turned (synced with the project ring)
  night: number; // 0 day, 1 night
};

export const D_HILL = 150;
export const D_END = 326;

export type World = {
  target: Drive;
  playIntro: (ms: number, onText: () => void) => void;
  resize: () => void;
  /** Without continuous animation (reduced motion, no GPU) the world renders on demand: call after changing `target`. */
  redraw: () => void;
  dispose: () => void;
};

// ---------------------------------------------------------------- terrain maths
const HILL_Z = -150;
const COAST_Z = -350;
const SEA_Y = -2;
const LX = 40, LZ = -374; // lighthouse headland

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < 4; i++) {
    s += a * noise(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

export const roadX = (z: number) => 7 * Math.sin(z * 0.035) + 4 * Math.sin(z * 0.013 + 1.3);
export const roadY = (z: number) => 7.5 * Math.exp(-(((z - HILL_Z) / 34) ** 2)) + 1.2 * Math.sin(z * 0.021);

function terrainH(x: number, z: number) {
  const ry = roadY(z);
  const dx = Math.abs(x - roadX(z));
  const side = smooth(6, 70, dx);
  const hm = Math.exp(-(((z - HILL_Z) / 70) ** 2)); // flatten hills around the lookout so it has a view
  const n = fbm(x * 0.011 + 3.1, z * 0.011 - 1.7);
  let h = ry * (1 - side) - 0.12 + side * ((n * 30 - 4 + side * 7) * (1 - 0.65 * hm) + fbm(x * 0.05, z * 0.05) * 1.6);
  const coast = smooth(COAST_Z + 14, COAST_Z - 16, z);
  const head = Math.exp(-((x - LX) ** 2 + (z - LZ) ** 2) / (2 * 20 * 20));
  h = lerp(h, SEA_Y - 7, coast * (1 - head));
  h = lerp(h, SEA_Y + 7 + fbm(x * 0.08, z * 0.08) * 2, coast * head);
  return h;
}

// Seeded random so the world is the same on every visit.
let seed = 20261;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const range = (a: number, b: number) => a + (b - a) * rand();

// ---------------------------------------------------------------- palette (day ↔ night)
const C = (hex: string) => new Color(hex);
const DAY = {
  zenith: C("#79b6e6"), mid: C("#b4daf3"), horizon: C("#f6ead6"),
  glow: C("#fff1d0"), hemiSky: C("#e4efff"), hemiGround: C("#a9b98e"), sun: C("#fff2dc"),
  wire: C("#55606e"), fog: C("#e9eef0"), sea: C("#6cb8d4"),
  hemiI: 1.25, sunI: 2.1, fogD: 0.0042,
};
const NIGHT = {
  zenith: C("#0b1231"), mid: C("#252b5e"), horizon: C("#6a5a8f"),
  glow: C("#e8ecff"), hemiSky: C("#5868b0"), hemiGround: C("#151b30"), sun: C("#b9c5ff"),
  wire: C("#8d95b8"), fog: C("#2f305d"), sea: C("#355a86"),
  hemiI: 0.9, sunI: 0.7, fogD: 0.0058,
};
const WHITE = C("#ffffff"), CLOUD_NIGHT = C("#a3a6d4"), GLOW_NIGHT = C("#676a9e"), LAMP_DAY = C("#f3ead6"), LAMP_NIGHT = C("#ffe08a");
const HEAD_DAY = C("#fff6dc"), HEAD_NIGHT = C("#ffe39a");
const SUN_DIR = new Vector3(-0.42, 0.5, -0.76).normalize();
const MOON_DIR = new Vector3(0.5, 0.42, -0.76).normalize();

// ---------------------------------------------------------------- shaders
const SKY_VS = `varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position.z=gl_Position.w;}`;
const SKY_FS = `
uniform vec3 uZenith;uniform vec3 uMid;uniform vec3 uHorizon;uniform vec3 uGlow;uniform vec3 uSunDir;uniform float uNight;uniform float uTime;
varying vec3 vDir;
float h3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
void main(){
  vec3 d=normalize(vDir);
  float y=d.y;
  vec3 col=mix(uHorizon,uMid,smoothstep(-0.02,0.22,y));
  col=mix(col,uZenith,smoothstep(0.22,0.9,y));
  col=mix(col,uHorizon*0.92,smoothstep(0.0,-0.25,y));
  float s=max(dot(d,uSunDir),0.0);
  col+=uGlow*(smoothstep(0.9993,0.9997,s)*mix(0.9,1.2,uNight)+pow(s,18.0)*0.22+pow(s,3.0)*0.05);
  if(uNight>0.01&&y>0.0){
    vec3 p=d*190.0;vec3 c=floor(p);float r=h3(c);
    float st=step(0.978,r)*smoothstep(0.36,0.0,length(fract(p)-0.5));
    st*=0.55+0.45*sin(uTime*(1.5+r*3.0)+r*40.0);
    col+=vec3(1.0,0.97,0.9)*st*uNight*smoothstep(0.0,0.25,y);
  }
  gl_FragColor=vec4(col,1.0);
}`;

const FLY_VS = `attribute float aSeed;uniform float uTime;uniform float uScale;varying float vA;
void main(){
  vec3 p=position;
  p.x+=sin(uTime*0.6+aSeed*12.0)*0.9;p.y+=sin(uTime*0.9+aSeed*7.0)*0.5;p.z+=cos(uTime*0.5+aSeed*9.0)*0.9;
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=uScale*(0.9+0.5*sin(aSeed*31.0))/max(-mv.z,1.0);
  vA=0.45+0.55*pow(0.5+0.5*sin(uTime*2.2+aSeed*50.0),3.0);
}`;
const FLY_FS = `uniform float uNight;varying float vA;
void main(){float r=length(gl_PointCoord-0.5);float a=smoothstep(0.5,0.0,r);a*=a;gl_FragColor=vec4(vec3(1.0,0.86,0.45)*a*vA*uNight,1.0);}`;

// ---------------------------------------------------------------- helpers
function toonRamp() {
  const t = new DataTexture(new Uint8Array([120, 175, 220, 255]), 4, 1, RedFormat);
  t.minFilter = t.magFilter = NearestFilter;
  t.needsUpdate = true;
  return t;
}
function dotTexture(soft: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(soft ? 0.25 : 0.7, soft ? "rgba(255,255,255,.5)" : "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

// Yield to the browser between build steps so building the world never blocks input for long.
const breathe = () => new Promise<void>((r) => setTimeout(r, 0));

export async function createWorld(
  canvas: HTMLCanvasElement,
  opts: { mobile: boolean; reduced: boolean; onReady: () => void; yaw: () => number },
): Promise<World | null> {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  // Checking every shader for errors makes the browser wait for each compile to finish; skip it in production
  // so compiles run in parallel and the first frame doesn't stall the page.
  renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
  const { mobile, reduced } = opts;
  let dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  // With no GPU (software WebGL), animating every frame would jank the page and drain the battery, so the
  // world only redraws when something changes (scroll, theme) and rests in between. Same for reduced motion.
  const ctx = renderer.getContext();
  const dbg = ctx.getExtension("WEBGL_debug_renderer_info");
  const gpu = String(ctx.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : ctx.RENDERER));
  const live = !reduced && !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const fog = new FogExp2(DAY.fog.clone(), DAY.fogD);
  scene.fog = fog;
  const camera = new PerspectiveCamera(42, 1, 0.1, 3000);
  const ramp = toonRamp();
  const toon = (hex: string, extra: Partial<{ emissive: string; emissiveIntensity: number }> = {}) =>
    new MeshToonMaterial({ color: hex, gradientMap: ramp, ...(extra.emissive ? { emissive: extra.emissive, emissiveIntensity: extra.emissiveIntensity ?? 1 } : {}) });

  // Lights
  const hemi = new HemisphereLight(DAY.hemiSky, DAY.hemiGround, DAY.hemiI);
  const sun = new DirectionalLight(DAY.sun, DAY.sunI);
  sun.position.copy(SUN_DIR).multiplyScalar(100);
  scene.add(hemi, sun);

  // Sky dome (follows the camera, drawn behind everything)
  const skyU = {
    uZenith: { value: DAY.zenith.clone() }, uMid: { value: DAY.mid.clone() }, uHorizon: { value: DAY.horizon.clone() },
    uGlow: { value: DAY.glow.clone() }, uSunDir: { value: SUN_DIR.clone() }, uNight: { value: 0 }, uTime: { value: 0 },
  };
  const sky = new Mesh(new SphereGeometry(1000, 32, 16), new ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: BackSide, depthWrite: false }));
  sky.renderOrder = -1;
  sky.frustumCulled = false;
  scene.add(sky);

  // ---------------- terrain
  const Z0 = 110, Z1 = -460, XH = 300;
  const step = mobile ? 5 : 4;
  const nx = Math.round((2 * XH) / step), nz = Math.round((Z0 - Z1) / step);
  const tg = new PlaneGeometry(2 * XH, Z0 - Z1, nx, nz);
  tg.rotateX(-Math.PI / 2);
  tg.translate(0, 0, (Z0 + Z1) / 2);
  const tp = tg.attributes.position;
  const tcol: number[] = [];
  const grassA = C("#9cc785"), grassB = C("#7fb378"), grassC = C("#b9d595"), wheat = C("#dccf8e"), sand = C("#ecdcb8"), deep = C("#6d9fae"), tmp = new Color();
  for (let i = 0; i < tp.count; i++) {
    if (i % 800 === 799) await breathe(); // ~10ms slices: the terrain maths is the heaviest part of the build
    const x = tp.getX(i), z = tp.getZ(i);
    const h = terrainH(x, z);
    tp.setY(i, h);
    const n = fbm(x * 0.03 + 9, z * 0.03 - 4);
    tmp.copy(grassA).lerp(grassB, smooth(0.35, 0.65, n)).lerp(grassC, smooth(6, 22, h) * 0.6);
    if (fbm(x * 0.02 - 20, z * 0.02 + 7) > 0.62) tmp.lerp(wheat, 0.75); // golden field patches
    tmp.lerp(sand, smooth(SEA_Y + 2.2, SEA_Y + 0.6, h));
    tmp.lerp(deep, smooth(SEA_Y - 0.2, SEA_Y - 2.5, h));
    tcol.push(tmp.r, tmp.g, tmp.b);
  }
  tg.setAttribute("color", new Float32BufferAttribute(tcol, 3));
  tg.computeVertexNormals();
  const terrainMat = new MeshToonMaterial({ vertexColors: true, gradientMap: ramp });
  scene.add(new Mesh(tg, terrainMat));

  // Sea
  const seaMat = toon("#6cb8d4");
  const sea = new Mesh(new PlaneGeometry(5000, 5000), seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(0, SEA_Y, -2400);
  scene.add(sea);

  // Distant mountains (fog turns them pale blue)
  const mtnN = 46;
  const mtn = new InstancedMesh(new IcosahedronGeometry(1, 2), toon("#ffffff"), mtnN);
  const o = new Object3D();
  for (let i = 0; i < mtnN; i++) {
    const behind = i < 10;
    const sideSign = i % 2 ? 1 : -1;
    const z = behind ? range(160, 260) : range(120, -380);
    const x = behind ? range(-320, 320) : sideSign * range(250, 380);
    const r = range(70, 130), h = range(40, 85);
    o.position.set(x, -14, z);
    o.scale.set(r, h, r * range(0.8, 1.2));
    o.rotation.set(0, rand() * 6, 0);
    o.updateMatrix();
    mtn.setMatrixAt(i, o.matrix);
    mtn.setColorAt(i, tmp.set("#8fb3a8").lerp(C("#a5bfd2"), rand()));
  }
  scene.add(mtn);

  await breathe();
  // ---------------- road
  const ROAD_Z0 = 100, ROAD_Z1 = -336, RW = 2.7;
  const rpos: number[] = [], rcol: number[] = [], ridx: number[] = [];
  const lanes = [-1, -0.62, -0.3, 0.3, 0.62, 1];
  const laneCol = [C("#c7b994"), C("#d8cba9"), C("#cbbd99"), C("#cbbd99"), C("#d8cba9"), C("#c7b994")];
  let rows = 0;
  for (let z = ROAD_Z0; z >= ROAD_Z1; z -= 1) {
    const cx = roadX(z), cy = roadY(z) + 0.14;
    const tx = roadX(z - 0.5) - roadX(z + 0.5);
    const len = Math.hypot(tx, 1);
    const nxv = 1 / len, nzv = tx / len; // perpendicular in the ground plane
    lanes.forEach((l, k) => {
      rpos.push(cx + nxv * l * RW, cy - Math.abs(l) * 0.06, z + nzv * l * RW);
      rcol.push(laneCol[k].r, laneCol[k].g, laneCol[k].b);
    });
    if (rows > 0) {
      const a = (rows - 1) * lanes.length, b = rows * lanes.length;
      for (let k = 0; k < lanes.length - 1; k++) ridx.push(a + k, b + k, a + k + 1, a + k + 1, b + k, b + k + 1);
    }
    rows++;
  }
  const rg = new BufferGeometry();
  rg.setAttribute("position", new Float32BufferAttribute(rpos, 3));
  rg.setAttribute("color", new Float32BufferAttribute(rcol, 3));
  rg.setIndex(ridx);
  rg.computeVertexNormals();
  scene.add(new Mesh(rg, new MeshToonMaterial({ vertexColors: true, gradientMap: ramp })));

  await breathe();
  // ---------------- trees
  const treeN = mobile ? 260 : 460;
  const trunk = new InstancedMesh(new CylinderGeometry(0.16, 0.24, 1, 6), toon("#7a5b46"), treeN);
  const crown = new InstancedMesh(new IcosahedronGeometry(1, 1), toon("#ffffff"), treeN);
  const treeGreens = ["#5f9b68", "#6fab6c", "#4f8b61", "#82b977", "#5a9472"].map(C);
  let placed = 0;
  for (let tries = 0; placed < treeN && tries < treeN * 30; tries++) {
    if (tries % 1500 === 1499) await breathe();
    const x = range(-XH + 10, XH - 10), z = range(Z0 - 10, -360);
    const dx = Math.abs(x - roadX(z));
    if (dx < 11) continue;
    if (Math.hypot(x - roadX(HILL_Z), z - HILL_Z) < 34) continue; // keep the lookout's view open
    const forest = fbm(x * 0.018 + 40, z * 0.018 - 13);
    if (rand() > smooth(0.42, 0.62, forest) + 0.06) continue;
    const h = terrainH(x, z);
    if (h < SEA_Y + 1.5) continue;
    const s = range(1.6, 3.4) * (dx < 25 ? 0.85 : 1);
    o.rotation.set(0, rand() * 6, 0);
    o.position.set(x, h + s * 0.7, z);
    o.scale.set(s * 0.9, s * 1.4, s * 0.9);
    o.updateMatrix();
    trunk.setMatrixAt(placed, o.matrix);
    o.position.set(x, h + s * 1.55 + 0.5, z);
    o.scale.set(s, s * range(0.95, 1.25), s);
    o.updateMatrix();
    crown.setMatrixAt(placed, o.matrix);
    crown.setColorAt(placed, treeGreens[(rand() * treeGreens.length) | 0]);
    placed++;
  }
  trunk.count = crown.count = placed;
  scene.add(trunk, crown);

  await breathe();
  // ---------------- flowers (meadow dots)
  const flN = mobile ? 1600 : 3200;
  const fpos: number[] = [], fcol: number[] = [];
  const flowerCols = ["#ffffff", "#fff4b0", "#ffd36e", "#f7b9cc", "#d9c8f5"].map(C);
  for (let i = 0; i < flN; i++) {
    if (i % 800 === 799) await breathe();
    const z = range(80, -330);
    const x = roadX(z) + (rand() < 0.5 ? -1 : 1) * range(4.2, 40);
    const h = terrainH(x, z);
    if (h < SEA_Y + 1.2) continue;
    fpos.push(x, h + 0.25, z);
    const c = flowerCols[(rand() * flowerCols.length) | 0];
    fcol.push(c.r, c.g, c.b);
  }
  const fg = new BufferGeometry();
  fg.setAttribute("position", new Float32BufferAttribute(fpos, 3));
  fg.setAttribute("color", new Float32BufferAttribute(fcol, 3));
  const flowerMat = new PointsMaterial({ size: 0.2, vertexColors: true, map: dotTexture(false), transparent: true, alphaTest: 0.35, depthWrite: false });
  scene.add(new Points(fg, flowerMat));

  // ---------------- telephone poles + wires (the road's companions)
  const poles: Vector3[] = [];
  for (let z = 60; z > -330; z -= 13) {
    const x = roadX(z) + 4.6;
    poles.push(new Vector3(x, terrainH(x, z), z));
  }
  const pole = new InstancedMesh(new CylinderGeometry(0.1, 0.14, 1, 6), toon("#6e5848"), poles.length);
  const bar = new InstancedMesh(new BoxGeometry(1, 1, 1), toon("#6e5848"), poles.length);
  const wpos: number[] = [];
  poles.forEach((p, i) => {
    o.rotation.set(0, 0, 0);
    o.position.set(p.x, p.y + 3.8, p.z);
    o.scale.set(1, 7.6, 1);
    o.updateMatrix();
    pole.setMatrixAt(i, o.matrix);
    o.position.set(p.x, p.y + 7.1, p.z);
    o.scale.set(1.9, 0.12, 0.12);
    o.updateMatrix();
    bar.setMatrixAt(i, o.matrix);
    const q = poles[i + 1];
    if (!q) return;
    for (const off of [-0.8, 0.8]) {
      const a = new Vector3(p.x + off, p.y + 7.15, p.z), b = new Vector3(q.x + off, q.y + 7.15, q.z);
      const seg = 8;
      for (let k = 0; k < seg; k++) {
        for (const kk of [k, k + 1]) {
          const t = kk / seg;
          wpos.push(lerp(a.x, b.x, t), lerp(a.y, b.y, t) - Math.sin(t * Math.PI) * 0.75, lerp(a.z, b.z, t));
        }
      }
    }
  });
  scene.add(pole, bar);
  const wg = new BufferGeometry();
  wg.setAttribute("position", new Float32BufferAttribute(wpos, 3));
  const wireMat = new LineBasicMaterial({ color: DAY.wire.clone(), transparent: true, opacity: 0.75 });
  scene.add(new LineSegments(wg, wireMat));

  await breathe();
  // ---------------- houses (warm windows at night)
  const windowMat = new MeshBasicMaterial({ color: "#ffd98a", transparent: true, opacity: 0 });
  const houseSpots: [number, number, string][] = [
    [-56, -26, "#5f9fa0"], [-98, 19, "#5f9fa0"], [-222, -21, "#4f6c93"], [-276, 17, "#d97a5f"], [24, 22, "#5f9fa0"],
  ];
  const wallMat = toon("#f3ead9");
  for (const [z, off, roof] of houseSpots) {
    const x = roadX(z) + off;
    const y = terrainH(x, z);
    const house = new Group();
    const walls = new Mesh(new BoxGeometry(5, 3.2, 4), wallMat);
    walls.position.y = 1.6;
    const prism = new CylinderGeometry(3.3, 3.3, 5.6, 3, 1); // triangular prism: ridge up, length along x
    prism.rotateX(-Math.PI / 2);
    prism.rotateY(Math.PI / 2);
    const r = new Mesh(prism, toon(roof));
    r.scale.set(1, 0.5, 0.72);
    r.position.y = 4.03;
    const win1 = new Mesh(new PlaneGeometry(0.9, 0.9), windowMat);
    win1.position.set(-1.1, 1.7, 2.01);
    const win2 = win1.clone();
    win2.position.x = 1.1;
    house.add(walls, r, win1, win2);
    house.position.set(x, y - 0.1, z);
    house.lookAt(roadX(z), y - 0.1, z); // windows face the road
    scene.add(house);
  }

  // ---------------- lighthouse on the headland (a nod to Durban's coast)
  const lh = new Group();
  const lhY = terrainH(LX, LZ);
  const stripes = new CylinderGeometry(1.05, 1.5, 11, 18, 6).toNonIndexed();
  const scol: number[] = [];
  const red = C("#d9614f"), white = C("#f6f0e6");
  const sp = stripes.attributes.position;
  for (let i = 0; i < sp.count; i += 3) {
    const cy = (sp.getY(i) + sp.getY(i + 1) + sp.getY(i + 2)) / 3;
    const c = Math.floor((cy + 5.5) / (11 / 6)) % 2 ? red : white;
    for (let k = 0; k < 3; k++) scol.push(c.r, c.g, c.b);
  }
  stripes.setAttribute("color", new Float32BufferAttribute(scol, 3));
  stripes.computeVertexNormals();
  const tower = new Mesh(stripes, new MeshToonMaterial({ vertexColors: true, gradientMap: ramp }));
  tower.position.y = 5.5;
  const lampMat = new MeshBasicMaterial({ color: "#fff1c2" });
  const lamp = new Mesh(new CylinderGeometry(0.85, 0.85, 1.2, 12), lampMat);
  lamp.position.y = 11.6;
  const cap = new Mesh(new ConeGeometry(1.25, 1.4, 12), toon("#d9614f"));
  cap.position.y = 12.9;
  const beamMat = new MeshBasicMaterial({ color: "#ffe6a6", transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: BackSide });
  const beam = new Mesh(new ConeGeometry(7, 70, 20, 1, true), beamMat);
  beam.geometry.translate(0, -35, 0);
  beam.geometry.rotateZ(Math.PI / 2);
  const beamPivot = new Group();
  beamPivot.position.y = 11.6;
  beamPivot.add(beam);
  lh.add(tower, lamp, cap, beamPivot);
  lh.position.set(LX, lhY - 0.3, LZ);
  scene.add(lh);

  await breathe();
  // ---------------- clouds: big flat-bottomed cumulus
  const puffs: Matrix4[] = [];
  const addCloud = (cx: number, cy: number, cz: number, size: number) => {
    const n = 9 + ((rand() * 6) | 0);
    const w = size * range(2.2, 3.2);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1) - 0.5;
      const r = size * range(0.55, 1) * (1 - Math.abs(t) * 0.9);
      const px = cx + t * w + range(-0.2, 0.2) * size;
      const pz = cz + range(-0.45, 0.45) * size;
      const py = cy + r * 0.55 + (1 - Math.abs(t) * 2) * size * range(0.15, 0.55);
      o.position.set(px, py, pz);
      o.scale.set(r, r * 0.92, r);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      puffs.push(o.matrix.clone());
    }
  };
  for (let i = 0; i < (mobile ? 9 : 12); i++) addCloud(range(-70, 70), range(34, 54), range(30, -70), range(5, 11)); // intro bank
  for (let i = 0; i < (mobile ? 18 : 28); i++) {
    const a = rand() * Math.PI * 2;
    const dist = range(260, 560);
    addCloud(Math.cos(a) * dist, range(55, 125), -170 + Math.sin(a) * dist, range(16, 34));
  }
  const cloudMat = new MeshToonMaterial({ color: "#ffffff", gradientMap: ramp, emissive: "#ffffff", emissiveIntensity: 0.28, fog: false }); // fog would turn night clouds to slate
  const clouds = new InstancedMesh(new IcosahedronGeometry(1, 2), cloudMat, puffs.length);
  puffs.forEach((m, i) => clouds.setMatrixAt(i, m));
  scene.add(clouds);

  // ---------------- fireflies (night only)
  const flyN = mobile ? 160 : 320;
  const ypos: number[] = [], yseed: number[] = [];
  for (let i = 0; i < flyN; i++) {
    const z = range(70, -330);
    const x = roadX(z) + (rand() < 0.5 ? -1 : 1) * range(3.5, 26);
    ypos.push(x, terrainH(x, z) + range(0.6, 3.2), z);
    yseed.push(rand());
  }
  const yg = new BufferGeometry();
  yg.setAttribute("position", new Float32BufferAttribute(ypos, 3));
  yg.setAttribute("aSeed", new Float32BufferAttribute(yseed, 1));
  const flyU = { uTime: { value: 0 }, uNight: { value: 0 }, uScale: { value: 60 } };
  const flies = new Points(yg, new ShaderMaterial({ uniforms: flyU, vertexShader: FLY_VS, fragmentShader: FLY_FS, transparent: true, depthWrite: false, blending: AdditiveBlending }));
  flies.frustumCulled = false;
  scene.add(flies);

  await breathe();
  // ---------------- the car: a small rounded hatchback with a suitcase on the roof
  const car = new Group();
  const outlineMat = new MeshBasicMaterial({ color: "#2b3442", side: BackSide });
  const withOutline = (m: Mesh, k = 1.05) => {
    const ol = new Mesh(m.geometry, outlineMat);
    ol.scale.setScalar(k);
    m.add(ol);
    return m;
  };
  const body = withOutline(new Mesh(new RoundedBoxGeometry(2.1, 0.82, 3.9, 4, 0.34), toon("#8fd0c0")));
  body.position.y = 0.8;
  const cabin = withOutline(new Mesh(new RoundedBoxGeometry(1.84, 0.86, 2.15, 4, 0.38), toon("#f7efe1")), 1.04);
  cabin.position.set(0, 1.5, 0.1);
  const glass = toon("#8fb4d2", { emissive: "#bcd8f0", emissiveIntensity: 0.25 });
  const wind = new Mesh(new RoundedBoxGeometry(1.6, 0.58, 0.08, 2, 0.04), glass);
  wind.position.set(0, 1.55, -0.99);
  const rear = wind.clone();
  rear.position.z = 1.19;
  const sideWin = new Mesh(new RoundedBoxGeometry(0.08, 0.5, 1.7, 2, 0.04), glass);
  sideWin.position.set(0.93, 1.55, 0.1);
  const sideWin2 = sideWin.clone();
  sideWin2.position.x = -0.93;
  const gloss = new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.55 });
  const streak = new Mesh(new BoxGeometry(0.06, 0.42, 0.1), gloss);
  streak.position.set(0.35, 1.58, -1.04);
  streak.rotation.z = -0.5;
  const streak2 = streak.clone();
  streak2.position.x = 0.52;
  streak2.scale.y = 0.6;
  const cream = toon("#f7efe1");
  const bumperF = new Mesh(new RoundedBoxGeometry(2.16, 0.24, 0.26, 2, 0.1), cream);
  bumperF.position.set(0, 0.5, -1.98);
  const bumperR = bumperF.clone();
  bumperR.position.z = 1.98;
  const headMat = new MeshBasicMaterial({ color: "#fff6dc" });
  const headL = new Mesh(new SphereGeometry(0.17, 12, 10), headMat);
  headL.position.set(-0.62, 0.9, -1.93);
  const headR = headL.clone();
  headR.position.x = 0.62;
  const tailMat = new MeshBasicMaterial({ color: "#e8705f" });
  const tailL = new Mesh(new BoxGeometry(0.34, 0.16, 0.06), tailMat);
  tailL.position.set(-0.68, 0.92, 1.95);
  const tailR = tailL.clone();
  tailR.position.x = 0.68;
  const rack = new Mesh(new BoxGeometry(1.5, 0.07, 1.6), toon("#6b5a4d"));
  rack.position.set(0, 1.98, 0.1);
  const case1 = withOutline(new Mesh(new RoundedBoxGeometry(1.12, 0.44, 0.78, 2, 0.1), toon("#e07a5f")), 1.06);
  case1.position.set(-0.08, 2.24, -0.05);
  const case2 = withOutline(new Mesh(new RoundedBoxGeometry(0.62, 0.34, 0.52, 2, 0.1), toon("#f2c46d")), 1.07);
  case2.position.set(0.25, 2.18, 0.72);
  const wheels: Group[] = [];
  const tyre = new CylinderGeometry(0.43, 0.43, 0.34, 20);
  tyre.rotateZ(Math.PI / 2);
  const hub = new CylinderGeometry(0.2, 0.2, 0.36, 14);
  hub.rotateZ(Math.PI / 2);
  const tyreMat = toon("#2d3541"), hubMat = cream;
  for (const [wx, wz] of [[-1.0, -1.28], [1.0, -1.28], [-1.0, 1.28], [1.0, 1.28]]) {
    const w = new Group();
    w.add(new Mesh(tyre, tyreMat), new Mesh(hub, hubMat));
    w.position.set(wx, 0.43, wz);
    wheels.push(w);
  }
  // Soft blob shadow
  const shadowTex = dotTexture(true);
  const shadow = new Mesh(new PlaneGeometry(3.4, 5.2), new MeshBasicMaterial({ map: shadowTex, color: "#000000", transparent: true, opacity: 0.22, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.04;
  // Headlight beams + light for the night drive
  const beamCarMat = new MeshBasicMaterial({ color: "#ffe8b0", transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
  const carBeam = new Mesh(new ConeGeometry(2.6, 11, 18, 1, true), beamCarMat);
  carBeam.geometry.translate(0, -5.5, 0);
  carBeam.geometry.rotateX(Math.PI / 2);
  carBeam.position.set(0, 0.9, -2.0);
  carBeam.scale.set(1, 0.45, 1);
  const spot = new SpotLight("#ffe2a8", 0, 34, 0.5, 1, 1.3);
  spot.position.set(0, 1, -1.8);
  spot.target.position.set(0, -0.6, -14);
  car.add(body, cabin, wind, streak, streak2, rear, sideWin, sideWin2, bumperF, bumperR, headL, headR, tailL, tailR, rack, case1, case2, shadow, carBeam, spot, spot.target, ...wheels);
  scene.add(car);

  // ---------------------------------------------------------------- state
  const target: Drive = { d: 0, hill: 0, sea: 0, yaw: 0, night: 0 };
  const cur: Drive = { d: 0, hill: 0, sea: 0, yaw: 0, night: 0 };
  let introStart = -1, introDur = 0, introP = 1, onIntroText: (() => void) | null = null;
  let lastD = 0, raf = 0, last = 0, alive = true, frames = 0, slow = 0, shown = false;
  const t0 = performance.now();

  const carPose = (d: number) => {
    const z = -d;
    const p = new Vector3(roadX(z), roadY(z) + 0.14, z);
    const ahead = new Vector3(roadX(z - 1.5), roadY(z - 1.5) + 0.14, z - 1.5);
    const f = ahead.sub(p).normalize();
    return { p, f };
  };

  const camPos = new Vector3(), camLook = new Vector3();
  const wantPos = new Vector3(), wantLook = new Vector3();
  const v1 = new Vector3(), v2 = new Vector3(), up = new Vector3(0, 1, 0);

  function rig(d: number, out: Vector3, look: Vector3) {
    const portrait = camera.aspect < 0.8;
    const { p, f } = carPose(d);
    const right = v1.crossVectors(f, up).normalize();
    // Chase: behind and to the left, so the car sits low and right with the road leading into the valley.
    out.copy(p).addScaledVector(f, portrait ? -15 : -13.5).addScaledVector(right, portrait ? -1.4 : -4.4).addScaledVector(up, portrait ? 4.4 : 3.4);
    look.copy(p).addScaledVector(f, 24).addScaledVector(up, portrait ? 3.6 : 2.6).addScaledVector(right, portrait ? 0 : -2);

    // Hilltop lookout: stand beside the parked car and turn with the project ring.
    if (cur.hill > 0.001) {
      const hp = carPose(D_HILL);
      const hr = v2.crossVectors(hp.f, up).normalize();
      const eye = hp.p.clone().addScaledVector(hr, -2.6).addScaledVector(up, 2.5).addScaledVector(hp.f, -1.5);
      const dir = hp.f.clone().setY(0).normalize().applyAxisAngle(up, -cur.yaw);
      const hl = eye.clone().addScaledVector(dir, 40).addScaledVector(up, -3.5);
      out.lerp(eye, cur.hill);
      look.lerp(hl, cur.hill);
    }
    // Sea overlook: rise up behind the parked car and look out over the water.
    if (cur.sea > 0.001) {
      const sp2 = carPose(D_END);
      const sr = v2.crossVectors(sp2.f, up).normalize();
      const eye = sp2.p.clone().addScaledVector(sp2.f, -15).addScaledVector(sr, portrait ? 2 : -6).addScaledVector(up, 6.5);
      const sl = sp2.p.clone().addScaledVector(sp2.f, 60).addScaledVector(sr, portrait ? 10 : 14).addScaledVector(up, 4);
      out.lerp(eye, cur.sea);
      look.lerp(sl, cur.sea);
    }
  }

  const introFrom = { pos: new Vector3(-6, 70, 46), look: new Vector3(4, 22, -70) };

  function applyNight(n: number) {
    skyU.uZenith.value.lerpColors(DAY.zenith, NIGHT.zenith, n);
    skyU.uMid.value.lerpColors(DAY.mid, NIGHT.mid, n);
    skyU.uHorizon.value.lerpColors(DAY.horizon, NIGHT.horizon, n);
    skyU.uGlow.value.lerpColors(DAY.glow, NIGHT.glow, n);
    skyU.uSunDir.value.copy(n < 0.5 ? SUN_DIR : MOON_DIR);
    skyU.uNight.value = n;
    // Swap sun for moon through a brief dusk dip so the disc never slides across the sky.
    const dip = 1 - Math.sin(n * Math.PI) * 0.6;
    fog.color.lerpColors(DAY.fog, NIGHT.fog, n);
    fog.density = lerp(DAY.fogD, NIGHT.fogD, n);
    hemi.color.lerpColors(DAY.hemiSky, NIGHT.hemiSky, n);
    hemi.groundColor.lerpColors(DAY.hemiGround, NIGHT.hemiGround, n);
    hemi.intensity = lerp(DAY.hemiI, NIGHT.hemiI, n);
    sun.color.lerpColors(DAY.sun, NIGHT.sun, n);
    sun.intensity = lerp(DAY.sunI, NIGHT.sunI, n) * dip;
    sun.position.copy(n < 0.5 ? SUN_DIR : MOON_DIR).multiplyScalar(100);
    seaMat.color.lerpColors(DAY.sea, NIGHT.sea, n);
    wireMat.color.lerpColors(DAY.wire, NIGHT.wire, n);
    // Moonlit at night: soft lavender, never heavy grey.
    cloudMat.emissive.lerpColors(WHITE, GLOW_NIGHT, n);
    cloudMat.emissiveIntensity = lerp(0.28, 0.7, n);
    cloudMat.color.lerpColors(WHITE, CLOUD_NIGHT, n);
    flyU.uNight.value = n;
    windowMat.opacity = n;
    beamMat.opacity = 0.16 * n;
    lampMat.color.lerpColors(LAMP_DAY, LAMP_NIGHT, n);
    beamCarMat.opacity = 0.05 * n;
    spot.intensity = 18 * n;
    headMat.color.lerpColors(HEAD_DAY, HEAD_NIGHT, n);
  }

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 58 : 42;
    camera.updateProjectionMatrix();
    flyU.uScale.value = 60 * dpr * (h / 900);
    wake();
  }
  function wake() {
    if (!raf && alive) raf = requestAnimationFrame(frame);
  }
  const settled = () =>
    Math.abs(target.d - cur.d) < 0.01 && Math.abs(target.hill - cur.hill) < 0.002 && Math.abs(target.sea - cur.sea) < 0.002 &&
    Math.abs(target.yaw - cur.yaw) < 0.001 && Math.abs(target.night - cur.night) < 0.002;

  function frame(now: number) {
    raf = 0;
    if (!alive) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const t = (now - t0) / 1000;

    // Ease towards what the page asked for. Reduced motion: jump straight there.
    const k = (rate: number) => (reduced ? 1 : 1 - Math.exp(-dt * rate));
    target.yaw = opts.yaw();
    cur.d += (target.d - cur.d) * k(2.6);
    cur.hill += (target.hill - cur.hill) * k(3);
    cur.sea += (target.sea - cur.sea) * k(2.4);
    cur.yaw += (target.yaw - cur.yaw) * k(5);
    cur.night += (target.night - cur.night) * k(2.2);
    applyNight(cur.night);

    // Intro: drop through the clouds while the car rolls in. Scrolling hurries it along.
    let introCar = 0;
    if (introStart >= 0 && introP < 1) {
      const speed = target.d > 0.5 ? 5 : 1;
      introP = Math.min(1, introP + (dt * 1000 * speed) / introDur);
      if (onIntroText && introP > 0.62) {
        onIntroText();
        onIntroText = null;
      }
      introCar = -32 * (1 - easeOut(Math.min(1, introP * 1.12)));
    }
    const d = cur.d + introCar;

    // Car
    const { p, f } = carPose(d);
    car.position.copy(p);
    car.lookAt(v1.copy(p).sub(f));
    const moved = d - lastD;
    lastD = d;
    for (const w of wheels) w.rotation.x -= moved / 0.43;
    body.position.y = 0.8 + Math.sin(t * 9) * 0.012 * Math.min(1, Math.abs(moved) * 20);

    // Camera
    rig(d, wantPos, wantLook);
    if (introP < 1) {
      const e = easeIO(introP);
      wantPos.lerpVectors(introFrom.pos, wantPos, e);
      wantLook.lerpVectors(introFrom.look, wantLook, e);
    }
    camPos.copy(wantPos);
    camLook.copy(wantLook);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    sky.position.copy(camPos);

    // Ambient life
    clouds.position.x = live ? Math.sin(t * 0.02) * 14 : 0;
    skyU.uTime.value = t;
    flyU.uTime.value = t;
    beamPivot.rotation.y = live ? t * 0.6 : 1.2;

    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      opts.onReady();
    }

    // Adaptive quality: if frames run long, render fewer pixels.
    if (live && dt > 0.028) slow++;
    if (live && ++frames % 90 === 0) {
      if (slow > 45 && dpr > 0.8) {
        dpr = Math.max(0.8, dpr * 0.8);
        resize();
      }
      slow = 0;
    }
    if (live || !settled()) raf = requestAnimationFrame(frame);
  }

  resize();
  applyNight(0);
  // Compile shaders off the main thread where the browser allows it, before the first frame.
  await renderer.compileAsync(scene, camera);

  const onVisible = () => {
    if (!document.hidden && live) wake();
  };
  document.addEventListener("visibilitychange", onVisible);

  wake();

  return {
    target,
    playIntro(ms, onText) {
      if (!live) return onText();
      introStart = performance.now();
      introDur = ms;
      introP = 0;
      onIntroText = onText;
    },
    resize,
    redraw: wake,
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisible);
      scene.traverse((obj) => {
        const m = obj as Mesh;
        m.geometry?.dispose();
        const mats = m.material as Material | Material[] | undefined;
        (Array.isArray(mats) ? mats : mats ? [mats] : []).forEach((x) => x.dispose());
      });
      ramp.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
