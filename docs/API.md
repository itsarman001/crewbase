# API: Crewbase

Base path: `/api`. JSON in, JSON out. Auth via httpOnly cookie `token`.
Status column: ✅ done, ⬜ planned.

## Conventions

**Success**
```json
{ "data": { ... } }
```

**Error**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": { "email": "Invalid email" } } }
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body/query failed Zod validation |
| 401 | `UNAUTHENTICATED` | Missing, invalid or expired token |
| 403 | `FORBIDDEN` | Role not allowed (see `SPEC.md` matrix) |
| 404 | `NOT_FOUND` | Resource does not exist (or is out of scope for the role) |
| 409 | `CONFLICT` | Duplicate email / team name, last-admin rule |
| 500 | `INTERNAL_ERROR` | Unexpected; never leak stack traces |

Public user shape (password is **never** returned):
```json
{ "id": "string", "name": "string", "email": "string", "role": "USER", "teamId": "string | null", "createdAt": "ISO date" }
```

## Auth

| Method | Path | Access | Status |
|---|---|---|---|
| POST | `/auth/register` | Public | ✅ |
| POST | `/auth/login` | Public | ⬜ |
| POST | `/auth/logout` | Signed in | ⬜ |
| GET | `/auth/me` | Signed in | ⬜ |

- `POST /auth/register` body `{ name, email, password }` → `201` `{ data: { user } }` + sets cookie. Role is always `USER`. `409` if email exists.
- `POST /auth/login` body `{ email, password }` → `200` `{ data: { user } }` + sets cookie. Same generic `401` message for wrong email or wrong password.
- `POST /auth/logout` → `200`, clears cookie.
- `GET /auth/me` → `200` `{ data: { user } }`.

## Users

| Method | Path | Access | Status |
|---|---|---|---|
| GET | `/users` | ADMIN (all), MANAGER/USER (own team) | ⬜ |
| GET | `/users/:id` | ADMIN, same-team, or self | ⬜ |
| POST | `/users` | ADMIN | ⬜ |
| PATCH | `/users/:id` | ADMIN, MANAGER (own team, no role change), self (name only) | ⬜ |
| DELETE | `/users/:id` | ADMIN | ⬜ |

`GET /users` query: `?page=1&pageSize=10&search=&role=&teamId=` → `{ data: { items: User[], total, page, pageSize } }`.

## Teams

| Method | Path | Access | Status |
|---|---|---|---|
| GET | `/teams` | ADMIN (all), others (own team) | ⬜ |
| GET | `/teams/:id` | ADMIN or member | ⬜ |
| POST | `/teams` | ADMIN | ⬜ |
| PATCH | `/teams/:id` | ADMIN, MANAGER (own team) | ⬜ |
| DELETE | `/teams/:id` | ADMIN | ⬜ |
| POST | `/teams/:id/members` | ADMIN, MANAGER (own team) | ⬜ |
| DELETE | `/teams/:id/members/:userId` | ADMIN, MANAGER (own team) | ⬜ |

- `POST /teams` body `{ name, description? }`.
- `POST /teams/:id/members` body `{ userId }`.
- Deleting a team sets its members' `teamId` to `null` (does not delete users).

## Roles / access management

| Method | Path | Access | Status |
|---|---|---|---|
| GET | `/roles` | ADMIN | ⬜ |
| PATCH | `/users/:id/role` | ADMIN | ⬜ |

- `PATCH /users/:id/role` body `{ role }`. `409` if it would remove the last Admin.

## Implementation checklist for every endpoint
1. Read session → 401 if none.
2. `can(role, action, resource)` → 403.
3. Zod-validate body/query → 400.
4. Call service → map errors to the table above.
5. Return the shaped response (no `password`).
