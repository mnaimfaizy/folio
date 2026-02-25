# Single User Minimal Setup (Non-Technical)

This guide is for one person who wants to run Folio on their own machine and use it as a personal book catalog.

## Result

After setup you will have:

- Local web app
- Local API
- Local PostgreSQL database
- One admin user who can manage everything
- Single-user profile with a simplified interface

## Prerequisites

Install:

- Docker Desktop
- Node.js 22.x
- Yarn 1.x

## Step 1: Get the project

Open terminal in the project folder and run:

```sh
yarn
```

## Step 2: Start local database

```sh
yarn docker:up
```

This starts PostgreSQL and initializes schema + seed data.

## Step 3: Set environment files

- Copy `apps/api/.env.example` to `.env` at repo root.
- Copy `apps/web/.env.example` to `apps/web/.env`.

If you keep local defaults, no extra changes are usually needed for first run.

## Step 4: Start backend and frontend

Use two terminals:

Terminal A:

```sh
yarn dev:api
```

Terminal B:

```sh
yarn dev:web
```

Open:

- Web: http://localhost:4200
- API docs: http://localhost:3000/api-docs

## Step 5: Login as admin

Default local admin user:

- Email: `admin@folio.local`
- Password: `admin123`

Change the password after first login.

## Step 6: Apply `Single User` profile

In the app:

1. Open `Admin Dashboard`.
2. Open `Settings`.
3. In `Profile Presets`, click `Single User`.
4. Confirm the dialog.
5. Reload the page.

## What changes in Single User profile

- Home page switches to a minimal variant.
- Footer is simplified to copyright-only.
- `My Collection`, `Request Book`, and loan pages are hidden/blocked.
- Admin navigation hides multi-user/library modules.
- Admin settings tabs are reduced to essential tabs.

Do not create extra users unless needed.

## Daily usage (recommended)

1. Open `Admin → Books` to add/edit books.
2. Open `Admin → Authors` to add/edit authors.
3. Use `Home`, `Books`, and `Authors` pages to browse your catalog.
4. Keep profile as `Single User` unless you intentionally need library workflows.

## Optional configuration

- In `Admin → Settings → Pages`, disable `About` and `Contact` if you want an even cleaner UI.
- In `Admin → Settings → Hero`, customize title/subtitle for your personal library.

## Backup guidance (important)

For personal usage, create periodic DB backups.

- If using pgAdmin: export the `folio` database weekly.
- If using CLI:

```sh
docker exec -t folio-postgres pg_dump -U folio folio > folio-backup.sql
```

Restore example:

```sh
cat folio-backup.sql | docker exec -i folio-postgres psql -U folio -d folio
```

## Stop everything

- Stop dev servers with `Ctrl + C` in terminal windows.
- Stop local infrastructure:

```sh
yarn docker:down
```

## Troubleshooting quick checks

- Profile changed but UI did not: reload browser page.
- Cannot log in: ensure API is running (`yarn dev:api`).
- No data: ensure Docker DB is up (`yarn docker:up`).
- Port conflict: stop existing process on `3000`/`4200` or change env config.

## Optional: Make it even easier for non-technical users

For wider non-technical adoption, package this setup as:

- Preconfigured Docker Compose profile (single-user defaults)
- One launcher script for Windows (`start-folio.bat`)
- One quick onboarding page/checklist after first login

This keeps setup simple without changing core architecture.
