// Audius provider — public API, no key, no proxy.
// Discovery node is hardcoded; rotation would need a separate lookup.
(function(){
	var HOST = 'https://discoveryprovider.audius.co';
	var APP  = 'Kulmination';

	Search.register({
		name:  'audius',
		label: 'audius',
		search: function(q, signal){
			var url = HOST + '/v1/tracks/search?app_name=' + APP + '&query=' + encodeURIComponent(q);
			return fetch(url, { signal: signal }).then(function(r){
				if (!r.ok) throw new Error('HTTP ' + r.status);
				return r.json();
			}).then(function(data){
				return (data.data || []).map(function(t){
					return {
						id:        'audius:' + t.id,
						name:      t.title,
						artist:    t.user && t.user.name,
						audio:     HOST + '/v1/tracks/' + t.id + '/stream?app_name=' + APP,
						track_url: t.permalink ? ('https://audius.co' + t.permalink) : ('https://audius.co/tracks/' + t.id),
						duration:  t.duration,
						source:    'audius',
					};
				});
			});
		},
	});
})();
