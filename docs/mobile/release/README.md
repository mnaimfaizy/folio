# Mobile release process

This runbook defines the standard process for releasing mobile app versions.

## Naming and versioning

- Branch: `mobile/vx.y.z`
- Tag: `mobile/vx.y.z`
- Version format: semantic version (`x.y.z`), example `1.1.1`

## End-to-end flow

1. Pick the release version (`x.y.z`).
2. Create release branch:

   ```sh
   yarn release:mobile:prepare -- --version 1.1.1 --push
   ```

3. Update version and release metadata (for example `apps/mobile/app.json` and any release artifacts required by your process).
4. Open a PR from `mobile/vx.y.z` to `main` using the mobile release PR template:
   - [../../../.github/PULL_REQUEST_TEMPLATE/mobile-release.md](../../../.github/PULL_REQUEST_TEMPLATE/mobile-release.md)
5. Complete checklist: build + test Android/iOS, release notes, deployment readiness.
6. Merge PR after review and green checks.
7. Create and push release tag from the release branch commit:

   ```sh
   yarn release:mobile:tag -- --version 1.1.1 --push
   ```

8. Execute release deployment workflow:
   - GitHub Actions: `Mobile Release (EAS)`
   - or EAS Workflows file: `.eas/workflows/build-and-submit-production.yml`
9. Publish release notes to your release channel.

## Release notes

Release notes are mandatory for every mobile release.

- Starter template: [RELEASE_NOTES_TEMPLATE.md](./RELEASE_NOTES_TEMPLATE.md)

## Mobile PR checklist policy

The release PR must include, at minimum:

- Build on Android
- Build on iOS
- Test on Android
- Test on iOS
- Release notes present
- Deploy/submission plan for Android
- Deploy/submission plan for iOS

Use the official template:

- [../../../.github/PULL_REQUEST_TEMPLATE/mobile-release.md](../../../.github/PULL_REQUEST_TEMPLATE/mobile-release.md)

## References

- CI/CD options: [../ci/README.md](../ci/README.md)
- Build guide: [../build/README.md](../build/README.md)
- Deploy guide: [../deploy/README.md](../deploy/README.md)
- Troubleshooting: [../troubleshoot/README.md](../troubleshoot/README.md)
- Global release governance: [../../release/README.md](../../release/README.md)
