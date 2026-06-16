// Leaderboard endpoints. Backed by env.DB (Cloudflare D1).
//
// PoC mode: no auth, no anti-cheat. We trust whatever the client posts
// (within sanity caps + a regex on the nickname). The composite track
// identity is (source, id); custom uploads have no stable identity and
// are silently skipped client-side, so we don't expect them here.
//
// Endpoints:
//   POST /api/play                       — submit one play
//   GET  /api/leaderboard?source=&id=    — top 10 for one track + total
//   GET  /api/recent                     — last 20 unique tracks
//   GET  /api/most-played                — top 10 by play count over last 1000

const NICK_RE     = /^[a-zA-Z0-9_-]{1,16}$/;
const MAX_SCORE   = 10_000_000;     // sanity cap; rhythm rounds rarely top 100k
const MAX_TITLE   = 200;
const MAX_ARTIST  = 200;
const MAX_ID_LEN  = 128;
const ALLOWED_SOURCES = new Set(['audius', 'bundled']);

const LEADERBOARD_CAP   = 1000;    // safety cap on rows returned per track
const RECENT_LIMIT      = 20;
const MOST_PLAYED_LIMIT = 10;
const MOST_PLAYED_WIN   = 1000;    // count over last N plays

// Rate limit on POST /api/play is enforced by the Workers Rate Limiting
// binding (env.PLAY_RATELIMIT) configured in wrangler.toml — in-memory
// at the edge, no D1 hit. Local `wrangler dev` may not have the binding,
// in which case we skip the check.

export async function handleApi(request, env, url) {
    if (!env.DB) {
        return json({ error: 'leaderboard backend not configured' }, 503);
    }

    const path = url.pathname;

    if (path === '/api/play'         && request.method === 'POST') return submitPlay(request, env);
    if (path === '/api/leaderboard'  && request.method === 'GET')  return getLeaderboard(env, url);
    if (path === '/api/recent'       && request.method === 'GET')  return getRecent(env);
    if (path === '/api/most-played'  && request.method === 'GET')  return getMostPlayed(env);

    return json({ error: 'not found' }, 404);
}

async function submitPlay(request, env) {
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'invalid json' }, 400); }

    const v = validatePlay(body);
    if (v.error) return json({ error: v.error }, 400);

    const ip = request.headers.get('cf-connecting-ip');
    if (env.PLAY_RATELIMIT && ip) {
        const { success } = await env.PLAY_RATELIMIT.limit({ key: ip });
        if (!success) return json({ error: 'rate limit exceeded — slow down' }, 429);
    }

    const now = Date.now();
    await env.DB.prepare(
        'INSERT INTO plays (track_source, track_id, track_title, track_artist, nickname, score, played_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(v.source, v.id, v.title, v.artist, v.nickname, v.score, now).run();

    const rankRow = await env.DB.prepare(
        'SELECT COUNT(*) AS rank FROM plays WHERE track_source = ? AND track_id = ? AND score > ?'
    ).bind(v.source, v.id, v.score).first();
    const rank = (rankRow?.rank ?? 0) + 1;

    return json({ ok: true, rank, played_at: now });
}

function validatePlay(body) {
    if (!body || typeof body !== 'object')          return { error: 'body missing' };
    const { source, id, title, artist, nickname, score } = body;
    if (!ALLOWED_SOURCES.has(source))               return { error: 'invalid source' };
    if (typeof id !== 'string' || !id.length || id.length > MAX_ID_LEN)
                                                    return { error: 'invalid id' };
    if (typeof title !== 'string' || !title.length || title.length > MAX_TITLE)
                                                    return { error: 'invalid title' };
    if (artist != null && (typeof artist !== 'string' || artist.length > MAX_ARTIST))
                                                    return { error: 'invalid artist' };
    if (typeof nickname !== 'string' || !NICK_RE.test(nickname))
                                                    return { error: 'invalid nickname' };
    if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE)
                                                    return { error: 'invalid score' };
    return { source, id, title, artist: artist || null, nickname, score };
}

async function getLeaderboard(env, url) {
    const source = url.searchParams.get('source');
    const id     = url.searchParams.get('id');
    if (!ALLOWED_SOURCES.has(source) || !id) {
        return json({ error: 'source + id required' }, 400);
    }

    const top = await env.DB.prepare(
        'SELECT nickname, score, played_at FROM plays WHERE track_source = ? AND track_id = ? ORDER BY score DESC, played_at ASC LIMIT ?'
    ).bind(source, id, LEADERBOARD_CAP).all();

    const totalRow = await env.DB.prepare(
        'SELECT COUNT(*) AS total FROM plays WHERE track_source = ? AND track_id = ?'
    ).bind(source, id).first();

    return json({ rows: top.results || [], total: totalRow?.total ?? 0, cap: LEADERBOARD_CAP });
}

async function getRecent(env) {
    const rows = await env.DB.prepare(
        `SELECT track_source AS source, track_id AS id, track_title AS title, track_artist AS artist, MAX(played_at) AS played_at
         FROM plays
         GROUP BY track_source, track_id
         ORDER BY played_at DESC
         LIMIT ?`
    ).bind(RECENT_LIMIT).all();
    return json({ rows: rows.results || [] });
}

async function getMostPlayed(env) {
    const rows = await env.DB.prepare(
        `SELECT track_source AS source, track_id AS id, track_title AS title, track_artist AS artist, COUNT(*) AS plays
         FROM (SELECT * FROM plays ORDER BY played_at DESC LIMIT ?)
         GROUP BY track_source, track_id
         ORDER BY plays DESC, MAX(played_at) DESC
         LIMIT ?`
    ).bind(MOST_PLAYED_WIN, MOST_PLAYED_LIMIT).all();
    return json({ rows: rows.results || [] });
}

function json(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json; charset=utf-8' },
    });
}
