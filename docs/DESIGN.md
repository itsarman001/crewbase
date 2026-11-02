# DESIGN: Crewbase

The visual source of truth is the Google Stitch project:
https://stitch.withgoogle.com/projects/1154367852638652517

Use the **Stitch MCP** to pull screens and tokens. This file records how they map into code, so fill in the tables after the first inventory pass. Where this file and Stitch disagree, Stitch wins.

## 1. Design tokens
Map Stitch values to shadcn CSS variables in `app/globals.css`. Never hardcode colors in components.

| Token | Stitch value | shadcn variable |
|---|---|---|
| Background | `#ffffff` (canvas: `#fcf8fb`) | `--background` |
| Foreground | `#09090b` (on-surface: `#1c1b1d`) | `--foreground` |
| Primary / Primary Foreground | `#4f46e5` / `#ffffff` (brand operational accent) | `--primary` / `--primary-foreground` |
| Secondary / Secondary Foreground | `#0051d5` / `#ffffff` | `--secondary` / `--secondary-foreground` |
| Muted / Muted Foreground | `#f4f4f5` (surface-container-low: `#f6f2f5`) / `#71717a` | `--muted` / `--muted-foreground` |
| Accent / Accent Foreground | `#f4f4f5` / `#09090b` | `--accent` / `--accent-foreground` |
| Destructive / Destructive Foreground | `#ba1a1a` (`#ef4444`) / `#ffffff` | `--destructive` / `--destructive-foreground` |
| Border / Input | `#e4e4e7` (zinc-200, outline-variant: `#c7c4d8`) | `--border` / `--input` |
| Ring | `#4f46e5` (focus brand ring) | `--ring` |
| Radius | `0.5rem` (8px base card/modal, 6px controls) | `--radius` |
| Font (sans / mono) | Geist (`GeistSans`, fallback `Inter`) | loaded via `next/font` |

### Semantic Role Indicators
| Role | Background | Border | Text |
|---|---|---|---|
| ADMIN | `#eef2ff` (primary-fixed `#e2dfff`) | 1px solid `#c7d2fe` | `#4338ca` (primary `#3525cd`) |
| MANAGER | `#eff6ff` (secondary-fixed `#dbe1ff`) | 1px solid `#bfdbfe` | `#1d4ed8` (secondary `#0051d5`) |
| USER | `#f4f4f5` (surface-container `#f0edf0`) | 1px solid `#e4e4e7` | `#3f3f46` (on-surface-variant) |
| GUEST | `transparent` | 1px dashed `#d4d4d8` | `#52525b` |

Dark mode: Supported in the Stitch design system (`#09090B` base background, `#18181B` surface container, `#27272A` borders, with theme switcher in Profile and Sidebar).

## 2. Screens → routes

| Stitch screen | Route | Notes |
|---|---|---|
| Crewbase — Login | `/login` | Public auth page; email + password, SSO buttons, error alert, remember me |
| Crewbase — Register | `/register` | Public auth page; name, email, password, optional team code, admin info banner |
| Crewbase — Dashboard | `/dashboard` | Metrics cards, access control reference, recent member table with filters, role distribution bar |
| Crewbase — Dashboard (Skeleton) | `/dashboard` (loading) | Skeleton loaders for metrics, roster table, and role breakdown |
| Crewbase — Users | `/users` | Directory table, search, role & team filters, state switcher, member action dropdown |
| Crewbase — Users (Change Role Dialog & Toast) | `/users` (modal) | Dialog for role reassignment + Sonner toast confirmation |
| Crewbase — Users (Change Team Dialog) | `/users` (modal) | Dialog with searchable team combobox + Sonner toast confirmation |
| Crewbase — Teams | `/teams` | Squad cards grid, department filter, search, copyable team codes, roster preview, coming soon badge |
| Crewbase — Roles / Access Control | `/roles` | ADMIN only; role definition, scope entitlement matrix, member role allocation |
| Crewbase — Profile | `/profile` (alias `/settings`) | User identity card, SCIM directory details, active sessions, appearance theme selector |
| Crewbase — System States & Error Pages | `not-found.tsx`, `error.tsx`, `/system-states` | 401 session expired, 403 access restricted, 404 not found, 500 server fault, connectivity alert banner |

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
