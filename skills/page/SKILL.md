# Pages

A web page in a single HTML file.

- One self-contained `.html`: CSS and JS inside, no local dependency; libraries only from a CDN, at an exact version.
- Made for a phone: `viewport`, readable text, targets of 44 px, no horizontal scroll.
- A page is not a template to fill. Before coding, write the concept in ONE sentence (« a page that behaves like… »), choose ONE signature
  element that is remembered (a visual gesture, an interaction, a way to stage the text) and a marked typography, and write precise,
  living content: never generic formulas that would fit any page.
- Take MEASURED references instead of trusting your memory: clone the kit read-only
  (`git clone --depth 1 https://github.com/theodoreyong9/Aiwa_public /tmp/aiwa-ref`) and run
  `node /tmp/aiwa-ref/skills/kit/design-research/src/cli.js research "<the request in one sentence>" --format=site`; its README says how
  to read what it returns.
- Several linked sites (one proposal per recipient, with a summary): one sub-folder per site, RELATIVE links, published together by
  GitHub Pages; in the release, each site as a page, and its address in its card of recipients (`kind` `url`).
- Open it in a headless browser, read its console, and look at a capture at a phone's width before publishing.
- Publish with the tag `page-…`.
