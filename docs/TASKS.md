# TASKS: Crewbase

Work top to bottom. Do only the phase requested. Tick boxes as you finish and add follow-ups at the bottom.

## Phase 0: Foundation (mostly done)
- [x] Next.js 16 project with pnpm
- [x] Docker Postgres 17 (`docker-compose.yml`, `.env`)
- [x] Prisma 6.19.0 set up, init migration (teams, users) applied
- [x] Auth helpers: password hashing, token generation, permission check
- [x] Register API (validation, role assignment, token generation)
- [ ] `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`
- [ ] Add `Role` enum and any missing fields to `schema.prisma` to match `SPEC.md`; migrate
- [ ] Prisma client singleton (`lib/prisma.ts`)
- [ ] Add Zod; create `lib/validations/`

## Phase 1: UI only (mock data, no backend logic)
Use the Stitch MCP for designs and the shadcn MCP for components.

- [x] 1.1 Inventory Stitch screens; fill `DESIGN.md` route and token tables; **stop for review**
- [x] 1.2 Initialise shadcn (`pnpm dlx shadcn@latest init`); map tokens into `globals.css`
- [x] 1.3 Types (`types/index.ts`) and typed mock data (`data/mock.ts`)
- [x] 1.4 Layout shell: sidebar, header, user menu, mobile Sheet
- [x] 1.5 Shared components: PageHeader, StatCard, DataTable, EmptyState, RoleBadge, ConfirmDialog
- [x] 1.6 Auth screens: login, register (visual validation only)
- [x] 1.7 Dashboard
- [x] 1.8 Users: list, filters, create/edit dialog, delete confirm
- [x] 1.9 Teams: list, detail/members, create/edit dialog
- [x] 1.10 Roles: role assignment screen
- [x] 1.11 Loading, empty, error and forbidden states; not-found page
- [x] 1.12 Responsive and a11y pass; `pnpm lint && pnpm build` clean
- [x] 1.13 List "TODO: wire up" spots for Phase 2

## Phase 2: Functionality
- [ ] 2.1 `lib/permissions.ts` finalised against the `SPEC.md` matrix (with unit tests)
- [ ] 2.2 Session helper `getSession()` (reads cookie, verifies JWT)
- [ ] 2.3 `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [ ] 2.4 `proxy.ts`: token check and redirects for protected routes
- [ ] 2.5 Connect login/register forms (`useActionState` or fetch) and `AuthProvider`
- [ ] 2.6 Users: services + routes + connect UI (pagination, search, role filter)
- [ ] 2.7 Teams: services + routes + member add/remove + connect UI
- [ ] 2.8 Role assignment endpoint + last-admin protection + connect UI
- [ ] 2.9 Role-based navigation and page guards (403 view)
- [ ] 2.10 Replace all `data/mock.ts` usage; delete the file
- [ ] 2.11 Seed script (one Admin, sample teams/users)

## Phase 3: Testing and polish
- [ ] 3.1 Unit tests: permissions, auth helpers, validation schemas
- [ ] 3.2 API tests: auth flow, each role against each endpoint (401/403/200)
- [ ] 3.3 Manual role walkthrough (Admin, Manager, User, Guest)
- [ ] 3.4 README: setup (Docker, env, migrate, seed), scripts, architecture links
- [ ] 3.5 Security review: cookie flags, no password leakage, rate-limit login (optional)

## Follow-ups / notes
- **Phase 2 "TODO: wire up" inventory**:
  - `components/auth/login-form.tsx` → Wire up `POST /api/auth/login`, handle invalid credentials, set HTTP-only cookie.
  - `components/auth/register-form.tsx` → Wire up `POST /api/auth/register`, handle email conflict, set session.
  - `components/layout/user-nav.tsx` & `header.tsx` → Replace `mockCurrentUser` with live server session (`getSession()`); wire "Sign out" to `POST /api/auth/logout`.
  - `app/(dashboard)/dashboard/page.tsx` → Replace `mockStats`, `mockTeamDistribution`, `mockRecentActivity` with real Prisma database queries.
  - `app/(dashboard)/users/page.tsx` → Replace `mockUsers` state with `GET /api/user` query, connect search/role/team server filters, pagination.
  - `components/users/invite-user-dialog.tsx` → Wire to `POST /api/user` with Zod validation.
  - `components/users/change-role-dialog.tsx` → Wire to `PATCH /api/user/[userId]/role` with last-admin guard check.
  - `components/users/change-team-dialog.tsx` → Wire to `PATCH /api/user/[userId]/team`.
  - `app/(dashboard)/teams/page.tsx` → Wire team creation and roster queries to real endpoints.
  - `components/teams/team-roster-dialog.tsx` → Wire member unassignment / reassignment actions to backend.
  - `app/(dashboard)/profile/page.tsx` → Wire profile updates and password change to `PATCH /api/user/me`.
  - Auth protection: Implement `proxy.ts` (Next.js 16) for token presence checks, redirecting unauthenticated users to `/login`.
