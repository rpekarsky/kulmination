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

	function lookup(source, id, signal){
		var provider = providers.find(function(p){ return p.name === source; });
		if (!provider) return Promise.reject(new Error('unknown source: ' + source));
		if (typeof provider.lookup !== 'function') return Promise.reject(new Error(source + ' does not support lookup'));
		return provider.lookup(id, signal);
	}

	return {
		register:     register,
		searchAll:    searchAll,
		lookup:       lookup,
		getProviders: function(){ return providers.slice(); },
	};
})();
