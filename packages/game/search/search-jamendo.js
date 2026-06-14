// Jamendo provider — proxies through rpekarsky/kulmination-worker because
// Jamendo's ToS forbids exposing client_id in client code.
(function(){
	var PROXY_URL = 'https://kulmination-jamendo.roman-pekarskiy.workers.dev';

	Search.register({
		name:  'jamendo',
		label: 'jamendo',
		search: function(q, signal){
			var url = PROXY_URL + '/search?q=' + encodeURIComponent(q);
			return fetch(url, { signal: signal }).then(function(r){
				if (!r.ok) throw new Error('HTTP ' + r.status);
				return r.json();
			}).then(function(data){
				if (data.error) throw new Error(data.error);
				return (data.results || []).map(function(t){
					return {
						id:        'jamendo:' + t.id,
						name:      t.name,
						artist:    t.artist,
						audio:     t.audio,
						track_url: t.track_url,
						duration:  t.duration,
						source:    'jamendo',
					};
				});
			});
		},
	});
})();
