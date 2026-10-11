# Kayley Lin · Working Notebook

The public site, served by GitHub Pages at <https://kayleylin.github.io>.

Static HTML, CSS and JavaScript. **There is no build step.** The repository is
the site: Pages serves this directory as-is from `main`, so a push is a deploy.

## Credits

Research, data, written content and the projects documented here are Kayley
Lin's. Site design, markup and front-end code are by Arc Mentors.

## Layout

```
index.html                     the homepage: the through-line, then six projects
pages/floorball.html           01 — the sport the questions come from
pages/nhl.html                 02 — 956k-shot xG model and where its ceiling is
  hockey/index.html              the instrument, bilingual, light/dark
pages/ee.html                  03 — IB Mathematics Extended Essay
pages/pioneer.html             04 — LLM output stability
pages/stepping-stones.html     05 — the volunteer organization, two branches
  pages/teaching.html            the analogy method
  pages/algorithms/*.html        16 algorithm visualisers (algo.css, same tokens)
pages/about.html               06 — gallery
public/assets/                 figures; public/assets/about/ the photographs
styles/main.css                the design system — see --measure and the token block
tools/check_links.py           pre-push check, not part of the site
.nojekyll                      tells Pages to serve the tree verbatim
```

`hockey/` is a vendored copy of `static_page/` from the Floorball research repo,
which also holds the python pipeline, tests and raw NHL tables. Only the
published page lives here. If the instrument is rebuilt there, copy it in again
and rewrite its two links to the notebook: `../../portfolio-site/pages/hockey.html`
becomes `../pages/nhl.html`.

Model metrics quoted on `pages/nhl.html` come from that repo's canonical export
(`18_export_verified_metrics.py`). If they are regenerated there, update the page
to match rather than the other way round.

## Before pushing

```bash
make check    # fails on any broken local link, surviving placeholder, or unbalanced tags
make serve    # serve on :4000 exactly as Pages will serve it
```

`make check` catches the whole class of error that only shows up in production.
Run it before every push.

## Design system

`styles/main.css` is the single source of truth: paper/ink/rust tokens,
Fraunces · Newsreader · JetBrains Mono, and `--measure` — the one column width
every run of prose sits on.

Two other files carry their own copy of the same tokens because they ship as
standalone documents. **Change one, change all three:**

- `styles/algo.css` — the algorithm visualisers' app shell
- `hockey/index.html` — the hockey instrument

The visualisers also colour their canvases in JS: the shared palette is `C` in
`scripts/algo-base.js`, and the pages carry per-state literals of their own. The
rule there is contrast-by-role — a solid `C.*` fill is dark, so its label is
paper; a low-alpha wash is light, so its label is ink.

The only outbound request the site makes is Google Fonts. Everything else,
including Plotly and KaTeX, is vendored under `hockey/vendor/`.

## Known gaps

- `pages/research.html` has three figures still to place: a tornado chart and a
  perturbation ranking, plus one more slot. `public/assets/` already carries
  `pioneer-convergence.png`, `pioneer-distributions.png` and
  `pioneer-transferability.png`, which nothing currently references and which
  are the obvious candidates.
- `pages/teaching.html` has no classroom photo and no scan of the analogy
  revision log.
