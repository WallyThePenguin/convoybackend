import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { DATABASE_FILE } from './config.js'

const databaseDirectory = path.dirname(DATABASE_FILE)

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true })
}

const db = new Database(DATABASE_FILE)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      source TEXT,
      is_confirmed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      confirmed_at TEXT
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_subscribers_created_at
    ON subscribers (created_at);
  `,
  `
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role_interest TEXT NOT NULL,
      experience TEXT,
      portfolio_url TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK (
        status IN ('new', 'reviewing', 'accepted', 'rejected')
      ),
      created_at TEXT NOT NULL
    );
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_applications_created_at
    ON applications (created_at);
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_applications_status
    ON applications (status);
  `,
]

for (const migration of migrations) {
  db.prepare(migration).run()
}

export default db
