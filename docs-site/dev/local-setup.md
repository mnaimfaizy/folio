---
title: Local Setup
---

# Local Setup (Developer)

Complete local development environment setup for contributors and extenders.

---

## Prerequisites

| Tool           | Version    | Install                                                      |
| -------------- | ---------- | ------------------------------------------------------------ |
| Node.js        | **22.x**   | [nodejs.org](https://nodejs.org)                             |
| Yarn           | **1.x**    | `npm i -g yarn`                                              |
| Docker Desktop | Latest     | [docker.com](https://www.docker.com/products/docker-desktop) |
| Git            | Any recent | [git-scm.com](https://git-scm.com)                           |

Verify node version:

```sh
node --version   # must be v22.x.x
```

::: tip Windows: WSL2
If you're on Windows, Docker Desktop with WSL2 backend is strongly recommended. All `yarn` commands work in both PowerShell and WSL2 bash.
:::

---

## Clone and install

```sh
git clone https://github.com/yourusername/folio.git
cd folio
yarn
```

`yarn` installs all workspace dependencies for api, web, mobile, and shared in one pass.

---

## Environment variables

### API environment (`/.env`)

Copy the example and review the values:

```sh
cp apps/api/.env.example .env
```

Key variables:

| Variable               | Dev default                                     | Notes                        |
| ---------------------- | ----------------------------------------------- | ---------------------------- |
| `DATABASE_URL`         | `postgresql://folio:folio@localhost:5432/folio` | Local Docker DB              |
| `JWT_SECRET`           | Set a strong random string                      | Used to sign access tokens   |
| `REFRESH_TOKEN_SECRET` | Set a strong random string                      | Used for refresh tokens      |
| `SMTP_*`               | Mailhog defaults                                | Uses local Mailhog for email |
| `CORS_ORIGINS`         | `http://localhost:4200`                         | Web dev server origin        |
| `GOOGLE_BOOKS_API_KEY` | _(optional)_                                    | Enables Google Books search  |
| `UPLOADTHING_SECRET`   | _(optional)_                                    | Enables file uploads         |

### Web environment (`apps/web/.env`)

```sh
cp apps/web/.env.example apps/web/.env
```

Key variables:

| Variable       | Dev default             |
| -------------- | ----------------------- |
| `VITE_API_URL` | `http://localhost:3000` |

### Mobile environment (`apps/mobile/app.json`)

The API URL for mobile is set in `apps/mobile/app.json` under `expo.extra.apiUrl`. For Android emulators, `http://10.0.2.2:3000` is the correct localhost alias.

---

## Start local infrastructure

```sh
yarn docker:up
```

This starts:

| Service    | URL                   | Credentials                   |
| ---------- | --------------------- | ----------------------------- |
| PostgreSQL | `localhost:5432`      | user: `folio` / pass: `folio` |
| PgAdmin    | http://localhost:5050 | `admin@folio.com` / `admin`   |
| Mailhog    | http://localhost:8025 | No auth                       |

The database is automatically initialized from:

- `docker/postgres/init/001_schema.sql` — full schema
- `docker/postgres/init/002_seed.sql` — admin user + demo content

---

## Run all apps

Use separate terminals for each:

```sh
# Terminal 1 — API (port 3000)
yarn dev:api

# Terminal 2 — Web (port 4200)
yarn dev:web

# Terminal 3 — Mobile (Expo, opens Metro bundler)
yarn dev:mobile
```

| App          | URL                                 |
| ------------ | ----------------------------------- |
| Web          | http://localhost:4200               |
| API          | http://localhost:3000               |
| Swagger UI   | http://localhost:3000/api-docs      |
| Swagger JSON | http://localhost:3000/api-docs.json |

---

## Nx commands

Folio uses Nx. Most tasks are wrapped in root `package.json` scripts, but you can call Nx directly:

```sh
# Run a specific project's target
npx nx run api:build
npx nx run web:test

# Run only affected projects (faster in CI)
npx nx affected --target=test
npx nx affected --target=lint

# Visualize project graph
npx nx graph
```

---

## Validate your setup

Run the full validation suite before opening a PR:

```sh
yarn lint    # ESLint across all projects
yarn test    # Jest (api, shared) + Vitest (web)
yarn build   # Build all apps
yarn format  # Prettier check
```

---

## VS Code recommended extensions

Add to `.vscode/extensions.json` (or install manually):

- `nrwl.angular-console` — Nx Console GUI
- `dbaeumer.vscode-eslint` — ESLint inline
- `esbenp.prettier-vscode` — Prettier formatter
- `bradlc.vscode-tailwindcss` — Tailwind IntelliSense
- `ms-vscode.vscode-typescript-next` — Latest TS support

---

## Stopping and resetting

Stop local services:

```sh
yarn docker:down        # Stop containers (data preserved)
```

Full reset (destroys data):

```sh
yarn docker:down
docker volume rm folio_postgres_data
yarn docker:up
```

---

[Project Structure →](./project-structure) · [API Guide →](./api-guide)
