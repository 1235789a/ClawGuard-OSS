PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  website_url TEXT NOT NULL,
  business_name TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  consent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_tasks (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  task_date TEXT NOT NULL,
  task_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_history (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS growth_scores (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  scores_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES business_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  slug TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  report_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  consent INTEGER NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  properties_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_name_created ON events(name, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
