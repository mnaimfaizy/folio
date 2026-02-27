---
title: Environment Config
---

# Environment Config

All runtime configuration in Folio is supplied through environment variables. This page documents every variable used across the project.

---

## API environment (`/.env` at repo root)

Sourced from `apps/api/.env.example`. The API reads this file via `dotenv`.

### Required

| Variable               | Example                                         | Description                       |
| ---------------------- | ----------------------------------------------- | --------------------------------- |
| `DATABASE_URL`         | `postgresql://folio:folio@localhost:5432/folio` | PostgreSQL connection string      |
| `JWT_SECRET`           | `change-me-in-production-32chars+`              | Secret for signing access tokens  |
| `REFRESH_TOKEN_SECRET` | `another-secret-different-from-jwt`             | Secret for signing refresh tokens |

### CORS

| Variable       | Example                                        | Description                             |
| -------------- | ---------------------------------------------- | --------------------------------------- |
| `CORS_ORIGINS` | `http://localhost:4200,https://yourdomain.com` | Comma-separated list of allowed origins |

### Email (SMTP)

| Variable      | Example               | Description                     |
| ------------- | --------------------- | ------------------------------- |
| `SMTP_HOST`   | `localhost`           | SMTP server hostname            |
| `SMTP_PORT`   | `1025`                | SMTP server port                |
| `SMTP_USER`   | _(empty for Mailhog)_ | SMTP username                   |
| `SMTP_PASS`   | _(empty for Mailhog)_ | SMTP password                   |
| `SMTP_FROM`   | `noreply@folio.local` | From address for outgoing email |
| `SMTP_SECURE` | `false`               | Use TLS (`true` in production)  |

### External book/author APIs

| Variable               | Required                   | Provider                       |
| ---------------------- | -------------------------- | ------------------------------ |
| `GOOGLE_BOOKS_API_KEY` | Optional                   | Google Books                   |
| `ISBNDB_API_KEY`       | Optional (paid)            | ISBNdb                         |
| `ISBNDB_BASE_URL`      | Optional                   | ISBNdb base URL override       |
| `WORLDCAT_WSKEY`       | Optional (paid)            | WorldCat                       |
| `WORLDCAT_BASE_URL`    | Required if using WorldCat | WorldCat API base URL          |
| `OPENLIBRARY_DEBUG`    | Optional                   | Logs raw OpenLibrary responses |

### File uploads

| Variable             | Required             | Description            |
| -------------------- | -------------------- | ---------------------- |
| `UPLOADTHING_SECRET` | Required for uploads | Uploadthing secret key |
| `UPLOADTHING_APP_ID` | Required for uploads | Uploadthing app ID     |

### Runtime

| Variable                       | Default       | Description                             |
| ------------------------------ | ------------- | --------------------------------------- |
| `NODE_ENV`                     | `development` | Set to `production` in prod             |
| `PORT`                         | `3000`        | API port                                |
| `ENABLE_SWAGGER_IN_PRODUCTION` | _(unset)_     | Set to `true` to expose Swagger in prod |

---

## Web environment (`apps/web/.env`)

Sourced from `apps/web/.env.example`. Vite exposes these as `import.meta.env.*`.

| Variable       | Example                 | Description  |
| -------------- | ----------------------- | ------------ |
| `VITE_API_URL` | `http://localhost:3000` | API base URL |

In production, set this to your actual API domain (e.g. `https://api.yourdomain.com`).

---

## Mobile environment (`apps/mobile/app.json`)

The mobile app reads configuration from `apps/mobile/app.json` under `expo.extra`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

For Android emulators, use `http://10.0.2.2:3000` instead of `localhost`.

For production, change `apiUrl` to your production API URL before building.

---

## CI/CD secrets (GitHub Actions)

| Secret                   | Used by         | Description                    |
| ------------------------ | --------------- | ------------------------------ |
| `CPANEL_FTP_HOST`        | `cd-cpanel.yml` | FTP host for cPanel deployment |
| `CPANEL_FTP_USERNAME`    | `cd-cpanel.yml` | FTP username                   |
| `CPANEL_FTP_PASSWORD`    | `cd-cpanel.yml` | FTP password                   |
| `CPANEL_API_REMOTE_PATH` | `cd-cpanel.yml` | Remote path for API deploy     |
| `CPANEL_WEB_REMOTE_PATH` | `cd-cpanel.yml` | Remote path for Web deploy     |

---

## Security checklist for production

- [ ] `JWT_SECRET` is 32+ random characters (generate with `openssl rand -hex 32`)
- [ ] `REFRESH_TOKEN_SECRET` is different from `JWT_SECRET`
- [ ] `DATABASE_URL` points to a restricted user (not a superuser)
- [ ] `CORS_ORIGINS` lists only your actual frontend URL
- [ ] `NODE_ENV=production` is set
- [ ] `ENABLE_SWAGGER_IN_PRODUCTION` is **not** set (keeps API docs internal)
- [ ] SMTP credentials are for a real mail provider (not Mailhog)

---

[Deployment →](./deployment) · [Testing →](./testing)
