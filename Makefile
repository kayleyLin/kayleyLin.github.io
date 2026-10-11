# The repository is the site. There is no build step: GitHub Pages serves this
# directory as-is. These targets are the three things worth doing before a push.
PORT ?= 4000

.PHONY: stamp check serve

# Rewrites the shared CSS/JS references with a hash of their contents, so a
# returning visitor can never be served new HTML against a stale stylesheet.
stamp:
	@python3 tools/stamp_assets.py

# Fails if any local href/src points at a file that is not here, if an
# authoring placeholder survived, or if a page's <div>/<p> tags do not balance.
check:
	@python3 tools/check_links.py .

# Serve the repo exactly as Pages will serve it.
serve:
	@echo "http://localhost:$(PORT)/"
	@python3 -m http.server $(PORT)
