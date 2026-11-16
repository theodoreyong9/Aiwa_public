# Mascot

A character that stands for a creation, a brand, an agent or a product: a face, a body, a way of moving, a voice.

- Ask (or decide, and write down) what it is: the creature, its look, its colours, its character, what it stands for. Keep it **simple**: a body, a face with eyes and a mouth,
  one or two signs that make it recognisable (a crest, a beak, an emblem, wings, a halo). Two families: an animal-like body (`drop`, `egg`, `ball`, `capsule`) or a `figure` (head,
  body, arms, legs). No clothes, no fingers, no detail that has to be rigged; if the user shows a picture, take its idea (the colours, the signs, the pose), not its finish.
- Write it as `mascot.json` (shape, colours, face, crest, emblem, little ones that follow it). The fields and their limits are in `skills/kit/mascot-kit/README.md`; whatever is not
  written is assumed. Change it by editing that file, never by starting again: « rounder », « blue eyes », « two little ones » are one-line changes.
- Look first: `node skills/kit/mascot-kit/src/cli.js still mascot.json still.png`, then read the picture (the face readable, nothing cut, the sign visible). Fix once or twice, not ten times.
- Moods and speech: a timeline of moods (from sad to happy) and the windows where it speaks; the mouth follows the voice of `skills/voice` (`lipsync.py`) and moves to a rhythm if there is no
  voice, which you say. Then `mascot-kit film mascot.json out.mp4 --seconds=N --timeline=… --voice=…`.
- Clone the kit read-only as `skills/page` says: `git clone --depth 1 https://github.com/theodoreyong9/Aiwa_public /tmp/aiwa-ref`, and `npm install --ignore-scripts` in `skills/kit/mascot-kit`.
- Two engines for a `figure`: three.js (`mascot-kit film …`, seconds, runs live in an app) and Blender with a Rigify rig (`--engine=blender`, minutes, better light and outline, needs `python3.13` and `pip install bpy`). Look at a still of each first; use Blender for a film, three.js for anything live.
- Say what it is: a rendered drawing, never a photograph or a recording. It is software-rendered (slow: about 30 s per 8 s of film at 960x540); say so before promising a long film.
- In a longer film (`skills/video`), render the mascot as a clip and lay it over the pages with `video-kit assemble --clips`.
- A still is published with the tag `image-…`, a film with `video-…` (see `skills/release/SKILL.md`), the `mascot.json` as a note beside them so that it can be changed later.
