# Folio Web

Vite + React + TypeScript web app for Folio. In this repo it’s run via Nx from the workspace root.

## Run (local)

```sh
yarn dev:web
```

- Web: http://localhost:4200

## API base URL

The web app reads the API base URL from `import.meta.env.VITE_API_URL`.

- Copy `apps/web/.env.example` to `apps/web/.env`.
- Default: `http://localhost:3000`

## Build / test / lint

From the repo root:

```sh
yarn nx build web
yarn nx test web
yarn nx lint web
```
