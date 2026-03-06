# Mobile troubleshooting (build + deploy)

This document captures common issues for local development, release builds, and store deployment for the Expo app in `apps/mobile`.

Related runbooks:

- Build: [../build/README.md](../build/README.md)
- Deploy: [../deploy/README.md](../deploy/README.md)
- OTA: [../ota/README.md](../ota/README.md)
- CI/CD: [../ci/README.md](../ci/README.md)

## Quick start (known-good)

From repo root:

```bash
yarn dev:mobile:android
```

Helpful diagnostics:

```bash
yarn mobile:doctor
```

## Build-time failures (EAS/local)

### Credential or signing prompt loops

Symptom:

- EAS repeatedly asks for credentials or fails to validate signing assets.

Fix:

1. Confirm authenticated Expo account (`npx eas whoami`).
2. Re-run with explicit profile/platform and complete credential prompts.
3. If access recently changed, refresh or rotate credentials per [../security/README.md](../security/README.md).

### iOS local build fails on non-macOS

Symptom:

- `--local` iOS build fails immediately.

Cause:

- Local iOS builds require macOS + Xcode.

Fix:

- Use EAS cloud builds for iOS from non-macOS environments.

### Android local build fails with SDK/NDK mismatch

Symptom:

- Gradle fails with Android SDK/NDK or Java mismatch errors.

Fix:

- Use the EAS cloud path for consistent toolchains, or align local Android SDK/Java setup with Expo requirements.

## Logs & debugging

### React Native DevTools

Metro supports opening React Native DevTools:

- Press `j` in the Metro terminal to open DevTools (requires Chrome or Edge).

If you’re running Metro via Nx and keypresses don’t seem to work, click the terminal that is running Metro first (so it has focus).

### Android logs (adb)

To see JS + native crashes from the emulator/device:

```bash
adb devices
adb -s emulator-5554 logcat -v time ReactNativeJS:V AndroidRuntime:E Expo:V *:S
```

## Android: app builds but crashes (screens/view managers)

### Symptom

Red screen or crash mentioning missing view managers such as:

- `ViewManagerResolver returned null for either RNSScreenContentWrapper...`
- Missing `RNSScreen...` view managers

### Cause (monorepo)

Autolinking can accidentally resolve native modules from an unexpected location (or from a non-existent `apps/mobile/node_modules`), producing an Android build that either:

- doesn’t include the expected native views, or
- can’t resolve the Gradle module variants.

### Fix

This repo is configured to make Expo/RN autolinking search the hoisted workspace `node_modules`.

If this regresses, verify:

- `apps/mobile/android/settings.gradle` includes the monorepo root `node_modules` in the autolinking search paths.

Then do a clean rebuild:

```bash
rm -rf apps/mobile/android/build
cd apps/mobile/android
./gradlew clean
cd ../../..
yarn dev:mobile:android
```

## Android build error: “No matching variant … project :react-native-screens … No variants exist”

### Symptom

Gradle fails resolving `:react-native-screens` with an error like:

- `No matching variant of project :react-native-screens was found... No variants exist.`

### Likely cause

Autolinking generated `autolinking.json` pointing `react-native-screens.root` to a wrong path (often under `apps/mobile/node_modules`).

### Fix

1. Force regeneration of autolinking output:

```bash
rm -rf apps/mobile/android/build/generated/autolinking
cd apps/mobile/android
./gradlew app:assembleDebug -x lint -x test
```

2. If the generated `apps/mobile/android/build/generated/autolinking/autolinking.json` still points `react-native-screens.root` somewhere unexpected, revisit the autolinking search paths in `apps/mobile/android/settings.gradle`.

## Metro bundler error: cannot resolve Node built-ins (e.g. crypto)

### Symptom

Metro fails with errors like:

- `Cannot resolve "crypto"`

### Cause

Some packages (notably `axios`) can resolve to a Node-targeted build in monorepo setups, which pulls Node core modules that Metro can’t bundle.

### Fix

The repo’s Metro config forces the browser bundle of axios:

- `apps/mobile/metro.config.js` overrides resolution for `axios` to `axios/dist/browser/axios.cjs`.

If you change networking libraries, re-check that Metro isn’t pulling Node core modules.

## Native module missing at runtime (e.g. ExpoLinking)

### Symptom

Runtime error like:

- `Cannot find native module 'ExpoLinking'`

### Likely cause

The app is being run as a development build (dev client), but the module isn’t installed/linked in the native build or versions drifted.

### Fix

1. Ensure the module is listed in `apps/mobile/package.json`.
2. Rebuild the dev client:

```bash
yarn dev:mobile:android
```

If you previously had an `apps/mobile/node_modules` directory, delete it—native tooling can accidentally resolve modules from there.

## Watchman recrawl warnings

### Symptom

Metro prints Watchman warnings like:

- `Recrawled this watch ... MustScanSubDirs UserDropped`

### Fix

```bash
watchman watch-del '/Users/naimfaizy/folio'
watchman watch-project '/Users/naimfaizy/folio'
```

## API calls fail on Android (localhost issues)

### Symptom

Requests to the API fail on Android when using `http://localhost:3000`.

### Cause

On an Android emulator/device, `localhost` refers to the device itself, not your Mac.

### Fix

Use:

- Android emulator: `http://10.0.2.2:3000`

This repo also includes logic to rewrite localhost appropriately during development.

## Submission failures (store deploy)

### Android submit fails with Play API auth errors

Symptom:

- `mobile:submit` fails for Android with authorization/permission errors.

Fix:

1. Verify Google Play service account has correct Play Console permissions.
2. Confirm credentials in your chosen secret store.
3. Retry submit after validating the app record and track availability.

### iOS submit fails in App Store Connect

Symptom:

- Submission fails with App Store Connect auth/app metadata errors.

Fix:

1. Confirm app record exists in App Store Connect.
2. Verify account roles and credentials used by submission flow.
3. Ensure the uploaded build matches expected bundle identifier/versioning.

### Build appears in TestFlight but cannot be released

Symptom:

- Build is uploaded but blocked from release.

Fix:

- Complete required App Store metadata/compliance sections in App Store Connect.
- Re-submit if binary metadata/version increments are required.

## OTA/update-specific issues

### OTA published but users do not receive update

Common causes:

- Update published to wrong channel
- Runtime version incompatibility with installed binary

Fix:

1. Verify update channel used during publish.
2. Verify runtime compatibility policy and rebuild when native changes exist.
3. If required, publish to correct channel and re-test.

## Clean-slate reset (last resort)

If things get into a confusing state:

```bash
# from repo root
rm -rf apps/mobile/android/build
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*
yarn install

yarn mobile:doctor
yarn dev:mobile:android
```

## Escalation checklist

When escalating a release issue, include:

- Platform (`android`/`ios`)
- Build profile (`development`/`preview`/`production`)
- Whether build was cloud or local
- Full command used
- Link or ID of failed EAS build/submit job
