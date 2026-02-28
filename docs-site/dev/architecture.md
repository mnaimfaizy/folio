---
title: Architecture
---

# Architecture

This page describes how Folio's parts fit together, from user interactions down to the database.

---

## System Context

The highest-level view: who uses Folio and what external services it talks to.

```mermaid
C4Context
  title System Context — Folio

  Person(admin, "Admin User", "Manages books, authors, loans, settings")
  Person(member, "Library Member", "Browses catalog, requests books, tracks loans")
  Person(visitor, "Public Visitor", "Browses catalog (showcase mode)")

  System(folio, "Folio", "Self-hosted book collection and library management system")

  System_Ext(openlibrary, "Open Library", "Book and author metadata (free)")
  System_Ext(googlebooks, "Google Books", "Book and author metadata (API key)")
  System_Ext(wikidata, "Wikidata", "Author biographical data (free SPARQL)")
  System_Ext(loc, "Library of Congress", "Book catalog (free)")
  System_Ext(isbndb, "ISBNdb", "ISBN data (paid)")
  System_Ext(worldcat, "WorldCat", "Union catalog (paid)")
  System_Ext(uploadthing, "Uploadthing", "File / cover image storage")
  System_Ext(smtp, "SMTP server", "Loan reminder and auth emails")

  Rel(admin, folio, "Uses via browser or mobile")
  Rel(member, folio, "Uses via browser or mobile")
  Rel(visitor, folio, "Browses via browser")

  Rel(folio, openlibrary, "Fetches book/author metadata")
  Rel(folio, googlebooks, "Fetches book/author metadata")
  Rel(folio, wikidata, "Fetches author data via SPARQL")
  Rel(folio, loc, "Fetches book metadata")
  Rel(folio, isbndb, "Fetches ISBN data")
  Rel(folio, worldcat, "Fetches catalog data")
  Rel(folio, uploadthing, "Stores uploaded cover images")
  Rel(folio, smtp, "Sends reminder and verification emails")
```

---

## Container Diagram

The internal moving parts of Folio and how they communicate.

```mermaid
C4Container
  title Container Diagram — Folio

  Person(user, "User / Admin", "Browser or mobile device")

  Container_Boundary(folio, "Folio") {
    Container(web, "Web App", "Vite + React", "Admin panel and public catalog UI. Served on port 4200 in dev.")
    Container(mobile, "Mobile App", "Expo / React Native", "iOS and Android companion app")
    Container(api, "REST API", "Express + TypeScript", "All business logic, data access, and external integrations. Port 3000.")
    ContainerDb(db, "PostgreSQL", "PostgreSQL 15", "All application data: books, authors, users, loans, settings")
    Container(shared, "Shared Library", "TypeScript (libs/shared)", "Shared DTOs, contracts, auth helpers, and validation utilities")
  }

  System_Ext(external, "External Book/Author APIs", "OpenLibrary, Google Books, Wikidata, etc.")
  System_Ext(uploadthing, "Uploadthing", "File storage")
  System_Ext(smtp, "SMTP", "Email delivery")

  Rel(user, web, "Uses", "HTTPS / HTTP")
  Rel(user, mobile, "Uses", "HTTPS / HTTP")
  Rel(web, api, "Calls", "REST / JSON over HTTP (VITE_API_URL)")
  Rel(mobile, api, "Calls", "REST / JSON over HTTP")
  Rel(api, db, "Reads/writes", "SQL via pg pool")
  Rel(api, external, "Fetches metadata", "HTTPS")
  Rel(api, uploadthing, "Stores files", "HTTPS SDK")
  Rel(api, smtp, "Sends emails", "SMTP")
  Rel(web, shared, "Imports types")
  Rel(mobile, shared, "Imports types")
  Rel(api, shared, "Imports types")
```

---

## API Request Flow

How a typical authenticated request moves through the API layers.

```mermaid
sequenceDiagram
  participant Client as Web / Mobile
  participant MW as Middleware<br/>(auth, rate limit, CORS)
  participant Router as Router
  participant Controller as Controller
  participant Service as Service
  participant Repo as Repository
  participant DB as PostgreSQL

  Client->>MW: HTTP Request + JWT header
  MW->>MW: Verify JWT, attach req.user
  MW->>Router: Authorized request
  Router->>Controller: Route match → handler(req, res)
  Controller->>Controller: Parse & validate request body
  Controller->>Service: Call domain method with clean args
  Service->>Service: Apply business rules
  Service->>Repo: Query / mutation call
  Repo->>DB: SQL query via pg pool
  DB-->>Repo: Result rows
  Repo-->>Service: Typed domain objects
  Service-->>Controller: Result or error
  Controller-->>Client: HTTP response (status + JSON)
```

---

## Monorepo Structure

How the Nx workspace is organized.

```mermaid
graph TD
  subgraph Workspace["Nx Workspace (repo root)"]
    subgraph Apps["apps/"]
      API["apps/api<br/>Express REST API"]
      WEB["apps/web<br/>Vite + React"]
      MOB["apps/mobile<br/>Expo"]
    end
    subgraph Libs["libs/"]
      SHARED["libs/shared<br/>Contracts · Auth · Validation · Utils"]
    end
    subgraph Infra["Infrastructure"]
      DC["docker-compose.yml<br/>Postgres + PgAdmin + Mailhog"]
      SQL["docker/postgres/init/<br/>001_schema.sql · 002_seed.sql · 003_settings.sql"]
    end
    subgraph CI["GitHub Actions (.github/workflows/)"]
      CIFLOW["ci.yml — lint, test, build (affected)"]
      CDFLOW["cd-cpanel.yml — deploy API + Web to cPanel"]
      DOCS["docs.yml — build + deploy VitePress to Pages"]
    end
  end

  API -->|imports| SHARED
  WEB -->|imports| SHARED
  MOB -->|imports| SHARED
  API -->|reads| SQL
  DC -->|init volumes| SQL
```

---

## API Internal Layers

The four-layer architecture inside `apps/api`.

```mermaid
graph LR
  subgraph HTTP["HTTP Layer"]
    R["routes/*.ts<br/>Endpoint + middleware declarations"]
  end
  subgraph AppLayer["Application Layer"]
    C["controllers/*.ts<br/>Parse req · map status codes"]
    S["services/*.ts<br/>Business logic · orchestration"]
  end
  subgraph DataLayer["Data Layer"]
    Repo["repositories/*.ts<br/>SQL read/write operations"]
    DB[("PostgreSQL")]
  end
  subgraph Cross["Cross-cutting"]
    MDW["middleware/<br/>auth · CORS · rate-limit · error"]
    EXT["services/external*<br/>OpenLibrary · Wikidata · Google Books …"]
  end

  R --> C
  C --> S
  S --> Repo
  Repo --> DB
  S --> EXT
  MDW -.->|wraps| R
```

---

## Authentication Flow

How users authenticate and how the JWT token is used on subsequent requests.

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant DB

  Note over Client,DB: Login
  Client->>API: POST /auth/login { email, password }
  API->>DB: SELECT user WHERE email = ?
  DB-->>API: User row (with hashed password)
  API->>API: bcrypt.compare(password, hash)
  API-->>Client: { token, user }

  Note over Client,DB: Authenticated request
  Client->>API: GET /api/books<br/>Authorization: Bearer <accessToken>
  API->>API: verifyJWT(token) → req.user
  API->>DB: SELECT books...
  DB-->>API: Book rows
  API-->>Client: 200 { data: [...] }

  Note over Client,DB: Session validation
  Client->>API: GET /api/auth/me + Bearer token
  API->>DB: SELECT user WHERE id = ?
  DB-->>API: User row
  API-->>Client: 200 { user }
```

---

## Data Model (core entities)

Key relationships between the most important tables.

```mermaid
erDiagram
  users {
    bigint id PK
    string email
    string password
    string role
    boolean email_verified
    decimal credit_balance
    timestamp created_at
  }

  books {
    bigint id PK
    string title
    string isbn
    string isbn10
    string isbn13
    int available_copies
    decimal price_amount
    string shelf_location
    text description
    string cover
    timestamp created_at
  }

  authors {
    bigint id PK
    string name
    text biography
    text birth_date
  }

  author_books {
    bigint author_id FK
    bigint book_id FK
    boolean is_primary
  }

  book_loans {
    bigint id PK
    bigint book_id FK
    bigint user_id FK
    decimal loan_credit_amount
    string status
    timestamp due_date
    timestamp returned_at
  }

  book_requests {
    bigint id PK
    bigint requested_by_user_id FK
    string request_key
    string status
    timestamp created_at
  }

  site_settings {
    int id PK
    string usage_profile
    boolean loans_enabled
    decimal minimum_credit_balance
    string credit_currency
    boolean manual_cash_payment_enabled
    boolean online_payment_enabled
    timestamp updated_at
  }

  authors ||--o{ author_books : "linked"
  books ||--o{ author_books : "linked"
  users ||--o{ book_loans : "borrows"
  books ||--o{ book_loans : "is loaned"
  users ||--o{ book_requests : "submits"
```

---

## Deployment Topology (production)

How a typical cPanel/shared hosting deployment looks.

```mermaid
graph TD
  subgraph Internet
    BROWSER["User's Browser"]
    MOBILEAPP["Mobile App"]
  end

  subgraph cPanel["cPanel Host"]
    NGINX["Web Server / Passenger<br/>(Apache / LiteSpeed)"]
    WEB_STATIC["Web (static build)<br/>dist/ served as files"]
    API_NODE["API (Node.js via Passenger)<br/>apps/api built bundle"]
    PG["PostgreSQL<br/>(local service or external managed instance)"]
  end

  subgraph GH["GitHub"]
    GH_PAGES["GitHub Pages<br/>VitePress Docs Site"]
  end

  BROWSER -->|HTTPS| NGINX
  MOBILEAPP -->|HTTPS| NGINX
  NGINX -->|static files| WEB_STATIC
  NGINX -->|/api proxy| API_NODE
  API_NODE --> PG

  BROWSER -->|docs.github.io/folio-docs| GH_PAGES
```

---

## Next steps

- [Project Structure](./project-structure) — file-by-file breakdown
- [API Guide](./api-guide) — patterns and conventions in depth
- [Adding Features](./adding-features) — step-by-step feature workflow
