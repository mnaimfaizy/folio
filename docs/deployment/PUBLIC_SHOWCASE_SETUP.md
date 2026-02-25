# Public Showcase Setup Guide

This guide is for a user who wants to present a personal collection publicly without enabling borrowing/request workflows.

## Goal

Run Folio as a public catalog showcase where visitors can browse books/authors, while loan/request and personal collection flows are hidden.

## Recommended profile

Use the `Public Showcase` profile preset.

## Setup paths

You can use either:

- Local setup (same as development setup), then expose publicly later.
- Public deployment (for example cPanel flow).

For deployment packaging and cPanel details, see:

- [CPANEL_CD.md](CPANEL_CD.md)

## Apply Public Showcase profile

1. Sign in as admin.
2. Go to `Admin → Settings`.
3. In `Profile Presets`, click `Public Showcase`.
4. Confirm the dialog.
5. Reload the page.

## What changes in Public Showcase profile

- Showcase landing page variant is used.
- Public pages remain available:
  - Home
  - Books
  - Authors
  - Optional About/Contact (based on settings)
- These pages/workflows are hidden or blocked:
  - `My Collection`
  - `Request Book`
  - `My Loans`
  - Admin `Requests`
  - Admin `Loans`
- Admin settings tabs are reduced to showcase-relevant sections:
  - General
  - Pages
  - Hero
  - Stats
  - About
  - Footer
  - Contact

## Content checklist for a strong showcase

- Add high-quality covers and descriptions to featured books.
- Keep author biographies concise and public-friendly.
- Configure hero title/subtitle for your audience.
- Enable About and Contact pages if you want visitor context.
- Review footer links and social links for public visitors.

## Safety checklist before going public

- Change default admin password immediately.
- Keep API credentials/secrets only in environment variables.
- If exposing on internet, use HTTPS and secure host settings.
- Disable any feature you do not need.

## Troubleshooting

- Profile changed but UI still looks old: reload the page.
- Requests/loans still visible in old tab: hard refresh and re-login.
- Public site missing content: verify books/authors exist and are not draft-like placeholders.

## Switching back

If you later need full operations:

1. Go to `Admin → Settings → Profile Presets`.
2. Select `Library`.
3. Confirm and reload.

This re-enables loans/request workflows and full admin tabs.
