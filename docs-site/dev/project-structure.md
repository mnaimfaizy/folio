---
title: Project Structure
---

# Project Structure

A guided tour of the Folio monorepo layout, explaining the purpose of every significant folder and file.

---

## Root layout

```
folio/
├── apps/                    # Application projects
│   ├── api/                 # Express REST API
│   ├── web/                 # Vite + React web frontend
│   └── mobile/              # Expo mobile app
├── libs/
│   └── shared/              # Cross-app TypeScript library
├── docker/
│   ├── api.Dockerfile       # API production image
│   ├── web.Dockerfile       # Web production image
│   └── postgres/
│       └── init/
│           ├── 001_schema.sql   # Database schema
│           └── 002_seed.sql     # Seed data (admin user, demo content)
├── docs/                    # Original markdown docs (legacy, preserved)
├── docs-site/               # VitePress documentation site (this site)
├── .github/
│   └── workflows/
│       ├── ci.yml           # Lint, test, build for affected projects
│       ├── cd-cpanel.yml    # Deploy API + Web to cPanel
│       └── docs.yml         # Build + deploy docs to GitHub Pages
├── docker-compose.yml       # Local dev infrastructure
├── nx.json                  # Nx workspace configuration
├── package.json             # Root dependencies + Yarn workspace + scripts
├── tsconfig.base.json       # Base TypeScript config (path aliases)
├── jest.config.ts           # Root Jest config
├── vitest.workspace.ts      # Vitest workspace config (for web)
└── babel.config.json        # Babel config for Jest transforms
```

---

## apps/api

```
apps/api/
├── index.ts                 # Express app entry: middleware, route mounting, server start
├── uploadthing.ts           # Uploadthing file router definition
├── config/
│   ├── config.ts            # Typed config object (env vars + defaults)
│   ├── index.ts             # Config barrel export
│   └── swagger.ts           # OpenAPI / Swagger spec (JSDoc annotations + manual spec)
├── controllers/             # HTTP handlers — parse req, call service, map status code
│   ├── authController.ts
│   ├── authorsController.ts
│   ├── booksController.ts
│   ├── externalAuthorsController.ts
│   ├── externalBooksController.ts
│   ├── loansController.ts
│   └── ...
├── routes/                  # Express router modules
│   ├── authRoutes.ts
│   ├── authorRoutes.ts
│   ├── bookRoutes.ts
│   ├── loanRoutes.ts
│   ├── requestRoutes.ts
│   ├── reviewRoutes.ts
│   ├── settingsRoutes.ts
│   └── admin/               # Admin-only route sub-tree
│       └── index.ts
├── services/                # Business logic and orchestration
│   ├── externalAuthorProviders.ts   # OpenLibrary, Wikidata, Google Books
│   ├── externalBookProviders.ts     # OpenLibrary, Google Books, LOC, ISBNdb, WorldCat
│   └── ...
├── repositories/            # Database read/write (raw SQL via pg pool)
├── models/                  # TypeScript interfaces for DB rows
├── middleware/              # Auth, error handling, rate-limit helpers
├── db/
│   ├── database.ts          # pg Pool creation + connectDatabase()
│   └── ...
├── utils/
│   ├── helpers.ts
│   └── loanReminderScheduler.ts   # Background cron for overdue loan emails
├── scripts/
│   └── bootstrapDatabase.ts      # One-time DB init/migration helper
└── __tests__/               # All API tests (Jest)
    ├── controllers/
    ├── services/
    ├── routes/
    ├── integration/
    └── ...
```

---

## apps/web

```
apps/web/
├── index.html               # Vite entry HTML
├── src/
│   ├── main.tsx             # React entry, BrowserRouter, theme providers
│   ├── App.tsx              # Top-level route definitions
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page-level components (routed)
│   │   ├── admin/           # Admin panel pages
│   │   └── public/          # Public-facing pages
│   ├── services/
│   │   ├── api.ts           # Axios instance configured with VITE_API_URL
│   │   ├── authService.ts   # Login, logout, JWT helpers
│   │   └── settingsService.ts  # Settings API calls
│   ├── context/
│   │   └── SettingsContext.tsx  # Global settings state (profile, site config)
│   ├── hooks/               # Custom React hooks
│   ├── types/               # Web-specific TypeScript types
│   └── utils/               # Helpers (date formatting, etc.)
├── vite.config.ts           # Vite dev server + build config
├── tailwind.config.js       # Tailwind CSS config
└── tsconfig.app.json
```

---

## apps/mobile

```
apps/mobile/
├── app/                     # Expo Router screens
│   ├── _layout.tsx          # Root layout (auth gate)
│   ├── (tabs)/              # Tab navigator screens
│   └── (auth)/              # Login / registration screens
├── components/              # Reusable React Native components
├── services/
│   ├── api.ts               # Axios instance (Android localhost rewrite)
│   ├── auth.ts              # Auth flow helpers
│   └── settingsService.ts  # Settings API calls
├── context/                 # React contexts (auth, settings)
├── hooks/                   # Custom hooks
├── constants/               # Theme colors, sizes, etc.
├── types/                   # Mobile-specific TypeScript types
└── app.json                 # Expo app config (bundle ID, API URL, etc.)
```

---

## libs/shared

```
libs/shared/
└── src/
    ├── index.ts             # Public exports — everything goes through here
    └── lib/
        ├── contracts/       # Request/response DTOs shared across apps
        ├── auth/            # Role constants, permission helpers
        ├── validation/      # Shared validator functions
        └── utils/           # Date, string, and other shared utilities
```

Rule: **never import directly from internal paths** — always use the barrel: `import { ... } from '@folio/shared'`.

---

## TypeScript path aliases

Defined in `tsconfig.base.json`:

| Alias           | Resolves to                |
| --------------- | -------------------------- |
| `@folio/shared` | `libs/shared/src/index.ts` |

Add new aliases here if you create a new shared lib.

---

## Key config files

| File                  | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `nx.json`             | Nx task pipeline, caching, default project settings                |
| `package.json`        | Yarn workspaces, root devDeps, root scripts (`yarn dev:api`, etc.) |
| `tsconfig.base.json`  | Shared TS base config with path aliases                            |
| `jest.config.ts`      | Root Jest preset (extends `jest.preset.js`)                        |
| `vitest.workspace.ts` | Vitest workspace (web Vitest projects)                             |
| `docker-compose.yml`  | Local Postgres + PgAdmin + Mailhog                                 |

---

[Architecture →](./architecture) · [Local Setup →](./local-setup)
