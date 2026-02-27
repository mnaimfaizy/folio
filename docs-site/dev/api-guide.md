---
title: API Guide
---

# API Guide

Reference for the Express API architecture, patterns, and conventions used in `apps/api`.

---

## Four-layer architecture

Every non-trivial API feature follows this stack:

```
Request
   ↓
Route          apps/api/routes/*
   ↓
Controller     apps/api/controllers/*
   ↓
Service        apps/api/services/*
   ↓
Repository     apps/api/repositories/*
   ↓
PostgreSQL
```

### Layer responsibilities

| Layer          | File pattern     | Responsibility                                    | What NOT to do here         |
| -------------- | ---------------- | ------------------------------------------------- | --------------------------- |
| **Route**      | `*Routes.ts`     | Declare path, HTTP method, attach middleware      | No logic                    |
| **Controller** | `*Controller.ts` | Parse req, call service, map to HTTP status       | No SQL, no business rules   |
| **Service**    | `*Service.ts`    | Business rules, orchestration, external API calls | No HTTP parsing, no raw SQL |
| **Repository** | `*Repository.ts` | SQL queries only, return typed objects            | No business logic           |

---

## Route conventions

```ts
// apps/api/routes/bookRoutes.ts
import { Router } from 'express';
import { getBooks, createBook } from '../controllers/booksController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getBooks); // public
router.post('/', authenticate, requireAdmin, createBook); // admin only

export default router;
```

Mount in `apps/api/index.ts`:

```ts
app.use('/api/books', bookRoutes);
```

---

## Controller conventions

```ts
// apps/api/controllers/booksController.ts
import { Request, Response } from 'express';
import { BookService } from '../services/bookService';

export const createBook = async (req: Request, res: Response) => {
  try {
    const dto = req.body; // parse input
    const book = await BookService.create(dto); // delegate to service
    res.status(201).json(book); // map to HTTP response
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
```

**Rules:**

- No business logic.
- Handle error types and map to correct HTTP status codes.
- Do not import repositories directly — always go through a service.

---

## Service conventions

```ts
// apps/api/services/bookService.ts
import { BookRepository } from '../repositories/bookRepository';

export class BookService {
  static async create(dto: CreateBookDto) {
    // Validate / enforce business rules
    if (!dto.title?.trim()) throw new ValidationError('Title is required');

    // Orchestrate — may call multiple repositories or external APIs
    const existing = await BookRepository.findByIsbn(dto.isbn);
    if (existing) throw new ConflictError('Book with this ISBN already exists');

    return BookRepository.create(dto);
  }
}
```

**Rules:**

- All business rules live here.
- May call other services or external providers.
- Throws typed errors; controllers catch and map them.

---

## Repository conventions

```ts
// apps/api/repositories/bookRepository.ts
import { pool } from '../db/database';
import { Book } from '../models/book';

export class BookRepository {
  static async findByIsbn(isbn: string): Promise<Book | null> {
    const { rows } = await pool.query(
      'SELECT * FROM books WHERE isbn = $1 OR isbn10 = $1 OR isbn13 = $1',
      [isbn]
    );
    return rows[0] ?? null;
  }

  static async create(dto: CreateBookDto): Promise<Book> {
    const { rows } = await pool.query(
      'INSERT INTO books (title, ...) VALUES ($1, ...) RETURNING *',
      [dto.title, ...]
    );
    return rows[0];
  }
}
```

**Rules:**

- Raw SQL only. No business logic.
- Always use parameterized queries (`$1`, `$2`) — never string interpolation.
- Return typed model objects.

---

## Middleware

### Authentication

```ts
import { authenticate, requireAdmin } from '../middleware/auth';

// Requires valid JWT
router.get('/protected', authenticate, handler);

// Requires valid JWT + admin role
router.delete('/:id', authenticate, requireAdmin, handler);
```

### Rate limiting

Applied globally in `apps/api/index.ts` — 100 requests per 15 minutes per IP.

For sensitive endpoints (login, register), a stricter limiter is applied per route.

### Error handling

A global error handler in `apps/api/middleware/errorHandler.ts` catches unhandled promise rejections and returns a consistent error shape:

```json
{ "message": "Human-readable error", "code": "OPTIONAL_CODE" }
```

---

## External providers

Book and author metadata is fetched in dedicated service files:

| File                                  | Providers                                        |
| ------------------------------------- | ------------------------------------------------ |
| `services/externalBookProviders.ts`   | OpenLibrary, Google Books, LOC, ISBNdb, WorldCat |
| `services/externalAuthorProviders.ts` | OpenLibrary, Wikidata, Google Books              |

Each provider implements a common interface so controllers can call any provider without knowing its implementation details.

---

## API documentation (Swagger)

All endpoints are documented inline in `apps/api/config/swagger.ts` and via JSDoc/OpenAPI comments in route files. The spec is served at:

- **Swagger UI**: http://localhost:3000/api-docs
- **Swagger JSON**: http://localhost:3000/api-docs.json

**Keep swagger aligned with your endpoint contracts.** When adding a new endpoint, add the OpenAPI description in the same PR.

---

## Adding a new endpoint — checklist

- [ ] Route declared in `apps/api/routes/`
- [ ] Controller handler created (HTTP concerns only)
- [ ] Service method created (business logic)
- [ ] Repository method created (SQL only) if DB access needed
- [ ] Swagger doc added in `apps/api/config/swagger.ts`
- [ ] Tests added in `apps/api/__tests__/controllers/` and/or `services/`
- [ ] Shared DTO added to `libs/shared/src/lib/contracts/` if web/mobile consume the payload

---

[Architecture →](./architecture) · [Adding Features →](./adding-features)
