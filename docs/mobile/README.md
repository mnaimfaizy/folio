# Mobile release docs

Canonical runbooks for building, deploying, and operating the Folio mobile app (`apps/mobile`) in this Nx monorepo.

## Start here

- Build guides (Android + iOS): [build/README.md](./build/README.md)
- Deployment guides (Play Console + App Store Connect): [deploy/README.md](./deploy/README.md)
- Troubleshooting (build + deploy): [troubleshoot/README.md](./troubleshoot/README.md)
- OTA basics (EAS Update): [ota/README.md](./ota/README.md)
- CI options (GitHub Actions and EAS Workflows): [ci/README.md](./ci/README.md)
- Credentials and secret handling: [security/README.md](./security/README.md)
- Mobile release process (branching, tags, release notes, PR checklist): [release/README.md](./release/README.md)

## Source of truth

`docs/mobile/*` is the canonical source for mobile release operations.

The docs site (`docs-site/dev/mobile.md`) mirrors and links to these pages for developer discoverability.

Cross-app release governance (Web + Mobile tag separation): [../release/README.md](../release/README.md)
