# mascot-kit

A mascot described in a small JSON file, drawn in real 3D in the browser (three.js, on the CPU where there is no GPU), animated by pure functions of time (it floats, blinks, changes mood, speaks with its mouth following a voice, little ones follow it), and rendered to a film with ffmpeg. Nothing here belongs to one project: `examples/aiwa.json` and `examples/robin.json` are two examples, not defaults.

```
npm install --ignore-scripts          # three.js and playwright (Chromium: CHROMIUM_PATH, or `npx playwright install chromium`)
node src/cli.js still examples/robin.json robin.png
node src/cli.js film examples/aiwa.json film.mp4 --seconds=8 --timeline=examples/timeline.json --voice=voice.wav
```

## The description (`mascot.json`)

Every field is optional; `src/config.js` says what is assumed. `shape`: `drop` (pointed top, tilted so its tip trails), `egg`, `ball`, `capsule`. `color`, `accent` (the light on its edge), `glow`, `background`: `#rrggbb`. `face`: `visor`, `visorColor`, `eye` (`color`, `shape` oval or round, `size`), `mouth.color`. `beak`: `{color}` or nothing. `crest`: `{kind:"flame", count:1-5, colors:[low, high]}`. `emblem`: `{kind:"orb-ring", color}`, a sign on the head. `young`: `{count:0-5, scale:[…]}`, little copies that follow it (a single flame, no emblem). `yaw`: how far the face turns toward the camera. A wrong shape or colour is refused with a message, not drawn.

## The timeline

`{ "duration": 8, "mood": [{"at": 1, "v": 1}, …], "speak": [{"from": 1, "to": 3.6}] }`: the mood goes from -1 (sad: eyes droop, the flame lowers, the mouth turns down) to 1 (happy: eyes wide, the flame rises), eased between keys; the mouth moves only inside the `speak` windows.

## The voice and the lips

`src/lipsync.py voice.wav env.json --fps=24` writes one number from 0 to 1 per frame: the loudness of that slice of the voice, so that the loudest syllable opens the mouth fully. The voice itself comes from `../video-kit/src/voice.py` (`skills/voice`). **Honest limit:** the mouth follows the loudness, not the sounds (an "o" and an "a" open it alike), which is what a cartoon mouth needs. Without `--voice` the mouth moves to a steady rhythm while it speaks, and the film says so (`mouth` in the result): do not present that as lip sync.

## What it is, and is not

A rendered character: glossy, lit, simple. Not a photograph, not a modelled and rigged character from a studio, and no arms or legs (a body, a face, a crest, an emblem, a beak, little ones). Rendering is software GL: about 30 s for 8 s of 960x540 video. To use it inside a film made with `video-kit`, render it as a clip (a still or a film at the film's size) and lay it with `video-kit assemble --clips`.

`node --test` checks the description, the mood, the speaking windows and the lip-sync envelope (numpy; set `PYTHON` to the interpreter that has it).
