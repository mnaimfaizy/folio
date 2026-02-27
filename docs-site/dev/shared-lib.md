---
title: Shared Library
---

# Shared Library (`libs/shared`)

`libs/shared` is the cross-app TypeScript package. Any code reused by two or more of `apps/api`, `apps/web`, or `apps/mobile` lives here.

---

## Importing from shared

Always import from the public barrel — never from internal paths:

```ts
// ✅ Correct
import { UserRole, CreateBookDto } from '@folio/shared';

// ❌ Wrong — fragile internal path
import { UserRole } from '../../libs/shared/src/lib/auth/roles';
```

The alias `@folio/shared` is defined in `tsconfig.base.json` and resolves to `libs/shared/src/index.ts`.

---

## What lives in shared

```
libs/shared/src/lib/
├── contracts/       # Request / response DTO types
├── auth/            # Role constants, permission predicates
├── validation/      # Shared validator functions (no HTTP deps)
└── utils/           # Date helpers, string helpers, etc.
```

---

## Contracts

Contracts are TypeScript interfaces for the data shapes passed between API and clients.

### Adding a new contract

1. Create a file in `libs/shared/src/lib/contracts/`:

```ts
// libs/shared/src/lib/contracts/tags.ts
export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}
```

2. Export it from `libs/shared/src/index.ts`:

```ts
export * from './lib/contracts/tags';
```

3. Use in API (TypeScript service/controller) and in Web/Mobile (React components).

---

## Auth helpers

`libs/shared/src/lib/auth/` contains:

- `roles.ts` — `UserRole` enum (`admin`, `member`, `guest`)
- Permission predicate functions (e.g. `canManageBooks(role)`)

Example:

```ts
import { UserRole, canManageBooks } from '@folio/shared';

if (!canManageBooks(req.user.role)) {
  return res.status(403).json({ message: 'Forbidden' });
}
```

---

## Validation helpers

`libs/shared/src/lib/validation/` contains validators that work without any HTTP framework dependency (no Express, no React):

```ts
import { isValidIsbn } from '@folio/shared';

if (!isValidIsbn(dto.isbn)) {
  throw new ValidationError('Invalid ISBN format');
}
```

---

## Utilities

`libs/shared/src/lib/utils/` contains:

- `formatBirthDate(date: string | null)` — safely formats author dates including historical formats
- String helpers, slug generation, etc.

---

## Rules for shared code

1. **No HTTP framework imports** in shared (no Express, no React, no Expo).
2. **No database imports** in shared.
3. **Barrel-export everything** through `libs/shared/src/index.ts`.
4. **Keep it minimal** — shared is for truly reused code, not a dumping ground.
5. **Add tests** in `libs/shared/src/__tests__/` for any non-trivial shared logic.

---

## Building shared

The shared lib is built as part of the monorepo:

```sh
npx nx run shared:build
```

Or it's built automatically when any app that depends on it is built.

---

[Adding Features →](./adding-features) · [Database →](./database)
