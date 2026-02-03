# Folio Mobile

Expo + React Native mobile app for Folio. In this repo it’s run via Nx from the workspace root.

## Run (local)

Start the Expo dev server:

```sh
yarn dev:mobile
```

Run on devices:

```sh
yarn dev:mobile:android
yarn dev:mobile:ios

# or directly via Nx
yarn nx run mobile:run-android
yarn nx run mobile:run-ios
```

Notes:

- Android runs require Android Studio + an emulator (or a connected device with USB debugging enabled).
- If you change the app identifiers in `apps/mobile/app.json` (`expo.android.package` / `expo.ios.bundleIdentifier`), you may need to re-install the app on the device/emulator.

## API URL configuration

Mobile requests use `apps/mobile/app.json` → `expo.extra.apiUrl` (or `EXPO_PUBLIC_API_URL`).

For local dev:

- On Android emulator we automatically rewrite `localhost` → `10.0.2.2`.
- On a physical Android device, set `apiUrl` to your machine’s LAN IP (e.g. `http://192.168.1.10:3000/api`).

## React Native DevTools (logs)

When Metro is running, press `j` in the Metro terminal to open React Native DevTools in your browser.

If you’re running through Nx and keypresses don’t get forwarded, re-run the mobile command in a plain terminal and then press `j`.

## Tests

```sh
yarn nx test mobile
```

## Troubleshooting

See the workspace troubleshooting guide:

- [docs/mobile/troubleshoot/README.md](../../docs/mobile/troubleshoot/README.md)

Run Expo environment checks:

```sh
yarn mobile:doctor
```

This uses the locally installed `expo-doctor` (pinned in the repo) for repeatable runs.

Pass flags to `expo-doctor` via Nx `--args` (this avoids conflicts with Nx CLI flags like `--help`):

```sh
yarn mobile:doctor --args="--help"
```
