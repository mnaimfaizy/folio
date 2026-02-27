---
title: Troubleshooting
---

# Troubleshooting

Common problems and their fixes for non-technical users.

---

## App won't start at all

**Check that Docker Desktop is running.** Open Docker Desktop from your taskbar or applications. The Docker icon should appear in the system tray (Windows) or menu bar (Mac).

Then try:

```sh
yarn docker:up
```

Wait 20–30 seconds before running the app again.

---

## "Address already in use" or "Port in use" error

Another program is already using port `3000` (API) or `4200` (Web).

**Find and stop the other program, or run:**

Windows:

```sh
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

Mac / Linux:

```sh
lsof -i :3000
kill -9 <PID_NUMBER>
```

Then start Folio again.

---

## "Cannot connect to database" error

The database container isn't running. Run:

```sh
yarn docker:up
```

If it still fails, stop and restart Docker containers:

```sh
yarn docker:down
yarn docker:up
```

---

## I forgot my admin password

If you're using local development defaults, the admin password is `admin123`.

If you changed it and forgot it, reset it via the database:

1. Make sure the database is running (`yarn docker:up`).
2. Open PgAdmin at [http://localhost:5050](http://localhost:5050) (login: `admin@folio.com` / `admin`).
3. Connect to the `folio` database.
4. An admin can also use the CLI:

```sh
docker exec -it folio-postgres psql -U folio -d folio -c \
  "UPDATE users SET password_hash = '<new_bcrypt_hash>' WHERE email = 'admin@folio.local';"
```

::: tip
For a quick local reset, re-running the seed will restore the default admin. Be aware this may reset other seed data:

```sh
yarn docker:down
yarn docker:up
```

:::

---

## Profile changed but the UI looks the same

This is normal — the profile change takes effect after a **hard page reload**.

Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac) to force-reload.

---

## The web app shows a blank page

Usually caused by an API connection issue. Check:

1. Is `yarn dev:api` still running in its terminal?
2. Is `apps/web/.env` pointing to the correct API URL? Open `apps/web/.env` and confirm:
   ```
   VITE_API_URL=http://localhost:3000
   ```
3. Try restarting the web dev server (`Ctrl + C`, then `yarn dev:web`).

---

## Books or Authors imported from external sources are empty

External providers require internet access and, for some providers, API keys.

- **Open Library** and **Library of Congress**: free, no key needed — check your internet connection.
- **Google Books**: requires `GOOGLE_BOOKS_API_KEY` in your `.env` file.
- **ISBNdb / WorldCat**: paid services — check your API key in `.env`.

---

## How to back up your data

Run this command while Docker is running:

```sh
docker exec -t folio-postgres pg_dump -U folio folio > folio-backup.sql
```

This creates a file called `folio-backup.sql` in the current folder.

**Restore from backup:**

```sh
docker exec -i folio-postgres psql -U folio -d folio < folio-backup.sql
```

---

## How to fully reset and start fresh

::: warning This deletes all your data
This removes all books, authors, users, and settings you've added.
:::

```sh
yarn docker:down
docker volume rm folio_postgres_data
yarn docker:up
```

The database will re-initialize from the default schema and seed data.

---

## Still stuck?

- Check [GitHub Issues](https://github.com/yourusername/folio/issues) to see if others had the same problem.
- Open a new issue with the error message from your terminal.
