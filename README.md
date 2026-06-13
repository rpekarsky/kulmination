# Kulmination

A monorepo for a 2014 Tizen Web Challenge entry — a Three.js music-rhythm tube
runner — and its companion audio-analysis tool.

Originally built in 2014 for Samsung's Tizen Web App Challenge. Mercurial
history (12 commits) was preserved through hg-fast-export → git, then layered
with the 2014-12 working-state recovery and a series of 2026 revival commits.

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

🏛️ **Archive / portfolio piece.**

The game is playable but unpolished. The analyzer is a WIP — partial Web Audio
pipeline with no output mechanism and uses `webkitAudioContext` + deprecated
`ScriptProcessorNode`. Needs modernization (AudioWorklet, file-picker UI,
beats-export) before it can produce new tracks.

Only `packages/game/example10.mp3` is bundled as a playable audio asset (track:
"luckystar"). The other 14 `*_beats.js` files in `packages/game/` reference
audio files that aren't shipped — those tracks load patterns but stay silent.

## License

Code: **[GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html)** (see [`LICENSE`](./LICENSE)). Self-hosting, forking, and modification are welcome — but any modified version distributed or run as a network service must release its source under the same license. Bundled third-party libraries remain under their original licenses (Three.js MIT, dat.gui MIT, GreenSock, OpenSans/Ubuntu fonts) and are listed in the same file.
