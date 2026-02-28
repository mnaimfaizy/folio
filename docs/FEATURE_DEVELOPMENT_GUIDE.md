# Feature Development Guide

This guide defines how to add new features in Folio while keeping the monorepo organized and maintainable.

## 1) Decide where the feature belongs

- `apps/api`: backend endpoints, data access, business logic.
- `apps/web`: admin/public web UI.
- `apps/mobile`: Expo app UI and mobile-specific behavior.
- `libs/shared`: contracts, validation helpers, and role/auth utilities reused across 2+ apps.

Rule of thumb: if code is reused by API + Web/Mobile, move it to `libs/shared`.

## 2) API implementation pattern (required)

For non-trivial features, follow this flow:

1. Route (`apps/api/routes/*`): declare endpoint and middleware.
2. Controller (`apps/api/controllers/*`): HTTP concerns only (parse req, map status codes).
3. Service (`apps/api/services/*`): business logic and orchestration.
4. Repository (`apps/api/repositories/*`): database read/write concerns.

Keep controllers thin; avoid direct DB access in controllers when a service/repository exists.

## 3) Shared contracts and validation

If frontend/mobile consume new payloads:

- Add shared request/response types in `libs/shared/src/lib/contracts/*`.
- Export via `libs/shared/src/index.ts`.
- Reuse shared validators from `libs/shared/src/lib/validation/*` where applicable.

Avoid duplicating DTO/type definitions inside app-specific code when they can be shared.

## 4) Database change process

If schema/data setup changes are needed:

- Update `docker/postgres/init/001_schema.sql` for schema changes.
- Update `docker/postgres/init/002_seed.sql` if seed compatibility is required.
- If bootstrap behavior changes, verify `apps/api/db/database.ts` + `apps/api/scripts/bootstrapDatabase.ts`.

## 5) API docs and runtime config

- Keep `apps/api/config/swagger.ts` aligned with endpoint contracts.
- Add or document new env vars in `apps/api/.env.example` and relevant README sections.
- Preserve production-safe defaults and fail-fast checks for sensitive config.

## 6) Test requirements

At minimum, include or update tests for changed behavior:

- API: `apps/api/__tests__` (controller/service/route/integration as appropriate).
- Web: existing Vitest/Jest tests in `apps/web`.
- Mobile: tests in `apps/mobile/**/__tests__` when behavior is changed.

Prefer focused tests near the changed layer first (e.g., controller/service), then broader integration where needed.

## 7) Feature completion checklist

Before opening/merging a PR:

- Run: `yarn lint`, `yarn test`, and any impacted app build.
- Confirm no duplicated business logic across controllers/services.
- Confirm shared types are used where cross-app contracts exist.
- Confirm swagger docs are updated for API changes.
- Confirm README/docs updates are included if workflows/config changed.

## 8) Naming and structure conventions

- Use descriptive filenames: `*Controller.ts`, `*Service.ts`, `*Repository.ts`.
- Keep one domain concern per file/module where practical.
- Prefer small, composable functions over large monolithic handlers.
- Keep changes minimal and scoped to the feature.

## 9) Credit and loan features

For loan-related features, keep these rules consistent across API + Web + Docs:

- New users should not receive borrowing credit by default.
- Borrowing/request eligibility is governed by `minimum_credit_balance` and `credit_currency` from `site_settings`.
- Book-level borrowing value comes from `books.price_amount`.
- Credit accounting must be transactional with loan state changes.
- Admin manual top-ups happen in user edit flows and should trigger a user notification email.
- Stripe/PayPal in current phase are configuration/documentation features (not live checkout).

When changing these behaviors, update:

- `docker/postgres/init/001_schema.sql`
- `docker/postgres/init/003_settings.sql`
- `apps/api/db/database.ts`
- `apps/api/config/swagger.ts`
- user/admin docs in `docs-site/user/*`
