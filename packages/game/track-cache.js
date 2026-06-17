// IndexedDB-backed cache for audio blobs. Avoids re-downloading the
// same Audius track twice and gives DnD files a way to survive a page
// refresh (the blob: URL the page held dies on reload — but the blob
// itself, once stored in IndexedDB, restores on lookup by file identity:
// name + size + lastModified).
//
// Out of scope: bundled tracks (small, served from same origin → no
// bandwidth win, and they'll likely be removed entirely).
//
// API:
//   TrackCache.lookup(source, id)            → Promise<Blob | null>
//   TrackCache.put(source, id, blob, meta?)  → Promise<void>
//   TrackCache.customId(file)                → composite id for a File
//
// Eviction: LRU on `lastUsed`, capped at MAX_ENTRIES. Each successful
// lookup touches the entry so frequently-played tracks stay hot.

var TrackCache = (function(){
    var DB_NAME     = 'kulm';
    var DB_VERSION  = 1;
    var STORE       = 'tracks';
    var MAX_ENTRIES = 30;

    var _dbPromise = null;

    function open(){
        if (_dbPromise) return _dbPromise;
        if (typeof indexedDB === 'undefined') {
            _dbPromise = Promise.reject(new Error('IndexedDB unavailable'));
            return _dbPromise;
        }
        _dbPromise = new Promise(function(resolve, reject){
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function(){
                var db = req.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    var store = db.createObjectStore(STORE, { keyPath: 'key' });
                    store.createIndex('lastUsed', 'lastUsed');
                }
            };
            req.onsuccess = function(){ resolve(req.result); };
            req.onerror   = function(){ reject(req.error); };
        });
        return _dbPromise;
    }

    function tx(mode){
        return open().then(function(db){
            return db.transaction(STORE, mode).objectStore(STORE);
        });
    }

    function keyOf(source, id){ return source + ':' + id; }

    function lookup(source, id){
        var key = keyOf(source, id);
        return tx('readonly').then(function(s){
            return new Promise(function(resolve){
                var r = s.get(key);
                r.onsuccess = function(){
                    var rec = r.result;
                    if (!rec || !rec.blob) { resolve(null); return; }
                    // Async-touch the entry (don't block playback).
                    touch(key);
                    resolve(rec.blob);
                };
                r.onerror = function(){ resolve(null); };
            });
        }).catch(function(){ return null; });
    }

    function touch(key){
        return tx('readwrite').then(function(s){
            var r = s.get(key);
            r.onsuccess = function(){
                if (!r.result) return;
                r.result.lastUsed = Date.now();
                s.put(r.result);
            };
        }).catch(function(){});
    }

    function put(source, id, blob, meta){
        var key = keyOf(source, id);
        var rec = {
            key:      key,
            source:   source,
            id:       id,
            blob:     blob,
            size:     blob.size,
            title:    (meta && meta.title)  || null,
            artist:   (meta && meta.artist) || null,
            cover:    (meta && meta.cover)  || null,
            lastUsed: Date.now(),
        };
        return tx('readwrite').then(function(s){
            return new Promise(function(resolve){
                var r = s.put(rec);
                r.onsuccess = function(){ resolve(); };
                r.onerror   = function(){ resolve(); };
            });
        }).then(enforceLimit).catch(function(){});
    }

    function enforceLimit(){
        return tx('readwrite').then(function(s){
            return new Promise(function(resolve){
                var cReq = s.count();
                cReq.onsuccess = function(){
                    var excess = cReq.result - MAX_ENTRIES;
                    if (excess <= 0) { resolve(); return; }
                    var idx = s.index('lastUsed');
                    var cur = idx.openCursor(null, 'next');   // oldest first
                    var removed = 0;
                    cur.onsuccess = function(){
                        var c = cur.result;
                        if (!c || removed >= excess) { resolve(); return; }
                        s.delete(c.primaryKey);
                        removed++;
                        c.continue();
                    };
                };
                cReq.onerror = function(){ resolve(); };
            });
        }).catch(function(){});
    }

    function customId(file){
        return file.name + ':' + file.size + ':' + (file.lastModified || 0);
    }

    return {
        lookup:   lookup,
        put:      put,
        customId: customId,
    };
})();
