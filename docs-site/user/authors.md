---
title: Managing Authors
---

# Managing Authors

Author profiles give your books richer context — biographies, birth dates, photos, and alternate names.

---

## Viewing authors

- Go to **Admin → Authors** for the full admin list.
- Go to **/authors** (the public page) to see what visitors see.

---

## Adding an author manually

1. In **Admin → Authors**, click **Add Author**.
2. Fill in:
   - **Name** (required)
   - **Biography** — a short description
   - **Birth date** — supports historical formats like `6th cent. B.C.` or `c. 1564`
   - **Death date** (if applicable)
   - **Nationality**
   - **Photo** — upload or paste a URL
3. Click **Save**.

---

## Importing author data from external sources

Folio searches three public sources for author information:

| Source           | Best for                                  |
| ---------------- | ----------------------------------------- |
| **Open Library** | Biographies, photos, alternate names      |
| **Wikidata**     | Rich biographical data, birth/death dates |
| **Google Books** | Author info with linked works             |

### Steps

1. In **Admin → Authors**, click **Add Author**.
2. Click the **External Search** tab.
3. Select a source.
4. Type the author's name.
5. Click a result to pull in the data.
6. Review the fields and click **Save**.

::: tip Alternate names
For authors with names in multiple scripts (e.g., 孙武 → Sun Tzu), Folio stores up to 15 alternate name variants from OpenLibrary so you can search by any version.
:::

---

## Enriching an existing author

Already have an author but missing their biography or photo? Use the enrich feature.

1. Open the author's detail page.
2. Click **Enrich from External Sources**.
3. Search for the author on any provider.
4. A field-by-field merge UI appears — tick which fields you want to import.
5. Click **Apply Selected**.

Only the fields you tick will be updated. Existing data is not overwritten without your confirmation.

---

## Duplicate detection

When you search for an author by name, Folio checks if a similar author already exists using fuzzy name matching (70% similarity threshold). If a likely duplicate is found:

- A warning banner appears showing the existing matching author.
- You can dismiss the warning and proceed if they are different people.
- Or click the duplicate to open it instead of creating a new record.

---

## Editing and deleting

- **Edit**: open the author → click **Edit**, update fields, click **Save**.
- **Delete**: open the author → click **Delete**.

::: warning Deletion blocked if books exist
If an author has books in your catalog, you cannot delete them until those books are deleted or reassigned to a different author. Folio will show the exact book count blocking deletion.
:::

---

## Historical dates

Folio stores birth and death dates as plain text, so formats like:

- `c. 800 B.C.`
- `6th cent. B.C.`
- `fl. 1200`
- `1564`

…are all valid and displayed as-is. No reformatting happens.

---

[Back to Managing Books](./books) · [Loans & Requests →](./loans)
