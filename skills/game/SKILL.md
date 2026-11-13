# Games

- Read the standard of quality first: https://raw.githubusercontent.com/theodoreyong9/Aiwa_public/main/skills/game/FOUNDATION.md
- A small game, or a game inside another creation: decide yourself what is missing (genre, 2D or 3D, solo or not) and say your choices in
  the notes of the release.
- Choose the base by the need and say why: a single HTML file for a small game; a contract of Aiwa (the contract skill) when results or
  rewards must be verifiable by the players themselves.
- A game is played before it is published: run it, play a full loop, and fix what breaks the first minute.
- Publish with the tag `game-…`.

## A real game

For a full game, what is missing from the request (genre, 2D or 3D, solo or multiplayer, number of players, real time or turn by turn,
target platforms) is decided on reasonable assumptions, said in the notes of the release; a choice that truly changes everything is asked
through a `blocked` line of the status file.

- The base, by the need, and say why: an HTML file or a site for a small game; a contract of Aiwa when results or rewards must be
  verifiable by everyone without a server; Godot 4 + Nakama for real-time multiplayer from 2 to 16 players.
- Build by verified steps, and do not go to the next when one fails.
- The server (or the contract) has the last word on results and rewards: test a forged action and a duplicated command.
- Write the rules for disconnection, abandonment and reconnection, and test them.
- Never say that a build, a test or a deployment succeeded without the output of its run; never replace a missing function with an
  unannounced simulation; invent no method of an SDK (read the official documentation of the version used); announce no capacity (8 or 16
  players) that you did not measure.
- Before delivering, PLAY IT yourself: open it in Chromium with Playwright, play a full game by script (start, points, end, replay), check
  that the console holds no error, take captures at 390 px and 1440 px, look at them, fix what is broken, cut or unreadable, and say what
  you saw.
- Free sets, 3D models, textures and lights: search the register first
  (`node skills/kit/asset-research/src/cli.js search "<what is needed>" --kind=model`, from the cloned kit) and download only what you keep.
  Music and sounds: `node skills/kit/music-research/src/cli.js search "<the mood>" --credit=ok`. Keep the source and the licence of every
  element in the game's `CREDITS.md`.
- For the interface and the visual direction, the measured references of the page skill apply.
