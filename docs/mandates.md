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
| rights | a set of: act · suggest · translate · conclude · speak · answer | What may it do? |
| tempo | on demand · days · live · time-boxed · standing | When does it work? |
| answers to | owner · each speaker · each party | Who answers for what it says or does? |

The rights are a **set** (the angel acts and suggests; the call suggests and speaks): that is what lets mandates be composed. A tuple that obeys the rules is a mandate that can exist, whether or not a mode of the agent carries it today.

The code is `android/domain/.../mandate/Mandate.kt` (`Mandates.explain(tuple)` says for any tuple which rule it breaks, or which mandate it is); the tests that state what follows are `MandateTest.kt`.

## The mandates that exist

Each one is a mode of the agent (`AgentMode`). The phone mode is called the call: the voice line is a channel, the mandate is whispering to the owner and, when she allows it, speaking in her name to someone who does not use Aiwa.

| Mandate | for whom | facing | context | rights | tempo | answers to |
| --- | --- | --- | --- | --- | --- | --- |
| agent | owner | the owner | all | act, suggest | on demand | owner |
| angel | owner | the owner | momentum | act, suggest | days | owner |
| soldier | owner | a person | momentum | suggest | live | owner |
| interpreter | both speakers | a person | words | translate | live | each speaker |
| interview | each its own | an agent | brief | conclude | time-boxed | each party |
| call | owner | a person | given | suggest, speak | live | owner |
| portage | owner | a guest | given | answer | standing | owner |

The agent and the angel have the same rights and face the same one, the owner. They differ by tempo (when she asks, over days) and by context (all of her files, her momentum). The angel acts "within what she allows" (that is what its instruction says), so it is not a mode that only suggests.

## The rules: which tuples can exist

A tuple is a mandate that can exist only if every rule holds.

1. **Responsibility.** Whoever the agent acts for answers for it (owner for owner, each speaker for both speakers, each party for each its own).
2. **Some rights.** A mandate gives at least one.
3. **Least privilege.** It reads no more than its widest right needs: act reads all, suggest reads up to the momentum and the conversation, conclude reads the brief, speak and answer read what was given, translate reads only the words.
4. **Target.** Every right is exercised toward the one it is for: acting is on the world and is told to the owner, never done on a person; a person across is spoken to, translated, or watched for the owner; a conclusion goes toward an agent; an answer goes toward a guest.
5. **Clock.** A tempo is the tempo of something: on demand keeps time with the world and with the owner, days with the owner, live with a person, time-boxed with an agent, standing with a guest.

Of the 70,875 combinations of the six axes, **177** pass the rules, and **7** are in use. The other 170 are tuples that can exist and that no mode of the agent carries. 32 of them are one coordinate away from a mandate that exists, and 17 of those only read less of her world (a narrower version).

## What the structure says

- **The rights are the master axis.** Among the mandates that exist, the rights settle for whom, who answers, and what is across. The tempo also settles what is across.
- **The tempo is not redundant.** What is across does not settle the tempo: the agent and the angel face the same one at two tempos. A test states it, and fails if a change makes it false.
- **The 177 are the composable space.** A mandate someone proposes is placed in the space, and the rules say at once whether it can exist and which coordinate it adds. The seven are presets: a mandate composed from a tuple that passes the rules is as legitimate as one of them.
- **A limit.** The tables of the rules (what a right can be exercised toward, what a tempo keeps time with) were written with these mandates in view, so the agreement is partly by construction. What is independent is the other direction: the proposals.

## Adding a mandate

1. Write its tuple and ask `Mandates.explain`. If a rule rejects it, say which one and why the rule should change, or drop the idea.
2. If its tuple passes, it can exist: say which axis makes the difference with the nearest mandate.
3. If it needs a value that no axis has, that is a new coordinate: add it, and update the rules and `MandateTest`.
4. To make it a mode of the agent, add its `AgentMode` and its entry in `Mandates.all`. The tests fail until the figures in them are updated on purpose.

## What is not yet governed by the tuple

The agent's behavior in each mode still comes from its own instruction text. The tuple describes the mandates and checks them against each other, and does not yet limit what the agent does at runtime (for instance, the soldier's rule of never acting is in its instruction, not drawn from its rights). Making the rights gate the tools, and the context breadth gate what is put in the instruction, is the step that makes the tuple a guarantee and not a description.
