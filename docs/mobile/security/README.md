# Mobile release security and credentials

This page defines where mobile release secrets belong and who should manage them.

## Rules

- Never commit credentials to the repository
- Never paste secret values into docs, issues, or PR comments
- Use provider secret managers only (Expo, Apple, Google, GitHub)

## Credential inventory

- Expo account / EAS auth token
- Apple App Store Connect credentials and signing assets
- Google Play service account credentials (for API submission)
- CI secrets for release automation

## Ownership model

- Platform owner manages Apple/Google app records and access
- Release owner manages EAS project access and release profiles
- CI owner manages repository/workflow secret configuration

## Rotation and revocation

- Rotate credentials when team access changes
- Revoke exposed tokens immediately
- Re-run credential validation before next release cycle

## Logging and redaction

- Do not upload screenshots containing keys or account IDs unless redacted
- If build logs contain sensitive metadata, store them in restricted channels

## Related guides

- Build: [../build/README.md](../build/README.md)
- Deploy: [../deploy/README.md](../deploy/README.md)
- CI/CD: [../ci/README.md](../ci/README.md)
