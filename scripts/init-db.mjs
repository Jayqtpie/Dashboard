import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const projectRoot = path.resolve(process.cwd());
const dataDir = path.join(projectRoot, 'data');
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(dataDir, 'guidedbarakah.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cta_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS engagement_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  completed_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS growth_metrics (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS growth_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL, -- hook | cta
  text TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS growth_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL, -- do_more | stop | test
  text TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS funnel_stats (
  keyword TEXT PRIMARY KEY,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  purchases INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ops_rollup (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  zapier_success INTEGER NOT NULL DEFAULT 0,
  zapier_fail INTEGER NOT NULL DEFAULT 0,
  delivery_errors INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ops_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  severity TEXT NOT NULL, -- info | warn | critical
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0
);
`);

const hasChecklist = db.prepare('SELECT COUNT(*) as c FROM checklist_items').get().c;
if (!hasChecklist) {
  const insert = db.prepare('INSERT INTO checklist_items (label, done, order_index) VALUES (?, ?, ?)');
  const items = [
    'Draft post (hook + promise)',
    'Add CTA keyword (choose below)',
    'Design cover / thumbnail',
    'Schedule or publish',
    'Pin comment + CTA',
    '20-minute engagement sprint',
    'Log results (clicks/purchases)',
  ];
  db.transaction(() => {
    items.forEach((label, i) => insert.run(label, 0, i));
  })();
}

const hasKeywords = db.prepare('SELECT COUNT(*) as c FROM cta_keywords').get().c;
if (!hasKeywords) {
  const insert = db.prepare('INSERT INTO cta_keywords (keyword, active) VALUES (?, ?)');
  const keywords = ['HABITS', 'BLUEPRINT', 'PLANNER', 'RAMADAN'];
  db.transaction(() => {
    keywords.forEach((k) => insert.run(k, 1));
  })();
}

const hasMetrics = db.prepare('SELECT COUNT(*) as c FROM growth_metrics').get().c;
if (!hasMetrics) {
  const insert = db.prepare('INSERT INTO growth_metrics (key, label, value, unit) VALUES (?, ?, ?, ?)');
  db.transaction(() => {
    insert.run('posts_week', 'Posts this week', 3, '');
    insert.run('avg_watch', 'Avg watch time', 18.4, 'sec');
    insert.run('ctr', 'Profile CTR', 2.1, '%');
    insert.run('replies', 'Comments + DMs', 27, '');
  })();
}

const hasLists = db.prepare('SELECT COUNT(*) as c FROM growth_lists').get().c;
if (!hasLists) {
  const insert = db.prepare('INSERT INTO growth_lists (kind, text, score) VALUES (?, ?, ?)');
  db.transaction(() => {
    ['"Stop scrolling if your salah is inconsistent"', '"If you had 10 minutes a day…"', '"The quiet habit that fixes your focus"'].forEach((t, i) => {
      insert.run('hook', t, 10 - i);
    });
    ['Comment HABITS and I\'ll send the checklist', 'DM BLUEPRINT for the 3-step system', 'Reply PLANNER for the template'].forEach((t, i) => {
      insert.run('cta', t, 10 - i);
    });
  })();
}

const hasNotes = db.prepare('SELECT COUNT(*) as c FROM growth_notes').get().c;
if (!hasNotes) {
  const insert = db.prepare('INSERT INTO growth_notes (kind, text) VALUES (?, ?)');
  db.transaction(() => {
    insert.run('do_more', 'Post earlier (before lunch) on weekdays.');
    insert.run('stop', 'Stop over-editing. Cap edits at 25 minutes.');
    insert.run('test', 'Test 7-second hook vs 3-second hook.');
  })();
}

const hasFunnel = db.prepare('SELECT COUNT(*) as c FROM funnel_stats').get().c;
if (!hasFunnel) {
  const insert = db.prepare(
    'INSERT INTO funnel_stats (keyword, trigger_count, clicks, purchases) VALUES (?, ?, ?, ?)'
  );
  db.transaction(() => {
    insert.run('HABITS', 42, 18, 3);
    insert.run('BLUEPRINT', 30, 14, 2);
    insert.run('PLANNER', 55, 21, 4);
    insert.run('RAMADAN', 10, 6, 1);
  })();
}

const ops = db.prepare('SELECT COUNT(*) as c FROM ops_rollup').get().c;
if (!ops) {
  db.prepare(
    'INSERT INTO ops_rollup (id, zapier_success, zapier_fail, delivery_errors) VALUES (1, ?, ?, ?)'
  ).run(128, 3, 1);
}

const hasAlerts = db.prepare('SELECT COUNT(*) as c FROM ops_alerts').get().c;
if (!hasAlerts) {
  const insert = db.prepare('INSERT INTO ops_alerts (severity, message, resolved) VALUES (?, ?, ?)');
  db.transaction(() => {
    insert.run('warn', 'Zapier: 2 recent failures in the last 24h.', 0);
    insert.run('info', 'Delivery: email provider latency elevated (monitor).', 0);
  })();
}

console.log('✅ Database initialized at:', dbPath);
console.log('Tip: set DB_PATH to override location.');

db.close();
