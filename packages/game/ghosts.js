// Ghost runners — visual overlay of top leaderboard runs on the same
// track. Each ghost holds a recorded score timeline (from /api/leaderboard
// ?include_history=1). At every frame we look up where the ghost's
// score was at the current playhead, compute the score delta vs the
// player, and translate that to an arc-length offset on the spline.
// Net effect: ghost appears "ahead" if it's outscoring you, "behind"
// if you're outscoring it — even though physically you all travel the
// same tube at the same speed.

var Ghost = (function(){
    var bodyMaterial = new THREE.MeshBasicMaterial({
        color:       0xffffff,
        transparent: true,
        opacity:     0.35,
        wireframe:   false,
    });

    function Ghost(row, index){
        this.nickname = row.nickname;
        this.score    = row.score;
        this.history  = Array.isArray(row.history) ? row.history : [];
        this._cursor  = 0;                  // forward-walking lookup hint

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

    // Find ghost's score at playhead t (ms). Uses _cursor as a hint —
    // sequential calls during gameplay almost always advance forward.
    Ghost.prototype.scoreAt = function(tMs){
        var h = this.history;
        if (!h.length) return 0;
        var i = this._cursor;
        // Move forward if needed.
        while (i < h.length && h[i][0] <= tMs) i++;
        // Move back if playhead jumped (seek).
        while (i > 0 && h[i - 1][0] > tMs) i--;
        this._cursor = Math.max(0, Math.min(i, h.length));
        if (this._cursor === 0) return 0;
        return h[this._cursor - 1][1];
    };

    Ghost.prototype.update = function(playerPos, playerScore){
        var tMs = (typeof MPlayer !== 'undefined' && MPlayer.audio)
            ? MPlayer.audio.currentTime * 1000 : 0;
        var ghostScore = this.scoreAt(tMs);

        // delta > 0 → player ahead in score → ghost should appear BEHIND
        // delta < 0 → ghost ahead in score → ghost appears AHEAD of player
        var delta  = playerScore - ghostScore;
        var offset = delta * Ghosts.SCORE_TO_POSITION;
        var pos    = playerPos - offset;

        // Clamp inside the spline range; off-spline ghosts get hidden.
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
        // hand. Cached on the function so we don't allocate a new Matrix4
        // every frame per ghost.
        var worldPos = new THREE.Vector3();
        this.mesh.updateMatrixWorld();
        worldPos.setFromMatrixPosition(this.mesh.matrixWorld);
        var m = Ghost._projMatrix;
        m.multiplyMatrices(mainCamera.projectionMatrix, mainCamera.matrixWorldInverse);
        worldPos.applyProjection(m);
        // After applyProjection, components are in clip space ([-1,1] when
        // visible). z > 1 → behind near plane / outside frustum.
        if (worldPos.z > 1 || worldPos.z < -1 || Math.abs(worldPos.x) > 1.2 || Math.abs(worldPos.y) > 1.2) {
            this.labelEl.style.display = 'none';
            return;
        }
        var x = (worldPos.x + 1) / 2 * window.innerWidth;
        var y = (-worldPos.y + 1) / 2 * window.innerHeight;
        this.labelEl.style.display = 'block';
        this.labelEl.style.left = x + 'px';
        this.labelEl.style.top  = (y - 28) + 'px';
    };

    // Shared scratch matrix for screen-projection — reused every frame
    // by every ghost. Avoids per-frame allocation of Matrix4 instances.
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
    var active = [];

    // Arc-units of spline displacement per point of score delta. The
    // tube uses tubeRadius=30 with level.length usually in the tens of
    // thousands per 3-min track; ~0.1 puts a 200-point lead ≈20 units
    // ahead, which is roughly Obstacles.screen visibility range.
    var SCORE_TO_POSITION = 0.1;

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
    }

    function update(){
        if (!active.length || typeof player === 'undefined') return;
        var playerScore = (typeof scoring !== 'undefined') ? scoring.getScore() : 0;
        var playerPos   = player.position;
        for (var i = 0; i < active.length; i++) {
            active[i].update(playerPos, playerScore);
        }
    }

    return {
        spawn: spawn,
        clear: clear,
        update: update,
        SCORE_TO_POSITION: SCORE_TO_POSITION,
    };
})();
