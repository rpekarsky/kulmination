// Leaderboard API client. Talks to the Worker /api/* endpoints living on
// the same origin (so no CORS dance). All calls degrade silently: if the
// backend is missing (e.g. local Vite dev with no `wrangler dev`) or D1
// isn't bound yet, fetch() falls through to a null/empty return and the
// UI layer hides the panels.

var Leaderboard = (function(){
    var NICK_RE   = /^[a-zA-Z0-9_-]{1,16}$/;
    var BASE      = '/api';

    function isValidNickname(s){
        return typeof s === 'string' && NICK_RE.test(s);
    }

    function submit(play){
        return fetch(BASE + '/play', {
            method:  'POST',
            headers: { 'content-type': 'application/json' },
            body:    JSON.stringify(play),
        }).then(function(r){
            if (!r.ok) return r.json().then(function(j){ throw new Error(j.error || ('HTTP ' + r.status)); });
            return r.json();
        });
    }

    function leaderboard(source, id){
        var q = '?source=' + encodeURIComponent(source) + '&id=' + encodeURIComponent(id);
        return fetch(BASE + '/leaderboard' + q)
            .then(function(r){ return r.ok ? r.json() : { rows: [], total: 0 }; })
            .catch(function(){ return { rows: [], total: 0 }; });
    }

    function recent(){
        return fetch(BASE + '/recent')
            .then(function(r){ return r.ok ? r.json() : { rows: [] }; })
            .catch(function(){ return { rows: [] }; });
    }

    function mostPlayed(){
        return fetch(BASE + '/most-played')
            .then(function(r){ return r.ok ? r.json() : { rows: [] }; })
            .catch(function(){ return { rows: [] }; });
    }

    return {
        isValidNickname: isValidNickname,
        submit:          submit,
        leaderboard:     leaderboard,
        recent:          recent,
        mostPlayed:      mostPlayed,
    };
})();
