CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  page TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS feedback_created ON feedback(created_at);
CREATE TABLE IF NOT EXISTS feedback_quota (
  bucket TEXT PRIMARY KEY,
  hour INTEGER NOT NULL,
  count INTEGER NOT NULL
);
