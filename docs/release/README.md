# Release governance (Web + Mobile)

This runbook defines release separation across Web and Mobile using branch and tag conventions.

## Versioning policy

- Use semantic versions: `x.y.z` (for example `1.1.1`)
- Release tags are prefixed by target:
  - Mobile: `mobile/vx.y.z`
  - Web: `web/vx.y.z`

This prevents collision and keeps independent release cadence per target.

## Branching policy

- Mobile release branch format: `mobile/vx.y.z`
- Web release branch format: `web/vx.y.z`

Example:

- `mobile/v1.1.1`
- `web/v2.4.0`

## Release automation script

Use the shared script from repo root:

```sh
yarn release:prepare -- prepare --target mobile --bump patch --push
yarn release:prepare -- tag --target mobile --push
```

Equivalent target-specific shortcuts:

```sh
yarn release:mobile:prepare -- --bump patch --push
yarn release:mobile:tag -- --push

yarn release:web:prepare -- --bump patch --push
yarn release:web:tag -- --push
```

Version automation behavior:

- `prepare` derives next version from previous target tag (`mobile/*` or `web/*`) when `--version` is not provided.
- `tag` infers version from current release branch when `--version` is not provided.
- On `tag`, version artifacts are updated and committed automatically before the annotated tag is created.

Version storage:

- Shared release version store: [versions.json](./versions.json)
- Mobile runtime version source: `apps/mobile/app.json` (`expo.version`)
- Web release version artifact: `apps/web/public/version.json`

## Release notes requirement

Every `mobile/*` and `web/*` release must include release notes.

- Mobile template: [../mobile/release/RELEASE_NOTES_TEMPLATE.md](../mobile/release/RELEASE_NOTES_TEMPLATE.md)

## PR template requirement

- Mobile release PRs must use: [../../.github/PULL_REQUEST_TEMPLATE/mobile-release.md](../../.github/PULL_REQUEST_TEMPLATE/mobile-release.md)
- Web release PRs must use: [../../.github/PULL_REQUEST_TEMPLATE/web-release.md](../../.github/PULL_REQUEST_TEMPLATE/web-release.md)

## Related runbooks

- Mobile release process: [../mobile/release/README.md](../mobile/release/README.md)
