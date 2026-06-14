# kulmination-worker

Cloudflare Worker that proxies Jamendo's search API for
[Kulmination](https://github.com/rpekarsky/kulmination), the music-rhythm
tube runner. The Jamendo `client_id` lives in CF Secret storage, never
in the client JS — required by Jamendo's ToS clause 2 (the key is
"strictly personal", must not be shared with third parties).

## Endpoint

```
GET https://<your-worker-subdomain>.workers.dev/search?q=lofi
→ { results: [
    {
      id: "1234567",
      name: "Track Name",
      artist: "Artist Name",
      audio: "https://prod-1.storage.jamendo.com/?...mp3",
      duration: 187,
      license_url: "https://creativecommons.org/licenses/by-nc-sa/3.0/",
      track_url: "https://www.jamendo.com/track/1234567"
    },
    ...
] }
```

Returns up to 10 results, only tracks marked downloadable. Edge-cached
60s to keep upstream load light.

## One-time deploy

```bash
npm install
npx wrangler login                          # opens browser, log into CF
npx wrangler secret put JAMENDO_CLIENT_ID   # paste your client_id, never commits
npx wrangler deploy
```

The deploy command prints a URL like
`https://kulmination-jamendo.<your-cf-subdomain>.workers.dev`. Drop that
base URL into `PROXY_URL` in `packages/game/search/search-jamendo.js`.

## Local dev

```bash
cp .dev.vars.example .dev.vars
# edit .dev.vars, paste your client_id
npm run dev
# Worker runs on http://localhost:8787
```

`.dev.vars` is gitignored.

## Tightening CORS

`src/worker.js` ships with `ALLOWED_ORIGIN = '*'` so anyone can call it
during development. Once the game is deployed, switch that constant to
the GitHub Pages origin (`'https://<your-username>.github.io'`) so
random sites can't burn your Jamendo quota.

## Attribution requirement

Jamendo ToS clause 4.1: the consuming application MUST credit the
JAMENDO Member as the creator and provide a clickable backlink to the
track's page on jamendo.com. The Worker returns `track_url` on every
result for exactly that reason — the game UI uses it in each search
row.

## License

GNU AGPL-3.0. See [LICENSE](../../LICENSE) at the monorepo root.
