#!/usr/bin/env node
// mascot-kit still mascot.json out.png [--t=1.3] [--width=1280] [--height=720]
// mascot-kit film mascot.json out.mp4 --seconds=8 [--timeline=timeline.json] [--voice=voice.wav] [--fps=24] [--width=960] [--height=540]
//   --engine=blender renders the Rigify-rigged figure in Blender (python3.13 + bpy; minutes, not seconds; only for shape "figure"); [--samples=16]
//   with --voice, the mouth follows it (python3 src/lipsync.py is run for you); without, it moves to a rhythm.
import { renderStill, renderFilm } from './render.js';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const PY = process.env.PYTHON || 'python3';
const [cmd, config, out, ...rest] = process.argv.slice(2);
const o = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
if (!['still', 'film'].includes(cmd) || !config || !out) { console.error(readUsage()); process.exit(2); }
function readUsage() { return 'usage: mascot-kit still mascot.json out.png [--t=1.3]\n       mascot-kit film mascot.json out.mp4 --seconds=8 [--timeline=t.json] [--voice=voice.wav] [--fps=24] [--width=960] [--height=540]'; }
const num = (k, d) => o[k] === undefined ? d : +o[k];
if (cmd === 'still') {
  console.log(await renderStill({ config, out, t: num('t', 1.3), width: num('width', 1280), height: num('height', 720), timeline: o.timeline }));
} else if (o.engine === 'blender') {
  // The Rigify-rigged figure in Blender (CPU): slower (minutes), better lit and outlined. python3.13 with `pip install bpy`; the voice's envelope comes from lipsync.py.
  const { mkdtempSync, rmSync, copyFileSync } = await import('node:fs'); const { tmpdir } = await import('node:os');
  const fps = num('fps', 24), seconds = num('seconds', 0), py13 = process.env.PYTHON_BPY || 'python3.13', here = dirname(fileURLToPath(import.meta.url)), tmp = mkdtempSync(join(tmpdir(), 'mk-bl-'));
  const args = [join(here, '..', 'blender', 'figure.py'), config, tmp, `--seconds=${seconds}`, `--fps=${fps}`, `--width=${num('width', 720)}`, `--height=${num('height', 720)}`, `--samples=${num('samples', 16)}`];
  if (o.timeline) args.push(`--timeline=${o.timeline}`);
  if (o.voice) { const env = join(tmp, 'env.json'); const r = spawnSync(PY, [join(here, 'lipsync.py'), o.voice, env, `--fps=${fps}`, `--seconds=${seconds}`], { encoding: 'utf8' }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } args.push(`--env=${env}`); }
  const r = spawnSync(py13, args, { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1);
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(tmp, '%04d.png'), ...(o.voice ? ['-i', o.voice, '-c:a', 'aac', '-shortest'] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', out], { encoding: 'utf8' });
  rmSync(tmp, { recursive: true, force: true }); if (ff.status !== 0) { console.error(ff.stderr); process.exit(1); }
  console.log(JSON.stringify({ out, engine: 'blender', mouth: o.voice ? 'follows the voice' : 'steady rhythm (no voice file given)' }));
} else {
  const fps = num('fps', 24), seconds = num('seconds', 0);
  let env;
  if (o.voice) {
    env = resolve(dirname(out), `${out.replace(/\.[^.]+$/, '').split('/').pop()}.env.json`);
    const r = spawnSync(PY, [join(dirname(fileURLToPath(import.meta.url)), 'lipsync.py'), o.voice, env, `--fps=${fps}`, `--seconds=${seconds}`], { encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stderr || r.stdout); process.exit(1); }
    // the page reads the envelope through the folder of the config: copy it there
    const { copyFileSync } = await import('node:fs'); const there = join(dirname(resolve(config)), '.env.json'); copyFileSync(env, there); env = there;
  }
  console.log(JSON.stringify(await renderFilm({ config, out, seconds, fps, width: num('width', 960), height: num('height', 540), timeline: o.timeline, env, audio: o.voice })));
}
