# Her profile page

The folder `Profile/` of her profile repository is her page: what the others see when they meet her in Aiwa, and her own Home.

- `Profile/index.html` is the page: one self-contained HTML file (the page skill applies), its media next to it in `Profile/media/`,
  referenced by RELATIVE addresses. The repository is public; the application reads the file from GitHub as it is. Nothing else is published.
- `Profile/avatar.jpg` is her portrait, a square picture she chose on her phone; the application shows it next to her name in the lists
  of the others. It is hers: use it in the page when a face belongs there (a relative address, `avatar.jpg`), never replace or retouch it.
- `Profile/aiwa-offers.json` holds her offers: what she offers and what she looks for, several, in her own words. They are public, and
  the others' agents read them to tell how well she fits. They are hers to change; read them to know what she wants, and let the page say it.
- `Profile/aiwa.json` belongs to the application (her address, whether her page adapts): change only the key `zones`, and only for the
  adaptation skill.
- At someone else's, her page runs NONE of its scripts: everything that matters must be there without JavaScript (content, layout, media).
  Scripts are a bonus she sees at home.
- The agent of a visitor can press the buttons and fill the fields of the page by voice: give every button, link and field words that
  say what it does (its text, or `aria-label`).
- It is HER page: her words, her work, her way. Read the repository and her hub (`Hub/`) to know her before writing. No stock phrase.
- Commit the page into the repository (it is the one production that is not a release), and also publish a copy with the tag `profile-…`
  so that the versions are kept.

## What a change of her profile brings

Her profile says who she is and what she looks for: when it changes, what depends on it follows, in the same piece of work.

- The copy of the page, released with the tag `profile-…`.
- Her skills (`Hub/skills/`): what the change teaches about her (a new activity, a new taste, a new way of presenting herself) is written
  in the skill it belongs to, and the skill is released (`skill-…`).
- Her scenarios (`Hub/scenarios/`): those that quote her old profile are brought up to date and released (`scenario-…`).
- Her targets: see the targets skill, « When her profile changes ».
