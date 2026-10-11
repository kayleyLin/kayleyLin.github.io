# Vendored Plotly

- **Package:** `plotly-cartesian-2.27.0.min.js`
- **Source:** `https://cdn.plot.ly/plotly-cartesian-2.27.0.min.js`
- **Version:** 2.27.0, pinned. The page was built and verified against this version.
- **License:** MIT, © Plotly, Inc.

## Why the cartesian bundle rather than the full one

The page draws only three trace types — `scatter`, `bar`, and `heatmap`. The full
bundle is 4.1 MB; `plotly-basic` is smaller still but omits `heatmap`, which the shot
map needs. `plotly-cartesian` is the smallest bundle that covers everything used here.

| bundle | raw | gzip | has heatmap |
|---|---|---|---|
| `plotly.min.js` | 4.1 MB | 1.0 MB | yes |
| `plotly-basic.min.js` | 976 KB | 0.3 MB | **no** |
| `plotly-cartesian.min.js` | 1.2 MB | 0.4 MB | yes |

## Why vendored rather than loaded from the CDN

The CDN fetch was measured at 1982 ms of a 2807 ms cold load — about 71%. Vendoring
removes the round trip entirely. It also removes a second remote origin from a page
whose test suite (`make browser-smoke`) treats any console error as a failure, so a
CDN hiccup turned into a red suite rather than a slow page. KaTeX was vendored earlier
for the same reason; see `../katex/PROVENANCE.md`.

## Reproducing

```bash
curl -sL -o static_page/vendor/plotly/plotly-cartesian-2.27.0.min.js \
  https://cdn.plot.ly/plotly-cartesian-2.27.0.min.js
```

**If a new trace type is ever introduced, check it is in this bundle.** A missing trace
type fails at draw time, which surfaces as a console error and a lower plot count.
