# Folio Web

Vite + React + TypeScript web app for Folio. In this repo it’s run via Nx from the workspace root.

## Run (local)

```sh
yarn dev:web
```

- Web: http://localhost:4200

## API base URL

The web app reads the API base URL from `import.meta.env.VITE_API_URL`.

- Copy `apps/web/.env.example` to `apps/web/.env`.
- Default: `http://localhost:3000`

## Build / test / lint

From the repo root:

```sh
yarn nx build web
yarn nx test web
yarn nx lint web
```

## Admin features

### Author management

**Creating authors with external data:**

Navigate to `/admin/authors/create` to access the author creation interface with two tabs:

1. **Manual Entry** - Traditional form-based creation
2. **External Search** - Search Open Library, Wikidata, or Google Books

**External search workflow:**

1. Select a data source (Open Library, Wikidata, or Google Books)
2. Enter author name and search
3. Browse results with preview data (photo, biography, birth date, alternate names)
4. Click "Select" to pre-fill the form
5. Review and submit

**Features:**

- **Historical dates**: Automatically handles formats like `6th cent. B.C.`, `c. 1564`
- **English name priority**: Latin-script names auto-selected when multiple variations exist
- **Alternate names**: Up to 36 alternate name variations stored (e.g., \u5b59\u6b66 \u2192 Sun Tzu)
- **Duplicate detection**: Fuzzy matching alerts you to similar existing authors
- **Force creation**: Override duplicate warnings when intentional

**Enriching existing authors:**

Edit any author at `/admin/authors/edit/{id}` and click **"Enrich from External Sources"** to:

1. Search external providers using the author's name (pre-populated)
2. Select matching author from search results
3. Preview available data fields:
   - Biography (with preview)
   - Birth date
   - Photo URL (with image preview)
   - Alternate names (shown for reference)
4. Check which fields to merge into the existing author
5. Click "Apply Selected Fields" to update the form
6. Review and save changes

**Smart field pre-selection:**

The enrichment dialog automatically checks fields that:

- Have data in the external source
- Are currently empty in your author record

This prevents accidental overwrites of existing data.

**Alternate name display:**

When viewing authors with alternate names, they're displayed in the UI as badges:

- Primary 5 shown with a count of remaining names
- Useful for authors with multiple name variations across cultures

**Author deletion restrictions:**

Authors cannot be deleted if they have associated books. You'll see an error:

> "This author has X book(s). Please remove all books before deleting the author."

This protects data integrity in the many-to-many author-book relationship.

Books can be deleted freely without author restrictions.
