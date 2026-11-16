// The description of a mascot, and what is assumed when a field is missing. Pure data: the browser (mascot.js) and Node (render.js, the tests) read it the same way.
// Nothing here belongs to one project: a mascot is whatever its description says.
export const SHAPES = ['drop', 'egg', 'ball', 'capsule', 'figure'];   // figure: a head, a body, arms, legs, and optionally wings and a halo
export const DEFAULTS = {
  name: 'mascot',
  shape: 'drop',            // the body: drop (a pointed top), egg, ball, capsule
  color: '#faf3ea',         // the body
  accent: '#ffb27a',        // the light on its edge and under it
  tilt: null,               // radians; null = -0.75 for a drop (its tip trails behind), 0 otherwise
  face: { visor: true, visorColor: '#0b0806', eye: { color: '#ffe6c2', shape: 'oval', size: 1 }, mouth: { color: '#ff8a4a' } },
  beak: null,               // { color } or null
  crest: null,              // { kind: 'flame', count: 1..5, colors: [low, high] } or null
  emblem: null,             // { kind: 'orb-ring', color } or null: a sign on the head
  glow: '#ff8a3d',          // the halo of light around it
  background: '#14110f',
  young: { count: 0, scale: [0.42, 0.34, 0.28] },   // little copies that follow it
  yaw: null,                // how far its face turns toward the camera (0 = in profile, 1.57 = full face); 0.62 for the animals, 1.4 for a figure
  figure: { arms: true, legs: true, wings: false, halo: false, wave: true },   // only for shape 'figure'                // how far its face turns toward the camera (0 = in profile, 1.57 = full face)
};
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const merge = (base, extra) => {
  const out = { ...base };
  for (const k of Object.keys(extra || {})) out[k] = isObj(base[k]) && isObj(extra[k]) ? merge(base[k], extra[k]) : extra[k];
  return out;
};
export function normalize(input = {}) {
  const c = merge(DEFAULTS, input);
  if (!SHAPES.includes(c.shape)) throw new Error(`shape must be one of ${SHAPES.join(', ')}, not ${c.shape}`);
  for (const k of ['color', 'accent', 'glow', 'background']) if (!/^#[0-9a-fA-F]{6}$/.test(c[k])) throw new Error(`${k} must be a #rrggbb colour`);
  if (c.yaw === null) c.yaw = c.shape === 'figure' ? 1.4 : 0.62;
  if (c.tilt === null) c.tilt = c.shape === 'drop' ? -0.75 : 0;
  if (c.crest) { c.crest = merge({ kind: 'flame', count: 3, colors: ['#ff5a1f', '#ffd27a'] }, c.crest); c.crest.count = Math.max(1, Math.min(5, Math.round(c.crest.count))); }
  if (c.beak) c.beak = merge({ color: '#ff8a3d' }, c.beak);
  if (c.emblem) c.emblem = merge({ kind: 'orb-ring', color: '#ff6b35' }, c.emblem);   // kinds: orb-ring, chevron (an A without its bar)
  c.young.count = Math.max(0, Math.min(5, Math.round(c.young.count)));
  return c;
}
// A timeline for a film: { duration, mood: [{at, v}] (v from -1 sad to 1 happy), speak: [{from, to}] }. The value of the mood at time t, eased between keys.
export function moodAt(timeline, t) {
  const k = [...(timeline.mood || [])].sort((a, b) => a.at - b.at);
  if (!k.length) return 0;
  if (t <= k[0].at) return k[0].v;
  for (let i = 1; i < k.length; i++) if (t <= k[i].at) { const u = (t - k[i - 1].at) / Math.max(1e-6, k[i].at - k[i - 1].at); return k[i - 1].v + (k[i].v - k[i - 1].v) * u * u * (3 - 2 * u); }
  return k[k.length - 1].v;
}
export const speaking = (timeline, t) => (timeline.speak || []).some(s => t >= s.from && t < s.to);
