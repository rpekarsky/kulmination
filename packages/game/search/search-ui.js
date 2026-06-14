var SearchUI = (function(){
	var MIN_CHARS = 2;
	var DEBOUNCE_MS = 350;

	function formatDuration(seconds){
		if (!seconds) return '';
		var mins = Math.floor(seconds / 60);
		var secs = seconds % 60;
		return mins + ':' + (secs < 10 ? '0' + secs : secs);
	}

	function buildResultRow(result, onPick){
		var row = document.createElement('div');
		row.className = 'item ' + result.source;

		var name = document.createElement('span');
		name.className = 'name';
		name.textContent = result.artist ? (result.name + ' — ' + result.artist) : result.name;
		name.addEventListener('click', function(){ onPick(result); });

		var duration = document.createElement('span');
		duration.className = 'duration';
		duration.textContent = formatDuration(result.duration);

		var backlink = document.createElement('a');
		backlink.className = 'ext';
		backlink.href = result.track_url;
		backlink.target = '_blank';
		backlink.rel = 'noopener';
		backlink.textContent = '↗';
		backlink.title = 'open on ' + result.source;
		backlink.addEventListener('click', function(e){ e.stopPropagation(); });

		row.appendChild(name);
		row.appendChild(duration);
		row.appendChild(backlink);
		return row;
	}

	function renderGroups(groups, resultsEl, onPick){
		resultsEl.innerHTML = '';
		var totalResults = groups.reduce(function(n, g){ return n + g.results.length; }, 0);
		if (!totalResults) {
			resultsEl.innerHTML = '<div class="search-status">no results</div>';
			return;
		}
		groups.forEach(function(group){
			if (!group.results.length) return;
			var header = document.createElement('div');
			header.className = 'search-header';
			header.textContent = '↓ from ' + group.provider.label;
			resultsEl.appendChild(header);
			group.results.forEach(function(result){
				resultsEl.appendChild(buildResultRow(result, onPick));
			});
		});
	}

	function attach(opts){
		var debounceTimer = null;
		var inFlightAbort = null;

		opts.input.addEventListener('input', function(e){
			var query = e.target.value.trim();
			if (debounceTimer) clearTimeout(debounceTimer);
			if (inFlightAbort) inFlightAbort.abort();

			if (query.length < MIN_CHARS) {
				opts.results.innerHTML = '';
				if (opts.onClear) opts.onClear();
				return;
			}
			if (opts.onStart) opts.onStart();
			debounceTimer = setTimeout(function(){
				inFlightAbort = new AbortController();
				opts.results.innerHTML = '<div class="search-status">searching…</div>';
				Search.searchAll(query, inFlightAbort.signal).then(function(groups){
					renderGroups(groups, opts.results, opts.onPick);
				}).catch(function(err){
					if (err && err.name === 'AbortError') return;
					opts.results.innerHTML = '<div class="search-status error">search failed: ' + (err.message || err) + '</div>';
				});
			}, DEBOUNCE_MS);
		});
		opts.input.addEventListener('keydown', function(e){ e.stopPropagation(); });
	}

	return { attach: attach };
})();
