# AGENTS.md

Agent instructions for `apps/api`.

## Scope

- Applies to `apps/api/**`.
- Inherits repository-wide rules from root `AGENTS.md`.

## Stack and layout

- Runtime: Node.js + Express + PostgreSQL
- Entry point: `apps/api/index.ts`
- Routes: `apps/api/routes`
- Controllers: `apps/api/controllers`
- Services: `apps/api/services`
- Repositories: `apps/api/repositories`
- DB utilities/models: `apps/api/db`, `apps/api/models`
- Tests: `apps/api/**tests**`

## Required implementation pattern

For non-trivial features, keep layering strict:

1. Route
2. Controller (HTTP parsing/status mapping only)
3. Service (business logic)
4. Repository (data access)

## Commands

Run from repo root:

- Start API dev server: `yarn dev:api`
- Targeted tests: `yarn nx test api`
- API build: `yarn nx build api`
- Lint API: `yarn nx lint api`
- DB bootstrap script target: `yarn nx run api:db:bootstrap`

## API change checklist

- Update swagger docs when endpoints/contracts change: `apps/api/config/swagger.ts`
- Keep error handling/status codes consistent with existing controllers.
- If DB schema changes are required, update `docker/postgres/init/001_schema.sql`.
- If seed data depends on schema changes, update `docker/postgres/init/002_seed.sql`.
- Add/update tests in `apps/api/**tests**` for new behavior and edge cases.

## Author management specifics

- External provider integration lives in `apps/api/services/externalAuthorProviders.ts`.
- Duplicate detection uses Levenshtein threshold (70%) for name matching.
- Historical dates are preserved as text values.
- `alternate_names` is a JSON array (OpenLibrary values capped per existing logic).
- Author deletion must respect author/book association checks.

## References

- `apps/api/README.md`
- `docs/FEATURE_DEVELOPMENT_GUIDE.md`
