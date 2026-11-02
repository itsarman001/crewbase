# ARCHITECTURE: Crewbase

## 1. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| UI | shadcn/ui, Tailwind CSS, lucide-react |
| Database | PostgreSQL 17 (Docker, `postgres:17-alpine`) |
| ORM | Prisma 6.19.0 (`@prisma/client`) |
| Auth | `bcryptjs` (hashing), `jsonwebtoken` (JWT in httpOnly cookie) |
| Validation | Zod |
| Package manager | pnpm |

## 2. Layering

```
UI (components) → pages / server actions / route handlers → services → Prisma → PostgreSQL
                                   ↑
                         lib/auth + lib/permissions
```

| Layer | Responsibility | Must not |
|---|---|---|
| `app/**/page.tsx` | Compose UI, fetch data | Contain business logic |
| `app/api/**/route.ts` | Parse request, auth check, call service, return response | Talk to Prisma directly for complex logic |
| `services/*` | Business rules and DB access | Import UI code or read `Request` objects |
| `lib/auth.ts` | Hash/verify password, sign/verify JWT, read session | Contain permission rules |
| `lib/permissions.ts` | Single source of role/permission checks | Touch the DB |
| `components/*` | Presentation | Call Prisma or know about JWT |

## 3. Folder structure

```
src/
  app/
    (auth)/login/  (auth)/register/
    (dashboard)/layout.tsx  dashboard/  users/  teams/  roles/
    api/auth/{register,login,logout,me}/route.ts
    api/users/ api/teams/ api/roles/
  components/
    ui/        # shadcn generated
    layout/    # app-sidebar, header, user-nav, page-header
    auth/ users/ teams/ roles/
    shared/    # data-table, stat-card, empty-state, role-badge
  lib/
    prisma.ts  auth.ts  permissions.ts  utils.ts  constants.ts
    validations/   # Zod schemas (auth.ts, user.ts, team.ts)
  services/        # user.service.ts, team.service.ts, auth.service.ts
  types/index.ts
  data/mock.ts     # UI phase only, removed in the functionality phase
  proxy.ts         # fast token check + redirects (Next 16)
prisma/
  schema.prisma  migrations/
docker-compose.yml
.env  .env.example
```

## 4. Request flow (protected API)

1. Request hits `proxy.ts`: no/invalid token on a protected path → redirect (pages) or 401 (API).
2. Route handler reads the session via `getSession()` (`lib/auth.ts`).
3. Handler calls `can(role, action, resource)` from `lib/permissions.ts` → 403 if false.
4. Handler validates the body with Zod → 400 on failure.
5. Handler calls a service; service uses Prisma.
6. Handler returns a typed response (see `API.md`).

Proxy is an optimisation. **Authorisation is always re-checked in step 3.**

## 5. Data flow in the UI
- Server Components fetch via services directly (no self-HTTP calls).
- Mutations from forms use Server Actions or `fetch` to route handlers (pick one per feature and stay consistent; default: Server Actions with `useActionState`).
- Auth state for client components comes from a small `AuthProvider` fed by the server session, not from re-fetching `/me` everywhere.

## 6. Environment variables

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | JWT signing secret (long, random) |
| `JWT_EXPIRES_IN` | e.g. `7d` |
| `NODE_ENV` | environment |

## 7. Decisions log
Record non-obvious decisions in the vault's decisions file with date and reason (e.g. Prisma 7 → 6.19 downgrade, Docker instead of Postgres.app).
