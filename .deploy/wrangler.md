# Wrangler / Cloudflare workflow

Notes specific to *this* project — what wrangler does for us, how the
moving parts fit, how to run locally, what the prod deploy path looks
like. Cloudflare's general docs live at
[developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/);
this file documents the non-obvious bits.

## Architecture overview

```
                ┌──────────────────────────────────────────┐
                │  Cloudflare Worker (src/worker.js)       │
   Request ───→ │  ─ /api/*  → leaderboard.js → env.DB     │ ─→ D1
                │  ─ /?source=&id=  → OG HTMLRewriter       │     (kulmination_db)
                │  ─ everything else → env.ASSETS.fetch()  │
                └──────────────────────────────────────────┘
                            │
                            ▼
                ┌──────────────────────────────────────────┐
                │  ASSETS binding → packages/game/         │
                │  static index.html + dist/bundle + assets│
                └──────────────────────────────────────────┘
```

One Worker fronts everything. Static files are served via `[assets]`
binding (no separate Pages project). `run_worker_first = true` means
the Worker sees every request first, then explicitly delegates static
ones to `env.ASSETS.fetch(request)`. Without it CF would short-circuit
straight to static for `/` and the OG rewriter would never run.

## Bindings (`wrangler.toml`)

| Binding              | Type        | Purpose                                          | Fallback if absent |
|----------------------|-------------|--------------------------------------------------|--------------------|
| `env.ASSETS`         | `[assets]`  | Static file server (`packages/game/`)            | Worker is dead     |
| `env.DB`             | `d1`        | Leaderboard / recent-feed / most-played          | 503 on `/api/*`    |
| `env.PLAY_RATELIMIT` | `ratelimit` | 10 req / 60s per cf-connecting-ip on POST /play  | Rate-limit skipped |
| `env.META_CACHE`     | `kv`        | 1h cache for Audius track lookup (OG rewriter)   | Direct API hit     |

`DB`, `PLAY_RATELIMIT`, and `META_CACHE` are all optional — the Worker
checks for their presence at runtime and degrades gracefully. The Worker
only hard-requires `ASSETS`.

## Local dev — three modes

### Full local-prod (`wrangler dev`)

```bash
wrangler dev    # → http://localhost:8787
```

Same code paths as prod: Worker, ASSETS, /api/*, OG rewrite, D1 (local
SQLite), rate-limit binding (miniflare emulation). Use this when
touching the Worker or testing /api/* end-to-end.

Caveats: no HMR. Edit → `Cmd-R` to refresh. Worker code (`src/`) is
watched and reloaded automatically; static files are served live but
the browser doesn't auto-refresh.

### Frontend HMR with proxied API (`npm start`)

```bash
cd packages/game && npm start    # → http://localhost:8765
```

Vite dev server with HMR. `/api/*` requests are proxied to
`http://localhost:8787` (where `wrangler dev` should be running in
another terminal). If `wrangler dev` isn't up, `/api/*` requests will
just fail and the frontend silently hides the leaderboard panels.

Use this when iterating on frontend code. Worker stays in the other
terminal, frontend gets live reload.

### Frontend HMR against prod backend (`npm run start:vs-prod`)

```bash
cd packages/game && npm run start:vs-prod
```

Same as above, but `/api/*` is proxied to
`https://play.kulmination.app`. Use this when testing frontend changes
against real leaderboard data without spinning up local D1. Submits
write to production — be careful with test inputs.

## One-time setup

### Login

```bash
wrangler login
```

Opens a browser tab to authorize. Stores creds in `~/.wrangler/`.

### Create the D1 database

```bash
wrangler d1 create kulmination_db
```

Copy the `database_id` UUID from the output into `wrangler.toml`
(replaces `"PASTE_AFTER_CREATE"`).

### Apply schema (local + remote)

```bash
wrangler d1 execute kulmination_db --local  --file=.deploy/schema.sql
wrangler d1 execute kulmination_db --remote --file=.deploy/schema.sql
```

`--local` writes to `.wrangler/state/v3/d1/…/db.sqlite` for `wrangler
dev`. `--remote` writes to the actual CF-hosted D1. Both are needed
once; subsequent runs of the same SQL are idempotent
(`CREATE … IF NOT EXISTS`).

## Deploy

```bash
wrangler deploy
```

But realistically the canonical deploy path is **push to `main`** —
CF Pages picks up the change, runs `[build].command` (which calls
`packages/game/.deploy/build.sh` to produce `dist/`), then deploys.
Direct `wrangler deploy` is for emergency/manual pushes.

## Inspecting prod data

```bash
# Top scores on a track
wrangler d1 execute kulmination_db --remote --command \
  "SELECT nickname, score, datetime(played_at/1000, 'unixepoch') AS at \
   FROM plays WHERE track_source='audius' AND track_id='XXX' \
   ORDER BY score DESC LIMIT 10"

# Recent plays
wrangler d1 execute kulmination_db --remote --command \
  "SELECT track_source, track_id, nickname, score, played_at \
   FROM plays ORDER BY played_at DESC LIMIT 20"

# Total volume
wrangler d1 execute kulmination_db --remote --command \
  "SELECT COUNT(*) FROM plays"

# Wipe local D1 (DEV ONLY — never touch --remote with this)
wrangler d1 execute kulmination_db --local --command "DELETE FROM plays"
```

## Common pitfalls

- **`wrangler dev` complains about `[[unsafe.bindings]]`** → wrangler
  is too old. Need 3.60+ for local emulation of the Rate Limiting
  binding. `npm i -g wrangler@latest`.

- **`D1_ERROR: no such table: plays`** → schema not applied to the
  environment you're hitting. Re-run `wrangler d1 execute --local
  --file=.deploy/schema.sql` (or `--remote`).

- **CF Pages build fails on `pnpm: command not found`** → pnpm shim
  drama in the CF build env. `packages/game/.deploy/build.sh`
  installs pnpm into a local prefix to dodge the asdf-shim. If this
  ever breaks again, that script is the place to look.

- **`run_worker_first = true` removed by mistake** → OG meta rewriting
  silently stops working. Static `/` is served straight from ASSETS,
  Worker never gets the request. Symptom: share-link unfurls show the
  generic site meta instead of the track name.

- **403 / CORS on `/api/*` from `npm start`** → check that
  `wrangler dev` is running and that you're hitting `:8765`, not the
  proxy target `:8787` directly. Vite's proxy strips the localhost
  origin so the Worker sees same-site requests.

## Where things live

- `wrangler.toml` — single source of truth for bindings, build command,
  compatibility date
- `src/worker.js` — Worker entry, dispatches to /api/ or asset/OG path
- `src/leaderboard.js` — /api/* handlers
- `.deploy/schema.sql` — D1 schema (idempotent CREATEs)
- `.deploy/leaderboard-setup.md` — narrow doc for first-time D1 setup
- `packages/game/.deploy/build.sh` — what CF runs to build the static
  bundle on deploy

## Things deliberately NOT in scope (yet)

- Workers KV for `META_CACHE` — Audius API is fast enough; revisit when
  share-link unfurls start showing up in analytics
- Demo recording on R2 — see `.agents/backlog-leaderboard.md`
- OAuth-backed identity — same backlog file
- Multi-region D1 read replicas — single primary is fine until traffic
  justifies it
