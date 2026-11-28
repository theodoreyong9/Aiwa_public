# Mandates: what the code does, mode by mode

Step 1 of putting the tuple to work: for each mode of the agent, the tuple declared in `Mandates.all` against what the code of `Agent.handle` actually does today.
Read from `Agent.kt` (turn handling) and `AgentTurn.systemPrompt` / `Angel.*Prompt`. Not run on a phone.

| Mode | Declared rights | What the code does with rights | Declared context | What the code gives as context |
|---|---|---|---|---|
| normal | act, suggest | actions carried out | all | full state (memory, agenda, journal, screen, connectors): matches |
| angel | act, suggest | actions carried out | momentum | same message as normal plus an angel part: it looks like **all**, not momentum |
| soldier | suggest | only the prompt says « no action »; **actions the model returns are still carried out** | momentum | only `SAID` (the words, with the episode kept): narrower than declared |
| call (phone) | suggest, speak | actions not blocked in code; speaking is gated by `call.speaks` (enforced) | given | words + the subject she gave: matches |
| interpreter | translate | only the prompt says « no action »; **actions still carried out if returned** | words | only `SAID`: matches |
| interview | conclude | actions **blocked in code** (`taking != null`): enforced | brief | brief + what was said: matches |
| portage | answer | not read here (the guest's own agent, a separate path): **not verified** | given | not verified |

## What this shows
1. Rights are enforced by code in only two places: the interview (no action) and the call (no speaking unless allowed). For soldier and interpreter the limit is a sentence in the prompt.
2. Context is narrowed by code (the message is only `SAID`) for soldier, call, interpreter, interview. For soldier it is narrower than the tuple says; for angel it is wider.
3. So either the tuple of soldier (context) and angel (context) is wrong, or the code is. This is to be decided, not assumed.

## Next (step 2 and 3, not done)
- Decide for soldier and angel which side is right, and change the tuple or the code.
- Make the carrying out of actions depend on the right: only modes with `ACT` carry out actions.
