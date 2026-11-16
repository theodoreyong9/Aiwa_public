# mascot-kit

A mascot described in a small JSON file, drawn in real 3D in the browser (three.js, on the CPU where there is no GPU), animated by pure functions of time (it floats, blinks, changes mood, speaks with its mouth following a voice, little ones follow it), and rendered to a film with ffmpeg. Nothing here belongs to one project: `examples/aiwa.json` and `examples/robin.json` are two examples, not defaults.

```
npm install --ignore-scripts          # three.js and playwright (Chromium: CHROMIUM_PATH, or `npx playwright install chromium`)
node src/cli.js still examples/robin.json robin.png
node src/cli.js film examples/aiwa.json film.mp4 --seconds=8 --timeline=examples/timeline.json --voice=voice.wav
```

## The description (`mascot.json`)

Every field is optional; `src/config.js` says what is assumed. `shape`: `drop` (pointed top, tilted so its tip trails), `egg`, `ball`, `capsule`, or `figure` (an egg head with a dark visor, a small body, arms and legs; `figure`: `{arms, legs, wings, halo, wave}` choose what it has; its eyes are smiling arcs that droop when sad; `examples/angel.json`). `color`, `accent` (the light on its edge), `glow`, `background`: `#rrggbb`. `face`: `visor`, `visorColor`, `eye` (`color`, `shape` oval or round, `size`), `mouth.color`. `beak`: `{color}` or nothing. `crest`: `{kind:"flame", count:1-5, colors:[low, high]}`. `emblem`: `{kind:"orb-ring"|"chevron", color}`, a sign on the head (or, on a figure, on the chest). `young`: `{count:0-5, scale:[…]}`, little copies that follow it (a single flame, no emblem). `yaw`: how far the face turns toward the camera. A wrong shape or colour is refused with a message, not drawn.

## The timeline

`{ "duration": 8, "mood": [{"at": 1, "v": 1}, …], "speak": [{"from": 1, "to": 3.6}] }`: the mood goes from -1 (sad: eyes droop, the flame lowers, the mouth turns down) to 1 (happy: eyes wide, the flame rises), eased between keys; the mouth moves only inside the `speak` windows.

## The voice and the lips

`src/lipsync.py voice.wav env.json --fps=24` writes one number from 0 to 1 per frame: the loudness of that slice of the voice, so that the loudest syllable opens the mouth fully. The voice itself comes from `../video-kit/src/voice.py` (`skills/voice`). **Honest limit:** the mouth follows the loudness, not the sounds (an "o" and an "a" open it alike), which is what a cartoon mouth needs. Without `--voice` the mouth moves to a steady rhythm while it speaks, and the film says so (`mouth` in the result): do not present that as lip sync.

## What it is, and is not

A rendered character: glossy, lit, simple. Not a photograph, not a modelled and rigged character from a studio, with simple limbs: soft capsules and balls, no fingers, no clothes, no face other than the visor, the eyes and the mouth. Rendering is software GL: about 30 s for 8 s of 960x540 video. To use it inside a film made with `video-kit`, render it as a clip (a still or a film at the film's size) and lay it with `video-kit assemble --clips`.

`node --test` checks the description, the mood, the speaking windows and the lip-sync envelope (numpy; set `PYTHON` to the interpreter that has it).

## Blender: the same figure, rigged with Rigify

`blender/figure.py` builds a `figure` in Blender (bpy, CPU only): it shapes Rigify's *basic human* meta-rig to a chibi's proportions (the breast bones removed: they would take the weights of the belly), generates the Rigify rig, builds the body, the legs and the arms as ONE organic mesh and weights it to the deform bones, and keys the FK controls: a float, a nod, a wave, the mood; the eyes blink and the mouth opens as the voice says. Rendered in Cycles with Freestyle outlines. `node src/cli.js film angel.json out.mp4 --engine=blender --seconds=8 --timeline=… --voice=…`.

**How the shapes are made** (what worked, in the order to try it):
- A graph of joints with radii thickened by the **Skin** modifier, rounded by **Subsurf**, applied, then `parent_set(type='ARMATURE_AUTO')` with only the `DEF-` bones deforming: one smooth body, a mitten hand with a thumb. Skin radii read thin: a first try with the radii one would guess gave sticks; chubby limbs need radii of 0.12 to 0.17 m on a 2 m figure.
- Feathers: a rounded outline (a single n-gon), **Solidify** then Subsurf, fanned from the wing's root; a rim of coloured light by the Fresnel of the Layer Weight node (emission).
- Glow: cards (a plane, emission fading with a radial gradient, transparent elsewhere), kept out of the outline. Not the compositor's Glare node: in Blender 5 the compositor wants a GPU, and the render dies without one. The outline is drawn on one collection only (`FreestyleLineSet` has no « exclude » option).
- Rigify's parameters only register headless with `addon_utils.enable('rigify', default_set=True, persistent=True)`; with `default_set=False` the generation fails with « RigifyParameters has no attribute ».
- Measured on this rig: a rotation about Z raises the right FK arm when negative.

**The loop that makes it good, not just done:** render a still of `examples/angel.json` and put it beside the reference picture (`ffmpeg -i ref.png -i still.png -filter_complex hstack`), list the differences (proportions, silhouette, the size of the visor, the wings, the light, the pose), fix the biggest one, render again. Three rounds on the first angel went from sticks, to a chubby body, to separate legs and clean outlines; it is still far from a generated picture (see the limits).

- **Cost, measured:** a 480x480 still takes 3 to 12 s; 8 s of film (192 frames) at 480x480 with 10 samples took 4.5 minutes on 8 cores. 1080p costs many times that. Setup: `python3.13 -m pip install bpy` (400 MB, once).
- **Honest limits:** only the `figure` shape. The result is a lit, outlined toy, not a modelled and sculpted character: the head is a sphere with a dark ball for a visor, the hands are mittens, there is no contrapposto pose and no real neon glow. The wave is one pose with an oscillation. The three.js engine stays the one that runs live in an app.
