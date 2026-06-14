var SearchUI = (function(){
	var MIN_CHARS = 2;
	var DEBOUNCE_MS = 350;
	var ENGINE_STORAGE_KEY = 'kulm_search_engine';
	var ALL = 'all';

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
		var showHeaders = groups.length > 1;
		groups.forEach(function(group){
			if (!group.results.length) return;
			if (showHeaders) {
				var header = document.createElement('div');
				header.className = 'search-header';
				header.textContent = '↓ from ' + group.provider.label;
				resultsEl.appendChild(header);
			}
			group.results.forEach(function(result){
				resultsEl.appendChild(buildResultRow(result, onPick));
			});
		});
	}

	function populateEngineSelect(selectEl){
		var saved = localStorage.getItem(ENGINE_STORAGE_KEY) || ALL;
		selectEl.innerHTML = '';

		var allOpt = document.createElement('option');
		allOpt.value = ALL;
		allOpt.textContent = 'all';
		selectEl.appendChild(allOpt);

		Search.getProviders().forEach(function(p){
			var opt = document.createElement('option');
			opt.value = p.name;
			opt.textContent = p.label;
			selectEl.appendChild(opt);
		});

		var savedExists = Array.prototype.some.call(selectEl.options, function(o){ return o.value === saved; });
		selectEl.value = savedExists ? saved : ALL;
	}

	function selectedProviderNames(selectEl){
		if (!selectEl || selectEl.value === ALL) return null;
		return [selectEl.value];
	}

	function attach(opts){
		var debounceTimer = null;
		var inFlightAbort = null;

		if (opts.engineSelect) {
			// With a single provider the dropdown adds no choice — hide it.
			// When more providers register, the dropdown re-appears automatically.
			if (Search.getProviders().length <= 1) {
				opts.engineSelect.style.display = 'none';
			} else {
				populateEngineSelect(opts.engineSelect);
				opts.engineSelect.addEventListener('change', function(e){
					localStorage.setItem(ENGINE_STORAGE_KEY, e.target.value);
					if (opts.input.value.trim().length >= MIN_CHARS) {
						opts.input.dispatchEvent(new Event('input'));
					}
				});
				opts.engineSelect.addEventListener('keydown', function(e){ e.stopPropagation(); });
			}
		}

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
				var providerNames = selectedProviderNames(opts.engineSelect);
				Search.searchAll(query, inFlightAbort.signal, providerNames).then(function(groups){
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
