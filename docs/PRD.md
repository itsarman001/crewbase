# PRD: Crewbase

> Team & RBAC Management Platform. Also a backend learning project, so clarity beats cleverness.

## 1. Problem
Small teams need one place to manage who is on which team and what each person is allowed to do. Without role-based access, either everyone can do everything or an admin becomes a bottleneck.

## 2. Goals
- Register and sign in users securely.
- Organise users into teams.
- Assign roles and enforce what each role can see and do, on both UI and API.
- Provide a clean, responsive dashboard that adapts to the signed-in role.

## 3. Non-goals (for now)
- Email verification, password reset, OAuth/SSO
- Multi-tenant organisations (one workspace only)
- Billing, notifications, audit-log UI
- Mobile app

## 4. Users and roles

| Role | Who | Summary |
|---|---|---|
| ADMIN | Workspace owner | Full control: users, teams, roles |
| MANAGER | Team lead | Manages members of their own team(s) |
| USER | Regular member | Sees own profile and own team |
| GUEST | External / read-only | Minimal read-only access |

Exact permissions live in `SPEC.md` (permission matrix).

## 5. Core user stories
1. As a visitor, I can register and log in.
2. As a signed-in user, I land on a dashboard that fits my role.
3. As an Admin, I can create, edit and delete users and teams.
4. As an Admin, I can change any user's role.
5. As a Manager, I can add/remove members in my team.
6. As a User, I can view my profile and my team's members.
7. As a Guest, I can only view what I am explicitly allowed to see.
8. As any user, I am redirected to login if my session is missing or expired.

## 6. Success criteria
- Every protected route and API rejects unauthenticated requests (401) and unauthorised roles (403).
- UI never shows actions the role cannot perform (and the API still enforces it).
- `pnpm build`, `pnpm lint` and tests pass.

## 7. Delivery phases
1. **UI** (static, mock data), generated from the Google Stitch design with shadcn/ui.
2. **Functionality**: wire auth, RBAC, CRUD to Prisma/PostgreSQL.
3. **Testing and polish**.

See `TASKS.md` for the checklist.

## 8. Open questions
- Can a user belong to more than one team? (Assumed: one team per user, see `SPEC.md`.)
- Can a Manager promote users to Manager? (Assumed: no, Admin only.)
