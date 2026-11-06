# Crewbase

**A full-stack team and role-based access control (RBAC) management platform built with Next.js 16, Prisma, and PostgreSQL.**

Crewbase lets organisations manage users, teams, and permissions through a secure, role-aware dashboard. Authentication is handled with hashed passwords and JWTs in cookies, every protected route is checked against the caller's role, and the UI adapts to what each role is allowed to do.

> **Status:** ✅ Backend and frontend phases complete. Latest work lives on the [`develop` branch](https://github.com/itsarman001/crewbase/tree/develop).

<!-- Add screenshots or a short GIF here. This is the single biggest upgrade to a README:
![Login](./docs/login.png)
![Dashboard](./docs/dashboard.png)
-->

---

## Why I built this

I'm a frontend developer who wanted to own the whole stack, not just the UI. Crewbase is how I learned backend engineering end to end: schema design, password hashing, token-based auth, RBAC enforcement, and wiring all of it into a modern React frontend.

It started from an existing reference project. From there I made my own choices (Dockerised Postgres, pnpm, shadcn/ui, my own structure) and added features of my own. Notes on decisions, challenges, and a dated changelog are in my [knowledge vault](https://github.com/itsarman001).

---

## Features

**Authentication**
- Register, login, logout, and "current user" endpoints
- Passwords hashed with `bcryptjs`
- JWTs issued on login and stored in cookies
- Server-side validation on all inputs

**Authorisation (RBAC)**
- Four roles: Admin, Manager, User, Guest
- Middleware verifies the JWT and the caller's role before protected routes run
- Reusable permission-check helper

**Team and user management**
- Users, teams, and roles endpoints
- Assign roles and manage team members

**Frontend**
- Role-based dashboard that shows each role only what it can access
- Auth context for client-side session state
- Forms powered by server actions and `useActionState`
- UI built with shadcn/ui, designed in Google Stitch

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, server and client components, server actions) |
| Language | TypeScript |
| Database | PostgreSQL 17 (Docker) |
| ORM | Prisma 6 |
| Auth | JWT (`jsonwebtoken`), `bcryptjs`, HTTP cookies |
| UI | shadcn/ui, Tailwind CSS |
| Tooling | pnpm, Docker Compose |

---

## Roles

| Role | Intended access |
|---|---|
| **Admin** | Full control over users, teams, and role assignment |
| **Manager** | Manage their team and its members |
| **User** | Standard access to their own team's resources |
| **Guest** | Limited, read-only access |

---

## API overview

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Users | Create, read, update, delete users |
| Teams | Create teams, list teams, manage membership |
| Access | Assign roles, add or remove team members |

Protected routes pass through middleware that verifies the JWT and checks the caller's role before the handler runs.

---

## Getting started

### Prerequisites
- Node.js (LTS)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) with Docker Compose

### Setup

```bash
# 1. Clone
git clone https://github.com/itsarman001/crewbase.git
cd crewbase

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# then edit .env (see below)

# 4. Start PostgreSQL
docker compose up -d

# 5. Apply migrations and generate the Prisma client
pnpm prisma migrate dev

# 6. Run the app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/crewbase` |
| `JWT_SECRET` | Secret used to sign tokens. Use a long random string. |

---

## Project structure

```
crewbase/
├── prisma/            # Schema and migrations
├── src/
│   ├── app/           # App Router pages, layouts, and API route handlers
│   ├── components/    # UI components (shadcn/ui and app-specific)
│   ├── lib/           # Auth helpers: hashing, tokens, permission checks
│   └── ...
├── docker-compose.yml # Local PostgreSQL
└── ...
```

---

## Key decisions

- **Prisma 6 over 7:** downgraded to 6.19.0 to keep dependencies stable while learning.
- **Docker for Postgres:** one `docker compose up` gives a reproducible database on any machine.
- **pnpm over npm:** noticeably faster installs.
- **Role checks in middleware:** authorisation is enforced centrally rather than scattered across handlers.

---

## Roadmap

- [x] Project setup (Next.js 16, pnpm, Docker Postgres)
- [x] Prisma schema and migrations
- [x] Auth helpers (hashing, tokens, permission checks)
- [x] Register, login, logout, and `me` endpoints
- [x] JWT and role middleware
- [x] Users, teams, and roles endpoints
- [x] shadcn/ui frontend with role-based dashboard
- [ ] Automated tests
- [ ] Deployment

---

## What I learned

- Designing relational schemas and migrations with Prisma and PostgreSQL
- Secure password handling and stateless auth with JWTs and cookies
- Modelling RBAC and enforcing it in middleware
- Next.js 16 App Router: server vs client components, server actions, `useActionState`
- Running a reproducible dev environment with Docker

---

## Author

**Arman**, Frontend Developer
GitHub: [@itsarman001](https://github.com/itsarman001)
