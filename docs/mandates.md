# Mandates

Aiwa is one agent. What changes from one situation to the next is its **mandate**. A mandate is not a feature: it is a point in a small space, written as a tuple.

```
(for whom, facing, context, rights, tempo, answers to)
```

| Axis | Values | Question |
| --- | --- | --- |
| for whom | owner · both speakers · each party its own | Whom does the agent act for? |
| facing | nobody (the world) · the owner · a person · an agent · a guest | Who is on the other side of what it reads or does? |
| context | words · given · brief · momentum · all (ordered, narrow to wide) | How much of the owner's world may it read? |
| rights | act · suggest · translate · conclude · speak · answer | What may it do? |
| tempo | on demand · days · live · time-boxed · standing | When does it work? |
| answers to | owner · each speaker · each party | Who answers for what it says or does? |

The code is `android/domain/.../mandate/Mandate.kt`; the tests that state what follows are `MandateTest.kt`.

## The mandates that exist

Each one is a mode of the agent (`AgentMode`). The phone mode is a call: the voice line is a channel, the mandate is speaking in her name to someone who does not use Aiwa.

| Mandate | for whom | facing | context | rights | tempo | answers to |
| --- | --- | --- | --- | --- | --- | --- |
| agent | owner | nobody | all | act | on demand | owner |
| angel | owner | the owner | momentum | suggest | days | owner |
| soldier | owner | a person | momentum | suggest | live | owner |
| interpreter | both speakers | a person | words | translate | live | each speaker |
| interview | each its own | an agent | brief | conclude | time-boxed | each party |
| call | owner | a person | given | speak | live | owner |
| portage | owner | a guest | given | answer | standing | owner |

Angel and soldier are two mandates. They differ by what is across (the owner herself, or a person she is talking with), by the tempo (days, live), and so by what they read; they share their rights (suggest, and nothing else).

## The rules: which tuples can exist

A tuple is a mandate that can exist only if every rule holds.

1. **Responsibility.** Whoever the agent acts for answers for it (owner for owner, each speaker for both speakers, each party for each its own).
2. **Least privilege.** It reads no more than its rights need: act reads all, suggest reads up to the momentum and the conversation, conclude reads the brief, speak and answer read what was given, translate reads only the words.
3. **Target.** Rights are exercised toward the one they are for: acting is on the world, never on a person; a person across is spoken to, translated, or watched for the owner; a conclusion goes toward an agent; an answer goes toward a guest.
4. **Clock.** A tempo is the tempo of something: on demand keeps time with the world, days with the owner, live with a person, time-boxed with an agent, standing with a guest.

Of the 6,750 combinations of the six axes, **63** pass the four rules, and **7** are in use. The other 56 are either a narrower version of a mandate that exists (the same rights reading less of her world) or a mandate that could be made.

## What the structure says

- **The rights are the master axis.** Among the mandates that exist, the rights settle for whom, the context and who answers. Three of the six axes repeat the fourth.
- **Tempo and facing settle each other.** One person-across means live, an agent across means time-boxed, and so on, in both directions. Today tempo carries nothing that facing does not already say. It stays in the tuple because a mandate that breaks this (a live mandate toward the world, a slow one toward a person) would be a real new coordinate, and the test fails loudly when one is added.
- **The seven are the seven allowed pairs of rights and facing.** Each allowed pair holds exactly one mandate. That is an honest limit: the table of the target rule was written from these mandates, so the agreement is partly by construction. What is independent is the other direction: a mandate someone proposes is placed in the space, and the rules say at once whether it can exist and which coordinate it adds.

## Adding a mandate

1. Write its tuple. If a rule rejects it, say which one and why the rule should change, or drop the idea.
2. If its tuple is among the 56 candidates, it is a variant or a new mandate: say which axis makes the difference.
3. If it needs a value that no axis has, that is a new coordinate: add it, and update the rules and `MandateTest`.
4. Add its `AgentMode` and its entry in `Mandates.all`. The tests fail until the figures in them are updated on purpose.
