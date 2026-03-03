# AGENTS.md

Agent instructions for `apps/mobile`.

## Scope

- Applies to `apps/mobile/**`.
- Inherits repository-wide rules from root `AGENTS.md`.

## Stack and layout

- Runtime: Expo + React Native + TypeScript
- Route/screens: `apps/mobile/app`
- Reusable UI: `apps/mobile/components`
- Supporting modules: `apps/mobile/hooks`, `apps/mobile/services`, `apps/mobile/utils`

## Commands

Run from repo root:

- Start Expo dev: `yarn dev:mobile`
- Run Android: `yarn dev:mobile:android`
- Run iOS: `yarn dev:mobile:ios`
- Run Expo doctor: `yarn mobile:doctor`
- Run mobile tests: `yarn nx test mobile`

## Mobile implementation guidance

- Prefer existing shared components/hooks before adding new ones.
- Keep Expo Router patterns consistent with current app structure.
- Avoid web-only APIs in mobile code paths.
- Keep platform-specific behavior explicit and minimal.

## Testing expectations

- Add/update mobile tests when behavior changes.
- Validate changed flows with project-scoped checks first.

## References

- `apps/mobile/README.md`
- `docs/mobile/troubleshoot`
