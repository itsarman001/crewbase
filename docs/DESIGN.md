# DESIGN: Crewbase

The visual source of truth is the Google Stitch project:
https://stitch.withgoogle.com/projects/1154367852638652517

Use the **Stitch MCP** to pull screens and tokens. This file records how they map into code, so fill in the tables after the first inventory pass. Where this file and Stitch disagree, Stitch wins.

## 1. Design tokens
Map Stitch values to shadcn CSS variables in `src/app/globals.css`. Never hardcode colors in components.

| Token | Stitch value | shadcn variable |
|---|---|---|
| Background | _fill in_ | `--background` |
| Foreground | _fill in_ | `--foreground` |
| Primary | _fill in_ | `--primary` / `--primary-foreground` |
| Secondary | _fill in_ | `--secondary` |
| Muted | _fill in_ | `--muted` / `--muted-foreground` |
| Accent | _fill in_ | `--accent` |
| Destructive | _fill in_ | `--destructive` |
| Border / Input / Ring | _fill in_ | `--border` / `--input` / `--ring` |
| Radius | _fill in_ | `--radius` |
| Font (sans / mono) | _fill in_ | loaded via `next/font` |

Dark mode: only if present in the Stitch design.

## 2. Screens → routes

| Stitch screen | Route | Notes |
|---|---|---|
| Login | `/login` | |
| Register | `/register` | |
| Dashboard | `/dashboard` | stat cards, recent activity |
| Users | `/users` | table, filters, create/edit dialog |
| Teams | `/teams` | cards or table, members panel |
| Roles / access | `/roles` | ADMIN only |
| 403 / 404 | `not-found.tsx`, `forbidden` view | |

Adjust to the real Stitch inventory.

## 3. Component mapping

| UI need | shadcn component(s) |
|---|---|
| App shell | Sidebar, Sheet (mobile), Breadcrumb |
| User menu | DropdownMenu, Avatar |
| Forms | Form (react-hook-form + Zod), Input, Select, Label, Button |
| Lists | Table, Badge, Pagination, Skeleton |
| Create/edit | Dialog or Sheet |
| Confirmations | AlertDialog |
| Feedback | Sonner (toasts), Alert |
| Filters | Input (search), Select, Tabs |

Shared custom components (built on shadcn): `DataTable`, `StatCard`, `PageHeader`, `EmptyState`, `RoleBadge`, `ConfirmDialog`.

## 4. Role badges

| Role | Variant |
|---|---|
| ADMIN | _per Stitch_ (suggest destructive/primary) |
| MANAGER | _per Stitch_ |
| USER | secondary |
| GUEST | outline |

## 5. Layout and responsiveness
- Dashboard shell: collapsible sidebar + header; sidebar becomes a Sheet below `md`.
- Content max width and padding consistent across pages via `PageHeader` and a shared container.
- Tables scroll horizontally on small screens or collapse to cards.
- Mobile-first; verify at 375, 768, 1280.

## 6. Navigation by role

| Item | ADMIN | MANAGER | USER | GUEST |
|---|---|---|---|---|
| Dashboard | yes | yes | yes | yes |
| Users | yes | yes | yes | no |
| Teams | yes | yes | yes | no |
| Roles | yes | no | no | no |

Hide items the role cannot use. The API still enforces access.

## 7. States and accessibility
- Every list: loading (Skeleton), empty (EmptyState with action), error (Alert + retry).
- Visible focus rings, labelled inputs, `aria-*` on icon-only buttons, keyboard-operable dialogs and menus.
- Contrast meets WCAG AA.
- Forms: inline field errors, disabled submit while pending (visual only in the UI phase).

## 8. Content and tone
Short, plain labels. Destructive actions say exactly what will happen ("Delete user", not "Confirm").
