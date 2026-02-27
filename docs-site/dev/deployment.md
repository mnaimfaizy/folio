---
title: Deployment
---

# Deployment

Folio supports several deployment configurations. This page describes the production deployment patterns with links to detailed setup guides.

---

## Deployment options overview

| Option                      | Best for                              | Complexity |
| --------------------------- | ------------------------------------- | ---------- |
| **Local only**              | Personal use on one machine           | Low        |
| **cPanel / shared hosting** | Budget hosting, existing cPanel plans | Medium     |
| **Docker Compose (VPS)**    | Full control on a VPS/cloud VM        | Medium     |
| **Managed PaaS**            | Railway, Render, Fly.io, etc.         | Low–Medium |

---

## What gets deployed

| Artifact   | Description                                                    |
| ---------- | -------------------------------------------------------------- |
| `apps/api` | Node.js Express app (bundled with `nx build api`)              |
| `apps/web` | Static React app (bundled with `nx build web`)                 |
| PostgreSQL | Must be provisioned separately (Docker, managed DB, cPanel DB) |

`apps/mobile` is deployed via Expo EAS (separate process — see `apps/mobile/eas.json`).

---

## Option 1: Local (development and personal use)

See [Local Setup](./local-setup) and the [User Guide](../user/getting-started).

---

## Option 2: cPanel deployment

Full step-by-step guide: [docs/deployment/CPANEL_CD.md](https://github.com/yourusername/folio/blob/main/docs/deployment/CPANEL_CD.md)

**Summary:**

1. Build both apps locally or in CI:
   ```sh
   npx nx build api
   npx nx build web
   ```
2. The CI/CD pipeline in `.github/workflows/cd-cpanel.yml` packages `apps/api/dist` and `apps/web/dist` and uploads them via FTP.
3. Configure Node.js via Passenger (cPanel) to run the API bundle.
4. Point your domain's document root at `apps/web/dist`.
5. Proxy `/api/*` requests to the Passenger-managed Node.js process.

**Required GitHub secrets for CD:**

- `CPANEL_FTP_HOST`
- `CPANEL_FTP_USERNAME`
- `CPANEL_FTP_PASSWORD`
- `CPANEL_API_REMOTE_PATH`
- `CPANEL_WEB_REMOTE_PATH`

---

## Option 3: Docker Compose on a VPS

The `docker-compose.yml` is tuned for local development (no SSL, no health checks). For production:

1. Create a `docker-compose.prod.yml` extending the base with:
   - Postgres with a named volume and `restart: always`
   - API with `NODE_ENV=production` and secrets via Docker secrets or env files
   - A reverse proxy service (Traefik or Nginx) handling SSL termination
2. Never expose PostgreSQL port `5432` publicly.
3. Set strong `JWT_SECRET` and `REFRESH_TOKEN_SECRET` values.

---

## Option 4: PaaS (Railway, Render, Fly.io)

Deploy the API as a Node.js service and provision a managed PostgreSQL database.

Generic steps:

1. Set all required environment variables on the platform.
2. Build command: `npx nx build api`
3. Start command: `node apps/api/dist/main.js` (or path per build output)
4. Provision a PostgreSQL add-on or external database.
5. Set `DATABASE_URL` to the platform's DB connection string.

For web: deploy to any static hosting (Netlify, Vercel, Cloudflare Pages) pointing at `apps/web/dist`.

---

## Single-user setup guide

For personal non-technical users running Folio locally only:

[User Guide: Getting Started →](../user/getting-started)
[User Guide: Single User Profile →](../user/profiles#single-user-personal-library)

---

## Public showcase setup guide

For a public-facing Folio instance:

[User Guide: Public Showcase →](../user/profiles#public-showcase)
[CPANEL_CD guide](https://github.com/yourusername/folio/blob/main/docs/deployment/CPANEL_CD.md)

---

## Environment variables for production

See [Environment Config](./env-config) for the full list of required and optional variables.

Key things to change for every production deployment:

- [ ] `JWT_SECRET` — strong random string (32+ chars)
- [ ] `REFRESH_TOKEN_SECRET` — strong random string (different from JWT_SECRET)
- [ ] `DATABASE_URL` — production database connection string
- [ ] `CORS_ORIGINS` — your actual frontend URL only
- [ ] `NODE_ENV=production`
- [ ] SMTP configured for real email delivery
- [ ] Default admin password changed after first login

---

[Environment Config →](./env-config) · [Testing →](./testing)
