# Kulmination — notes for Claude

## What it is

2014 Three.js music-rhythm tube runner, originally for the Samsung Tizen Web
App Challenge. Revived in 2026 as a portfolio demo, deployed to GitHub Pages.
Three packages live in this repo's `packages/`; one related service
(`rpekarsky/kulmination-worker`) lives in a sibling repo.

## Monorepo layout

```
packages/
├── game/             — playable web app, deployed to GH Pages root
├── audio-analyzer/   — original 2014 beat-extraction prototype, deployed to /analyzer/
```

No workspaces, no bundler. Each package = vanilla HTML + a pile of
`<script src>` tags. Load order matters (see GAME_SCRIPTS in
`packages/game/index.html`).

The Cloudflare Worker that proxies Jamendo search lives outside this repo
at `~/projects/rpekarsky/kulmination-worker/`. Its public URL is hardcoded
into `packages/game/index.html` as `JAMENDO_PROXY_URL`.

## Don't refactor the 2014 core

The gameplay logic (`obstacles.js`, `loop.js`, `tube.js`, `GameObject.js`,
`SplineCurve4.js`, `initialize.js`, `camera.js`, `player.js`, `hud.js`,
`utils.js`, `gui.js`, `main.js`) is original 2014 code. It's raw, repetitive
and would not survive a code review. **Wrap it; don't rewrite it.** The 2026
revival is intentionally an outer scaffolding (DnD, search, gamification
state, audio pipeline) around an untouched core.

Anything new (search/, scoring.js, beat-filter.js, MPlayer.js, SFX.js,
rng.js, build-manifest.js, beat-detector.js) is fair game for normal
quality bars.

## Code style

Read the global CLAUDE.md `Code Style Preferences` section — applies
here too. In short:
- **Self-documenting code first.** Rename a variable / extract a helper
  before reaching for a comment. `result` over `t`, `debounceTimer` over
  `timer`, `audioBlobUrl` over `url`.
- **Default to zero comments.** No "WHAT the code does" — the code is for
  that. Comments earn their keep only on non-obvious WHY (workarounds,
  hidden constraints, browser quirks).
- Don't write multi-paragraph module headers that read like API docs.

This repo has accumulated chatty comments. Don't add to the pile;
trim where you touch.

## Run + deploy

```bash
cd packages/game && npm start          # → http://localhost:8765
cd packages/audio-analyzer && npm start # → http://localhost:8766
```

Push to `main` triggers `.github/workflows/deploy.yml` → builds `_site/`
(game at root + analyzer under `/analyzer/`) → injects
`vars.ANALYTICS_SCRIPT` into both `index.html`s → publishes to Pages.

## License

AGPL-3.0. Bundled libs (Three.js MIT, dat.gui Apache-2.0) keep their own.

## State around audio/search

Pluggable search: `packages/game/search/search.js` is a facade with a
provider registry. Each provider lives in its own `search-<name>.js`
sibling and registers itself on script load. UI lives in
`packages/game/search/search-ui.js`. The Jamendo provider is the first
adapter; Audius is being added next.

Adapter contract — minimum useful fields:
```
{ id, name, audio, track_url, source, artist?, duration? }
```
`audio` is required for playback; `track_url` is required for ToS
attribution. The UI gracefully degrades on missing optionals.
