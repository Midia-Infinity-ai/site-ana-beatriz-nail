import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** Persisted data directory (mount a volume here in production, e.g. /data). */
export const DATA_DIR = resolve(process.env.DATA_DIR ?? './.data')
export const UPLOADS_DIR = join(DATA_DIR, 'uploads')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })

export const db = new Database(join(DATA_DIR, 'ana-beatriz.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_usage (
    month TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS nail_usage (
    visitor TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL DEFAULT '',
    visitor TEXT NOT NULL DEFAULT '',
    day TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_visits_day ON visits(day);
  CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor);
`)

/** Current month key, e.g. "2026-06". */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function getAiUsage(month: string): number {
  const row = db.prepare('SELECT count FROM ai_usage WHERE month = ?').get(month) as
    | { count: number }
    | undefined
  return row?.count ?? 0
}

export function incrementAiUsage(month: string): number {
  db.prepare(
    `INSERT INTO ai_usage (month, count) VALUES (?, 1)
     ON CONFLICT(month) DO UPDATE SET count = count + 1`,
  ).run(month)
  return getAiUsage(month)
}

/** Per-visitor try-on counter (keeps a single person from draining credits). */
export function getNailUsage(visitor: string): number {
  const row = db.prepare('SELECT count FROM nail_usage WHERE visitor = ?').get(visitor) as
    | { count: number }
    | undefined
  return row?.count ?? 0
}

export function incrementNailUsage(visitor: string): number {
  db.prepare(
    `INSERT INTO nail_usage (visitor, count, updated_at) VALUES (?, 1, ?)
     ON CONFLICT(visitor) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`,
  ).run(visitor, new Date().toISOString())
  return getNailUsage(visitor)
}
