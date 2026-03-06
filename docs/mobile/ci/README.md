# Mobile CI/CD options

This page compares two supported automation paths for mobile release operations.

## Added starter automation in this repo

- GitHub Actions workflow: `.github/workflows/mobile-release.yml`
- EAS Workflows file: `.eas/workflows/build-and-submit-production.yml`
- Release branch/tag script: `tools/scripts/prepare-release.mjs`

## Branch + tag release automation

Create release branch:

```sh
yarn release:mobile:prepare -- --version 1.1.1 --push
```

Create release tag:

```sh
yarn release:mobile:tag -- --version 1.1.1 --push
```

Conventions enforced by script:

- Branch: `mobile/vx.y.z`
- Tag: `mobile/vx.y.z`
- Version: semantic version (`x.y.z`)

## Option 1: GitHub Actions

Use repository-managed workflows in `.github/workflows/*` to run EAS commands.

Good fit when:

- You want one CI platform for API, web, and mobile
- You need custom approval gates and release orchestration
- You already manage secrets in GitHub

Typical release job commands:

```sh
yarn nx run mobile:build --platform android --profile production --non-interactive
yarn nx run mobile:build --platform ios --profile production --non-interactive
yarn nx run mobile:submit --platform android --profile production
yarn nx run mobile:submit --platform ios --profile production
```

### How to run

1. Open GitHub Actions and run `Mobile Release (EAS)` manually.
2. Choose:
   - `platform`: `android`, `ios`, or `all`
   - `profile`: `production` / `preview` / `development`
   - `submit`: `true` to submit after build
3. Monitor build/submission in both GitHub Actions and EAS dashboard.

### Required GitHub secrets

- `EXPO_TOKEN` (required)

Optional but typically needed for non-interactive submission:

- App Store Connect credentials (for iOS submit)
- Google Play service account credentials (for Android submit)

## Option 2: EAS Workflows

Use Expo-hosted automation to run mobile build/submit pipelines.

Good fit when:

- You want a mobile-focused release pipeline with less CI plumbing
- Your team primarily releases through Expo tooling
- You prefer Expo-managed workflow UX and logs

### How to run

Run from repo root:

```sh
npx eas-cli@latest workflow:run .eas/workflows/build-and-submit-production.yml
```

You can also connect the repository in Expo and add `on.push`/`on.pull_request` triggers later.

## Recommended model for this monorepo

Hybrid model:

- Keep quality checks in GitHub Actions (tests/lint/build for affected projects)
- Trigger mobile build/submit through EAS workflows or EAS CLI from Actions

## Secret management

Store platform and EAS credentials in CI secret stores only.

See [../security/README.md](../security/README.md).

Store-specific CI credential setup:

- iOS CI submission guide: https://docs.expo.dev/submit/ios#submitting-your-app-using-cicd-services
- Android CI submission guide: https://docs.expo.dev/submit/android#submitting-your-app-using-cicd-services

## Minimum release checklist

- `mobile` tests pass (`yarn nx test mobile`)
- Build succeeds for target platform/profile
- Submission succeeds to TestFlight/Internal track
- Manual verification completed before production rollout
