CREATE TABLE IF NOT EXISTS plays (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  track_source TEXT    NOT NULL,
  track_id     TEXT    NOT NULL,
  track_title  TEXT    NOT NULL,
  track_artist TEXT,
  nickname     TEXT    NOT NULL,
  score        INTEGER NOT NULL,
  played_at    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS plays_by_track  ON plays (track_source, track_id, score DESC);
CREATE INDEX IF NOT EXISTS plays_by_played ON plays (played_at DESC);
