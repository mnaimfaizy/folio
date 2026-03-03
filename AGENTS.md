# AGENTS.md

Agent instructions for the Folio Nx monorepo.

## Scope and precedence

- This file applies to the whole repository unless a closer `AGENTS.md` exists.
- Nested files in `apps/*` and `libs/*` override this file for their subtree.
- Direct user instructions in chat always override file instructions.

## Repository overview

Folio is an Nx monorepo with:

- API: Express + PostgreSQL (`apps/api`)
- Web: Vite + React (`apps/web`)
- Mobile: Expo + React Native (`apps/mobile`)
- Shared library: shared contracts/utilities (`libs/shared`)

Runtime/tooling baseline:

- Node.js `22.x`
- Yarn `1.22.x`
- Nx `22.x`

## Bootstrap and core commands

Run from repository root:

- Install dependencies: `yarn`
- API dev: `yarn dev:api`
- Web dev: `yarn dev:web`
- Mobile dev: `yarn dev:mobile`
- Full test run: `yarn test`
- Lint: `yarn lint`
- Build: `yarn build`
- Format: `yarn format`

Local infrastructure:

- Start services: `yarn docker:up`
- Stop services: `yarn docker:down`

## Nx usage conventions

- Prefer `yarn nx ...` or existing root scripts over ad-hoc commands.
- For targeted checks, run project-scoped commands first (e.g. `yarn nx test api`) before broad workspace runs.
- Keep changes minimal and scoped to the requested project.

## Branching and pre-commit workflow

- Before starting any feature/fix/chore/refactor work, create and use a dedicated branch.
- Branch names must start with a work-type prefix:
  - `feat/*` for features
  - `fix/*` for bug fixes
  - `refactor/*` for refactors
  - `chore/*` for chores/maintenance
  - `docs/*` for documentation-only changes
  - `test/*` for test-only changes
  - `ci/*` for CI/CD changes
  - `perf/*` for performance improvements
- Before committing, run `test`, `lint`, and `build` for every affected project/library (when those targets exist).
- Prefer project-scoped checks first, for example:
  - `yarn nx test <project>`
  - `yarn nx lint <project>`
  - `yarn nx build <project>`
- If multiple projects are affected, run checks for each affected project, then run broader workspace checks only if needed.

## Collaboration and risk handling

- If a task appears to require large refactoring, critical changes, side effects, or breaking changes, pause and ask clarifying questions before implementation.
- If task context is incomplete or ambiguous, ask focused follow-up questions to confirm scope, constraints, and expected outcomes.
- Do not default to agreement; provide constructive technical pushback when a better approach exists.
- Discuss trade-offs clearly (risk, complexity, maintainability, delivery impact) and align on the best outcome before proceeding with high-impact changes.

## Architecture and layering

For non-trivial API features, follow:

1. Route in `apps/api/routes/*`
2. Controller in `apps/api/controllers/*`
3. Service in `apps/api/services/*`
4. Repository in `apps/api/repositories/*`

General rules:

- Keep controllers thin; business logic belongs in services.
- Reuse existing utilities/services before introducing new abstractions.
- If logic/contracts are reused across apps, place them in `libs/shared`.

## Change requirements

- Update tests for behavior changes.
- Keep API docs aligned when API behavior changes (`apps/api/config/swagger.ts`).
- If schema/seed must change, update SQL init files in `docker/postgres/init`.
- Update docs when workflow, behavior, or setup changes.

## Safety and boundaries

- Do not commit secrets or credentials.
- Do not run destructive git operations unless explicitly requested.
- Avoid unrelated refactors while implementing a focused task.

## Project-specific instructions

- API: `apps/api/AGENTS.md`
- Web: `apps/web/AGENTS.md`
- Mobile: `apps/mobile/AGENTS.md`
- Shared lib: `libs/shared/AGENTS.md`

## References

- `.github/copilot-instructions.md`
- `README.md`
- `docs/FEATURE_DEVELOPMENT_GUIDE.md`
- `docs-site/dev/architecture.md`
- `docs-site/dev/testing.md`
