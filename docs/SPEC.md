# SPEC: Crewbase

Behaviour and rules. `prisma/schema.prisma` is the source of truth for data shape; if this file disagrees with it, fix this file.

## 1. Data model (summary)

| Model | Key fields | Notes |
|---|---|---|
| User | id, name, email (unique), password (hashed), role, teamId (nullable), createdAt, updatedAt | `password` is never returned by any API |
| Team | id, name (unique), description (optional), createdAt, updatedAt | One team has many users |

`Role` enum: `ADMIN | MANAGER | USER | GUEST` (default `USER`).

Assumption: a user belongs to at most one team.

## 2. Authentication
- Register: validate input, hash password with `bcryptjs`, create user, issue JWT.
- Login: verify email + password, issue JWT.
- JWT (`jsonwebtoken`) payload: `{ sub: userId, role }`, signed with `JWT_SECRET`, expiry 7d.
- Token stored in an **httpOnly, Secure (in prod), SameSite=Lax** cookie named `token`. Never in localStorage.
- Logout: clear the cookie.
- `GET /api/auth/me` returns the current user from the token (fresh from DB).

## 3. Validation rules

| Field | Rule |
|---|---|
| name | 2 to 60 chars, trimmed |
| email | valid format, lowercased, unique |
| password | min 8 chars, at least 1 letter and 1 number |
| team name | 2 to 60 chars, unique |
| role | must be a valid `Role` |

Validate on the server always; client validation is for UX only.

## 4. Permission matrix (proposed, adjust as needed)

| Action | ADMIN | MANAGER | USER | GUEST |
|---|---|---|---|---|
| View dashboard | yes | yes | yes | yes (limited) |
| View all users | yes | own team only | own team only | no |
| Create user | yes | no | no | no |
| Edit user | yes | own team members (not role) | self only | no |
| Delete user | yes | no | no | no |
| Change a user's role | yes | no | no | no |
| View all teams | yes | own team | own team | no |
| Create / delete team | yes | no | no | no |
| Edit team details | yes | own team | no | no |
| Add / remove team members | yes | own team | no | no |

Rules:
- Admin cannot demote or delete themselves if they are the last Admin.
- Self-registration always creates role `USER` (registration cannot choose a role).
- Permission checks live in one place (`lib/permissions.ts`) and are used by both API routes and UI.

## 5. Route access

| Route | Access |
|---|---|
| `/login`, `/register` | Public (redirect to `/dashboard` if signed in) |
| `/dashboard` | Any signed-in user |
| `/users` | ADMIN, MANAGER, USER (scoped), not GUEST |
| `/teams` | ADMIN, MANAGER, USER (scoped) |
| `/roles` | ADMIN only |

Unauthenticated: redirect to `/login`. Authenticated but forbidden: show a 403 page, not a redirect loop.

## 6. UI states every list/page must handle
Loading (skeleton), empty, error, and forbidden.

## 7. Error format
All API errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }` (see `API.md`).

## 8. Out of scope
Password reset, email verification, OAuth, audit-log UI, multi-workspace.
