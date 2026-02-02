# Folio API

Express + TypeScript API for Folio. In this repo it’s run via Nx from the workspace root.

## Run (local)

1. Start local infrastructure (Postgres + Mailhog + PgAdmin):

```sh
yarn docker:up
```

2. Configure env:

- Copy `apps/api/.env.example` to `.env` (repo root).
- Adjust DB + JWT settings as needed.

3. Start the API:

```sh
yarn dev:api
```

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs

## Environment variables

The API supports either a full `DATABASE_URL` or individual `POSTGRES_*` values.

Common:

- `PORT` (default `3000`)
- `JWT_SECRET`
- `RESET_PASSWORD_EXPIRY` (ms, default `3600000`)
- `FRONTEND_URL` (used in email links; default `http://localhost:4200`)

Database:

- `DATABASE_URL` (e.g. `postgres://folio:folio@localhost:5432/folio`)
  - OR `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

SMTP (Mailhog-friendly defaults):

- `SMTP_HOST` (default `localhost`, or `mailhog` when `RUNNING_IN_DOCKER=true`)
- `SMTP_PORT` (default `1025`)
- `SMTP_SECURE` (`true`/`false`, default `false`)
- `SMTP_USER`, `SMTP_PASS` (optional)
- `EMAIL_FROM` (default `library@example.com`)
- `EMAIL_SERVICE` (optional)

## Seed data

When using `yarn docker:up`, Postgres is initialized from the workspace root:

- `docker/postgres/init/001_schema.sql`
- `docker/postgres/init/002_seed.sql`

Seeded users:

- `admin@folio.local` / `admin123`
- `user@folio.local` / `user123`

## Tests

Run API tests from the repo root:

```sh
yarn nx test api
```
