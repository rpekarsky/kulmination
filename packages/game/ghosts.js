// Ghost runners — visual overlay of top leaderboard runs on the same
// track. Each ghost holds a recorded score timeline (history) and at
// every frame the live player's score is compared to where the ghost
// was at the current playhead. The score delta translates to an
// arc-length offset on the spline: ghost appears "ahead" if outscoring
// you, "behind" if you're outscoring it.
//
// Smoothing model: both the player's and each ghost's "score-for-
// rendering" exponentially lerp toward their actual values. Position
// is derived from the smoothed scores, so a pickup (+100 instant) reads
// as a deliberate slide rather than a teleport.

var Ghost = (function(){
    var bodyMaterial = new THREE.MeshBasicMaterial({
        color:       0xffffff,
        transparent: true,
        opacity:     0.35,
        wireframe:   false,
    });

    function Ghost(row, index){
        this.nickname     = row.nickname;
        this.score        = row.score;
        this.history      = Array.isArray(row.history) ? row.history : [];
        this._cursor      = 0;            // forward-walking lookup hint
        this._smoothScore = null;         // null until first update seeds it

        this.geom = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(this.geom, bodyMaterial);
        this.mesh.rotation.z = 45 * TO_RADIANS;
        this.mesh.rotation.y = 90 * TO_RADIANS;

        this.obj            = new THREE.Object3D();
        this.pivotObject    = new THREE.Object3D();
        this.pivotRotate    = new THREE.Object3D();
        this.pivotPosition  = new THREE.Object3D();

        this.obj.add(this.mesh);
        this.obj.scale.set(1, 4, 8);
        this.pivotObject.add(this.obj);
        this.pivotRotate.add(this.pivotObject);
        this.pivotPosition.add(this.pivotRotate);

        // Each ghost orbits at a slightly different angle so they don't
        // stack into a single sprite when scores are tied near the start.
        this._angle = (index * 360 / 7) % 360;
        this.pivotObject.position.x = -tubeRadius / 2;

        this.labelEl = document.createElement('div');
        this.labelEl.className = 'ghost-label';
        this.labelEl.textContent = this.nickname;
    }

    // Find ghost's actual score at playhead t (ms). Forward-cursor with
    // back-walk-on-seek so it's O(1) amortized along normal playback.
    Ghost.prototype.scoreAt = function(tMs){
        var h = this.history;
        if (!h.length) return 0;
        var i = this._cursor;
        while (i < h.length && h[i][0] <= tMs) i++;
        while (i > 0 && h[i - 1][0] > tMs) i--;
        this._cursor = Math.max(0, Math.min(i, h.length));
        if (this._cursor === 0) return 0;
        return h[this._cursor - 1][1];
    };

    // Called per frame. `alpha` is the shared lerp coefficient for this
    // frame (1 - exp(-dt/TIME_CONSTANT)) — same for the player score
    // smoothing in Ghosts.update so both interpolations stay in sync.
    Ghost.prototype.update = function(playerPos, playerSmoothScore, alpha){
        var tMs = (typeof MPlayer !== 'undefined' && MPlayer.audio)
            ? MPlayer.audio.currentTime * 1000 : 0;
        var actualGhostScore = this.scoreAt(tMs);

        if (this._smoothScore === null) this._smoothScore = actualGhostScore;
        else                            this._smoothScore += (actualGhostScore - this._smoothScore) * alpha;

        // delta > 0 → player ahead in score → ghost should appear BEHIND
        // delta < 0 → ghost ahead in score → ghost appears AHEAD of player
        var delta = playerSmoothScore - this._smoothScore;
        var pos   = playerPos - delta * Ghosts.SCORE_TO_POSITION;

        if (pos < 0 || pos > level.length) {
            this.pivotPosition.visible = false;
            this.labelEl.style.display = 'none';
            return;
        }
        this.pivotPosition.visible = true;

        var t   = pos / level.length;
        var pt  = spline.getPointAt(t);
        var dir = spline.getTangentAt(t);
        dir = new THREE.Vector3(dir.x, dir.y, dir.z);

        this.pivotPosition.position = pt;
        var cross = dir.clone().cross(vectorUp);
        this.pivotPosition.up = cross.clone();
        this.pivotPosition.lookAt(pt.clone().add(dir));
        this.pivotRotate.rotation.z = this._angle * TO_RADIANS - 90 * TO_RADIANS;

        // Project mesh world position to screen for the HTML label.
        // Three.js r67 has applyProjection (incl. perspective divide) but
        // no Vector3.project shortcut yet — do the matrix composition by
        // hand. Shared scratch Matrix4 to avoid per-frame allocation.
        var worldPos = new THREE.Vector3();
        this.mesh.updateMatrixWorld();
        worldPos.setFromMatrixPosition(this.mesh.matrixWorld);
        var m = Ghost._projMatrix;
        m.multiplyMatrices(mainCamera.projectionMatrix, mainCamera.matrixWorldInverse);
        worldPos.applyProjection(m);
        if (worldPos.z > 1 || worldPos.z < -1 || Math.abs(worldPos.x) > 1.2 || Math.abs(worldPos.y) > 1.2) {
            this.labelEl.style.display = 'none';
            return;
        }

        // Label opacity by score-diff (use actual values — the visible
        // intent is "who's nearby in score right now", not the smoothed
        // value that's still catching up to a pickup). Inside NEAR fully
        // opaque, past FAR fully transparent, linear in between.
        var scoreDiff   = Math.abs(playerSmoothScore - actualGhostScore);
        var near        = Ghosts.SCORE_DIFF_NEAR;
        var far         = Ghosts.SCORE_DIFF_FAR;
        var labelOpacity;
        if (scoreDiff <= near)      labelOpacity = 1;
        else if (scoreDiff >= far)  labelOpacity = 0;
        else                        labelOpacity = 1 - (scoreDiff - near) / (far - near);

        if (labelOpacity <= 0.01) {
            this.labelEl.style.display = 'none';
            return;
        }

        var x = (worldPos.x + 1) / 2 * window.innerWidth;
        var y = (-worldPos.y + 1) / 2 * window.innerHeight;
        this.labelEl.style.display = 'block';
        this.labelEl.style.left    = x + 'px';
        this.labelEl.style.top     = (y - 28) + 'px';
        this.labelEl.style.opacity = labelOpacity;
    };

    Ghost._projMatrix = new THREE.Matrix4();

    Ghost.prototype.attach = function(){
        scene.add(this.pivotPosition);
        document.body.appendChild(this.labelEl);
    };

    Ghost.prototype.detach = function(){
        scene.remove(this.pivotPosition);
        if (this.labelEl && this.labelEl.parentNode) {
            this.labelEl.parentNode.removeChild(this.labelEl);
        }
    };

    return Ghost;
})();


var Ghosts = (function(){
    var active  = [];
    var enabled = true;     // toggled by the #ghosts-toggle UI

    // Player's smoothed score for ghost-offset rendering. Lerps toward
    // scoring.getScore() with the same alpha each ghost uses for its
    // own smoothing — keeps the relative-deltas consistent.
    var playerSmoothScore = null;
    var lastT             = 0;

    // Arc-units of spline displacement per point of score delta.
    var SCORE_TO_POSITION   = 0.1;

    // Score-smoothing time constant. ~0.3s lets a pickup slide visibly
    // without lingering forever.
    var LERP_TIME_CONSTANT  = 0.3;

    // Nickname label fade by score-diff. Inside NEAR fully opaque,
    // beyond FAR fully transparent, linear between. Score units —
    // a coin is 100, so 100/500 = "within ~1 coin opaque, beyond
    // 5 coins gone".
    var SCORE_DIFF_NEAR     = 2000;
    var SCORE_DIFF_FAR      = 5000;

    function spawn(rows){
        clear();
        if (!Array.isArray(rows) || !rows.length) return;
        if (typeof spline === 'undefined' || typeof level === 'undefined') return;
        for (var i = 0; i < rows.length; i++) {
            var g = new Ghost(rows[i], i);
            g.attach();
            active.push(g);
        }
        console.log('ghosts: spawned ' + active.length + ' runs');
    }

    function clear(){
        for (var i = 0; i < active.length; i++) active[i].detach();
        active = [];
        playerSmoothScore = null;
        lastT = 0;
    }

    function setVisible(v){
        enabled = !!v;
        if (!enabled) {
            for (var i = 0; i < active.length; i++) {
                active[i].pivotPosition.visible = false;
                active[i].labelEl.style.display = 'none';
            }
        }
    }

    function update(){
        if (!enabled || !active.length || typeof player === 'undefined') return;
        var actualPlayerScore = (typeof scoring !== 'undefined') ? scoring.getScore() : 0;
        var playerPos         = player.position;

        var now = performance.now();
        var alpha;
        if (playerSmoothScore === null) {
            playerSmoothScore = actualPlayerScore;
            alpha = 1;
        } else {
            var dt = Math.max(0, (now - lastT) / 1000);
            alpha  = 1 - Math.exp(-dt / LERP_TIME_CONSTANT);
            playerSmoothScore += (actualPlayerScore - playerSmoothScore) * alpha;
        }
        lastT = now;

        for (var i = 0; i < active.length; i++) {
            active[i].update(playerPos, playerSmoothScore, alpha);
        }
    }

    return {
        spawn:      spawn,
        clear:      clear,
        update:     update,
        setVisible: setVisible,
        SCORE_TO_POSITION:  SCORE_TO_POSITION,
        LERP_TIME_CONSTANT: LERP_TIME_CONSTANT,
        SCORE_DIFF_NEAR:    SCORE_DIFF_NEAR,
        SCORE_DIFF_FAR:     SCORE_DIFF_FAR,
    };
})();
