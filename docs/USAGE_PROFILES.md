# Folio Usage Profiles

This document describes the 3 supported usage profiles in Folio and what each profile enables/hides.

The active profile is saved as `usage_profile` in site settings and defaults to `library`.

Profile presets are available in **Admin → Settings → Profile Presets**.

> After changing a profile, reload the page to apply all UI changes.

## Profile 1: Single User (Minimal, local-first)

**Who it is for**

- One person managing their own books locally.

**Intent**

- Keep the app minimal.
- Remove multi-user/library workflows.

**Implemented behavior**

- Minimal single-user landing page variant.
- Footer is reduced to copyright-only.
- `My Collection`, `Request Book`, and loan pages are hidden/blocked.
- Admin navigation hides: `Users`, `Reviews`, `Requests`, `Loans`.
- Admin dashboard is reduced to essential modules.
- Admin settings tabs are reduced to: `General`, `Pages`, `Hero`.

See: [deployment/SINGLE_USER_MINIMAL_SETUP.md](deployment/SINGLE_USER_MINIMAL_SETUP.md)

---

## Profile 2: Library (multi-user operations)

**Who it is for**

- Libraries and teams running the full system.

**Intent**

- Full catalog + users + loans + requests.

**Implemented behavior**

- Full landing page and full navigation.
- `My Collection`, loans, and request workflows are enabled.
- Full admin navigation and dashboard modules.
- Full admin settings tabs.

---

## Profile 3: Public Showcase (collection showcase)

**Who it is for**

- A person showcasing their collection publicly.

**Intent**

- Public catalog experience without borrowing/request workflows.

**Implemented behavior**

- Showcase landing page variant.
- `My Collection`, loans, and request pages are hidden/blocked.
- Admin `Requests` and `Loans` pages are hidden/blocked.
- Admin settings tabs include only showcase-relevant tabs:
  `General`, `Pages`, `Hero`, `Stats`, `About`, `Footer`, `Contact`.

See: [deployment/CPANEL_CD.md](deployment/CPANEL_CD.md)
See also: [deployment/PUBLIC_SHOWCASE_SETUP.md](deployment/PUBLIC_SHOWCASE_SETUP.md)

---

## Behavior Matrix

| Area                                 | Single User          | Library                    | Showcase                                            |
| ------------------------------------ | -------------------- | -------------------------- | --------------------------------------------------- |
| Landing page                         | Minimal variant      | Full library landing       | Showcase variant                                    |
| Header collection/loan links         | Hidden               | Visible                    | Hidden                                              |
| Public books/authors pages           | Enabled              | Enabled                    | Enabled                                             |
| `/my-collection`                     | Blocked              | Enabled                    | Blocked                                             |
| `/request-book`                      | Blocked              | Enabled                    | Blocked                                             |
| `/my-loans`                          | Blocked              | Enabled (if loans enabled) | Blocked                                             |
| Admin nav: Users/Reviews             | Hidden               | Visible                    | Visible                                             |
| Admin nav: Requests/Loans            | Hidden               | Visible                    | Hidden                                              |
| Admin dashboard requests/loans cards | Hidden               | Visible                    | Hidden                                              |
| Admin settings tabs                  | General, Pages, Hero | All tabs                   | General, Pages, Hero, Stats, About, Footer, Contact |

## How to choose

1. Open **Admin → Settings → Profile Presets**.
2. Pick `Single User`, `Library`, or `Public Showcase`.
3. Confirm preset.
4. Reload page.

Quick rule:

- **Single User**: one-person local usage.
- **Library**: full operational mode.
- **Public Showcase**: display collection publicly without loan/request workflows.
