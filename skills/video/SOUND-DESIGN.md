# Sound design: the music, the ambience, the voice, and what can be measured

What a Claude Code session reads at stage 4 of `PROMO-VIDEO.md`. Sound is half of a film. A flat, generated pad under a voice is a lecture, not a film (DIRECTOR-PLAYBOOK, section 5). Write `sound.md` first.

## The sound sheet (`sound.md`), one row per scene
| scene | bed (ambience) | music role | spot effects (what, when, how loud) | voice | silence |
Every scene has a **bed** (a room tone, a hum, a wind: never dead air), a **role for the music** (absent, rising, full, thinning), and **two or three spot effects** tied to what is seen (a UI tick when the phone answers, a swell when a world lights, a low impact on the flash). Name the **motif's sound** (the ember: a low hum that rises when it wakes) and let it return.

## The music
- **A real track first.** `music-research` search, then three candidates compared by tempo, mood and length; place cuts and lines on its strong beats; write title, author, licence and source in `brief.md`; show the credit if the licence asks. If the source is unreachable from the session, run the workflow `music-mirror.yml` (ids comma separated) and fetch from the release `music`.
- **Generated music is a placeholder**, said as such. If it must be generated, use real instrument samples (a soundfont through FluidSynth), a written composition (chords, bass, melody, drums), not sine pads.
- Cut points land on beats; the riser ends on the downbeat; the loudest part is near the end; the quietest scene is quieter than the loud one by at least 6 dB.

## The mix
Integrated about -14 LUFS, true peak under -1 dBFS; the voice 4 to 5 dB over the music while it speaks (`--duck=light`), the music full between lines; **a silence of 0.6 s or more before the line that matters** (at least 12 dB under the loud parts); effects never cover a word.

## What can be measured here, and what cannot
`video-kit/src/sound-check.py film.mp4 --cuts=frames/cuts.json` reports: the loudness curve per second, the loudness range (a film that never varies has LRA under 4 LU), the deepest silence, the true peak, and whether the accents (sudden rises) fall within 80 ms of a cut. It cannot tell whether the music is good. **No session can listen:** say so in the report, give the numbers, and ask the person to listen once and say what is wrong. Never write « the sound is good ».
