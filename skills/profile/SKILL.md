# Her profile page

The folder `Profile/` of her profile repository is her page: what the others see when they meet her in Aiwa, and her own Home.

- `Profile/index.html` is the page: one self-contained HTML file (the page skill applies), its media next to it in `Profile/media/`,
  referenced by RELATIVE addresses. The repository is public; the application reads the file from GitHub as it is. Nothing else is published.
- `Profile/aiwa.json` belongs to the application (her address, whether her page adapts): change only the key `zones`, and only for the
  adaptation skill.
- At someone else's, her page runs NONE of its scripts: everything that matters must be there without JavaScript (content, layout, media).
  Scripts are a bonus she sees at home.
- The agent of a visitor can press the buttons and fill the fields of the page by voice: give every button, link and field words that
  say what it does (its text, or `aria-label`).
- It is HER page: her words, her work, her way. Read the repository and her hub (`Hub/`) to know her before writing. No stock phrase.
- Commit the page into the repository (it is the one production that is not a release), and also publish a copy with the tag `profile-…`
  so that the versions are kept.
