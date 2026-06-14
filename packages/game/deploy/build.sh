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

# ─── Activate pnpm via corepack ─────────────────────────────────────
# corepack is shipped with Node 16.13+. We pin pnpm@9.15.0 explicitly
# (matches packages/game/package.json's packageManager field). This is
# canonical Node-ecosystem version management — no global npm install,
# no asdf magic.
echo "==============================================================="
echo "[build] Activating pnpm@9.15.0 via corepack"
echo "==============================================================="
corepack enable
corepack prepare pnpm@9.15.0 --activate
echo -n "  pnpm: "; command -v pnpm && pnpm --version
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

# ─── Done ───────────────────────────────────────────────────────────
echo "==============================================================="
echo "[build] Done"
echo "==============================================================="
if [ -d dist ]; then
	echo "  dist/ contents:"
	ls -la dist/
fi
