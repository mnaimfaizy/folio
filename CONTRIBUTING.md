# Contributing to Folio

Thank you for your interest in contributing!

## Quick start

```sh
git clone https://github.com/mnaimfaizy/folio.git
cd folio
yarn
yarn docker:up
yarn dev:api   # terminal 1
yarn dev:web   # terminal 2
```

## Full guides

Everything you need is in the developer documentation:

- **[Developer Guide](https://mnaimfaizy.github.io/folio-docs/dev/)** — architecture, API patterns, DB setup
- **[Adding Features](https://mnaimfaizy.github.io/folio-docs/dev/adding-features)** — step-by-step feature workflow
- **[Testing](https://mnaimfaizy.github.io/folio-docs/dev/testing)** — how to run and write tests
- **[Contributing Guide](https://mnaimfaizy.github.io/folio-docs/dev/contributing)** — PR workflow, branch naming, checklist

## Before opening a PR

```sh
yarn lint    # no lint errors
yarn test    # no test failures
yarn build   # builds succeed
yarn format  # no format violations
```

## Security

Do not open public GitHub issues for security vulnerabilities. Contact maintainers directly.
