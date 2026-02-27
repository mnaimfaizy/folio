---
title: Loans & Requests
---

# Loans & Requests

::: info Library profile required
Loan and request features are only available in the **Library** usage profile. In Single User or Public Showcase mode, these workflows are hidden. See [Usage Profiles](./profiles) to switch.
:::

---

## How loans work

A **loan** is a record that tracks a physical book being borrowed by a user.

**Lifecycle:**

1. Admin creates a loan, assigning a book to a user with a due date.
2. The user can see their active loans at **My Loans**.
3. Admin marks the loan as returned when the book comes back.
4. Overdue loans trigger reminder emails automatically.

---

## Creating a loan (admin)

1. Go to **Admin → Loans**.
2. Click **New Loan**.
3. Select the user, the book, and set a due date.
4. Click **Create**.

The user will see the loan appear in their **My Loans** page.

---

## Marking a loan as returned

1. Go to **Admin → Loans**.
2. Find the loan (use the search/filter).
3. Click **Mark as Returned**.

---

## Overdue reminders

Folio runs a background job that checks for overdue loans and sends reminder emails. This runs automatically — no configuration needed for local development.

For production, ensure your email settings are configured in the environment file (see [Admin Settings](./admin-settings)).

---

## How book requests work

A **request** lets registered users ask for a book to be added to the library or reserved for them.

**Lifecycle:**

1. A registered user goes to **Request a Book** in the navigation.
2. They submit a request with book title, author, and a note.
3. Admin sees the request in **Admin → Requests**.
4. Admin can approve, reject, or fulfill the request.

---

## Managing requests (admin)

1. Go to **Admin → Requests**.
2. Click a request to open it.
3. Actions available:
   - **Approve** — accept the request, send confirmation to the user.
   - **Reject** — decline with an optional note.
   - **Mark Fulfilled** — the requested book has been added to the catalog.

---

## My Loans (user view)

Logged-in users can see their current and past loans at:

- Navigation → **My Loans**

Each entry shows the book, due date, and status (active / returned / overdue).

---

[Back to Managing Authors](./authors) · [Admin Settings →](./admin-settings)
