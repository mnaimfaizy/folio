---
title: Database
---

# Database

Folio uses **PostgreSQL** as its only data store. In development, it runs in Docker. In production, it's hosted on the same server or an external managed DB service.

---

## Schema

The database schema is declared in init SQL files:

- **`docker/postgres/init/001_schema.sql`** — core tables and constraints
- **`docker/postgres/init/003_settings.sql`** — site settings table and defaults

These files are executed automatically when the Docker Postgres container first initializes a fresh volume.

### Core tables

| Table           | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `users`         | User accounts (email, role, email verification, `credit_balance`)       |
| `books`         | Book catalog (ISBN variants, `available_copies`, `price_amount`, shelf) |
| `authors`       | Author profiles                                                         |
| `author_books`  | Many-to-many join table between books and authors                       |
| `book_loans`    | Loan lifecycle records + `loan_credit_amount`                           |
| `book_requests` | User request records + normalized matching fields                       |
| `reviews`       | User reviews of books (book FK, user FK, rating, text)                  |
| `site_settings` | Single-row global settings (profile, loans, payments, branding, etc.)   |
| `reset_tokens`  | Password reset token store                                              |

---

## Seed data

**`docker/postgres/init/002_seed.sql`**

Contains local/dev seed data:

- Admin user: `admin@folio.local` / `admin123`
- Regular user: `user@folio.local` / `user123`
- Demo books and authors (optional)

`003_seed_production.sql` is a production-safe seed variant.

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

`apps/api/db/database.ts` manages a `pg.Pool` and exposes a DB client adapter via `connectDatabase()`.

```ts
import { connectDatabase } from '../db/database';

export async function example() {
  const db = await connectDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', [1]);
  await db.run('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [1]);
}
```

Most API code uses `db.get`, `db.all`, and `db.run` through this adapter.

---

## Adding a column or table

1. Edit `docker/postgres/init/001_schema.sql`.
2. If settings/global config are affected, edit `docker/postgres/init/003_settings.sql`.
3. Keep runtime bootstrap aligned in `apps/api/db/database.ts`.
4. Add compatible seed data to `002_seed.sql` if needed.
5. Re-initialize locally:
   ```sh
   yarn docker:down
   docker volume rm folio_postgres_data
   yarn docker:up
   ```
6. Update any affected TypeScript types in `apps/api/models/` and `libs/shared/src/lib/contracts/`.
7. Update repositories/services/controllers that query the changed table.

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
