#!/usr/bin/env python3
"""Stamp the shared CSS and JS references with a content hash.

A visitor who has styles/main.css cached will keep using their copy until
something tells the browser it changed. Appending a hash of the file's own
contents does that: edit the file and every page now asks for a different
URL, so the update is picked up immediately. Leave the file alone and the
URL is unchanged, so the cached copy is still used and nothing is
re-downloaded.

Run from the repository root. Idempotent: an existing ?v= is replaced.
"""
import hashlib
import pathlib
import re
import sys

ASSETS = ["styles/main.css", "scripts/main.js"]
ROOT = pathlib.Path(__file__).resolve().parent.parent


def digest(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


def main() -> int:
    stamps = {}
    for rel in ASSETS:
        p = ROOT / rel
        if not p.exists():
            print(f"missing asset: {rel}", file=sys.stderr)
            return 2
        stamps[pathlib.PurePosixPath(rel).name] = digest(p)

    changed = 0
    for page in sorted(ROOT.rglob("*.html")):
        if "vendor" in page.parts:
            continue
        text = page.read_text(encoding="utf-8")
        original = text
        for name, h in stamps.items():
            # matches ../styles/main.css, styles/main.css, with or without ?v=
            text = re.sub(
                r'((?:href|src)="[^"]*?' + re.escape(name) + r')(?:\?v=[0-9a-f]+)?(")',
                lambda m: f"{m.group(1)}?v={h}{m.group(2)}",
                text,
            )
        if text != original:
            page.write_text(text, encoding="utf-8")
            changed += 1

    for name, h in stamps.items():
        print(f"  {name} -> ?v={h}")
    print(f"stamped {changed} pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
