// Leaderboard panels — DOM rendering for:
//   • #leaderboard-panel (right side, shown after track-finished)
//   • #recent-panel + #most-played-panel (left side, shown on main menu)
//
// Stays inert when the backend is missing (Leaderboard.* returns empty
// data on fetch failure → render produces empty list → CSS hides empty
// panels). No errors surfaced to the user for the PoC.

var LeaderboardUI = (function(){
    var pending = null;  // {source, id, title, artist, score} — current submission

    function $(id){ return document.getElementById(id); }

    function escapeText(s){
        var el = document.createElement('span');
        el.textContent = s == null ? '' : String(s);
        return el.innerHTML;
    }

    function relTime(ms){
        var s = Math.max(0, (Date.now() - ms) / 1000);
        if (s < 60)      return Math.floor(s) + 's ago';
        if (s < 3600)    return Math.floor(s / 60) + 'm ago';
        if (s < 86400)   return Math.floor(s / 3600) + 'h ago';
        if (s < 86400*7) return Math.floor(s / 86400) + 'd ago';
        return Math.floor(s / 86400 / 7) + 'w ago';
    }

    function init(opts){
        var leaderboardEl = $('leaderboard-panel');
        var recentEl      = $('recent-panel');
        var mostPlayedEl  = $('most-played-panel');
        if (!leaderboardEl || !recentEl || !mostPlayedEl) return;

        // Skip button hides the panel without submitting.
        leaderboardEl.addEventListener('click', function(e){
            if (e.target && e.target.classList.contains('lb-skip')) hideLeaderboard();
            if (e.target && e.target.classList.contains('lb-submit')) trySubmit();
        });

        // Enter inside the nickname input → submit.
        leaderboardEl.addEventListener('keydown', function(e){
            if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('lb-nick-input')) {
                e.preventDefault();
                trySubmit();
            }
            if (e.key === 'Escape') hideLeaderboard();
        });

        // Click on a recent / most-played row → load that track.
        function bindFeed(panelEl){
            panelEl.addEventListener('click', function(e){
                var row = e.target.closest('.feed-row');
                if (!row || !row.dataset.source || !row.dataset.id) return;
                if (typeof opts.onPickTrack === 'function') {
                    opts.onPickTrack(row.dataset.source, row.dataset.id, row.dataset.title || '', row.dataset.artist || '');
                }
            });
        }
        bindFeed(recentEl);
        bindFeed(mostPlayedEl);
    }

    function onTrackFinished(track, score, history){
        // Skip leaderboard for custom drops (no stable id) and any track
        // where we don't have a source/id pair.
        if (!track || !track.source || !track.id) return;
        pending = {
            source:  track.source,
            id:      track.id,
            title:   track.title  || track.id,
            artist:  track.artist || null,
            score:   score | 0,
            history: Array.isArray(history) ? history : null,
        };
        showLeaderboardLoading();
        Leaderboard.leaderboard(pending.source, pending.id).then(renderLeaderboard);
    }

    function showLeaderboardLoading(){
        var el = $('leaderboard-panel');
        el.classList.remove('hidden');
        el.innerHTML = '<div class="lb-loading">loading leaderboard…</div>';
    }

    function hideLeaderboard(){
        var el = $('leaderboard-panel');
        if (el) el.classList.add('hidden');
        pending = null;
    }

    function renderLeaderboard(data){
        if (!pending) return;
        var rows  = data.rows  || [];
        var score = pending.score;

        // Insertion index: first existing row with strictly-lower score.
        // Equal scores: new entry goes AFTER existing (ties favor the older
        // submission, matching the server's secondary ASC on played_at).
        var insertAt = rows.length;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].score < score) { insertAt = i; break; }
        }

        // Splice the input row into the displayed list so the user sees
        // exactly where their score lands among the existing entries.
        var displayRows = rows.slice();
        displayRows.splice(insertAt, 0, { __input: true, score: score });

        var html  = '<div class="lb-track">' + escapeText(pending.title) +
                    (pending.artist ? ' <span class="lb-artist">— ' + escapeText(pending.artist) + '</span>' : '') +
                    '</div>';
        html += '<div class="lb-rows">';
        for (var j = 0; j < displayRows.length; j++) {
            html += rowHtml(j + 1, displayRows[j]);
        }
        html += '</div>';
        html += '<div class="lb-actions">' +
                '<button class="lb-submit">submit</button>' +
                '<button class="lb-skip">skip</button>' +
                '</div>';
        html += '<div class="lb-error" role="alert"></div>';

        var el = $('leaderboard-panel');
        el.innerHTML = html;

        var input = el.querySelector('.lb-nick-input');
        if (input) {
            input.focus();
            input.select();
        }
        var selfRow = el.querySelector('.lb-row-self');
        if (selfRow && selfRow.scrollIntoView) {
            // Smooth scroll inside the rows container — the parent has
            // overflow:auto, so this scrolls only the inner list.
            selfRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function rowHtml(rank, row, isSelf){
        if (row.__input) {
            return '<div class="lb-row lb-row-self">' +
                   '<span class="lb-rank">' + rank + '</span>' +
                   '<input class="lb-nick-input" type="text" maxlength="16" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="ник" pattern="[a-zA-Z0-9_-]+">' +
                   '<span class="lb-score">' + row.score.toLocaleString('en-US') + '</span>' +
                   '</div>';
        }
        return '<div class="lb-row' + (isSelf ? ' lb-row-self' : '') + '">' +
               '<span class="lb-rank">' + rank + '</span>' +
               '<span class="lb-nick">' + escapeText(row.nickname) + '</span>' +
               '<span class="lb-score">' + row.score.toLocaleString('en-US') + '</span>' +
               '</div>';
    }

    function trySubmit(){
        if (!pending) return;
        var el    = $('leaderboard-panel');
        var input = el.querySelector('.lb-nick-input');
        var errEl = el.querySelector('.lb-error');
        if (!input) return;

        var nick = input.value.trim();
        if (!Leaderboard.isValidNickname(nick)) {
            errEl.textContent = 'nickname: a-z A-Z 0-9 _ - (1–16 chars)';
            input.focus();
            return;
        }
        errEl.textContent = '';

        var payload = {
            source:   pending.source,
            id:       pending.id,
            title:    pending.title,
            artist:   pending.artist,
            nickname: nick,
            score:    pending.score,
            history:  pending.history,
        };
        // Lock the buttons during the round trip.
        el.querySelectorAll('button').forEach(function(b){ b.disabled = true; });

        Leaderboard.submit(payload).then(function(res){
            return Leaderboard.leaderboard(pending.source, pending.id).then(function(data){
                pending = null;
                var rows = data.rows || [];
                var submittedRank = res && res.rank;

                var html  = '<div class="lb-track">' + escapeText(payload.title) +
                            (payload.artist ? ' <span class="lb-artist">— ' + escapeText(payload.artist) + '</span>' : '') +
                            '</div>';
                html += '<div class="lb-rows">';
                for (var i = 0; i < rows.length; i++) {
                    var isSelf = (i + 1 === submittedRank) &&
                                 rows[i].nickname === payload.nickname &&
                                 rows[i].score    === payload.score;
                    html += rowHtml(i + 1, rows[i], isSelf);
                }
                html += '</div>';
                html += '<div class="lb-actions"><button class="lb-skip">close</button></div>';
                el.innerHTML = html;
                var selfRow = el.querySelector('.lb-row-self');
                if (selfRow && selfRow.scrollIntoView) {
                    selfRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }).catch(function(err){
            errEl.textContent = 'submit failed: ' + (err.message || err);
            el.querySelectorAll('button').forEach(function(b){ b.disabled = false; });
        });
    }

    function refreshFeeds(){
        Leaderboard.recent().then(function(data){
            renderFeed($('recent-panel'), 'RECENT', data.rows || [], function(r){
                return relTime(r.played_at);
            });
        });
        Leaderboard.mostPlayed().then(function(data){
            renderFeed($('most-played-panel'), 'MOST PLAYED', data.rows || [], function(r){
                return r.plays + '×';
            });
        });
    }

    function renderFeed(panelEl, title, rows, formatMeta){
        if (!panelEl) return;
        if (!rows.length) {
            panelEl.classList.add('hidden');
            return;
        }
        panelEl.classList.remove('hidden');

        var html = '<div class="panel-eyebrow">' + title + '</div><div class="feed-rows">';
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            html += '<div class="feed-row" ' +
                    'data-source="' + escapeText(r.source) + '" ' +
                    'data-id="'     + escapeText(r.id)     + '" ' +
                    'data-title="'  + escapeText(r.title)  + '" ' +
                    'data-artist="' + escapeText(r.artist || '') + '">' +
                    '<div class="feed-title">' + escapeText(r.title) + '</div>' +
                    (r.artist ? '<div class="feed-artist">— ' + escapeText(r.artist) + '</div>' : '') +
                    '<div class="feed-meta">' + escapeText(formatMeta(r)) + '</div>' +
                    '</div>';
        }
        html += '</div>';
        panelEl.innerHTML = html;
    }

    function showFeeds(){
        ['recent-panel', 'most-played-panel'].forEach(function(id){
            var el = $(id);
            if (el && el.children.length) el.classList.remove('hidden');
        });
    }

    function hideFeeds(){
        ['recent-panel', 'most-played-panel', 'leaderboard-panel'].forEach(function(id){
            var el = $(id);
            if (el) el.classList.add('hidden');
        });
    }

    return {
        init:             init,
        onTrackFinished:  onTrackFinished,
        hideLeaderboard:  hideLeaderboard,
        refreshFeeds:     refreshFeeds,
        showFeeds:        showFeeds,
        hideFeeds:        hideFeeds,
    };
})();
