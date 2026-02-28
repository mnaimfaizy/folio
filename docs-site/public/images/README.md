# Images directory

This folder holds all static images, screenshots, animated GIFs, and diagram exports used in the documentation.

## Folder structure

```
images/
├── user/     ← Screenshots and GIFs for the User Guide
├── dev/      ← Diagrams, screenshots, and visuals for the Developer Guide
└── shared/   ← Logos, icons, and assets used across both guides
```

## Naming convention

`<page-slug>-<description>[-<variant>].<ext>`

Examples:

- `first-use-login-screen.png`
- `admin-settings-profile-presets.png`
- `profiles-apply-preset.gif`
- `architecture-container-diagram.svg`

## Guidelines

- PNG for screenshots (max 1 MB)
- GIF for animated walkthroughs (max 5 MB, optimize with gifsicle)
- SVG or PNG for diagrams (SVG preferred)
- Use alt text for every image in Markdown
- Do NOT commit video files — link to YouTube/Vimeo instead

See [docs-contributing.md](../../dev/docs-contributing.md) for full details.
