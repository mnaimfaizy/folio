---
title: Developer Introduction
---

# Developer Guide

Welcome to the Folio developer documentation. This guide covers everything you need to understand, run, extend, and deploy the project.

---

## What kind of project is this?

Folio is an **Nx monorepo** — a single Git repository that contains multiple related applications sharing code, tooling, and CI configuration.

| App           | Stack                             | Purpose                                   |
| ------------- | --------------------------------- | ----------------------------------------- |
| `apps/api`    | Express + PostgreSQL (TypeScript) | REST API and business logic               |
| `apps/web`    | Vite + React (TypeScript)         | Admin panel and public web UI             |
| `apps/mobile` | Expo (TypeScript)                 | iOS/Android companion app                 |
| `libs/shared` | TypeScript                        | Cross-app contracts, types, and utilities |

The monorepo is managed by **Nx** and uses **Yarn** workspaces. All commands run from the repo root.

---

## Quick orientation

```
folio/
├── apps/
│   ├── api/          ← Express REST API
│   ├── web/          ← React web frontend
│   └── mobile/       ← Expo mobile app
├── libs/
│   └── shared/       ← Shared TypeScript types and utils
├── docker/           ← DB init SQL + Dockerfiles
├── docs/             ← Original Markdown docs
├── docs-site/        ← This VitePress documentation site
├── .github/          ← CI/CD workflows
├── nx.json           ← Nx workspace config
└── package.json      ← Root workspace config
```

---

## Key principles

1. **Layered API**: Route → Controller → Service → Repository → DB. Keep business logic out of controllers.
2. **Shared first**: Contracts and types used across apps go in `libs/shared`. Don't duplicate DTOs.
3. **Minimal changes**: Scope PRs tightly. Don't refactor adjacent code unless required by the feature.
4. **Tests required**: Add or update tests for every behavior change.
5. **Docs in sync**: Swagger, README, and these docs stay aligned with API and schema changes.

---

## Where to go next

| I want to…                             | Page                                     |
| -------------------------------------- | ---------------------------------------- |
| Understand how the pieces fit together | [Architecture](./architecture)           |
| Set up my development environment      | [Local Setup](./local-setup)             |
| Navigate the monorepo layout           | [Project Structure](./project-structure) |
| Build a new feature correctly          | [Adding Features](./adding-features)     |
| Understand the API patterns            | [API Guide](./api-guide)                 |
| Use or extend shared types             | [Shared Library](./shared-lib)           |
| Work with the database                 | [Database](./database)                   |
| Deploy to production                   | [Deployment](./deployment)               |
| Write and run tests                    | [Testing](./testing)                     |
| Contribute a PR                        | [Contributing](./contributing)           |
