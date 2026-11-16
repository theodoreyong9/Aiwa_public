import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { normalize, moodAt, speaking } from '../src/config.js';

const PY = process.env.PYTHON || 'python3';
const here = dirname(fileURLToPath(import.meta.url));
const example = n => JSON.parse(readFileSync(join(here, '..', 'examples', n), 'utf8'));

test('a description with almost nothing in it gets a whole mascot', () => {
  const c = normalize({});
  assert.equal(c.shape, 'drop'); assert.equal(c.tilt, -0.75); assert.equal(c.crest, null); assert.equal(c.young.count, 0);
  assert.equal(normalize({ shape: 'ball' }).tilt, 0);
});
test('a wrong shape or colour is refused, not drawn', () => {
  assert.throws(() => normalize({ shape: 'cube' }), /shape must be one of/);
  assert.throws(() => normalize({ color: 'red' }), /#rrggbb/);
});
test('the crest and the young are kept within what can be drawn', () => {
  assert.equal(normalize({ crest: { count: 99 } }).crest.count, 5);
  assert.equal(normalize({ crest: { count: 0 } }).crest.count, 1);
  assert.equal(normalize({ young: { count: 40 } }).young.count, 5);
});
test('the examples are valid, and nothing in them is the default', () => {
  const a = normalize(example('aiwa.json')), r = normalize(example('robin.json'));
  assert.notEqual(a.shape, r.shape); assert.equal(a.young.count, 3); assert.equal(r.young.count, 0);
});
test('a figure turns its face to the camera more than an animal, and has its own parts', () => {
  const f = normalize(example('angel.json'));
  assert.equal(f.shape, 'figure'); assert.ok(f.yaw > normalize({}).yaw); assert.equal(f.figure.wings, true); assert.equal(f.emblem.kind, 'chevron');
});
test('the mood is eased between keys and clamped outside them', () => {
  const tl = example('timeline.json');
  assert.equal(moodAt(tl, -1), 0); assert.equal(moodAt(tl, 2), 1); assert.equal(moodAt(tl, 9), -1);
  assert.ok(moodAt(tl, 4.2) < 1 && moodAt(tl, 4.2) > -1);
  assert.equal(moodAt({}, 3), 0);
});
test('speaking windows', () => {
  const tl = example('timeline.json');
  assert.equal(speaking(tl, 2), true); assert.equal(speaking(tl, 4), false); assert.equal(speaking({}, 2), false);
});

const py = spawnSync(PY, ['-c', 'import numpy'], { encoding: 'utf8' });
test('lipsync: the mouth opens on the loud parts of a voice and stays shut in the silences', { skip: py.status === 0 ? false : 'numpy is not installed here' }, () => {
  const d = mkdtempSync(join(tmpdir(), 'mk-')), wav = join(d, 'v.wav'), out = join(d, 'e.json');
  const gen = `import numpy as np, wave
sr=24000; t=np.arange(sr*2)/sr; x=np.where((t>.5)&(t<1.2), np.sin(2*np.pi*220*t), 0)*.6
w=wave.open(${JSON.stringify(wav)},'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()`;
  assert.equal(spawnSync(PY, ['-c', gen]).status, 0);
  assert.equal(spawnSync(PY, [join(here, '..', 'src', 'lipsync.py'), wav, out, '--fps=10']).status, 0);
  const env = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(env.length, 20);
  assert.ok(env[0] === 0 && env[18] === 0, 'shut while silent');
  assert.ok(env[8] > 0.5, 'open while loud');
});
