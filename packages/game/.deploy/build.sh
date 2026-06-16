#!/usr/bin/env bash
# Build script for the game. Single entry point used by both Cloudflare
# Workers deploys (called from wrangler.toml's [build].command) and any
# local debugging. Fail-fast (set -e), diagnostic dump first so we
# always know what env actually ran us, then explicit pnpm-via-corepack.
#
# Local repro:
#   bash packages/game/deploy/build.sh

set -euo pipefail

# ─── Environment dump ────────────────────────────────────────────────
# Print first thing so when CF Pages' build fails opaquely we have
# evidence in the log about what shell/OS/PATH it actually used.
echo "==============================================================="
echo "[build] Environment"
echo "==============================================================="
uname -a
[ -r /etc/os-release ] && cat /etc/os-release
echo
echo "PATH=$PATH"
echo "PWD=$(pwd)"
echo "USER=${USER:-unknown}"
echo

# ─── Tools before activation ────────────────────────────────────────
echo "==============================================================="
echo "[build] Tools (before)"
echo "==============================================================="
echo -n "  node:     "; command -v node     >/dev/null && node --version     || echo "(missing)"
echo -n "  npm:      "; command -v npm      >/dev/null && npm --version      || echo "(missing)"
echo -n "  corepack: "; command -v corepack >/dev/null && corepack --version || echo "(missing)"
echo -n "  pnpm:     "; command -v pnpm     >/dev/null && pnpm --version     || echo "(missing)"
echo

# ─── Install pnpm into a local prefix, prepend to PATH ─────────────
# Why not corepack: CF Pages env ships an asdf-pnpm shim at
# /opt/buildhome/.asdf/shims/pnpm that intercepts every pnpm call
# and demands `asdf install pnpm <ver>` (which their asdf-pnpm
# plugin can't satisfy without prior config). corepack writes its
# pnpm into its own cache but the asdf shim sits BEFORE corepack's
# install dir in PATH and wins.
# Only reliable workaround: install pnpm via npm into a prefix WE
# control, prepend that prefix's .bin to PATH so our pnpm beats
# the asdf shim. Boring, no magic.
echo "==============================================================="
echo "[build] Installing pnpm@9.15.0 (ahead of asdf shim)"
echo "==============================================================="
PNPM_PREFIX="$HOME/.kulm-pnpm"
mkdir -p "$PNPM_PREFIX"
npm install --prefix "$PNPM_PREFIX" --silent --no-audit --no-fund pnpm@9.15.0
export PATH="$PNPM_PREFIX/node_modules/.bin:$PATH"
echo -n "  pnpm path:    "; command -v pnpm
echo -n "  pnpm version: "; pnpm --version
echo

# ─── Build ──────────────────────────────────────────────────────────
echo "==============================================================="
echo "[build] Building"
echo "==============================================================="
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GAME_DIR="$SCRIPT_DIR/.."
cd "$GAME_DIR"
echo "  cwd: $(pwd)"
echo

pnpm install --frozen-lockfile
pnpm run build

# ─── Worker bundle for CF Pages ─────────────────────────────────────
# Pages convention: a single ESM `_worker.js` sitting at the build
# output root. We bundle src/worker.js (+ its src/leaderboard.js
# import) via esbuild so Pages just picks it up. Without this step
# Pages sees only the static dir and /api/* + OG-meta rewriter
# never run.
echo "==============================================================="
echo "[build] Bundling Pages _worker.js"
echo "==============================================================="
REPO_ROOT="$GAME_DIR/../.."
pnpm exec esbuild "$REPO_ROOT/src/worker.js" \
	--bundle \
	--format=esm \
	--platform=neutral \
	--target=es2022 \
	--outfile=_worker.js
echo "  _worker.js: $(wc -c < _worker.js) bytes"

# ─── Done ───────────────────────────────────────────────────────────
echo "==============================================================="
echo "[build] Done"
echo "==============================================================="
if [ -d dist ]; then
	echo "  dist/ contents:"
	ls -la dist/
fi
ls -la _worker.js 2>/dev/null || true
