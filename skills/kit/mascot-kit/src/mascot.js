// The mascot in real 3D (three.js), built from a description (see config.js) and animated by pure functions of time. It runs in a browser page, on the CPU where there is no GPU (SwiftShader).
import * as THREE from 'three';
import { normalize } from './config.js';

const col = h => new THREE.Color(h);
const glowTex = h => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const k = col(h); const rgb = `${Math.round(k.r * 255)},${Math.round(k.g * 255)},${Math.round(k.b * 255)}`;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, `rgba(255,235,210,1)`); r.addColorStop(.4, `rgba(${rgb},.35)`); r.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
const PROFILES = {
  drop: [[0, -1], [.55, -.86], [.92, -.42], [1, .05], [.86, .58], [.52, 1.05], [.3, 1.4], [.13, 1.66], [0, 1.74]],
  egg: [[0, -1], [.55, -.88], [.9, -.45], [1, 0], [.9, .5], [.62, .95], [.3, 1.2], [0, 1.28]],
  ball: Array.from({ length: 13 }, (_, i) => { const a = Math.PI * i / 12; return [Math.sin(a), -Math.cos(a)]; }),
  capsule: [[0, -1.2], [.6, -1.1], [.95, -.7], [1, -.2], [1, .4], [.95, .8], [.6, 1.2], [0, 1.3]],
};
const TOP = { drop: .95, egg: 1.1, ball: .95, capsule: 1.2 };
const bodyGeo = shape => new THREE.LatheGeometry(new THREE.SplineCurve(PROFILES[shape].map(p => new THREE.Vector2(...p))).getPoints(70), 72);

export function makeMascot(config, { small = false } = {}) {
  const c = normalize(config), top = TOP[c.shape];
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const white = new THREE.MeshPhysicalMaterial({ color: col(c.color), roughness: .28, clearcoat: 1, clearcoatRoughness: .12, sheen: 1, sheenColor: col(c.accent), sheenRoughness: .5 });
  const body = new THREE.Mesh(bodyGeo(c.shape), white); body.rotation.x = c.tilt; body.position.y = .05; inner.add(body);
  const glow = glowTex(c.glow), eyeMat = new THREE.MeshBasicMaterial({ color: col(c.face.eye.color), toneMapped: false });
  const additive = (op, sx, sy) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, opacity: op })); s.scale.set(sx, sy, 1); return s; };
  const eyes = [], eyeBase = c.face.eye.shape === 'round' ? [.12, .12] : [.1, .15], sz = c.face.eye.size;
  if (c.face.visor) { const v = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhysicalMaterial({ color: col(c.face.visorColor), roughness: .05, metalness: .2, clearcoat: 1, clearcoatRoughness: .03 })); v.scale.set(.62, .42, .3); v.position.set(0, .12, .86); inner.add(v); }
  for (const x of [-.26, .26]) { const e = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), eyeMat); e.position.set(x, .17, 1.12); e.userData.base = [eyeBase[0] * sz, eyeBase[1] * sz]; e.scale.set(e.userData.base[0], e.userData.base[1], .05); inner.add(e); eyes.push(e);
    const s = additive(.8, .6 * sz, .7 * sz); s.position.set(x, .17, 1.2); inner.add(s); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.1, .02, 10, 24, Math.PI), eyeMat); mouth.rotation.z = Math.PI; mouth.position.set(0, -.02, 1.14); mouth.scale.setScalar(1.5); inner.add(mouth);
  const open = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: col(c.face.mouth.color), toneMapped: false })); open.position.set(0, -.06, 1.13); open.scale.set(.15, .01, .03); inner.add(open);
  if (c.beak) { const b = new THREE.Mesh(new THREE.ConeGeometry(.2, .36, 24), new THREE.MeshPhysicalMaterial({ color: col(c.beak.color), roughness: .35, clearcoat: .6 })); b.scale.set(1, 1, .55); b.rotation.x = Math.PI / 2; b.position.set(0, -.32, 1.1); inner.add(b); }
  const flames = [];
  if (c.crest && c.crest.kind === 'flame') {
    const n = small ? 1 : c.crest.count, spread = [[0, 0, 1, .75], [-.36, -.02, .75, .5], [.36, -.02, .75, .5], [-.62, -.08, .55, .4], [.62, -.08, .55, .4]].slice(0, n);
    const [lo, hi] = c.crest.colors.map(col), pts = new THREE.SplineCurve([[0, 0], [.2, .18], [.22, .5], [.08, .9], [0, 1.2]].map(p => new THREE.Vector2(...p))).getPoints(24);
    for (const [x, z, s, h] of spread) {
      const g = new THREE.LatheGeometry(pts, 24), pa = g.attributes.position, cs = [];
      for (let i = 0; i < pa.count; i++) { const y = Math.min(1, Math.max(0, pa.getY(i) / 1.2)), k = lo.clone().lerp(hi, y * y); cs.push(k.r, k.g, k.b); }
      g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
      const f = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); f.scale.set(1.5 * s, h * s * 1.3, .8 * s); f.position.set(x, top, z + .1); f.userData = { s, h, x }; inner.add(f); flames.push(f);
    }
    const fg = additive(.7, 2.4, 2.4); fg.position.set(0, top + .4, .1); inner.add(fg); inner.userData.fglow = fg;
  }
  if (c.emblem && !small) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(.09, 24, 18), new THREE.MeshBasicMaterial({ color: col(c.emblem.color), toneMapped: false })), new THREE.Mesh(new THREE.TorusGeometry(.17, .012, 10, 48), new THREE.MeshBasicMaterial({ color: col(c.accent), toneMapped: false }))); g.scale.setScalar(2.1); g.position.set(0, top * .7, .78); g.rotation.x = -.8; inner.add(g); }
  const shadow = additive(.35, 2.6, .5); root.add(shadow);
  root.userData = { inner, eyes, flames, mouth, open, shadow, fglow: inner.userData.fglow, config: c };
  return root;
}
// A pure function of the time t, of the mood (-1 sad .. 1 happy) and of how open the mouth is (0 .. 1).
export function animateMascot(m, t, mood = 0, talk = 0) {
  const { inner, eyes, flames, mouth, open, shadow, fglow } = m.userData;
  const bob = Math.sin(t * 2) * .08; inner.position.y = 1.35 + bob; inner.rotation.z = Math.sin(t * 1.3) * .04; inner.rotation.x = Math.sin(t * 1.7) * .03;
  shadow.position.y = 0; shadow.material.opacity = .35 - bob * .8; shadow.scale.set(2.6 - bob * 3, .5, 1);
  const ph = ((t * .7) % 4) / 4, blink = ph > .95 ? Math.max(.08, Math.abs((ph - .975) / .025)) : 1, j = Math.max(mood, 0), sd = Math.max(-mood, 0);
  eyes.forEach((e, i) => { const [bx, by] = e.userData.base; e.scale.set(bx * (1 + .15 * j), by * blink * (1 + .3 * j - .25 * sd), .05); e.rotation.z = (i ? 1 : -1) * -.4 * sd; e.position.y = .17 - .03 * sd; });
  const o = Math.min(1, Math.max(0, talk)); mouth.visible = o < .12; open.visible = o >= .12;
  open.scale.set(.13 + .05 * o, .01 + .12 * o, .03); open.position.y = -.04 - .05 * o + (mood < 0 ? -.02 : 0); mouth.rotation.z = mood < 0 ? 0 : Math.PI; mouth.position.y = mood < 0 ? -.1 : -.02;
  flames.forEach((f, i) => { const w = Math.sin(t * 7 + i * 2) * .5 + Math.sin(t * 11 + i) * .3; f.scale.y = f.userData.h * f.userData.s * 1.3 * (1 + .12 * w) * (1 + .3 * mood); f.rotation.z = Math.sin(t * 5 + i) * .1 - f.userData.x * .4; f.rotation.x = Math.sin(t * 4 + i) * .06; });
  if (fglow) fglow.material.opacity = .6 + Math.sin(t * 9) * .1;
}
export function makeStage(canvas, w, h, background = '#14110f', glowHex = '#ff8a3d') {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); r.setSize(w, h, false); r.setPixelRatio(1);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const s = new THREE.Scene(); s.background = col(background);
  const cam = new THREE.PerspectiveCamera(32, w / h, .1, 100); cam.position.set(0, 2.2, 10.5); cam.lookAt(-.1, 1.7, 0);
  s.add(new THREE.HemisphereLight(0xfff0e0, 0x4a2a18, .9));
  const k = new THREE.DirectionalLight(0xffffff, 2.6); k.position.set(3, 6, 6); s.add(k);
  const f = new THREE.PointLight(col(glowHex), 18, 12); f.position.set(0, 0, 3); s.add(f);
  const rim = new THREE.DirectionalLight(col(glowHex).lerp(new THREE.Color(0xffffff), .4), 1.6); rim.position.set(-5, 3, -4); s.add(rim);
  const pm = new THREE.PMREMGenerator(r), env = new THREE.Scene(); env.background = new THREE.Color(0x221810);
  const sb = (c, i, x, y, z, sx, sy) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: 2 })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  sb(0xffffff, 6, 0, 6, 4, 8, 4); sb(0xffd2a0, 4, -6, 2, 2, 3, 6); sb(0xffffff, 3, 6, 2, -2, 3, 6);
  s.environment = pm.fromScene(env, .04).texture;
  return { r, s, cam };
}
