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

When using `yarn docker:up`, Postgres is initialized from the workspace root:

- `docker/postgres/init/001_schema.sql`
- `docker/postgres/init/002_seed.sql`

Seeded users:

- `admin@folio.local` / `admin123`
- `user@folio.local` / `user123`

## Admin external imports

### Books

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

### Authors

Admins can search and import author data from external providers with enhanced
duplicate detection and data enrichment capabilities.

**Endpoints:**

```
GET /api/authors/external/search?source={source}&query={query}
GET /api/authors/external/details?source={source}&key={key}
POST /api/authors/check-duplicate
POST /api/admin/authors (with force=true to bypass duplicates)
PUT /api/admin/authors/:id
DELETE /api/admin/authors/:id
```

**Supported sources:**

- `openlibrary` - Open Library author data
- `wikidata` - Wikidata biographical data (SPARQL)
- `googlebooks` - Google Books author info

**External API response format:**

```json
{
  "source": "openlibrary",
  "name": "Sun Tzu",
  "key": "/authors/OL34184A",
  "externalId": "OL34184A",
  "biography": "Sun Tzu was a Chinese general...",
  "birthDate": "6th cent. B.C.",
  "deathDate": "5th cent. B.C.",
  "photoUrl": "https://covers.openlibrary.org/a/olid/OL34184A-M.jpg",
  "alternateNames": ["孙武", "Sun-Tzu", "Sunzi"],
  "topWorks": ["The Art of War"],
  "workCount": 47
}
```

**Historical date handling:**

The API preserves historical date formats without normalization:

- `6th cent. B.C.`
- `c. 1564`
- `384 BC`
- `1850-1900`

Dates are stored as TEXT and displayed as-is throughout the application.

**Alternate names:**

Authors can have multiple name variations stored as JSON:

```json
{
  "id": 1,
  "name": "Sun Tzu",
  "alternate_names": "[\"孙武\", \"Sun-Tzu\", \"Sunzi\"]"
}
```

- Maximum 15 alternate names from OpenLibrary
- Duplicates removed
- Used in duplicate detection (90% similarity threshold)

**Duplicate detection:**

The `/api/authors/check-duplicate` endpoint performs fuzzy matching:

- **95%+ match**: Exact alternate name match → likely duplicate
- **90%+ match**: Primary vs alternate name → potential duplicate
- **70%+ match**: Primary name similarity → similar author

Levenshtein distance algorithm with configurable thresholds.

**Force creation:**

Bypass duplicate detection with `force: true`:

```json
POST /api/admin/authors
{
  "name": "Jane Austen",
  "biography": "...",
  "force": true
}
```

**Deletion restrictions:**

Authors with associated books cannot be deleted:

```json
DELETE /api/admin/authors/1

// Response (400):
{
  "message": "Cannot delete author with existing books",
  "error": "This author has 3 book(s). Please remove all books before deleting the author.",
  "bookCount": 3
}
```

Books must be disassociated via the `author_books` table before deletion.

**Author-Book relationships:**

Many-to-many via `author_books` table:

```sql
CREATE TABLE author_books (
  author_id BIGINT REFERENCES authors(id) ON DELETE CASCADE,
  book_id BIGINT REFERENCES books(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (author_id, book_id)
);
```

- Books can be deleted without author restrictions
- Deleting a book removes all `author_books` entries (CASCADE)
- Deleting an author requires zero `author_books` entries first

## Tests

Run API tests from the repo root:

```sh
yarn nx test api
```
