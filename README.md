# Folio

Nx monorepo containing:

- API: Express + PostgreSQL
- Web: Vite + React
- Mobile: Expo

## Local dev (recommended)

### Run without Docker

```sh
yarn
yarn dev:api
yarn dev:web
```

- Web: http://localhost:4200
- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

## Docker Compose (Postgres + PgAdmin + Mailhog)

This repo uses PostgreSQL for the API database.

```sh
yarn docker:up
```

Services:

- Postgres: localhost:5432 (db `folio`, user `folio`, password `folio`)
- Mailhog UI: http://localhost:8025
- PgAdmin: http://localhost:5050 (email `admin@folio.com`, password `admin`)

Note: Docker Compose is dev-infra only (no API/Web containers). Run the apps on your host:

```sh
yarn dev:api
yarn dev:web
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- Web: http://localhost:4200

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

## Nx basics

To run tasks with Nx:

```sh
npx nx <target> <project-name>
```

Example:

```sh
npx nx serve web
```
