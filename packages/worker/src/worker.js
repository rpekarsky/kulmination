// Thin Cloudflare Worker that proxies search calls to the Jamendo API.
// The game's hint card has a "search Jamendo" input — every keystroke
// (debounced) hits this Worker, the Worker injects the JAMENDO_CLIENT_ID
// from env (never exposed to the browser), and returns a trimmed JSON.
//
// Why a Worker:
//   Jamendo's ToS clause 2 says the client_id is "strictly personal" and
//   must not be disclosed to third parties. A static GitHub-Pages frontend
//   that shipped the key in plain JS would be a ToS violation. This Worker
//   keeps the key in CF Secret storage and never echoes it back.
//
// Endpoints:
//   GET /search?q=...   →  {results: [{id, name, artist, audio, duration,
//                                       license_url, track_url}]}
//   GET /track?id=...   →  {track:    {id, name, artist, audio, duration,
//                                       license_url, track_url}}
//   OPTIONS *           →  CORS preflight
//
// Deploy:
//   wrangler secret put JAMENDO_CLIENT_ID    (paste your key, never commits)
//   wrangler deploy
//
// Free-tier ceiling: 100k requests/day. Even an aggressive demo session
// shouldn't come close.
const ALLOWED_ORIGIN = '*';   // tighten to https://<your-username>.github.io once deployed

export default {
	async fetch(request, env) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders() });
		}

		const url = new URL(request.url);

		if (url.pathname === '/search' && request.method === 'GET') {
			return handleSearch(url.searchParams.get('q') || '', env);
		}

		if (url.pathname === '/track' && request.method === 'GET') {
			return handleLookup(url.searchParams.get('id') || '', env);
		}

		if (url.pathname === '/health') {
			return jsonResponse({ ok: true });
		}

		return new Response('Not found', { status: 404, headers: corsHeaders() });
	},
};

async function handleSearch(q, env) {
	const query = q.trim();
	if (!query) return jsonResponse({ results: [] });
	if (query.length > 100) return jsonResponse({ error: 'query too long' }, 400);

	if (!env.JAMENDO_CLIENT_ID) {
		return jsonResponse({ error: 'server missing JAMENDO_CLIENT_ID' }, 500);
	}

	const api = new URL('https://api.jamendo.com/v3.0/tracks/');
	api.searchParams.set('client_id', env.JAMENDO_CLIENT_ID);
	api.searchParams.set('format',      'json');
	api.searchParams.set('search',      query);
	api.searchParams.set('audioformat', 'mp31');
	api.searchParams.set('audiodlallowed', 'true');   // only downloadable tracks
	api.searchParams.set('include',     'musicinfo licenses');
	api.searchParams.set('limit',       '10');

	let upstream;
	try {
		upstream = await fetch(api.toString(), { cf: { cacheTtl: 60 } });
	} catch (err) {
		return jsonResponse({ error: 'upstream fetch failed: ' + err.message }, 502);
	}

	if (!upstream.ok) {
		return jsonResponse({ error: 'jamendo returned ' + upstream.status }, upstream.status);
	}

	const data = await upstream.json();

	// Jamendo returns HTTP 200 even on credential errors — the real status
	// is in data.headers.status. Propagate it so the client sees a clear
	// "auth failed" instead of an empty results list.
	if (data.headers && data.headers.status === 'failed') {
		return jsonResponse({
			error: 'jamendo: ' + (data.headers.error_message || 'unknown error'),
			code: data.headers.code,
		}, 502);
	}

	const results = (data.results || [])
		.filter(t => t.audiodownload)
		.map(toClientTrack);

	return jsonResponse({ results });
}

async function handleLookup(id, env) {
	if (!id || !/^\d+$/.test(id)) return jsonResponse({ error: 'invalid id' }, 400);

	if (!env.JAMENDO_CLIENT_ID) {
		return jsonResponse({ error: 'server missing JAMENDO_CLIENT_ID' }, 500);
	}

	const api = new URL('https://api.jamendo.com/v3.0/tracks/');
	api.searchParams.set('client_id', env.JAMENDO_CLIENT_ID);
	api.searchParams.set('format',      'json');
	api.searchParams.set('id',          id);
	api.searchParams.set('audioformat', 'mp31');
	api.searchParams.set('include',     'musicinfo licenses');

	let upstream;
	try {
		upstream = await fetch(api.toString(), { cf: { cacheTtl: 300 } });
	} catch (err) {
		return jsonResponse({ error: 'upstream fetch failed: ' + err.message }, 502);
	}

	if (!upstream.ok) {
		return jsonResponse({ error: 'jamendo returned ' + upstream.status }, upstream.status);
	}

	const data = await upstream.json();

	if (data.headers && data.headers.status === 'failed') {
		return jsonResponse({
			error: 'jamendo: ' + (data.headers.error_message || 'unknown error'),
			code: data.headers.code,
		}, 502);
	}

	const track = (data.results || [])[0];
	if (!track || !track.audiodownload) return jsonResponse({ error: 'track not found' }, 404);

	return jsonResponse({ track: toClientTrack(track) });
}

function toClientTrack(t) {
	return {
		id:          t.id,
		name:        t.name,
		artist:      t.artist_name,
		audio:       t.audiodownload,
		duration:    t.duration,
		license_url: t.license_ccurl || null,
		track_url:   'https://www.jamendo.com/track/' + t.id,
	};
}

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Max-Age':       '86400',
	};
}

function jsonResponse(obj, status = 200) {
	return new Response(JSON.stringify(obj), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			...corsHeaders(),
		},
	});
}
