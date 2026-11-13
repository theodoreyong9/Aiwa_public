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

## Creative direction

A page is not a template to fill. Before coding, write the concept in ONE sentence (an idea, not a style: « a page that behaves like… »),
choose ONE signature element that is remembered (a visual gesture, an interaction, a way to stage the text) and a marked typography (not
the default system font), and write precise, living content: never generic formulas (« simple, sober, fast », « modern and accessible »)
that would fit any page. When the request is vague (no subject, no mood), do not conclude that it must stay sober: « simple » describes
the use, not the visual ambition. Make a bold proposal and say in one sentence, in the notes of the release, the assumption you took.

Make the visuals yourself, in code (SVG, canvas, WebGL, gradients, animated shapes), rather than leaving blanks or using only text and
cards, and put in movement that means something (an entrance, a reaction to scroll and to hover, transitions), respecting
`prefers-reduced-motion`. The catalogue of references shows what is done at this level (WebGL, GSAP, scroll-driven animation, view
transitions): take what the format can carry. Before you deliver, ask yourself: would this page be interchangeable with a template found
online? If so, start again from a stronger idea.

## Design: measured references

Before drawing an interface (a site, a PWA, an APK, the screen of a contract), take MEASURED references instead of trusting your memory.
Clone the kit read-only (`git clone --depth 1 https://github.com/theodoreyong9/Aiwa_public /tmp/aiwa-ref`), then, from your working
directory:

```
DR_CATALOG_URL=https://raw.githubusercontent.com/theodoreyong9/Aiwa_public/main/skills/kit/design-research/catalog DR_SHOTS_URL=https://raw.githubusercontent.com/theodoreyong9/Aiwa_public/main/skills/kit/design-research/screenshots \
  node /tmp/aiwa-ref/skills/kit/design-research/src/cli.js research "<the request in one sentence>" --format=<site|pwa|apk|contract_ui>
```

Then read `.research/latest/synthesis.md`, `references.json` and the captures. The traits are measures; the mood, the tone and why a
reference works are yours to judge by looking at the captures. Keep what SEVERAL references share for the fundamentals (legibility,
structure, performance) and take the risk elsewhere; respect what the format can carry (`transposable_to_format`); copy neither the
identity, nor the layout, nor the content, nor the assets, nor the distinctive implementation of a site.

Once the interface is built, open it in Chromium with Playwright at 390 px and at 1440 px, look at the captures, and fix overflows, weak
contrasts, cut texts, broken images and console errors before you say it is finished.

Traceability: write `aiwa-design/references.md` in the repository (commit it with the rest) with the 2 or 3 references you KEPT, and for
each: its name and address, its `id` in the catalogue (https://raw.githubusercontent.com/theodoreyong9/Aiwa_public/main/skills/kit/design-research/catalog/sites.jsonl), the captures you looked at
(https://raw.githubusercontent.com/theodoreyong9/Aiwa_public/main/skills/kit/design-research/screenshots/<id>/<file>), the measures you drew from the catalogue (typography, colours, movement, composition,
libraries), what you saw on the captures that the measures do not say, and what you took from it, with where it shows in the creation.
Never cite a reference you did not really look at. If the clone or the catalogue cannot be reached, say so in one sentence in the notes
and design without it (no references.md). Do not add `.research/` to the repository.
