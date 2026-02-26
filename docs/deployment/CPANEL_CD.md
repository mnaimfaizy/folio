# cPanel CD (API + Web)

This repo is an Nx monorepo. The GitHub Actions workflow deploys **API** and **Web** on every push to the `main` branch.

- API (Node/Express): built to `dist/apps/api/` with a generated `package.json`.
- Web (Vite static): built to `dist/apps/web/`.

## 1) One-time cPanel setup

### API (Node.js app)

In cPanel:

1. Open **Setup Node.js App** → **Create Application**
2. Set:
   - **Application Root**: (your choice, e.g. `folio-api`)
   - **Application Startup File**: `index.js`
   - **Application Mode**: Production
3. Add environment variables in cPanel UI (recommended) and restart the app.

The workflow uploads the built files into your API app root directory via FTP.

Note: FTP deploy cannot run remote commands. If the API dependencies changed (generated `package.json` changes), you must run **Run NPM Install** in cPanel and restart the Node app.

### Database (PostgreSQL)

The API uses Postgres via the `pg` driver and supports either:

- `DATABASE_URL` (recommended), or
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

#### Step A — Create database + user in cPanel

1. cPanel → **PostgreSQL Databases**
2. Create a **Database** (example: `folio`)
3. Create a **Database User** and set a strong password
4. Add the user to the database and grant **ALL PRIVILEGES**

#### Step B — Configure API env vars

In cPanel → **Setup Node.js App** → your API app → **Environment Variables**:

- Set `NODE_ENV=production`
- Set DB connection vars (prefer `DATABASE_URL`)

Example `DATABASE_URL` (your host/user/db names will differ):

`DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME`

#### Step C — Create tables

On startup, the API automatically creates the required tables if they do not exist.
So once your DB env vars are correct, a restart of the Node.js app is usually enough.

Additionally, when deployed via the API bundle/CD, the API will also apply `sql/003_settings.sql` on startup (idempotent).

If you prefer to create tables manually (or need to troubleshoot), you can run the schema SQL from:

- Repo source: `docker/postgres/init/001_schema.sql`
- In the API deploy zip: `sql/001_schema.sql`

How to run it depends on your hosting:

- If your cPanel includes **phpPgAdmin**, open your database → SQL → paste the file contents and run.
- If you have SSH + `psql` available, you can run:
  - `psql "$DATABASE_URL" -f sql/001_schema.sql`

#### Step D — (Optional) seed data

For staging/testing you can seed demo users/books/authors using:

- Repo source: `docker/postgres/init/002_seed.sql`
- In the API deploy zip: `sql/002_seed.sql`

Run it the same way as the schema (phpPgAdmin or `psql`).

Notes:

- Seeding creates `admin@folio.local` / `admin123` and `user@folio.local` / `user123` (intended for local/staging). Avoid seeding these in production unless you immediately change credentials.

Production seed (recommended):

- Repo source: `docker/postgres/init/003_seed_production.sql`
- In the API deploy zip: `sql/003_seed_production.sql`

This production seed inserts **only the admin user** and only if it doesn’t already exist.
Before running it, replace the placeholder bcrypt hash in the file.

Auto-run on startup:

- When `NODE_ENV=production`, the API will execute `sql/003_seed_production.sql` automatically during startup (it is designed to be safe to re-run).

### Generate strong secret keys

For production you should set a strong `JWT_SECRET` (and any other secrets you add later) to a long, random value.

Recommended:

- Use at least **32 random bytes** (256 bits) for `JWT_SECRET`.
- Generate it once and store it only in your secret manager / cPanel env vars (don’t commit it).

#### Option A — Node.js (works on Windows/macOS/Linux)

- Hex (64 chars):
  - `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

- Base64 (44 chars, includes `+` and `/`):
  - `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

#### Option B — OpenSSL

- Hex:
  - `openssl rand -hex 32`

- Base64:
  - `openssl rand -base64 32`

## Manual API package (zip)

To create a ready-to-upload API bundle for cPanel:

- Run: `yarn package:api`
- Output:
  - Folder: `dist/deploy/folio-api/`
  - Zip: `dist/deploy/folio-api.zip`

## Manual Web package (zip)

To create a ready-to-upload Web bundle for cPanel:

1. Package (API URL is required):

- Run: `yarn package:web --api-url https://api.yourdomain.com`
- Output:
  - Folder: `dist/deploy/folio-web/`
  - Zip: `dist/deploy/folio-web.zip`

This sets `VITE_API_URL` as a **build-time** setting (Vite bakes it into the built JS). After deploying static files to cPanel, you cannot change it without rebuilding.

This web bundle includes an `.htaccess` suitable for SPA routing (React Router `BrowserRouter`) so deep links like `/authors` work on refresh.

The web package also generates SEO assets (`robots.txt` and `sitemap.xml`) in the build output. These are automatically included in the deployment.

### Web (static hosting)

Point your domain/subdomain document root to your desired folder (commonly `public_html/` or a subfolder). The workflow will sync the built static assets there.

Notes:

- If you deploy under a subfolder (not the web root), you may need to configure Vite `base` so asset URLs resolve correctly.
- SEO sitemap and robots.txt are generated during packaging and included in the static assets.

## 2) GitHub Actions workflow

Workflow file: [.github/workflows/cd-cpanel.yml](../../.github/workflows/cd-cpanel.yml)

Trigger:

- `push` to `main`

What it does:

- Builds `api` and `web`
- Uploads `dist/apps/api/` to your API folder via FTP
- Uploads `dist/apps/web/` to your web folder via FTP

## 3) Required GitHub secrets

Set these in GitHub → **Settings → Secrets and variables → Actions**:

- `FTP_API_HOST`: FTP host for the API account
- `FTP_API_USERNAME`: FTP username for the API account
- `FTP_API_PASSWORD`: FTP password for the API account
- `FTP_API_DIR`: remote directory for the API Node app root (example: `/folio-api/` or `/home/<user>/folio-api/` depending on host)

- `FTP_WEB_HOST`: FTP host for the Web/static account
- `FTP_WEB_USERNAME`: FTP username for the Web/static account
- `FTP_WEB_PASSWORD`: FTP password for the Web/static account
- `FTP_WEB_DIR`: remote directory for static web root (example: `/public_html/` or a subfolder)

- `VITE_API_URL`: production API base URL used when building the Web app (example: `https://api.yourdomain.com`)

Notes:

- Server directory formats vary by hosting provider; confirm the correct `server-dir` values in your FTP client first.
- If your host only supports Node 18/20, ensure the runtime can execute the built output and dependencies.

## 4) Troubleshooting

- If the API doesn’t pick up changes, restart it from cPanel → **Setup Node.js App**.
- If you see missing modules after a deploy, run **Run NPM Install** in cPanel for the API app (FTP cannot do this step).
