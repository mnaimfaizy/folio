import { Pool, type PoolClient } from 'pg';
import { DbClient, DbRunResult } from './types';
import fs from 'node:fs';
import path from 'node:path';

let pool: Pool | undefined;
let initialized = false;

const identifierRewrites: Array<[RegExp, string]> = [
  [/\bbookId\b/g, 'book_id'],
  [/\buserId\b/g, 'user_id'],
  [/\bpublishYear\b/g, 'publish_year'],
  [/\bcoverKey\b/g, 'cover_key'],
  [/\bcreatedAt\b/g, 'created_at'],
  [/\bupdatedAt\b/g, 'updated_at'],
  [/\bexpiresAt\b/g, 'expires_at'],
  [/\bavailableCopies\b/g, 'available_copies'],
];

const rowKeyAliases: Record<string, string> = {
  book_id: 'bookId',
  user_id: 'userId',
  publish_year: 'publishYear',
  cover_key: 'coverKey',
  available_copies: 'availableCopies',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  expires_at: 'expiresAt',
};

function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  pool = new Pool(
    connectionString
      ? { connectionString }
      : {
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT || 5432),
          database: process.env.POSTGRES_DB || 'folio',
          user: process.env.POSTGRES_USER || 'folio',
          password: process.env.POSTGRES_PASSWORD || 'folio',
        },
  );

  return pool;
}

function replaceSqliteParams(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

function normalizeIdentifiers(sql: string): string {
  let text = sql;
  for (const [pattern, replacement] of identifierRewrites) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

function mapRowKeys<T extends Record<string, any>>(row: T): T {
  if (!row || typeof row !== 'object') return row;

  // Preserve original keys but also expose expected camelCase aliases.
  for (const [snakeKey, camelKey] of Object.entries(rowKeyAliases)) {
    if (snakeKey in row && !(camelKey in row)) {
      (row as any)[camelKey] = (row as any)[snakeKey];
    }
  }
  return row;
}

function normalizeSql(sql: string): string {
  let text = sql.trim();
  if (text.endsWith(';')) text = text.slice(0, -1);

  // SQLite: INSERT OR IGNORE -> Postgres: INSERT ... ON CONFLICT DO NOTHING
  const hadInsertOrIgnore = /insert\s+or\s+ignore/i.test(text);
  if (hadInsertOrIgnore) {
    text = text.replace(/insert\s+or\s+ignore/i, 'INSERT');
    if (!/\bon\s+conflict\b/i.test(text)) {
      text = `${text} ON CONFLICT DO NOTHING`;
    }
  }

  text = normalizeIdentifiers(text);
  return replaceSqliteParams(text);
}

function shouldAutoReturnId(sql: string): boolean {
  const match = sql.match(/insert\s+into\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
  if (!match) return false;
  const table = match[1].toLowerCase();
  if (table === 'author_books') return false; // composite PK
  return true;
}

async function initializeTables(db: DbClient): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      verification_token_expires TIMESTAMPTZ,
      role TEXT DEFAULT 'USER',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      isbn TEXT UNIQUE,
      isbn10 TEXT UNIQUE,
      isbn13 TEXT UNIQUE,
      publish_year INTEGER,
      pages INTEGER,
      genre TEXT,
      author TEXT,
      cover TEXT,
      cover_key TEXT,
      featured BOOLEAN DEFAULT FALSE,
      available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_key TEXT;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS pages INTEGER;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS genre TEXT;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS available_copies INTEGER DEFAULT 1;

    CREATE TABLE IF NOT EXISTS user_collections (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS reset_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS authors (
      id BIGSERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      biography TEXT,
      birth_date TEXT,
      photo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS author_books (
      author_id BIGINT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
      book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (author_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id BIGSERIAL PRIMARY KEY,
      book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      username TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS book_loans (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      borrowed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date TIMESTAMPTZ NOT NULL,
      approved_at TIMESTAMPTZ,
      rejected_at TIMESTAMPTZ,
      reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      rejection_reason TEXT,
      returned_at TIMESTAMPTZ,
      lost_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      penalty_amount NUMERIC(10,2),
      admin_note TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
    ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
    ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

    CREATE TABLE IF NOT EXISTS loan_notifications (
      id BIGSERIAL PRIMARY KEY,
      loan_id BIGINT NOT NULL REFERENCES book_loans(id) ON DELETE CASCADE,
      notification_key TEXT NOT NULL,
      notified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(loan_id, notification_key)
    );

    CREATE TABLE IF NOT EXISTS book_requests (
      id BIGSERIAL PRIMARY KEY,
      requested_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requested_title TEXT,
      requested_author TEXT,
      requested_isbn TEXT,
      normalized_title TEXT,
      normalized_author TEXT,
      normalized_isbn TEXT,
      request_key TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN',
      matched_book_id BIGINT REFERENCES books(id) ON DELETE SET NULL,
      fulfilled_at TIMESTAMPTZ,
      fulfilled_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      fulfillment_note TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_author_books_author ON author_books(author_id);
    CREATE INDEX IF NOT EXISTS idx_author_books_book ON author_books(book_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_book_loans_user_status ON book_loans(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_book_loans_due_date ON book_loans(due_date);
    CREATE INDEX IF NOT EXISTS idx_book_requests_status ON book_requests(status);
    CREATE INDEX IF NOT EXISTS idx_book_requests_key ON book_requests(request_key);

    CREATE TABLE IF NOT EXISTS site_settings (
      id              INTEGER PRIMARY KEY DEFAULT 1,
      show_about_page    BOOLEAN DEFAULT TRUE,
      show_contact_page  BOOLEAN DEFAULT TRUE,
      site_name          TEXT DEFAULT 'Folio',
      site_description   TEXT DEFAULT 'Your digital library management system',
      logo_url           TEXT,
      favicon_url        TEXT,
      seo_keywords       TEXT,
      hero_title         TEXT DEFAULT 'Your Digital Library Awaits',
      hero_subtitle      TEXT DEFAULT 'Discover, collect, and manage your favorite books in one beautiful place.',
      hero_cta_text      TEXT DEFAULT 'Get Started',
      hero_cta_link      TEXT DEFAULT '/signup',
      hero_image_url     TEXT,
      footer_text        TEXT DEFAULT '© 2026 Folio. All rights reserved.',
      footer_links       JSONB DEFAULT '[]',
      social_links       JSONB DEFAULT '[]',
      contact_email      TEXT,
      contact_phone      TEXT,
      contact_address    TEXT,
      contact_form_enabled BOOLEAN DEFAULT TRUE,
      smtp_enabled       BOOLEAN DEFAULT FALSE,
      smtp_from_name     TEXT DEFAULT 'Folio',
      smtp_from_email    TEXT,
      email_test_rate_limit INTEGER DEFAULT 5,
      email_test_count   INTEGER DEFAULT 0,
      email_test_reset_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      loans_enabled BOOLEAN DEFAULT TRUE,
      max_concurrent_loans INTEGER DEFAULT 3,
      default_loan_duration_days INTEGER DEFAULT 14,
      mobile_app_enabled   BOOLEAN DEFAULT FALSE,
      mobile_api_base_url  TEXT,
      mobile_app_store_url TEXT,
      mobile_play_store_url TEXT,
      created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT single_row CHECK (id = 1)
    );

    INSERT INTO site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS loans_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS max_concurrent_loans INTEGER DEFAULT 3;
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_loan_duration_days INTEGER DEFAULT 14;
  `);
}

function getAppRoot(): string {
  // When built, this file lives at: <appRoot>/apps/api/db/database.js
  // So ../../.. points to <appRoot>
  const candidateFromDist = path.resolve(__dirname, '../../..');

  const candidates = [
    process.env.PASSENGER_APP_ROOT,
    process.env.INIT_CWD,
    candidateFromDist,
    process.cwd(),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'sql'))) return candidate;
  }

  return candidateFromDist;
}

async function applySqlFileIfExists(
  db: DbClient,
  filePath: string,
): Promise<void> {
  if (!fs.existsSync(filePath)) return;
  const sql = fs.readFileSync(filePath, 'utf8');
  if (!sql.trim()) return;
  await db.exec(sql);
}

export const connectDatabase = async (): Promise<DbClient> => {
  const pgPool = getPool();

  let client: PoolClient | undefined;

  const query = async <T = any>(sql: string, params?: unknown[]) => {
    const text = normalizeSql(sql);
    const values = params || [];

    // Auto-add RETURNING id for inserts (to preserve sqlite's lastID behavior)
    let finalText = text;
    if (/^\s*insert\b/i.test(finalText) && !/\breturning\b/i.test(finalText)) {
      if (shouldAutoReturnId(finalText)) {
        finalText = `${finalText} RETURNING id`;
      }
    }

    if (client) {
      return client.query<T>(finalText, values);
    }
    return pgPool.query<T>(finalText, values);
  };

  const db: DbClient = {
    async all<T = any>(sql: string, params?: unknown[]): Promise<T[]> {
      const result = await query<T>(sql, params);
      return (result.rows || []).map((r) => mapRowKeys(r as any)) as T[];
    },

    async get<T = any>(
      sql: string,
      params?: unknown[],
    ): Promise<T | undefined> {
      const result = await query<T>(sql, params);
      const row = (result.rows && result.rows[0]) as T | undefined;
      return row ? (mapRowKeys(row as any) as T) : undefined;
    },

    async run(sql: string, params?: unknown[]): Promise<DbRunResult> {
      const trimmed = sql.trim().toUpperCase();

      if (trimmed === 'BEGIN' || trimmed === 'BEGIN TRANSACTION') {
        if (!client) client = await pgPool.connect();
        await client.query('BEGIN');
        return {};
      }

      if (trimmed === 'COMMIT') {
        if (client) {
          await client.query('COMMIT');
          client.release();
          client = undefined;
        }
        return {};
      }

      if (trimmed === 'ROLLBACK') {
        if (client) {
          await client.query('ROLLBACK');
          client.release();
          client = undefined;
        }
        return {};
      }

      const result = await query(sql, params);
      const lastID =
        Array.isArray(result.rows) &&
        result.rows[0] &&
        (result.rows[0] as any).id
          ? Number((result.rows[0] as any).id)
          : undefined;

      return { lastID, changes: result.rowCount || 0 };
    },

    async exec(sql: string): Promise<void> {
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const statement of statements) {
        // exec is used for DDL; avoid RETURNING auto-append
        const text = normalizeSql(statement);
        if (client) {
          await client.query(text);
        } else {
          await pgPool.query(text);
        }
      }
    },
  };

  try {
    if (!initialized) {
      await initializeTables(db);

      const appRoot = getAppRoot();

      const settingsSql = path.join(appRoot, 'sql', '003_settings.sql');
      if (fs.existsSync(settingsSql)) {
        console.log(`[db] Applying ${settingsSql}`);
        await applySqlFileIfExists(db, settingsSql);
      }

      if (process.env.NODE_ENV === 'production') {
        const prodSeedSql = path.join(
          appRoot,
          'sql',
          '003_seed_production.sql',
        );
        if (fs.existsSync(prodSeedSql)) {
          console.log(`[db] Applying ${prodSeedSql}`);
          await applySqlFileIfExists(db, prodSeedSql);
        } else {
          console.warn(
            `[db] NODE_ENV=production but ${prodSeedSql} was not found; skipping production seed`,
          );
        }
      }

      initialized = true;
    }
    console.log('Connected to Postgres database');
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};
