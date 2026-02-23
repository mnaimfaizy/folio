-- Minimal seed data for local development.
-- Passwords are bcrypt hashes so API login works.
-- All dev users share the same password as Test User.

INSERT INTO users (name, email, password, role, email_verified)
VALUES
  ('Admin User',     'admin@folio.local',  '$2b$10$75Z1V9Ot4DrhKk1K2XyznOCFgz0ttRqLAceWcOUWfnL4Q5FlKFPtO', 'ADMIN', TRUE),
  ('Test User',      'user@folio.local',   '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Alice Morgan',   'alice@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Bob Chen',       'bob@folio.local',    '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Carol Davis',    'carol@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('David Kim',      'david@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Eva Patel',      'eva@folio.local',    '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Frank Torres',   'frank@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Grace Wilson',   'grace@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Henry Brown',    'henry@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Iris Nakamura',  'iris@folio.local',   '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('James Robinson', 'james@folio.local',  '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Kate Martinez',  'kate@folio.local',   '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Liam Johnson',   'liam@folio.local',   '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Mia Anderson',   'mia@folio.local',    '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Noah Garcia',    'noah@folio.local',   '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE),
  ('Olivia Lee',     'olivia@folio.local', '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER',  TRUE)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  email_verified = TRUE,
  verification_token = NULL,
  verification_token_expires = NULL;

INSERT INTO authors (name, biography)
VALUES
  ('Harper Lee', 'Author of To Kill a Mockingbird'),
  ('George Orwell', 'Author of 1984'),
  ('F. Scott Fitzgerald', 'Author of The Great Gatsby')
ON CONFLICT (name) DO NOTHING;

INSERT INTO books (title, isbn, isbn13, publish_year, author, description, featured)
VALUES
  ('To Kill a Mockingbird', '9780061120084', '9780061120084', 1960, 'Harper Lee', 'A classic novel of justice and morality.', TRUE),
  ('1984', '9780451524935', '9780451524935', 1949, 'George Orwell', 'A dystopian novel about surveillance and power.', TRUE),
  ('The Great Gatsby', '9780743273565', '9780743273565', 1925, 'F. Scott Fitzgerald', 'A novel of wealth, love, and the American Dream.', TRUE)
ON CONFLICT (isbn) DO NOTHING;

-- Link authors to books (best-effort)
INSERT INTO author_books (author_id, book_id, is_primary)
SELECT a.id, b.id, TRUE
FROM authors a
JOIN books b ON (b.author = a.name)
ON CONFLICT DO NOTHING;

INSERT INTO reviews (book_id, user_id, username, rating, comment)
SELECT b.id,
       u.id,
       u.name,
       5,
       'Great read for local testing.'
FROM books b
JOIN users u ON u.email = 'user@folio.local'
WHERE b.isbn IN ('9780061120084', '9780451524935')
ON CONFLICT DO NOTHING;

-- Book requests: The Hobbit (6 requests) and Pride and Prejudice (5 requests)
-- are the top-demanded titles; the remaining 3 have 1 request each.
INSERT INTO book_requests (
  requested_by_user_id,
  requested_title,
  requested_author,
  requested_isbn,
  normalized_title,
  normalized_author,
  normalized_isbn,
  request_key,
  note,
  status
)
SELECT
  u.id,
  v.requested_title,
  v.requested_author,
  v.requested_isbn,
  v.normalized_title,
  v.normalized_author,
  v.normalized_isbn,
  v.request_key,
  v.note,
  v.status
FROM (VALUES
  -- The Hobbit — 6 different users
  ('alice@folio.local',  'The Hobbit',             'J.R.R. Tolkien', '9780618968633', NULL,                  NULL,           '9780618968633', 'isbn:9780618968633',                          'Would love to have this classic in the library.', 'OPEN'),
  ('frank@folio.local',  'The Hobbit',             'J.R.R. Tolkien', '9780618968633', NULL,                  NULL,           '9780618968633', 'isbn:9780618968633',                          'A childhood favourite I would love to re-read.',  'OPEN'),
  ('grace@folio.local',  'The Hobbit',             'J.R.R. Tolkien', '9780618968633', NULL,                  NULL,           '9780618968633', 'isbn:9780618968633',                          NULL,                                              'OPEN'),
  ('henry@folio.local',  'The Hobbit',             'J.R.R. Tolkien', '9780618968633', NULL,                  NULL,           '9780618968633', 'isbn:9780618968633',                          'Please add this!',                                'OPEN'),
  ('iris@folio.local',   'The Hobbit',             'J.R.R. Tolkien', '9780618968633', NULL,                  NULL,           '9780618968633', 'isbn:9780618968633',                          NULL,                                              'OPEN'),
  ('james@folio.local',  'The Hobbit',             'J.R.R. Tolkien', '9780618968633', NULL,                  NULL,           '9780618968633', 'isbn:9780618968633',                          'Essential Tolkien for the collection.',           'OPEN'),
  -- Pride and Prejudice — 5 different users
  ('bob@folio.local',    'Pride and Prejudice',    'Jane Austen',    NULL,            'pride and prejudice', 'jane austen',  NULL,            'title_author:pride and prejudice|jane austen', 'A must-have for any library.',                    'OPEN'),
  ('kate@folio.local',   'Pride and Prejudice',    'Jane Austen',    NULL,            'pride and prejudice', 'jane austen',  NULL,            'title_author:pride and prejudice|jane austen', 'My all-time favourite novel.',                    'OPEN'),
  ('liam@folio.local',   'Pride and Prejudice',    'Jane Austen',    NULL,            'pride and prejudice', 'jane austen',  NULL,            'title_author:pride and prejudice|jane austen', NULL,                                              'OPEN'),
  ('mia@folio.local',    'Pride and Prejudice',    'Jane Austen',    NULL,            'pride and prejudice', 'jane austen',  NULL,            'title_author:pride and prejudice|jane austen', 'Classic Austen — please stock it.',               'OPEN'),
  ('noah@folio.local',   'Pride and Prejudice',    'Jane Austen',    NULL,            'pride and prejudice', 'jane austen',  NULL,            'title_author:pride and prejudice|jane austen', NULL,                                              'OPEN'),
  -- Single-request titles
  ('carol@folio.local',  'The Catcher in the Rye', 'J.D. Salinger',  '9780316769174', NULL,                  NULL,           '9780316769174', 'isbn:9780316769174',                          NULL,                                              'OPEN'),
  ('david@folio.local',  'Brave New World',         'Aldous Huxley',  NULL,            'brave new world',     'aldous huxley',NULL,            'title_author:brave new world|aldous huxley',   'Essential dystopian fiction alongside 1984.',     'OPEN'),
  ('eva@folio.local',    'The Lord of the Rings',   'J.R.R. Tolkien', '9780544003415', NULL,                  NULL,           '9780544003415', 'isbn:9780544003415',                          'The complete one-volume edition please!',         'OPEN')
) AS v(user_email, requested_title, requested_author, requested_isbn, normalized_title, normalized_author, normalized_isbn, request_key, note, status)
JOIN users u ON u.email = v.user_email
WHERE NOT EXISTS (
  SELECT 1 FROM book_requests br
  WHERE br.requested_by_user_id = u.id
    AND br.request_key = v.request_key
);
