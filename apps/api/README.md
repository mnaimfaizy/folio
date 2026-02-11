# Folio API

Express + TypeScript API for Folio. In this repo it’s run via Nx from the workspace root.

## Run (local)

1. Start local infrastructure (Postgres + Mailhog + PgAdmin):

```sh
yarn docker:up
```

2. Configure env:

- Copy `apps/api/.env.example` to `.env` (repo root).
- Adjust DB + JWT settings as needed.

3. Start the API:

```sh
yarn dev:api
```

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api-docs

## Environment variables

The API supports either a full `DATABASE_URL` or individual `POSTGRES_*` values.

Common:


Database:

External book providers (admin-only imports):

UploadThing (book cover uploads):

- `UPLOADTHING_TOKEN` (UploadThing API token; required for `/api/uploadthing`)

- `GOOGLE_BOOKS_API_KEY` (Google Books API key)
- `ISBNDB_API_KEY` (ISBNdb REST key)
- `ISBNDB_BASE_URL` (default `https://api2.isbndb.com`)
- `WORLDCAT_WSKEY` (WorldCat WSKey)
- `WORLDCAT_BASE_URL` (WorldCat base URL for your plan)
- `OPENLIBRARY_DEBUG` (`true`/`false`, logs raw Open Library responses)
- `SMTP_HOST` (default `localhost`, or `mailhog` when `RUNNING_IN_DOCKER=true`)
- `SMTP_PORT` (default `1025`)
- `SMTP_SECURE` (`true`/`false`, default `false`)
- `SMTP_USER`, `SMTP_PASS` (optional)
- `EMAIL_FROM` (default `library@example.com`)
- `EMAIL_SERVICE` (optional)

## Seed data

## Admin external book imports

Admins can search external providers and prefill book data from the web UI. The
API exposes a single admin-only endpoint:

`GET /api/admin/books/external/search?source={source}&query={query}&type={title|author|isbn}`

Supported sources:

- `openlibrary`
- `googlebooks`
- `loc` (Library of Congress)
- `wikidata`
- `isbndb`
- `worldcat`

Response format:

```json
{
  "results": [
    {
      "source": "openlibrary",
      "title": "The Art of War",
      "authors": ["孙武", "Sun Tzu"],
      "isbn": "9780195014761",
      "isbn10": "0195014766",
      "isbn13": "9780195014761",
      "publishYear": 1900,
      "cover": "https://covers.openlibrary.org/b/id/4849549-M.jpg",
      "description": "..."
    }
  ]
}
```

Notes:

- Open Library search results can omit ISBNs. The API attempts a follow-up
  lookup by edition OLID to resolve `isbn10`/`isbn13` when missing.
- The admin create endpoint accepts `isbn`, `isbn10`, and `isbn13`. The stored
  `isbn` field prefers ISBN-13, then ISBN-10, then the provided `isbn`.
- ISBN uniqueness is enforced across `isbn`, `isbn10`, and `isbn13`.

When using `yarn docker:up`, Postgres is initialized from the workspace root:

- `docker/postgres/init/001_schema.sql`
- `docker/postgres/init/002_seed.sql`

Seeded users:

- `admin@folio.local` / `admin123`
- `user@folio.local` / `user123`

## Tests

Run API tests from the repo root:

```sh
yarn nx test api
```
