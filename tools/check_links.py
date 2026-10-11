#!/usr/bin/env python3
"""Fail if the built site links to anything that is not in it.

Every broken link this catches is one a visitor would hit as a 404, so this
runs against dist/ — the thing that actually gets uploaded — rather than
against the source tree, where the two halves of the site still live in
separate directories.
"""
import re
import sys
from pathlib import Path

# href/src values that are not local files
EXTERNAL = ("http://", "https://", "mailto:", "tel:", "data:", "#", "//")

# Values that were left as authoring placeholders and must never ship.
# TO-CONFIRM: is the convention for a fact awaiting confirmation: it renders
# visibly on the page AND fails this check, so it cannot reach production
# by being forgotten. Matched
# case-sensitively and anchored on the exact authoring conventions, so ordinary
# code that happens to contain the word "placeholder" (a loading state, a
# data-i18n-placeholder attribute) does not trip it.
PLACEHOLDER = re.compile(r"\[email\]|github\.com/\.\.\.|PLACEHOLDER:|placeholder-block"
                         r"|TO-CONFIRM:")

# Attributes are read out of markup, so comments have to be stripped first —
# otherwise a commented-out "replace this with <img src=...>" note reads as a
# live reference.
COMMENT = re.compile(r"<!--.*?-->", re.S)
ATTR = re.compile(r'(?:href|src)="([^"]+)"')


def main(dist: str) -> int:
    root = Path(dist).resolve()
    if not root.is_dir():
        print(f"no such directory: {root}", file=sys.stderr)
        return 2

    broken, placeholders, unbalanced = [], [], []
    for page in sorted(root.rglob("*.html")):
        raw = page.read_text(encoding="utf-8", errors="replace")
        text = COMMENT.sub("", raw)
        rel = page.relative_to(root)

        for hit in PLACEHOLDER.finditer(text):
            placeholders.append((rel, hit.group(0)))

        # A dropped or orphaned </div> silently reparents everything after it,
        # which shows up as a whole section wearing some other block's indent
        # rather than as an error. Count them.
        depth = 0
        for tag in re.finditer(r"<div\b|</div>", text):
            depth += 1 if tag.group(0) == "<div" else -1
        p_open, p_close = len(re.findall(r"<p\b", text)), len(re.findall(r"</p>", text))
        if depth != 0 or p_open != p_close:
            unbalanced.append((rel, depth, p_open, p_close))

        for url in ATTR.findall(text):
            if url.startswith(EXTERNAL):
                continue
            target = (page.parent / url.split("#")[0].split("?")[0]).resolve()
            if not target.exists():
                broken.append((rel, url))

    for where, url in broken:
        print(f"broken link  {where} -> {url}")
    for where, token in placeholders:
        print(f"placeholder  {where} -> {token}")
    for where, depth, po, pc in unbalanced:
        print(f"unbalanced   {where} -> div {depth:+d}, <p> {po} opened / {pc} closed")

    pages = len(list(root.rglob("*.html")))
    if broken or placeholders or unbalanced:
        print(f"\nFAILED: {len(broken)} broken, {len(placeholders)} placeholder, "
              f"{len(unbalanced)} unbalanced across {pages} pages")
        return 1
    print(f"check passed: {pages} pages — links resolve, no placeholders, tags balanced")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else "dist"))
