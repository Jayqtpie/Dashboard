import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

let _db: Database.Database | null = null;

export function getDb() {
  if (_db) return _db;

  const projectRoot = process.cwd();
  const dataDir = path.join(projectRoot, 'data');
  const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(dataDir, 'guidedbarakah.sqlite');

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  return _db;
}

export type ChecklistItem = {
  id: number;
  label: string;
  done: number; // 0|1
  order_index: number;
};

export type CTAKeyword = {
  id: number;
  keyword: string;
  active: number; // 0|1
};

export type GrowthMetric = {
  key: string;
  label: string;
  value: number;
  unit: string | null;
  updated_at: string;
};

export type GrowthListItem = {
  id: number;
  kind: 'hook' | 'cta';
  text: string;
  score: number;
  created_at: string;
};

export type GrowthNote = {
  id: number;
  kind: 'do_more' | 'stop' | 'test';
  text: string;
  updated_at: string;
};

export type FunnelStat = {
  keyword: 'HABITS' | 'BLUEPRINT' | 'PLANNER' | 'RAMADAN' | string;
  trigger_count: number;
  clicks: number;
  purchases: number;
  updated_at: string;
};

export type OpsRollup = {
  id: 1;
  zapier_success: number;
  zapier_fail: number;
  delivery_errors: number;
  updated_at: string;
};

export type OpsAlert = {
  id: number;
  severity: 'info' | 'warn' | 'critical' | string;
  message: string;
  created_at: string;
  resolved: number;
};
