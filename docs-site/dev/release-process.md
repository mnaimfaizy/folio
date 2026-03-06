---
title: Release Process
---

# Release Process

This page defines how Folio handles release separation for Web and Mobile, including branch naming, semantic versioning, tags, release notes, and PR checklist requirements.

---

## Canonical release runbooks

- Global governance (Web + Mobile): [docs/release/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/release/README.md)
- Mobile release process: [docs/mobile/release/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/release/README.md)
- Mobile release notes template: [docs/mobile/release/RELEASE_NOTES_TEMPLATE.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/release/RELEASE_NOTES_TEMPLATE.md)
- Mobile PR template: [.github/PULL_REQUEST_TEMPLATE/mobile-release.md](https://github.com/mnaimfaizy/folio/blob/main/.github/PULL_REQUEST_TEMPLATE/mobile-release.md)
- Web PR template: [.github/PULL_REQUEST_TEMPLATE/web-release.md](https://github.com/mnaimfaizy/folio/blob/main/.github/PULL_REQUEST_TEMPLATE/web-release.md)

---

## Release separation by tags

Use target-specific tags to prevent release conflicts:

- Mobile: `mobile/vx.y.z`
- Web: `web/vx.y.z`

Example:

- `mobile/v1.1.1`
- `web/v2.4.0`

---

## Branch strategy

- Mobile release branches: `mobile/vx.y.z`
- Web release branches: `web/vx.y.z`

---

## Semantic versioning

Use stable semantic versions in scripts and release branches/tags:

- `x.y.z` (for example `1.1.1`)

---

## Release automation commands

From repo root:

```sh
yarn release:mobile:prepare -- --bump patch --push
yarn release:mobile:tag -- --push

yarn release:web:prepare -- --bump patch --push
yarn release:web:tag -- --push
```

Automatic version behavior:

- `prepare` derives the next version from existing target tags if `--version` is omitted.
- `tag` infers the version from the current release branch if `--version` is omitted.
- `tag` updates version artifacts and commits them before creating the release tag.

Version storage files:

- `docs/release/versions.json`
- `apps/mobile/app.json` (`expo.version`)
- `apps/web/public/version.json`

---

## Release note requirement

Every release must include release notes before deployment.

Use the starter template:

- [Mobile release notes template](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/release/RELEASE_NOTES_TEMPLATE.md)

---

## Mobile PR checklist requirement

Mobile release PRs must include checklist items for:

- Android build
- iOS build
- Android testing
- iOS testing
- release notes presence
- Android deployment/submission status
- iOS deployment/submission status

Use the template:

- [Mobile release PR template](https://github.com/mnaimfaizy/folio/blob/main/.github/PULL_REQUEST_TEMPLATE/mobile-release.md)
