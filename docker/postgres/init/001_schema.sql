-- Folio schema for local Postgres (API uses Postgres).

CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  password        TEXT NOT NULL,
  email_verified  BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires TIMESTAMPTZ,
  role            TEXT DEFAULT 'USER',
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  isbn        TEXT UNIQUE,
  isbn10      TEXT UNIQUE,
  isbn13      TEXT UNIQUE,
  publish_year INTEGER,
  pages       INTEGER,
  genre       TEXT,
  author      TEXT,
  cover       TEXT,
  cover_key   TEXT,
  available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
  description TEXT,
  featured    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_loans (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id         BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrowed_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date        TIMESTAMPTZ NOT NULL,
  approved_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  returned_at     TIMESTAMPTZ,
  lost_at         TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'PENDING',
  penalty_amount  NUMERIC(10,2),
  admin_note      TEXT,
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS reviewed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE book_loans ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS loan_notifications (
  id                BIGSERIAL PRIMARY KEY,
  loan_id           BIGINT NOT NULL REFERENCES book_loans(id) ON DELETE CASCADE,
  notification_key  TEXT NOT NULL,
  notified_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(loan_id, notification_key)
);

CREATE TABLE IF NOT EXISTS book_requests (
  id                    BIGSERIAL PRIMARY KEY,
  requested_by_user_id  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_title       TEXT,
  requested_author      TEXT,
  requested_isbn        TEXT,
  normalized_title      TEXT,
  normalized_author     TEXT,
  normalized_isbn       TEXT,
  request_key           TEXT NOT NULL,
  note                  TEXT,
  status                TEXT NOT NULL DEFAULT 'OPEN',
  matched_book_id       BIGINT REFERENCES books(id) ON DELETE SET NULL,
  fulfilled_at          TIMESTAMPTZ,
  fulfilled_by_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  fulfillment_note      TEXT,
  created_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_collections (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id    BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS reset_tokens (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS authors (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  biography       TEXT,
  birth_date      TEXT,
  photo_url       TEXT,
  alternate_names TEXT, -- JSON array of alternate spellings/names
  created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS author_books (
  author_id  BIGINT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  book_id    BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (author_id, book_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id         BIGSERIAL PRIMARY KEY,
  book_id    BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
  username   TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
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
