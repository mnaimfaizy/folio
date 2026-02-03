# Folio

Nx monorepo containing:

- API: Express + PostgreSQL
- Web: Vite + React
- Mobile: Expo

## Prerequisites

- Node.js 22.x (see `package.json` engines)
- Yarn 1.x (repo uses workspaces)
- Docker (optional, for local Postgres + PgAdmin + Mailhog)

## Install

```sh
yarn
```

## Local dev (recommended)

### 1) Start dev infrastructure (recommended)

This brings up Postgres + PgAdmin + Mailhog for local development.

```sh
yarn docker:up
```

Services:

- Postgres: `localhost:5432` (db `folio`, user `folio`, password `folio`)
- Mailhog UI: http://localhost:8025 (SMTP on `localhost:1025`)
- PgAdmin: http://localhost:5050 (email `admin@folio.com`, password `admin`)

Postgres is initialized from:

- `docker/postgres/init/001_schema.sql`
- `docker/postgres/init/002_seed.sql`

Seeded users:

- `admin@folio.local` / `admin123` (email verified)
- `user@folio.local` / `user123` (email verified)

To stop containers:

```sh
yarn docker:down
```

### 2) Configure environment

- API: copy `apps/api/.env.example` to `.env` (repo root) and adjust as needed.
- Web: copy `apps/web/.env.example` to `apps/web/.env`.
- Mobile: update API URL in `apps/mobile/app.json` (see `apps/mobile/README.md`).

### 3) Run apps

```sh
yarn dev:api
yarn dev:web
yarn dev:mobile
```

Mobile help:

- Troubleshooting guide: [docs/mobile/troubleshoot/README.md](docs/mobile/troubleshoot/README.md)

URLs:

- Web: http://localhost:4200
- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs
- Swagger JSON: http://localhost:3000/api-docs.json

## Validate

From the repo root:

```sh
yarn lint
yarn test
yarn build
yarn format
```

## Nx basics

To run tasks with Nx:

```sh
yarn nx <target> <project-name>
```

Example:

```sh
yarn nx serve web
```
