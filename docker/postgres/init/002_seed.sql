-- Minimal seed data for local development.
-- Passwords are bcrypt hashes so API login works.

INSERT INTO users (name, email, password, role, email_verified)
VALUES
  ('Admin User', 'admin@folio.local', '$2b$10$75Z1V9Ot4DrhKk1K2XyznOCFgz0ttRqLAceWcOUWfnL4Q5FlKFPtO', 'ADMIN', TRUE),
  ('Test User', 'user@folio.local', '$2b$10$MUFmdnbx0qCcBnAu5MYWbu5Oup9SgQPHTRWMnnubq1GB.JpWYMCQi', 'USER', TRUE)
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

INSERT INTO books (title, isbn, isbn13, publish_year, author, description)
VALUES
  ('To Kill a Mockingbird', '9780061120084', '9780061120084', 1960, 'Harper Lee', 'A classic novel of justice and morality.'),
  ('1984', '9780451524935', '9780451524935', 1949, 'George Orwell', 'A dystopian novel about surveillance and power.'),
  ('The Great Gatsby', '9780743273565', '9780743273565', 1925, 'F. Scott Fitzgerald', 'A novel of wealth, love, and the American Dream.')
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
