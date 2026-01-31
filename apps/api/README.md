# Library Management System API

A RESTful API for managing a library system, built with Node.js, Express, TypeScript, and SQLite.

[![Test Coverage: 52.38%](https://img.shields.io/badge/Coverage-52.38%25-yellow.svg)](coverage/lcov-report/index.html)

## Features

- User authentication and authorization with JWT
- Book management (search, create, update, delete)
- Author management (search, create, update, delete)
- Review system for books
- User collections to save favorite books
- Integration with OpenLibrary API for searching books and authors
- Admin panel for user, book, author, and review management

## Test Coverage

The project now has extensive test coverage with both unit tests and integration tests.

### Current Test Coverage

| File                             | Statements | Branches | Functions | Lines  |
| -------------------------------- | ---------- | -------- | --------- | ------ |
| All files                        | 93.19%     | 71.11%   | 95.97%    | 93.03% |
| controllers                      | 90.85%     | 67.57%   | 93.87%    | 90.66% |
| controllers/authController.ts    | 91.81%     | 74.68%   | 100%      | 91.41% |
| controllers/authorsController.ts | 100%       | 84.61%   | 100%      | 100%   |
| controllers/booksController.ts   | 80.05%     | 51.52%   | 82.85%    | 79.78% |
| controllers/reviewsController.ts | 100%       | 85.89%   | 100%      | 100%   |
| controllers/admin                | 97.10%     | 87.09%   | 100%      | 97%    |

This represents a significant improvement from previous metrics where some controllers had coverage as low as:

- authorsController: 9.03%
- booksController: 4.98%
- reviewsController: 3.67%

### Types of Tests

- **Unit Tests**: Test individual components in isolation with mocked dependencies
- **Integration Tests**: Test the complete flow from HTTP requests to database operations
- **Edge Case Tests**: Verify application behavior with unusual or boundary inputs

## Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Set up environment variables (see .env.example)
4. Initialize the database
   ```
   npm run init-db
   ```
5. Start the server
   ```
   npm start
   ```

## Development

### Running Tests

Run all tests:

```
npm test
```

Run tests with coverage:

```
npm test -- --coverage
```

Run a specific test file:

```
npm test -- src/__tests__/controllers/booksController.test.ts
```

### Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon for development
- `npm test` - Run tests
- `npm run build` - Compile TypeScript
- `npm run init-db` - Initialize the database

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
