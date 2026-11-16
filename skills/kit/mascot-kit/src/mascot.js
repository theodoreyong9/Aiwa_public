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
  const c = normalize(config);
  if (c.shape === 'figure') return makeFigure(c, small);
  const top = TOP[c.shape];
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

const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(60,70,130,.55)'); r.addColorStop(1, 'rgba(60,70,130,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const ball = (rx, ry, rz, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mat); m.scale.set(rx, ry, rz); m.position.set(x, y, z); return m; };
// A figure: an egg head with a dark visor, a small body, arms, legs, and wings and a halo if asked. Standing a little above the ground.
function makeFigure(c, small) {
  const root = new THREE.Group(), inner = new THREE.Group(), fig = new THREE.Group(); root.add(inner); inner.add(fig); fig.scale.setScalar(.8);
  const white = new THREE.MeshPhysicalMaterial({ color: col(c.color), roughness: .3, clearcoat: .8, clearcoatRoughness: .2, sheen: 1, sheenColor: col(c.accent), sheenRoughness: .6 });
  const lit = col(c.glow), F = c.figure;
  fig.add(ball(1.0, .96, .95, white, 0, 3.3, 0));                                          // head
  fig.add(ball(.72, .95, .6, white, 0, 1.95, 0));                                          // body
  const neck = ball(.3, .15, .3, new THREE.MeshPhysicalMaterial({ color: 0x1c2233, roughness: .5 }), 0, 2.78, 0); fig.add(neck);
  if (F.legs) for (const x of [-.3, .3]) { const l = new THREE.Mesh(new THREE.CapsuleGeometry(.27, .7, 8, 16), white); l.position.set(x, .75, 0); fig.add(l); fig.add(ball(.36, .2, .5, white, x, .22, .1)); }
  const arm = (side, raised) => { const g = new THREE.Group(); g.position.set(side * .7, 2.45, 0); const a = new THREE.Mesh(new THREE.CapsuleGeometry(.2, .75, 8, 16), white); a.position.set(side * .1, -.38, 0); const h = ball(.26, .3, .2, white, side * .1, -.95, .05); g.add(a, h); g.rotation.z = raised ? side * 1.9 : side * -.22; fig.add(g); return g; };
  const armR = F.arms ? arm(-1, F.wave) : null; if (F.arms) arm(1, false);
  const visor = ball(.86, .68, .42, new THREE.MeshPhysicalMaterial({ color: col(c.face.visorColor), roughness: .05, metalness: .2, clearcoat: 1, clearcoatRoughness: .03 }), 0, 3.3, .62); fig.add(visor);
  const eyeMat = new THREE.MeshBasicMaterial({ color: col(c.face.eye.color), toneMapped: false }), additive = (op, sx, sy) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(c.glow), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: op })); s.scale.set(sx, sy, 1); return s; };
  const eyes = [-1, 1].map(side => { const e = new THREE.Mesh(new THREE.TorusGeometry(.17, .04, 12, 24, Math.PI), eyeMat); e.position.set(side * .36, 3.38, 1.0); e.scale.set(1.25, 1.25, 1); e.userData.side = side; fig.add(e); const s = additive(.55, .8, .6); s.position.set(side * .36, 3.4, 1.05); fig.add(s); return e; });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.13, .032, 10, 24, Math.PI), eyeMat); mouth.rotation.z = Math.PI; mouth.position.set(0, 3.02, 1.02); fig.add(mouth);
  const open = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: col(c.face.mouth.color), toneMapped: false })); open.position.set(0, 2.98, 1.0); open.scale.set(.15, .01, .03); fig.add(open);
  if (c.emblem && !small) { const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: col(c.emblem.color), toneMapped: false });
    if (c.emblem.kind === 'chevron') for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(.045, .34, 6, 12), mat); b.rotation.z = s * .62; b.position.x = s * .13; g.add(b); } else { g.add(new THREE.Mesh(new THREE.SphereGeometry(.12, 24, 18), mat), new THREE.Mesh(new THREE.TorusGeometry(.24, .018, 10, 48), new THREE.MeshBasicMaterial({ color: col(c.accent), toneMapped: false }))); }
    g.position.set(0, 2.1, .6); g.rotation.x = -.1; g.add(additive(.5, 1.2, 1.2)); fig.add(g); }
  const wings = [];
  if (F.wings && !small) for (const side of [-1, 1]) {
    const g = new THREE.Group(); g.position.set(side * .5, 2.5, -.4); g.scale.setScalar(1.25);
    for (const [ang, len, y] of [[.5, 1.0, .35], [.1, 1.15, 0], [-.35, .95, -.4]]) {
      const lobe = new THREE.Group(); lobe.rotation.z = side * ang; const m = ball(len * .5, .27, .1, white, side * len * .5, 0, 0), halo = ball(len * .5 + .06, .33, .16, new THREE.MeshBasicMaterial({ color: lit, side: THREE.BackSide, transparent: true, opacity: .7, toneMapped: false }), side * len * .5, 0, 0); lobe.add(m, halo); lobe.position.y = y * .4; g.add(lobe); }
    g.rotation.y = side * .5; fig.add(g); wings.push(g); }
  let halo = null;
  if (F.halo) { halo = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(.78, .07, 16, 64), new THREE.MeshBasicMaterial({ color: col(c.glow).lerp(new THREE.Color(0xffffff), .2), toneMapped: false, transparent: true })); ring.rotation.x = Math.PI / 2 - .38; ring.renderOrder = 10; halo.add(ring, additive(.35, 3.4, 1.4)); halo.position.set(0, 4.75, 0); fig.add(halo); }
  const shadow = new THREE.Sprite(new THREE.SpriteMaterial({ map: shadowTex, depthWrite: false, opacity: .5 })); shadow.scale.set(3, .7, 1); root.add(shadow);
  root.userData = { figure: true, inner, fig, eyes, mouth, open, wings, halo, armR, shadow, config: c };
  return root;
}
function animateFigure(m, t, mood, talk) {
  const { inner, fig, eyes, mouth, open, wings, halo, armR, shadow } = m.userData, bob = Math.sin(t * 2) * .1;
  inner.position.y = .45 + bob; fig.rotation.y = Math.sin(t * .8) * .08; fig.rotation.z = Math.sin(t * 1.3) * .015;
  shadow.position.y = .02; shadow.rotation.x = 0; shadow.scale.set(3 - bob * 3, .7, 1); shadow.material.opacity = .5 - bob * .8;
  const ph = ((t * .7) % 4) / 4, blink = ph > .95 ? Math.max(.1, Math.abs((ph - .975) / .025)) : 1, j = Math.max(mood, 0), sd = Math.max(-mood, 0);
  eyes.forEach(e => { e.scale.set(1.25, 1.25 * blink * (.6 + .4 * Math.min(1, .4 + j) - .1 * sd), 1); e.rotation.z = sd > .2 ? Math.PI : 0; e.position.y = 3.38 - (sd > .2 ? .1 : 0); });
  const o = Math.min(1, Math.max(0, talk)); mouth.visible = o < .12; open.visible = o >= .12; open.scale.set(.14 + .05 * o, .01 + .13 * o, .03); open.position.y = 3.0 - .06 * o; mouth.rotation.z = mood < 0 ? 0 : Math.PI; mouth.position.y = mood < 0 ? 2.95 : 3.02;
  wings.forEach((w, i) => { const s = i ? 1 : -1; w.rotation.z = s * (Math.sin(t * 2.4) * .08 - .05); });
  if (halo) { halo.position.y = 4.75 + Math.sin(t * 2 + 1) * .06; }
  if (armR) armR.rotation.z = -1.9 + Math.sin(t * 2.2) * .12 * (1 + talk);
}
// A pure function of the time t, of the mood (-1 sad .. 1 happy) and of how open the mouth is (0 .. 1).
export function animateMascot(m, t, mood = 0, talk = 0) {
  if (m.userData.figure) return animateFigure(m, t, mood, talk);
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
export function makeStage(canvas, w, h, background = '#14110f', glowHex = '#ff8a3d', shape = 'drop') {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true }); r.setSize(w, h, false); r.setPixelRatio(1);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const s = new THREE.Scene(); s.background = col(background);
  const cam = new THREE.PerspectiveCamera(32, w / h, .1, 100); if (shape === 'figure') { cam.position.set(0, 3.0, 9.6); cam.lookAt(0, 2.45, 0); } else { cam.position.set(0, 2.2, 10.5); cam.lookAt(-.1, 1.7, 0); }
  s.add(new THREE.HemisphereLight(0xfff0e0, 0x4a2a18, .9));
  const k = new THREE.DirectionalLight(0xffffff, 2.6); k.position.set(3, 6, 6); s.add(k);
  const f = new THREE.PointLight(col(glowHex), 18, 12); f.position.set(0, 0, 3); s.add(f);
  const rim = new THREE.DirectionalLight(col(glowHex).lerp(new THREE.Color(0xffffff), .4), 1.6); rim.position.set(-5, 3, -4); s.add(rim);
  const pm = new THREE.PMREMGenerator(r), env = new THREE.Scene(); env.background = shape === 'figure' && col(background).getHSL({}).l > .4 ? col(background).multiplyScalar(.9) : new THREE.Color(0x221810);
  const sb = (c, i, x, y, z, sx, sy) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), side: 2 })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  sb(0xffffff, 6, 0, 6, 4, 8, 4); sb(0xffd2a0, 4, -6, 2, 2, 3, 6); sb(0xffffff, 3, 6, 2, -2, 3, 6);
  s.environment = pm.fromScene(env, .04).texture;
  return { r, s, cam };
}
