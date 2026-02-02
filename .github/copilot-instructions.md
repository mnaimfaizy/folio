# Copilot instructions for Folio

## Repository summary

Folio is an Nx monorepo with three apps:

- API: Express + PostgreSQL (TypeScript)
- Web: Vite + React (TypeScript)
- Mobile: Expo (TypeScript)

Primary runtime: Node.js 22.x (see package.json engines).

## Build, run, and validate

Use Nx via Yarn scripts from the repo root.

Bootstrap:

- yarn

Run:

- yarn dev:api
- yarn dev:web
- yarn dev:mobile

Validate:

- yarn test
- yarn lint
- yarn build
- yarn format

Local dev infrastructure (Postgres + PgAdmin + Mailhog):

- yarn docker:up
- yarn docker:down

## Project layout

Repo root:

- nx.json, package.json, tsconfig.base.json
- docker-compose.yml
- docker/postgres/init (schema + seed SQL)

Apps:

- apps/api (Express API)
  - Entry: apps/api/index.ts
  - Config: apps/api/config
  - Controllers: apps/api/controllers
  - Routes: apps/api/routes
  - Models: apps/api/models
  - DB: apps/api/db
  - Tests: apps/api/**tests**
- apps/web (Vite + React)
  - Source: apps/web/src
- apps/mobile (Expo)
  - App routes: apps/mobile/app
  - Components: apps/mobile/components

## API change guidance

- Add routes in apps/api/routes and handlers in apps/api/controllers.
- Keep swagger docs in apps/api/config/swagger.ts aligned with API changes.
- If DB schema changes are needed, update docker/postgres/init/001_schema.sql.
- If seed data must match schema, update docker/postgres/init/002_seed.sql.
- Keep error handling and status codes consistent with existing controllers.

## Web change guidance

- UI code lives in apps/web/src.
- Prefer small components and reuse existing patterns.
- Follow current styling setup (Tailwind config is apps/web/tailwind.config.js).

## Mobile change guidance

- Expo Router screens live in apps/mobile/app.
- Reuse components from apps/mobile/components where possible.
- Avoid web-only APIs in shared code.

## Testing guidance

- API tests: apps/api/**tests** (unit + integration).
- Web tests: use existing Vitest/Jest setup (see apps/web project config).
- Mobile tests: apps/mobile/\*\*/**tests**.

## Working principles

- Make minimal, targeted changes.
- Keep public APIs stable unless the request requires changes.
- Update or add tests for behavior changes.
- Prefer existing dependencies and patterns; avoid adding new deps unless necessary.
