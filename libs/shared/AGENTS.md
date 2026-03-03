# AGENTS.md

Agent instructions for `libs/shared`.

## Scope

- Applies to `libs/shared/**`.
- Inherits repository-wide rules from root `AGENTS.md`.

## Purpose

- Host reusable cross-app code (contracts, validation, auth helpers, shared utilities).
- Keep shared types/contracts centralized to avoid duplication across API/Web/Mobile.

## Layout

- Source root: `libs/shared/src`
- Public exports entry: `libs/shared/src/index.ts`
- Project config: `libs/shared/project.json`

## Commands

Run from repo root:

- Build shared lib: `yarn nx build shared`
- Lint shared lib (if configured): `yarn nx lint shared`
- Test shared lib (if configured): `yarn nx test shared`

## Implementation guidance

- Prefer stable, framework-agnostic APIs.
- Update `libs/shared/src/index.ts` exports when adding new reusable modules.
- Avoid app-specific assumptions in shared contracts/utilities.

## References

- `libs/shared/README.md`
- `docs-site/dev/shared-lib.md`
