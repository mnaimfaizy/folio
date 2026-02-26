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

### Author management specifics

- External providers: apps/api/services/externalAuthorProviders.ts (OpenLibrary, Wikidata, Google Books)
- Duplicate detection: Levenshtein distance with 70% threshold for name matching
- Historical dates: Preserved as-is (e.g., "6th cent. B.C."), stored as TEXT
- Alternate names: JSON array in alternate_names column (max 15 from OpenLibrary)
- Deletion: Check author_books count before allowing deletion
- Tests: 49 comprehensive tests in apps/api/**tests**/controllers/authorsController.test.ts

## Web change guidance

- UI code lives in apps/web/src.
- Prefer small components and reuse existing patterns.
- Follow current styling setup (Tailwind config is apps/web/tailwind.config.js).

### Author UI components

- CreateAuthor: Two-tab interface (Manual/External Search), duplicate warnings with force override
- EditAuthor: "Enrich from External Sources" dialog with field-level merge selection
- AuthorSearchComponent: Reusable external provider search (OpenLibrary/Wikidata/Google Books)
- ViewAuthor & AuthorsList: Safe date formatting for historical dates via formatBirthDate() helper
- Deletion: Shows detailed error when author has books (includes count)

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

## Feature implementation workflow (required)

When adding new features, follow this organization unless the change is trivial:

1. Route in `apps/api/routes/*`
2. Controller in `apps/api/controllers/*` (HTTP parsing + status mapping)
3. Service in `apps/api/services/*` (business logic)
4. Repository in `apps/api/repositories/*` (data access)

### Layering rules

- Keep controllers thin; avoid embedding business logic in controllers.
- Prefer service/repository extraction instead of growing large handlers.
- Reuse existing services/utilities before creating new ones.

### Shared monorepo rules

- If code is reused across multiple apps, place it in `libs/shared`.
- Shared contracts go in `libs/shared/src/lib/contracts/*` and must be exported via `libs/shared/src/index.ts`.
- Shared validation/auth helpers go in `libs/shared/src/lib/validation/*` or `libs/shared/src/lib/auth/*`.
- Avoid duplicating request/response types in API/Web/Mobile when shared types exist.

### Required updates for feature PRs

- Update swagger docs in `apps/api/config/swagger.ts` for API changes.
- Update DB init SQL in `docker/postgres/init` when schema/seed changes are needed.
- Add/update tests in affected app(s): API/Web/Mobile.
- Update docs when workflow/config/behavior changes (README and docs/\* as needed).
