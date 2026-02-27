---
title: Database
---

# Database

Folio uses **PostgreSQL** as its only data store. In development, it runs in Docker. In production, it's hosted on the same server or an external managed DB service.

---

## Schema

The database schema is declared in a single file:

**`docker/postgres/init/001_schema.sql`**

This file is executed automatically when the Docker Postgres container first initializes a fresh volume. Edit this file when you add or change tables.

### Core tables

| Table            | Purpose                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| `users`          | User accounts (email, hashed password, role, email verification)          |
| `books`          | Book catalog (title, ISBN, isbn10, isbn13, cover, description, author FK) |
| `authors`        | Author profiles (name, bio, date, nationality, alternate_names JSON)      |
| `loans`          | Loan records (book FK, user FK, due_date, returned_at, status)            |
| `requests`       | Book borrow requests (user FK, title, author, status)                     |
| `reviews`        | User reviews of books (book FK, user FK, rating, text)                    |
| `settings`       | Key-value site configuration (profile, hero text, page toggles)           |
| `refresh_tokens` | JWT refresh token store                                                   |

---

## Seed data

**`docker/postgres/init/002_seed.sql`**

Contains:

- Admin user: `admin@folio.local` / `admin123`
- Regular user: `user@folio.local` / `user123`
- Demo books and authors (optional)

Update this file when your schema changes require compatible seed data.

---

## Local database connection

| Property | Value       |
| -------- | ----------- |
| Host     | `localhost` |
| Port     | `5432`      |
| Database | `folio`     |
| User     | `folio`     |
| Password | `folio`     |

Connection string:

```
postgresql://folio:folio@localhost:5432/folio
```

---

## Access via PgAdmin

PgAdmin runs at [http://localhost:5050](http://localhost:5050) when Docker is up.

Login: `admin@folio.com` / `admin`

Connect to server:

- Host: `folio-postgres` (the Docker service name)
- Port: `5432`
- Username: `folio`
- Password: `folio`

---

## Database connection in the API

`apps/api/db/database.ts` manages a `pg.Pool` instance:

```ts
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function connectDatabase() {
  await pool.query('SELECT 1'); // test connection startup
}
```

All repositories import and use `pool` directly.

---

## Adding a column or table

1. Edit `docker/postgres/init/001_schema.sql`.
2. Add compatible seed data to `002_seed.sql` if needed.
3. Re-initialize locally:
   ```sh
   yarn docker:down
   docker volume rm folio_postgres_data
   yarn docker:up
   ```
4. Update any affected TypeScript types in `apps/api/models/` and `libs/shared/src/lib/contracts/`.
5. Update repositories that query the changed table.

::: warning Production schema changes
Folio uses no automated migration runner. On production servers, you must apply schema changes manually (`ALTER TABLE`, `CREATE TABLE`) or by re-running the init SQL against a fresh database. Keep a record of incremental changes.
:::

---

## Backup and restore

**Backup (local Docker):**

```sh
docker exec -t folio-postgres pg_dump -U folio folio > folio-backup.sql
```

**Restore:**

```sh
docker exec -i folio-postgres psql -U folio -d folio < folio-backup.sql
```

**Automated backup script (cron example):**

```sh
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec -t folio-postgres pg_dump -U folio folio > "$BACKUP_DIR/folio-$DATE.sql"
# Keep last 14 backups
ls -t "$BACKUP_DIR"/folio-*.sql | tail -n +15 | xargs rm -f
```

---

## ISBN uniqueness

Books enforce uniqueness across all three ISBN variants:

- `isbn` — primary (prefers ISBN-13)
- `isbn10`
- `isbn13`

Attempting to insert a book where any of these three fields matches an existing record will fail with a 409 Conflict response.

---

[Shared Library →](./shared-lib) · [Deployment →](./deployment)
