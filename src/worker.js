// Worker entry — fronts the static game (served via env.ASSETS) and
// rewrites the HTML <head> for share-link URLs so Discord / Telegram /
// Twitter unfurl with the actual track name + cover art instead of the
// generic site meta.
//
// Bindings (wrangler.toml):
//   env.ASSETS     — static asset server (the packages/game/ output)
//   env.META_CACHE — KV namespace, optional, 1h TTL on track lookups

export default {
	async fetch(request, env, ctx) {
		const url    = new URL(request.url);
		const source = url.searchParams.get('source');
		const id     = url.searchParams.get('id');

		// Anything that isn't a share-link to root → serve the static file.
		if (!source || !id || url.pathname !== '/') {
			return env.ASSETS.fetch(request);
		}

		const meta = await getTrackMeta(source, id, env, ctx);
		if (!meta) return env.ASSETS.fetch(request);

		const response    = await env.ASSETS.fetch(request);
		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('text/html')) return response;

		const title = meta.artist
			? `${meta.name} — ${meta.artist} · Kulmination`
			: `${meta.name} · Kulmination`;
		const description = meta.artist
			? `Play "${meta.name}" by ${meta.artist} in Kulmination — browser rhythm tube runner.`
			: `Play "${meta.name}" in Kulmination — browser rhythm tube runner.`;

		const setAttr  = value => ({ element: el => el.setAttribute('content', value) });
		const setImage = value => ({ element: el => value && el.setAttribute('content', value) });

		return new HTMLRewriter()
			.on('title',                            { element: el => el.setInnerContent(title) })
			.on('meta[property="og:title"]',        setAttr(title))
			.on('meta[property="og:description"]',  setAttr(description))
			.on('meta[property="og:image"]',        setImage(meta.cover))
			.on('meta[name="twitter:title"]',       setAttr(title))
			.on('meta[name="twitter:description"]', setAttr(description))
			.on('meta[name="twitter:image"]',       setImage(meta.cover))
			.transform(response);
	},
};

async function getTrackMeta(source, id, env, ctx) {
	const key = `${source}:${id}`;
	if (env.META_CACHE) {
		const cached = await env.META_CACHE.get(key, 'json');
		if (cached) return cached;
	}
	const meta = await lookupTrack(source, id);
	if (meta && env.META_CACHE) {
		ctx.waitUntil(env.META_CACHE.put(key, JSON.stringify(meta), { expirationTtl: 3600 }));
	}
	return meta;
}

async function lookupTrack(source, id) {
	if (source === 'audius') {
		try {
			const r = await fetch('https://discoveryprovider.audius.co/v1/tracks/' + encodeURIComponent(id) + '?app_name=Kulmination');
			if (!r.ok) return null;
			const { data } = await r.json();
			if (!data) return null;
			return {
				name:   data.title || 'Unknown track',
				artist: (data.user && data.user.name) || null,
				cover:  (data.artwork && (data.artwork['1000x1000'] || data.artwork['480x480'] || data.artwork['150x150'])) || null,
			};
		} catch (err) {
			return null;
		}
	}
	return null;
}
