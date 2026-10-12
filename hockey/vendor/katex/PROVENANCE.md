# Vendored KaTeX 0.16.9

## Source

Downloaded from the official KaTeX release tarball:

```
https://github.com/KaTeX/KaTeX/releases/download/v0.16.9/katex.tar.gz
```

Version: 0.16.9.

## License

MIT. KaTeX is copyright Khan Academy and contributors. See
`katex.min.js` / `katex.min.css` headers and the upstream repository
(https://github.com/KaTeX/KaTeX) for the full license text.

## What was kept, what was dropped, and why

Kept:
- `katex.min.css`
- `katex.min.js`
- `fonts/*.woff2` (20 files)

Dropped:
- All `.woff` and `.ttf` font variants. KaTeX's `@font-face` rules list
  `woff2` first in the `src` list, and browsers select the first format
  they recognise rather than falling back through the list. Every
  browser capable of running this page also supports woff2, so the
  `.woff`/`.ttf` files are never requested and would be dead weight.
- `contrib/auto-render.min.js`. This page calls `katex.render()` directly
  per formula element inside its own `renderFormulas()` function; nothing
  calls `renderMathInElement`, the only function `auto-render.min.js`
  provides, so it was removed as unused (see the commit that added this
  file for the removal).
- Everything else in the release tarball (source maps, additional CSS
  themes, docs, other font formats, the `contrib/` directory generally)
  was dropped as unused by this page.

## Reproduction

```bash
cd <repo root>
TMP=$(mktemp -d)
curl -sL -o "$TMP/katex.tar.gz" https://github.com/KaTeX/KaTeX/releases/download/v0.16.9/katex.tar.gz
tar xzf "$TMP/katex.tar.gz" -C "$TMP"
mkdir -p static_page/vendor/katex/fonts
cp "$TMP/katex/katex.min.css" "$TMP/katex/katex.min.js" static_page/vendor/katex/
cp "$TMP/katex"/fonts/*.woff2 static_page/vendor/katex/fonts/
rm -rf "$TMP"
du -sh static_page/vendor/katex
```

## Expected result

As measured after vendoring (KaTeX 0.16.9, woff2-only, no auto-render):

- `static_page/vendor/katex/` total size: **592K**
  - `katex.min.css`: 24K
  - `katex.min.js`: 272K
  - `fonts/`: 296K, containing 20 `.woff2` files
- File listing:
  - `katex.min.css`
  - `katex.min.js`
  - `fonts/KaTeX_AMS-Regular.woff2`
  - `fonts/KaTeX_Caligraphic-Bold.woff2`
  - `fonts/KaTeX_Caligraphic-Regular.woff2`
  - `fonts/KaTeX_Fraktur-Bold.woff2`
  - `fonts/KaTeX_Fraktur-Regular.woff2`
  - `fonts/KaTeX_Main-Bold.woff2`
  - `fonts/KaTeX_Main-BoldItalic.woff2`
  - `fonts/KaTeX_Main-Italic.woff2`
  - `fonts/KaTeX_Main-Regular.woff2`
  - `fonts/KaTeX_Math-BoldItalic.woff2`
  - `fonts/KaTeX_Math-Italic.woff2`
  - `fonts/KaTeX_SansSerif-Bold.woff2`
  - `fonts/KaTeX_SansSerif-Italic.woff2`
  - `fonts/KaTeX_SansSerif-Regular.woff2`
  - `fonts/KaTeX_Script-Regular.woff2`
  - `fonts/KaTeX_Size1-Regular.woff2`
  - `fonts/KaTeX_Size2-Regular.woff2`
  - `fonts/KaTeX_Size3-Regular.woff2`
  - `fonts/KaTeX_Size4-Regular.woff2`
  - `fonts/KaTeX_Typewriter-Regular.woff2`
