# Kulmination

A monorepo for a 2014 Three.js music-rhythm tube runner and its companion
audio-analysis tool.

> ⚠️ **Prototype.** This is a 2014 unfinished hobby project. The gameplay
> code is old, raw and unpolished — wasn't shipped, wasn't reviewed, wasn't
> refactored. The 2026 revival wraps the original logic in a runnable web
> app via AI-assisted vibe-coding (Claude Code). The core game logic
> (spline tube, obstacle/coin spawn from beats, scoring math) is the
> original 2014 code; the surrounding scaffolding — DnD, search,
> highscores, hint UX, audio pipeline — is freshly vibe-coded on top.

Mercurial history (12 commits) was preserved through hg-fast-export → git,
then layered with the 2014-12 working-state recovery and a 2026 revival
pass that wraps the original gameplay logic in a runnable web app.

## Packages

| Path | What |
|---|---|
| [`packages/game/`](./packages/game/) | The runner itself — Three.js tube traversal driven by audio beats |
| [`packages/audio-analyzer/`](./packages/audio-analyzer/) | Web Audio peak-detection prototype. Half-finished WIP from late 2014 |

## Running

Each package is self-contained — `cd` into one and run its own commands.

```bash
cd packages/game
npm install
npm start                 # http-server on :8765
# open http://localhost:8765/
```

```bash
cd packages/audio-analyzer
npm install
npm start                 # http-server on :8766
# open http://localhost:8766/
```

No root-level package.json — plain folder-based monorepo (no workspaces, no
nx, no turborepo). When/if a shared library emerges, switch to workspaces.

## Status

🏛️ **Archive / portfolio piece, lightly revived.**

Both packages launch as plain web apps in a modern browser. The game is
playable: drop any `.mp3` (or pick a bundled track from the preset list),
the embedded analyzer extracts a beat pattern offline in a few seconds, and
the original 2014 obstacle-spawning logic runs against it. Scoring,
per-track highscores, multiplier and the bundled tracks all come from a
2026 revival pass on top of the untouched 2014 gameplay core.

Bundled audio under `packages/game/tracks/` is freely-licensed Pixabay
content (`alexguz`, `jumpingbunny`, `nveravetyanmusic`, `sunsides`,
`the_mountain`).

The in-game Jamendo search hits a separate Cloudflare Worker that holds
the Jamendo client_id in CF Secret storage (Jamendo ToS forbids exposing
it in client code). Source: [rpekarsky/kulmination-worker](https://github.com/rpekarsky/kulmination-worker).

## License

[GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html). See [`LICENSE`](./LICENSE).
