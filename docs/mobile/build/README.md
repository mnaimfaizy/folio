# Mobile build guide (Android + iOS)

This runbook covers binary builds for the Expo app in `apps/mobile` using the current Nx and EAS setup.

## Scope

- App: `apps/mobile`
- Build profiles: `development`, `preview`, `production` from `apps/mobile/eas.json`
- Build commands via Nx/Expo executors from `apps/mobile/project.json`

## Prerequisites

- Expo account and authenticated CLI (`npx eas login`)
- Apple Developer account (for iOS device/App Store builds)
- Google Play Console account (for Android store builds)
- App identifiers configured in `apps/mobile/app.json`:
  - iOS bundle id: `expo.ios.bundleIdentifier`
  - Android package: `expo.android.package`

## Build profile summary

- `development`: internal development client build
- `preview`: internal distribution (`.apk` on Android, simulator build for iOS)
- `production`: store-ready build (`.aab` on Android)

## Option A (default): EAS cloud builds

Run from repository root.

### Android

Internal testing (`preview`):

```sh
yarn nx run mobile:build --platform android --profile preview
```

Production store bundle (`production`):

```sh
yarn nx run mobile:build --platform android --profile production
```

### iOS

Internal simulator build (`preview`):

```sh
yarn nx run mobile:build --platform ios --profile preview
```

Production/App Store build (`production`):

```sh
yarn nx run mobile:build --platform ios --profile production
```

### Check build results

```sh
yarn nx run mobile:build-list --platform all
```

## Option B: local builds (`--local`)

Use this when you need local artifacts or cloud build is not available.

### Android local

```sh
yarn nx run mobile:build --platform android --profile production --local
```

### iOS local

```sh
yarn nx run mobile:build --platform ios --profile production --local
```

Local iOS builds require macOS + Xcode toolchain.

## Credentials and signing

For both local and cloud builds, EAS manages credentials by default when prompted.

Credential policy and secret ownership are documented in [../security/README.md](../security/README.md).

## When a rebuild is required

Rebuild native binaries (do not rely on OTA-only changes) when any of these change:

- Expo SDK or React Native version
- Native dependencies/plugins
- App permissions
- Bundle identifiers/package name
- Native config under `apps/mobile/android` or `apps/mobile/ios`

## Next step

After a successful build, deploy via [../deploy/README.md](../deploy/README.md).
