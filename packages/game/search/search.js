var Search = (function(){
	var providers = [];

	function register(p){
		if (!p || typeof p.search !== 'function') return;
		providers.push(p);
	}

	function searchAll(query, signal, providerNames){
		var pool = providerNames && providerNames.length
			? providers.filter(function(p){ return providerNames.indexOf(p.name) !== -1; })
			: providers;
		var fired = pool.map(function(p){
			return p.search(query, signal).catch(function(err){
				if (err && err.name === 'AbortError') throw err;
				console.warn('[' + p.name + ']', err);
				return [];
			});
		});
		return Promise.all(fired).then(function(arrays){
			return pool.map(function(p, i){
				return { provider: p, results: arrays[i] || [] };
			});
		});
	}

	return {
		register:     register,
		searchAll:    searchAll,
		getProviders: function(){ return providers.slice(); },
	};
})();
