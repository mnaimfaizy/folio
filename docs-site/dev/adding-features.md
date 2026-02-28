---
title: Adding Features
---

# Adding Features

Step-by-step guide for adding a new feature to Folio cleanly and completely.

---

## Step 1: Decide project placement

Before writing code, decide where the feature belongs.

| Change needed                            | Where                                                               |
| ---------------------------------------- | ------------------------------------------------------------------- |
| New API endpoint                         | `apps/api/routes/` + `controllers/` + `services/` + `repositories/` |
| New admin UI                             | `apps/web/src/components/admin/` and route wiring in `App.tsx`      |
| New public UI                            | `apps/web/src/components/` and route wiring in `App.tsx`            |
| Shared logic (API + Web or API + Mobile) | `libs/shared/src/lib/`                                              |
| New mobile screen                        | `apps/mobile/app/`                                                  |
| Database schema change                   | `docker/postgres/init/001_schema.sql`                               |

Rule: **if a type, interface, or helper is used in 2 or more apps, it belongs in `libs/shared`.**

---

## Step 2: Database schema (if needed)

Edit `docker/postgres/init/001_schema.sql` to add tables, columns, or indexes:

```sql
-- Add a new "tags" table
CREATE TABLE IF NOT EXISTS tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_tags (
  book_id BIGINT REFERENCES books(id) ON DELETE CASCADE,
  tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id)
);
```

If the change needs seed data, add it to `002_seed.sql`.
If the change affects global configuration, also update `003_settings.sql`.

**Apply changes locally:**

```sh
yarn docker:down
docker volume rm folio_postgres_data
yarn docker:up
```

::: warning No automatic migration runner
Folio does not use a migration framework (e.g. Flyway, Liquibase). Schema changes are applied by reinitializing the local Docker volume. On production, replays of init SQL or manual `ALTER TABLE` statements are required.
:::

---

## Step 3: Shared contracts (if web/mobile will consume the data)

Add request/response types to `libs/shared/src/lib/contracts/`:

```ts
// libs/shared/src/lib/contracts/tags.ts
export interface Tag {
  id: string;
  name: string;
}

export interface CreateTagDto {
  name: string;
}
```

Export from `libs/shared/src/index.ts`:

```ts
export * from './lib/contracts/tags';
```

---

## Step 4: Repository

```ts
// apps/api/repositories/tagRepository.ts
import { connectDatabase } from '../db/database';

export type TagRow = { id: number; name: string; created_at: string };

export const findAllTags = async (): Promise<TagRow[]> => {
  const db = await connectDatabase();
  return db.all<TagRow>('SELECT * FROM tags ORDER BY name');
};

export const createTag = async (name: string): Promise<TagRow | undefined> => {
  const db = await connectDatabase();
  const result = await db.run('INSERT INTO tags (name) VALUES (?)', [name]);
  return db.get<TagRow>('SELECT * FROM tags WHERE id = ?', [result.lastID]);
};
```

---

## Step 5: Service

```ts
// apps/api/services/tagService.ts
import { TagRepository } from '../repositories/tagRepository';

export class TagService {
  static async getTags() {
    return TagRepository.findAll();
  }

  static async createTag(name: string) {
    if (!name?.trim()) throw new Error('Tag name is required');
    return TagRepository.create(name.trim());
  }
}
```

---

## Step 6: Controller

```ts
// apps/api/controllers/tagsController.ts
import { Request, Response } from 'express';
import { TagService } from '../services/tagService';

export const getTags = async (_req: Request, res: Response) => {
  try {
    const tags = await TagService.getTags();
    res.json(tags);
  } catch {
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const tag = await TagService.createTag(req.body.name);
    res.status(201).json(tag);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    res.status(400).json({ message: msg });
  }
};
```

---

## Step 7: Route

```ts
// apps/api/routes/tagRoutes.ts
import { Router } from 'express';
import { getTags, createTag } from '../controllers/tagsController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getTags);
router.post('/', authenticate, requireAdmin, createTag);

export default router;
```

Mount in `apps/api/index.ts`:

```ts
import tagRoutes from './routes/tagRoutes';
// ...
app.use('/api/tags', tagRoutes);
```

---

## Step 8: Swagger docs

Add an OpenAPI annotation for each endpoint in `apps/api/config/swagger.ts`:

```ts
/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: List all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Array of tags
 *   post:
 *     summary: Create a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 */
```

---

## Step 9: Tests

Add tests in `apps/api/__tests__/`:

```ts
// apps/api/__tests__/controllers/tagsController.test.ts
describe('GET /api/tags', () => {
  it('returns 200 with tag list', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

---

## Step 10: Web UI (if needed)

Add a React page in `apps/web/src/pages/admin/`:

```tsx
// apps/web/src/pages/admin/Tags.tsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Tag } from '@folio/shared';

export default function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    api.get<Tag[]>('/api/tags').then((r) => setTags(r.data));
  }, []);

  return (
    <div>
      <h1>Tags</h1>
      {tags.map((tag) => (
        <div key={tag.id}>{tag.name}</div>
      ))}
    </div>
  );
}
```

---

## Feature completion checklist

- [ ] Schema updated in `docker/postgres/init/001_schema.sql`
- [ ] Shared DTOs added to `libs/shared` (if cross-app)
- [ ] Repository created (SQL only)
- [ ] Service created (business logic)
- [ ] Controller created (HTTP only)
- [ ] Route declared and mounted in `index.ts`
- [ ] Swagger annotation added
- [ ] Tests covering happy path + edge cases
- [ ] Web/mobile UI updated if feature is user-facing
- [ ] `yarn lint`, `yarn test`, `yarn build` all pass

---

[API Guide →](./api-guide) · [Shared Library →](./shared-lib)
