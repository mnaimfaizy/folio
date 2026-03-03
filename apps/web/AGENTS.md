# AGENTS.md

Agent instructions for `apps/web`.

## Scope

- Applies to `apps/web/**`.
- Inherits repository-wide rules from root `AGENTS.md`.

## Stack and layout

- Runtime: Vite + React + TypeScript
- Source root: `apps/web/src`
- Tailwind config: `apps/web/tailwind.config.js`

## Commands

Run from repo root:

- Start web dev server: `yarn dev:web`
- Run web tests: `yarn nx test web`
- Build web: `yarn nx build web`
- Lint web: `yarn nx lint web`

## UI implementation guidance

- Reuse existing patterns/components before introducing new ones.
- Keep changes small and local to the feature request.
- Follow existing styling/token conventions (Tailwind + current design patterns).
- Avoid introducing new dependencies unless clearly necessary.

## Author UI specifics

- `CreateAuthor` includes Manual and External Search tabs.
- `EditAuthor` includes external enrichment + field-level merge.
- `AuthorSearchComponent` is the reusable provider search UI.
- `ViewAuthor` and `AuthorsList` use safe historical date formatting helpers.
- Deletion flows should preserve informative errors when authors have linked books.

## Testing expectations

- Add/update tests for changed behavior using existing web test setup.
- Prefer targeted project tests before running broad workspace checks.

## References

- `apps/web/README.md`
- `docs/FEATURE_DEVELOPMENT_GUIDE.md`
