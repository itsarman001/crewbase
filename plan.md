# Task: Generate the Crewbase UI from Google Stitch using shadcn/ui

First read `AGENTS.md`, then `docs/TASKS.md`. Do ONLY Phase 1 (UI only, mock data, no backend logic).

## Context
Crewbase is a Team & RBAC Management Platform.
- Stack: Next.js 16 (App Router), TypeScript, Tailwind, Prisma 6 + PostgreSQL (backend already in progress)
- Package manager: **pnpm** (never use npm or yarn)
- Roles: Admin, Manager, User, Guest
- Planned areas: auth (login, register), dashboard, users, teams, roles/access management

## Phase scope: UI ONLY
Build the visual layer with static/mock data. Do NOT implement:
- API calls, Prisma queries, server actions, JWT/cookie handling
- Real auth, route protection, or middleware
- Form submission logic (forms may validate visually, but submit does nothing yet)

Functionality comes in the next phase, so structure the code to make that easy.

## Step 0: Verify tooling (stop if anything is missing)
1. List the MCP servers/tools you can currently use.
2. Confirm the Stitch MCP and the shadcn MCP are both available.
3. If either is missing, stop and tell me. Do not fall back to guessing the design or hand-writing shadcn components.

## Step 1: Pull the design from Stitch
Use the **Stitch MCP** to fetch the project:
https://stitch.withgoogle.com/projects/1154367852638652517

1. List every screen in the project and give me a short inventory (screen name, purpose, key components) before writing code.
2. Extract the design tokens: colors, typography, spacing, radius, shadows, light/dark mode if present.
3. Map each screen to a Next.js route and show me the proposed route map. Wait for my confirmation if anything is ambiguous.

## Step 2: Set up shadcn/ui
Use the **shadcn MCP** for all component work.
1. Check whether shadcn is already initialised (look for `components.json`). If not, run `pnpm dlx shadcn@latest init`.
2. Map the Stitch design tokens onto the shadcn theme in `globals.css` (CSS variables) and the Tailwind config. Do not hardcode hex values in components.
3. For every UI element in the designs, search the shadcn registry via the MCP first and install with `pnpm dlx shadcn@latest add <component>`. Prefer shadcn primitives (Button, Card, Input, Form, Table, Dialog, Sheet, DropdownMenu, Avatar, Badge, Tabs, Sidebar, Select, Sonner, Skeleton, etc.).
4. Only build a custom component when shadcn has no equivalent, and build it on top of shadcn primitives.

## Step 3: Project structure (maintainable and clean)
Follow this layout, adjusting only if the existing repo already has a convention:

```
src/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (dashboard)/layout.tsx          # sidebar + header shell
    (dashboard)/dashboard/page.tsx
    (dashboard)/users/page.tsx
    (dashboard)/teams/page.tsx
    (dashboard)/roles/page.tsx
  components/
    ui/                             # shadcn-generated only, don't hand-edit unless necessary
    layout/                         # app-sidebar, header, user-nav, page-header
    auth/                           # login-form, register-form
    users/ teams/ roles/            # feature-specific components
    shared/                         # data-table, stat-card, empty-state, role-badge
  lib/
    utils.ts
    constants.ts                    # nav items, role definitions
  types/
    index.ts                        # User, Team, Role types (mirror the Prisma models)
  data/
    mock.ts                         # typed mock data, swapped for real data later
```

## Step 4: Code rules
- Server Components by default; add `"use client"` only where interactivity requires it (sidebar toggle, dialogs, forms) and keep client components as small leaf components.
- No duplicated markup: extract repeated patterns (page header, stat card, data table, role badge) into `components/shared`.
- Typed props everywhere, no `any`. Types in `types/` should line up with the planned Prisma models (User, Team, Role enum: ADMIN, MANAGER, USER, GUEST) so wiring up real data later is a swap, not a rewrite.
- Keep pages thin: pages compose components and read from `data/mock.ts`.
- Use `next/link`, `next/image`, and `next/font` properly.
- Accessible by default: labels, focus states, keyboard navigation, semantic HTML.
- Responsive: mobile-first, test sidebar collapse on small screens.
- Add loading (`loading.tsx` + Skeleton) and empty states for list pages.
- Use `cn()` from `lib/utils` for class merging; no inline styles.
- Check the installed Next.js 16 docs/conventions before using any API you're unsure of, don't assume Next 14/15 patterns.

## Step 5: Execution order
1. Report the Stitch screen inventory and route map (stop here for my OK).
2. Theme and tokens setup.
3. Layout shell (sidebar, header, user menu).
4. Auth screens.
5. Dashboard.
6. Users, Teams, Roles screens.
7. Final pass: responsiveness, dark mode (if in the design), a11y check.

After each step, run `pnpm lint` and `pnpm build` and fix errors before moving on.

## Definition of done
- Every Stitch screen has a matching route that visually matches the design.
- All UI built from shadcn components via the MCP, themed from Stitch tokens.
- `pnpm build` passes with no type or lint errors.
- No backend logic added.
- Short summary at the end: routes created, shadcn components installed, shared components extracted, and a list of "TODO: wire up" spots for the functionality phase.