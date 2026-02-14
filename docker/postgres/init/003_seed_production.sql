
INSERT INTO users (name, email, password, role, email_verified)
SELECT
  'Admin User',
  'admin@folio.mnfprofile.com',
  '$2b$10$IEKx7R5wyDew85Ac4lRPxedduEkR67npqYKYw5aMqA/KzidhZDHUm',
  'ADMIN',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@folio.mnfprofile.com'
);

-- If the admin user already exists, ensure they are verified and have ADMIN role.
UPDATE users
SET email_verified = TRUE,
    role = 'ADMIN'
WHERE email = 'admin@folio.mnfprofile.com';
