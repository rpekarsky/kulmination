# Leaderboard setup (one-time)

The leaderboard worker needs a D1 database. Two manual steps before deploy
will work, both require `wrangler login` to be active.

## 1. Create the D1 database

```bash
wrangler d1 create kulmination_db
```

Output ends with a `[[d1_databases]]` block — copy the `database_id` UUID
and paste it into `wrangler.toml` at the existing `[[d1_databases]]` entry
(replace the `database_id = "PASTE_AFTER_CREATE"` placeholder).

## 2. Rate limiting

Rate limit on `POST /api/play` is handled by the Workers Rate Limiting
binding configured in `wrangler.toml` (`[[unsafe.bindings]]` →
`PLAY_RATELIMIT`). No setup needed beyond what's already in the config —
the binding is provisioned automatically on `wrangler deploy`. Period is
fixed to 60 seconds, limit 10 / cf-connecting-ip.

Recommend also enabling **Bot Fight Mode** in the CF dashboard (Security
→ Bots → free tier). It blocks blatant scrapers at the edge before they
hit the Worker — orthogonal layer to the Rate Limiting binding.

## 3. Apply the schema

Remote (production):

```bash
wrangler d1 execute kulmination_db --remote --file=.deploy/schema.sql
```

Local (for `wrangler dev`):

```bash
wrangler d1 execute kulmination_db --local --file=.deploy/schema.sql
```

That's it. The next `wrangler deploy` (or push-to-main via the CF Pages
build) will pick up the binding and the endpoints become live.

## Local dev with leaderboard backend

```bash
# Terminal 1: Worker + D1 emulation
wrangler dev

# Terminal 2: static game (Vite)
cd packages/game && npm start
```

`wrangler dev` serves the unified app (Worker + static via [assets]
binding) on a single port. Use that URL if you want full e2e —
`npm start`'s Vite dev server lacks the Worker so /api/* calls just 404
and the frontend silently hides the leaderboard panels (graceful degrade).

## Inspecting data

```bash
# Top scores on a track
wrangler d1 execute kulmination_db --remote --command \
  "SELECT nickname, score, datetime(played_at/1000, 'unixepoch') AS at FROM plays WHERE track_source='audius' AND track_id='87KQPwW' ORDER BY score DESC LIMIT 10"

# Total play count
wrangler d1 execute kulmination_db --remote --command \
  "SELECT COUNT(*) FROM plays"

# Clear (DEV ONLY)
wrangler d1 execute kulmination_db --local --command "DELETE FROM plays"
```
