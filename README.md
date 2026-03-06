# Construction Website Project

This workspace hosts a simple full‑stack construction portfolio application.

**Conceptual Architecture**

```
WEBSITE
  |
  ├─ PUBLIC (anyone)   – view only pages
  └─ ADMIN (login)     – manage content (projects, etc.)
```

Folder structure under `construction-website/`:

```
construction-website/
├── frontend/           # React components and UI
│   ├── pages/          # Public-facing pages
│   └── admin/          # Admin dashboard components
├── backend/            # Express server code
│   ├── routes/         # API endpoints
│   ├── models/         # Database schemas (Mongo/Mongoose example)
│   └── middleware/     # auth, etc.
└── database/           # schema & documentation
```

**Database**

Two main tables/collections:
- `users` (admin accounts)
- `projects` (portfolio entries)

Admin workflow:

```
Admin uploads project → saved in DB → public API serves projects → visitors see them
```

Dashboard features remain intentionally simple and mobile‑friendly.

For setup and further development, install dependencies, configure a database, and wire up frontend to backend.
