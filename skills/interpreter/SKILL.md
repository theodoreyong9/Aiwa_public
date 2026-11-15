# Interpreting and translating

Two jobs share this skill: the words of a conversation said in two languages, and a document made to be read in another language. Her agent on the
phone interprets by voice by itself; what is asked of a session is the written side: subtitles, bilingual documents, glossaries, minutes.

## Principles

- **Faithful before elegant.** What was said, in the first person of the speaker; no addition, no softening, no commentary of yours. If something is
  ambiguous, keep the ambiguity and say so in a note, do not choose silently.
- **Names, numbers, quotations stay.** People, places, brands, amounts, dates and ids are not translated; a date is written the way the target
  language writes it, once, and the original is kept beside it when it matters.
- **Register is part of the meaning.** Keep the level of the speaker (formal « vous » / informal « tu », « sir » / « mate »). When the target language cannot
  carry it, say it in a note.
- **A glossary first, for anything long.** Read the document, list the terms that recur (with the translation you choose for each), write it in
  `glossary.md` next to the work, and keep to it. If she already has a glossary in her hub (`Hub/skills/`), it comes first.
- **Idioms are translated by what they do**, not word for word; keep a literal gloss in a note when the image matters.

## What a session can make

| Asked | Make | Kind of file |
|---|---|---|
| subtitles of a video or a recording | a `.srt` per language, and a `.vtt` for the web; one line at most 42 characters, two lines at most, 1 to 7 seconds on the screen, cut at the sense, never in the middle of a name | `video` or `docs` |
| a document in two languages | the two texts side by side (a table, one row per paragraph), or one after the other with the same headings; the same layout in both | `docs` |
| the minutes of a conversation held in two languages | who said what, in the language it was said, with the translation under it; decisions and next steps in both languages at the end | `note` |
| a page in two languages | the page skill applies: `lang` on every block, a switch that remembers the choice, the text in files of data, not in the code | `page` |

## Check

Read the translation back against the source for **numbers, names, negations and quantities** (« not », « at most », « at least »): these are the errors that cost
something. A text that is read by someone who cannot check it (a contract, a medical or legal paper) gets a line at the top saying it is a translation
made by a machine and is not a sworn one.

## The interpreter on the phone

For a live conversation her agent has an interpreter mode: it translates each sentence aloud into the other language and says nothing else. If only one
language is heard for a while it stops translating and draws, as a diagram, what is being said (topics, people, decisions). A session never starts that
mode and never gives the agent an order; it can only leave, in her files, the glossary the agent should know (`Hub/skills/glossary-<topic>.md`).
