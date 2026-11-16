#!/usr/bin/env python3
"""How wide the mouth is open at each frame of a film, from the audio of the voice.

  lipsync.py voice.wav out.json [--fps=24] [--seconds=8]

Writes a JSON list, one number from 0 to 1 per frame: the loudness of that frame's slice of the voice, scaled so that the loudest syllable opens the mouth fully.
Honest limit: it follows the loudness, not the sounds (an "o" and an "a" open the mouth alike). That is what a cartoon mouth needs, and it is the same on every voice; no model, no GPU.
Needs numpy; a wav that is not mono 16-bit is converted with ffmpeg first.
"""
import json, subprocess, sys, tempfile, wave, os
import numpy as np


def load(path):
    try:
        w = wave.open(path, 'rb')
        if w.getsampwidth() != 2:
            raise wave.Error('not 16-bit')
        sr, ch, raw = w.getframerate(), w.getnchannels(), w.readframes(w.getnframes())
        x = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0
        return sr, x.reshape(-1, ch).mean(axis=1)
    except wave.Error:
        tmp = os.path.join(tempfile.mkdtemp(), 'v.wav')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', '24000', '-sample_fmt', 's16', tmp], check=True)
        return load(tmp)


def envelope(sr, x, fps, seconds=None):
    n = int((seconds if seconds else len(x) / sr) * fps)
    env = []
    for f in range(n):
        seg = x[int(f / fps * sr):int((f + 1) / fps * sr)]
        env.append(float(np.sqrt((seg ** 2).mean())) if len(seg) else 0.0)
    m = max(env) if env else 0.0
    if m <= 0:
        return [0.0] * n
    return [min(1.0, e / m * 1.5) if e / m > 0.04 else 0.0 for e in env]   # a floor so that the noise of a silence does not move the mouth


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
    if len(args) != 2:
        sys.exit(__doc__)
    sr, x = load(args[0])
    env = envelope(sr, x, float(opt.get('fps', 24)), float(opt['seconds']) if 'seconds' in opt else None)
    json.dump(env, open(args[1], 'w'))
    print(json.dumps({'frames': len(env), 'speaking_frames': sum(e > 0 for e in env)}))
