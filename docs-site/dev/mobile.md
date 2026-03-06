---
title: Mobile Build & Release
---

# Mobile Build & Release

This page gives a developer overview for building, deploying, and operating the Expo mobile app in this Nx monorepo.

---

## Canonical runbooks

Mobile release operations are maintained in `docs/mobile/*`.

- Build (Android + iOS): [docs/mobile/build/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/build/README.md)
- Deploy (Play Console + App Store Connect): [docs/mobile/deploy/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/deploy/README.md)
- Troubleshooting: [docs/mobile/troubleshoot/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/troubleshoot/README.md)
- OTA basics (EAS Update): [docs/mobile/ota/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/ota/README.md)
- CI options (GitHub Actions + EAS Workflows): [docs/mobile/ci/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/ci/README.md)
- Security and credentials: [docs/mobile/security/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/security/README.md)
- Mobile release process: [docs/mobile/release/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/mobile/release/README.md)
- Cross-app release governance: [docs/release/README.md](https://github.com/mnaimfaizy/folio/blob/main/docs/release/README.md)

---

## Tooling model

- App framework: Expo + React Native
- Monorepo orchestration: Nx (`@nx/expo` targets)
- Build/deploy service: EAS Build + EAS Submit
- OTA updates: EAS Update (JS/assets only)

---

## Recommended release flow

1. Run checks (`yarn nx test mobile` + any required workspace checks)
2. Build binaries using `mobile:build` with `preview` or `production`
3. Submit via `mobile:submit` or platform console upload
4. Roll out internal/testing track first, then production
5. Use OTA only for compatible JS/assets patches

---

[Deployment →](./deployment) · [Environment Config →](./env-config)
