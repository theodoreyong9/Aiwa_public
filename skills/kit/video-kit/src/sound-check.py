#!/usr/bin/env python3
"""What can be measured of a film's sound (not whether it is good: no session can listen).

  sound-check.py film.mp4 [--cuts=frames/cuts.json] [--voice=vo.wav]     (needs numpy and ffmpeg)

Prints JSON: integrated loudness, loudness range (LRA), true peak; the loudness curve per second; the deepest silence (0.4 s window) and how far under the median it is;
and, if the instants of the cuts are given, how many cuts carry an accent (a sudden rise of the level within 80 ms of the cut). With --voice (the voice track alone), the share of the film
in which the voice speaks (it should stay under about 40 %). The `notes` say what is flat or missing, in plain words; they are measurements, never praise."""
import json, re, subprocess, sys
import numpy as np

def decode(path, sr=22050):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4'), sr

def ebur(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tail = r[r.rfind('Summary:'):]
    g = lambda k: float(re.search(k + r':\s+(-?[\d.]+)', tail).group(1)) if re.search(k + r':\s+(-?[\d.]+)', tail) else None
    return {'integrated_lufs': g('I'), 'lra_lu': g('LRA'), 'true_peak_dbfs': g('Peak')}

def db(x): return 20 * np.log10(np.maximum(x, 1e-6))

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]; o = dict(x[2:].split('=', 1) for x in sys.argv[1:] if x.startswith('--') and '=' in x)
    if not a: sys.exit(__doc__)
    x, sr = decode(a[0]); dur = len(x) / sr
    out = {'seconds': round(dur, 2), **ebur(a[0])}
    sec = [float(np.sqrt((x[int(i * sr):int((i + 1) * sr)] ** 2).mean())) for i in range(int(dur))]
    curve = db(np.array(sec)); out['curve_db_per_second'] = [round(float(v), 1) for v in curve]
    med = float(np.median(curve)); win = int(.4 * sr); step = int(.05 * sr)
    w = [(float(db(np.sqrt((x[i:i + win] ** 2).mean()))), i / sr) for i in range(0, len(x) - win, step)]
    lo = min(w); out['deepest_silence'] = {'at_s': round(lo[1], 2), 'db': round(lo[0], 1), 'under_median_db': round(med - lo[0], 1)}
    notes = []
    if out['lra_lu'] is not None and out['lra_lu'] < 4: notes.append(f"flat: the loudness range is {out['lra_lu']} LU (under 4): the sound never really rises or falls")
    if out['deepest_silence']['under_median_db'] < 12: notes.append(f"no real silence: the quietest 0.4 s is only {out['deepest_silence']['under_median_db']} dB under the median (a silence before the key line wants 12 or more)")
    if out['true_peak_dbfs'] is not None and out['true_peak_dbfs'] > -1: notes.append(f"true peak {out['true_peak_dbfs']} dBFS: over -1, risk of clipping")
    if out['integrated_lufs'] is not None and not (-16 <= out['integrated_lufs'] <= -12): notes.append(f"integrated loudness {out['integrated_lufs']} LUFS: far from the -14 of social video")
    if 'cuts' in o:
        cuts = json.load(open(o['cuts'])).get('cuts', []); fr = int(.025 * sr)
        env = np.array([np.sqrt((x[i:i + fr] ** 2).mean()) for i in range(0, len(x) - fr, fr)]); on = np.maximum(np.diff(db(env)), 0); base = float(np.percentile(on, 90)) or 1.0
        hit = 0; det = []
        for c in cuts:
            i = int(c / .025); seg = on[max(0, i - 3):i + 4]; ok = bool(len(seg) and seg.max() > base); hit += ok; det.append({'cut_s': c, 'accent': ok})
        out['accents'] = {'cuts': len(cuts), 'with_accent': hit, 'detail': det}
        if cuts and hit < 0.7 * len(cuts): notes.append(f"only {hit} of {len(cuts)} cuts carry an accent (a sudden rise within 80 ms)")
    if 'voice' in o:
        v, vsr = decode(o['voice']); fr = int(.1 * vsr); lv = db(np.array([np.sqrt((v[i:i + fr] ** 2).mean()) for i in range(0, len(v) - fr, fr)]))
        share = float((lv > lv.max() - 35).mean()); out['voice_share'] = round(share, 2)
        if share > .4: notes.append(f"the voice speaks {round(share * 100)} % of the film (more than 40 %: a lecture)")
    out['notes'] = notes or ['nothing flagged by these measurements (this says nothing about whether it is good: someone must listen)']
    print(json.dumps(out, indent=1))

if __name__ == '__main__': main()
