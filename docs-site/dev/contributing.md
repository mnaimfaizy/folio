---
title: Contributing
---

# Contributing

How to contribute code, bug fixes, and features to Folio.

---

## Before you start

1. Check [GitHub Issues](https://github.com/mnaimfaizy/folio/issues) — the bug or feature may already be tracked.
2. For significant features, open an issue first to discuss the approach before coding.
3. Fork the repository or create a branch from `main`.

---

## Branch naming

| Type     | Pattern                        | Example                       |
| -------- | ------------------------------ | ----------------------------- |
| Feature  | `feat/<short-description>`     | `feat/book-tags`              |
| Bug fix  | `fix/<short-description>`      | `fix/isbn-dedup-regression`   |
| Docs     | `docs/<short-description>`     | `docs/add-api-guide`          |
| Refactor | `refactor/<short-description>` | `refactor/book-service-layer` |
| CI/Infra | `ci/<short-description>`       | `ci/add-affected-tests`       |

---

## Workflow

```
1. Branch from main
2. Make your changes (follow feature workflow in Adding Features guide)
3. Run the validation suite
4. Push branch → open Pull Request against main
5. Address review feedback
6. Merge (squash preferred for clean history)
```

---

## Validation before opening a PR

All checks must pass:

```sh
yarn lint      # No lint errors
yarn test      # No failing tests
yarn build     # Builds succeed
yarn format    # No format violations
```

---

## PR description template

When opening a PR, include:

```markdown
## What

Brief summary of what changed and why.

## Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Docs

## Changes

- List key file changes and their purpose

## Testing

- Describe manual testing performed
- Note which automated tests cover the change

## Checklist

- [ ] yarn lint passes
- [ ] yarn test passes
- [ ] yarn build passes
- [ ] Swagger updated (if API changed)
- [ ] Shared types used (if cross-app contract changed)
- [ ] Docs updated (if workflow/config changed)
```

---

## Code review expectations

Reviewers will check:

- **Correctness**: does the code do what the PR says?
- **Layer separation**: is business logic in services, not controllers or components?
- **No duplicated types**: are DTOs shared via `libs/shared` when appropriate?
- **API docs**: is Swagger updated?
- **Test coverage**: are happy path and error cases tested?
- **No breaking changes**: is the public API preserved unless intentionally changed?
- **Minimal diff**: is the change scoped tightly?

---

## Commit messages

Use the conventional commits format:

```
feat(books): add tag support to book creation
fix(loans): prevent duplicate loan creation on rapid submit
docs(readme): update local setup prerequisites
refactor(auth): extract token rotation to auth service
```

---

## Reporting bugs

Include in the issue:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, browser)
- Relevant terminal output or error messages

---

## Security issues

Do **not** open public GitHub issues for security vulnerabilities. Contact the maintainers directly via email or the repository's security policy.

---

[Docs Contribution →](./docs-contributing)
