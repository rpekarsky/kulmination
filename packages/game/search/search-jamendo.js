// Jamendo provider — proxies through packages/worker because Jamendo's
// ToS forbids exposing client_id in client code.
(function(){
	var PROXY_URL = 'https://kulmination-jamendo.roman-pekarskiy.workers.dev';

	function toResult(t){
		return {
			id:        'jamendo:' + t.id,
			name:      t.name,
			artist:    t.artist,
			audio:     t.audio,
			track_url: t.track_url,
			duration:  t.duration,
			source:    'jamendo',
		};
	}

	function fetchJson(url, signal){
		return fetch(url, { signal: signal }).then(function(r){
			if (!r.ok) throw new Error('HTTP ' + r.status);
			return r.json();
		}).then(function(data){
			if (data.error) throw new Error(data.error);
			return data;
		});
	}

	Search.register({
		name:  'jamendo',
		label: 'jamendo',
		search: function(q, signal){
			return fetchJson(PROXY_URL + '/search?q=' + encodeURIComponent(q), signal)
				.then(function(data){ return (data.results || []).map(toResult); });
		},
		lookup: function(id, signal){
			return fetchJson(PROXY_URL + '/track?id=' + encodeURIComponent(id), signal)
				.then(function(data){
					if (!data.track) throw new Error('track not found');
					return toResult(data.track);
				});
		},
	});
})();
