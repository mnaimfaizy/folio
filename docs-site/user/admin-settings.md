---
title: Admin Settings
---

# Admin Settings

The **Admin → Settings** panel controls how Folio looks and behaves. Changes here are saved to the database and take effect on reload.

---

## Settings tabs

The tabs available depend on your active [usage profile](./profiles). The table below shows which tabs appear in each profile.

| Tab      | Single User | Library | Public Showcase |
| -------- | ----------- | ------- | --------------- |
| General  | ✅          | ✅      | ✅              |
| Pages    | ✅          | ✅      | ✅              |
| Hero     | ✅          | ✅      | ✅              |
| Stats    | ❌          | ✅      | ✅              |
| About    | ❌          | ✅      | ✅              |
| Footer   | ❌          | ✅      | ✅              |
| Contact  | ❌          | ✅      | ✅              |
| Users    | ❌          | ✅      | ✅              |
| Reviews  | ❌          | ✅      | ✅              |
| Loans    | ❌          | ✅      | ❌              |
| Requests | ❌          | ✅      | ❌              |

---

## General tab

- **Site name** — shown in the browser tab and footer.
- **Site language** — affects date/text formatting.
- **Registration** — toggle whether new users can sign up.
- **Email verification** — require new users to verify their email before logging in.

---

## Profile Presets tab

Switch between **Single User**, **Library**, and **Public Showcase** profiles. See [Usage Profiles](./profiles) for full details.

---

## Pages tab

Enable or disable public-facing pages:

- About page
- Contact page

When disabled, those pages return a 404 and are removed from navigation.

---

## Hero tab

Customize the landing page hero section:

- **Title** — main heading on the home page
- **Subtitle** — tagline below the title
- **Background image** — upload or URL
- **CTA button text/link** — call-to-action button

---

## Stats tab _(Library + Showcase)_

Display collection statistics on the landing page:

- Total books, authors, genres
- Toggle visibility of each stat

---

## About tab _(Library + Showcase)_

Configure the About page content:

- Page title and body text
- Team/contact information

---

## Footer tab _(Library + Showcase)_

Customize links and text in the site footer.

---

## Contact tab _(Library + Showcase)_

Set up the Contact page with a form or plain contact details.

---

## Backup reminder

Settings are stored in the database. Regular database backups protect your configuration. See [Troubleshooting](./troubleshooting) for backup commands.

---

[Back to Loans & Requests](./loans) · [Troubleshooting →](./troubleshooting)
