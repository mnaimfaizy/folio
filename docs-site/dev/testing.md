---
title: Testing
---

# Testing

Folio uses two test runners depending on the project.

| Project       | Runner | Config                       |
| ------------- | ------ | ---------------------------- |
| `apps/api`    | Jest   | `apps/api/jest.config.ts`    |
| `libs/shared` | Jest   | `libs/shared/jest.config.ts` |
| `apps/web`    | Vitest | `apps/web/vitest.config.ts`  |
| `apps/mobile` | Jest   | `apps/mobile/jest.config.ts` |

---

## Running tests

From the repo root:

```sh
# All tests (Jest + Vitest via Nx)
yarn test

# Lint everything
yarn lint

# Only affected projects (faster in feature branches)
npx nx affected --target=test
```

Per-project:

```sh
npx nx run api:test
npx nx run web:test
npx nx run shared:test
```

Watch mode (API):

```sh
cd apps/api && npx jest --watch
```

---

## API tests (`apps/api/__tests__/`)

### Structure

```
apps/api/__tests__/
├── basic.test.ts                    # App smoke test
├── controllers/
│   ├── authController.test.ts
│   ├── authorsController.test.ts    # 49 tests
│   ├── booksController.test.ts
│   └── ...
├── services/
├── routes/
├── integration/                     # Full request→DB integration tests
├── middleware/
└── utils/
```

### Writing a controller test

```ts
import request from 'supertest';
import { app } from '../../index';

describe('GET /api/books', () => {
  it('returns 200 with book list', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 when creating without auth', async () => {
    const res = await request(app).post('/api/books').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });
});
```

### Writing a service test

```ts
import { BookService } from '../../services/bookService';
import { BookRepository } from '../../repositories/bookRepository';

jest.mock('../../repositories/bookRepository');

describe('BookService.create', () => {
  it('throws when title is empty', async () => {
    await expect(BookService.create({ title: '' })).rejects.toThrow('Title is required');
  });

  it('saves and returns the book', async () => {
    const mockBook = { id: '1', title: 'Dune' };
    (BookRepository.create as jest.Mock).mockResolvedValue(mockBook);

    const result = await BookService.create({ title: 'Dune' });
    expect(result).toEqual(mockBook);
  });
});
```

---

## Web tests (`apps/web/`)

Web uses **Vitest** with React Testing Library.

```ts
// apps/web/src/components/__tests__/BookCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookCard } from '../BookCard';

test('renders book title', () => {
  render(<BookCard title="Dune" author="Frank Herbert" />);
  expect(screen.getByText('Dune')).toBeInTheDocument();
});
```

Run web tests:

```sh
npx nx run web:test
```

---

## Test coverage

Generate coverage reports:

```sh
npx nx run api:test -- --coverage
npx nx run web:test -- --coverage
```

Coverage output goes to `coverage/apps/api/` and `coverage/apps/web/`.

---

## What to test — minimum expectations

| Change                | Required tests                                        |
| --------------------- | ----------------------------------------------------- |
| New controller action | Happy path + auth-required scenarios                  |
| New service method    | Domain rules + error cases                            |
| New repository method | Verify SQL is structured correctly (integration test) |
| New React component   | Renders without crashing + key user interaction       |
| Shared validation     | All valid + invalid edge cases                        |

---

## Mocking

- Use `jest.mock()` to mock modules at the module level.
- Use `jest.spyOn()` for targeted method overrides.
- Database interactions in unit tests: mock the repository layer.
- Integration tests in `apps/api/__tests__/integration/` hit the real database (requires Docker to be running).

---

## CI behavior

The GitHub Actions CI workflow (`ci.yml`) runs:

1. `npx nx affected --target=lint` — lint only changed projects
2. `npx nx affected --target=test` — test only changed projects
3. `npx nx affected --target=build` — build only changed projects

This keeps CI fast without skipping anything important.

---

[Contributing →](./contributing)
