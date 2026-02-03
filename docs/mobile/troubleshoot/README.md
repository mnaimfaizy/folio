# Mobile troubleshooting (Nx + Expo)

This document captures the most common issues when running the Expo app in `apps/mobile` inside this Nx monorepo.

## Quick start (known-good)

From repo root:

```bash
yarn dev:mobile:android
```

Helpful diagnostics:

```bash
yarn mobile:doctor
```

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

1) Force regeneration of autolinking output:

```bash
rm -rf apps/mobile/android/build/generated/autolinking
cd apps/mobile/android
./gradlew app:assembleDebug -x lint -x test
```

2) If the generated `apps/mobile/android/build/generated/autolinking/autolinking.json` still points `react-native-screens.root` somewhere unexpected, revisit the autolinking search paths in `apps/mobile/android/settings.gradle`.

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

1) Ensure the module is listed in `apps/mobile/package.json`.
2) Rebuild the dev client:

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
