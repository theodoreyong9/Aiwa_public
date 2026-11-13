# The adaptation of her profile

Her page can change for who looks at it: a visitor who likes red sees a red title. The matching is done on the VISITOR's phone, with what
the visitor lets pages read of her (a description and traits); the page never learns what matched. A rule is data, never code.

Two files in `Profile/`:

- `aiwa.json`, key `zones`: the parts of the page that may change, and how.
  `{"zones":{"titre":{"selecteur":"h1","modifiable":["texte","couleur"]}}}`. A zone is found by its selector, else by
  `data-aiwa-zone="titre"` in the page. `modifiable` lists what may change: `texte`, `couleur`, `fond`, `visible`, `ordre`, `variante`.
  Keep every other key of the file as it is.
- `adapt.json`: the rules.
  `{"regles":[{"si":{"traits.couleurs":{"contient":"rouge"}},"alors":[{"zone":"titre","couleur":"{traits.couleurs.0}"}]}]}`.
  Conditions read the visitor's data by path (`traits.couleurs`, `traits.themes`, `traits.metiers`, `traits.langues`, `description`) with
  `present`, `absent`, `egal`, `parmi`, `contient`, combined with `et`, `ou`, `non`. An action names a zone and sets what that zone allows;
  `{traits.themes.0}` puts the visitor's own word in a text. For `variante`, the zone holds children marked `data-aiwa-variant="…"`; for
  `ordre`, children marked `data-aiwa-item="…"`.

When she dictates a rule (« si le visiteur aime le rouge, mon titre devient rouge »): declare the zone if it is not yet one, add the rule,
keep the others, and check the two files are valid JSON. At most 50 rules. The page must stay right when no rule matches.
