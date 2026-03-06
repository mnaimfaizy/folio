# OTA basics (EAS Update)

Use OTA updates for JavaScript and static asset changes only.

## What OTA can and cannot do

OTA can deliver:

- JavaScript/TypeScript logic changes
- UI changes
- Bundled assets

OTA cannot deliver:

- Native dependency changes
- Expo SDK/React Native upgrades
- Permission changes requiring native rebuild

If a change touches native layers, rebuild and redeploy binaries via [../build/README.md](../build/README.md) and [../deploy/README.md](../deploy/README.md).

## Suggested channel model

- `preview`: internal QA/beta updates
- `production`: end-user stable updates

Keep build profile and update channel mapping explicit in your release process.

## Runtime version policy

Set a runtime version strategy so updates only apply to compatible binaries.

Recommended baseline:

- Bump runtime compatibility when native code/dependencies change
- Keep runtime stable for JS-only patch releases

## Publish OTA updates

Run from repository root.

Preview channel update:

```sh
yarn nx run mobile:update --channel preview --message "Preview OTA"
```

Production channel update:

```sh
yarn nx run mobile:update --channel production --message "Production OTA"
```

## Decision matrix

- JS/UI only change: OTA update is acceptable
- Native/plugin/config change: new build + store deployment required
- Unsure: choose full build/deploy path for safety

## Safety practices

- Ship to `preview` first
- Validate on both Android and iOS before production promotion
- Keep release notes for every OTA publish
