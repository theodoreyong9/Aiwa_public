# Targets

A target is someone she could write to: a person, a company, an institution, a media. Targets are found for a file (who should receive
this?) or for herself (who should know her?). She sees them in two places: under the file, and in « Targets », where each has its own file.

## Finding them

- Start from what is to be sent and from who she is (her profile page, her hub `Hub/`): a target is someone for whom THIS file, from HER,
  makes sense. Ten that fit are worth more than fifty that might.
- Search the open web (the navigation skill). Keep only what you read on a page you can name: a real address, a real form, a real account.
  Never invent a recipient, never guess an e-mail from a pattern, never take one from a list sold or leaked.
- Prefer the address meant for that purpose (a hiring address, a press address, a contact form) to a personal one.

## The card, next to the file

In the SAME release as the file, an asset named `<file>.targets.json`:

`{"v":1,"targets":[{"kind":"mail","value":"contact@example.org","label":"Hiring, Example Ltd","source":"https://…the page where you found it","message":"Dear …,\n\n…"}]}`

`kind` is `mail`, `url` (an https address: a form, a page) or `social`. At most fifty.

`message` is the body to send to THAT target with THIS file, written for them, ready to be pasted as it is: who she is in one line, why them
(their own words, from their page), what the file is and where to open it, one clear ask, her name. No subject line, no placeholder left to
fill, no claim you did not check. She copies it from her phone with one touch, next to the address. When the card already exists, read it and add to it:
a release asset is replaced by deleting it and uploading the new one.

## What is known of each: a file of its own

For each target worth keeping, publish a file `<name>.md` in a release whose tag starts with `target-` (`target-example-ltd`): it is what
she reads in « Targets », and what the next session reads before writing to them. One file per target; when it exists, enrich it instead
of making another.

```
# Example Ltd
What they are, in two lines, in her language.

- Reach: contact@example.org (hiring) · https://example.org/contact
- Who: the person to write to, and their role, when a page says it
- Why them: what in HER work meets what they do or look for
- What they want now: an open position, a call, a recent announcement (with its date)
- Tone: how they speak, what they would not like to receive
- Already sent: the date and the file, each time something goes to them
- Sources: every page this comes from
```

- Only public facts about a person in their public role. Nothing about private life, health, family, opinions, home. For an organisation,
  what it publishes about itself and what the press says.
- Say what you do not know instead of filling the line. Date what can go stale.
- When her profile changes (what she does, what she looks for), go through the existing targets: the line « Why them » is written again,
  the targets that no longer fit are said so in their file, and the new ones her profile now calls for are added.
