// Renders a mascot film: frames from the stage page in Chromium (software WebGL, no GPU), then ffmpeg. A still: renderStill.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const TYPES = { '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html' };

// A server over the kit folder (the page, three.js) and over the folder of the files the film reads (config, timeline, envelope).
function serve(extra) {
  return new Promise(ok => {
    const srv = createServer(async (q, res) => {
      const u = decodeURIComponent(q.url.split('?')[0]);
      for (const root of [u.startsWith('/files/') ? extra : null, KIT].filter(Boolean)) {
        const p = join(root, u.startsWith('/files/') ? u.slice(7) : u);
        if (!p.startsWith(root)) continue;
        try { const data = await readFile(p); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(data); return; } catch { /* try the next */ }
      }
      res.writeHead(404); res.end();
    }).listen(0, '127.0.0.1', () => ok(srv));
  });
}
async function open({ config, timeline, env, width, height, executablePath, transparent = false }) {
  const files = resolve(dirname(config)), srv = await serve(files), port = srv.address().port;
  const rel = f => f && `/files/${resolve(f).slice(files.length + 1)}`;
  const browser = await chromium.launch({ executablePath, args: GL_ARGS }), page = await browser.newPage({ viewport: { width, height } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const qs = new URLSearchParams({ config: rel(config), w: width, h: height }); if (transparent) qs.set('transparent', '1'); if (timeline) qs.set('timeline', rel(timeline)); if (env) qs.set('env', rel(env));
  await page.goto(`http://127.0.0.1:${port}/template/stage.html?${qs}`);
  await page.waitForFunction('window.ready', null, { timeout: 90000 }).catch(() => { throw new Error(`the stage did not start: ${errors.join('; ') || 'no error reported'}`); });
  return { page, close: async () => { await browser.close(); srv.close(); } };
}
export async function renderStill({ config, out, t = 1.3, width = 1280, height = 720, timeline, env, executablePath = process.env.CHROMIUM_PATH || undefined }) {
  const s = await open({ config, timeline, env, width, height, executablePath });
  try { await s.page.evaluate(`window.render(${t}, ${Math.round(t * 24)})`); await s.page.screenshot({ path: out }); } finally { await s.close(); }
  return out;
}
// `audio` is the voice (wav or anything ffmpeg reads); the mouth follows it when `env` is given (lipsync.py makes it), else it moves to a rhythm, and the result says so.
export async function renderFrames({ config, outDir, seconds, fps = 24, width = 1280, height = 720, timeline, env, transparent = true, executablePath = process.env.CHROMIUM_PATH || undefined }) {
  // PNG frames with an alpha channel (a transparent ground), to lay over a film: outDir/00000.png …
  await mkdir(outDir, { recursive: true }); const s = await open({ config, timeline, env, width, height, executablePath, transparent }), n = Math.round(seconds * fps);
  try { for (let f = 0; f < n; f++) { await s.page.evaluate(`window.render(${f / fps}, ${f})`); await s.page.screenshot({ path: join(outDir, `${String(f).padStart(5, '0')}.png`), omitBackground: transparent }); } } finally { await s.close(); }
  return { outDir, frames: n };
}
export async function renderFilm({ config, out, seconds, fps = 24, width = 1280, height = 720, timeline, env, audio, keepFrames = false, executablePath = process.env.CHROMIUM_PATH || undefined }) {
  if (!(seconds > 0)) throw new Error('seconds must be positive');
  const dir = join(dirname(resolve(out)), `.${Date.now()}-frames`); await mkdir(dir, { recursive: true });
  const s = await open({ config, timeline, env, width, height, executablePath }), n = Math.round(seconds * fps);
  try { for (let f = 0; f < n; f++) { await s.page.evaluate(`window.render(${f / fps}, ${f})`); await s.page.screenshot({ path: join(dir, `${String(f).padStart(5, '0')}.png`) }); } } finally { await s.close(); }
  const args = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(dir, '%05d.png'), ...(audio ? ['-i', audio] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', ...(audio ? ['-c:a', 'aac', '-shortest'] : []), out];
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (!keepFrames) rmSync(dir, { recursive: true, force: true });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr}`);
  return { out, frames: n, mouth: env ? 'follows the voice' : 'steady rhythm (no voice file given)' };
}
