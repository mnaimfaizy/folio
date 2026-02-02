# Folio Mobile

Expo + React Native mobile app for Folio. In this repo it’s run via Nx from the workspace root.

## Run (local)

Start the Expo dev server:

```sh
yarn dev:mobile
```

Run on devices:

```sh
yarn nx run mobile:run-android
yarn nx run mobile:run-ios
```

## API URL configuration

Mobile requests use `apps/mobile/app.json` → `expo.extra.apiUrl` (and fall back to a hard-coded LAN URL if not set).

For local dev:

- If you’re using an emulator: `http://localhost:3000/api` usually works.
- If you’re using a physical device: set `apiUrl` to your machine’s LAN IP (e.g. `http://192.168.1.10:3000/api`).

## Tests

```sh
yarn nx test mobile
```
