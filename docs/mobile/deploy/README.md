# Mobile deployment guide (Android + iOS)

This runbook covers store deployment for Folio mobile after binaries are built.

## Release flow

1. Build signed binaries (see [../build/README.md](../build/README.md))
2. Validate app metadata/versioning
3. Submit to store (EAS submit or manual upload)
4. Roll out (internal/closed/testing first, then production)

## Android deployment (Google Play)

### Prerequisites

- Google Play Console app created
- First app setup completed in Play Console (store listing, content rating, policy forms)
- Service account configured for Play API if you want non-interactive submission

### Submit using EAS (recommended)

Build first:

```sh
yarn nx run mobile:build --platform android --profile production
```

Submit:

```sh
yarn nx run mobile:submit --platform android --profile production
```

### Manual upload alternative

If required, download the built `.aab` artifact and upload it in Play Console:

- Internal testing track first
- Closed testing (optional)
- Production rollout after validation

## iOS deployment (App Store Connect)

### Prerequisites

- Apple Developer Program active
- App record created in App Store Connect
- Certificates/profiles available via EAS credential flow

### Submit using EAS (recommended)

Build first:

```sh
yarn nx run mobile:build --platform ios --profile production
```

Submit:

```sh
yarn nx run mobile:submit --platform ios --profile production
```

The submitted build appears in TestFlight first. Final App Store release is completed in App Store Connect.

### Manual upload alternative

Use Transporter/Xcode upload if your process requires manual delivery.

## Versioning checklist

Before production submission, verify:

- `apps/mobile/app.json` `expo.version`
- Android version code and iOS build number strategy used by your release process
- Release notes prepared for each platform

## Rollback strategy

- Android: halt rollout or revert track promotion in Play Console
- iOS: stop phased release or reject pending release in App Store Connect
- For JS-only regressions, see OTA guidance in [../ota/README.md](../ota/README.md)

## CI/CD options

Automated release options are documented in [../ci/README.md](../ci/README.md).

## Troubleshooting

If submission fails, use [../troubleshoot/README.md](../troubleshoot/README.md).
