<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md: Crewbase

Team & RBAC management platform. Next.js 16 (App Router) + TypeScript + Prisma 6.19 + PostgreSQL 17 (Docker). UI: shadcn/ui + Tailwind.

## Read first
`docs/PRD.md` (what/why) → `docs/SPEC.md` (rules) → `docs/ARCHITECTURE.md` (structure) → `docs/API.md` (endpoints) → `docs/DESIGN.md` (UI) → `docs/TASKS.md` (what to do now).
When docs and code disagree, say so and ask; don't silently pick one.

## Commands (pnpm only, never npm or yarn)
```bash
pnpm dev                          # start dev server
pnpm build && pnpm lint           # must pass before finishing a task
pnpm dlx shadcn@latest add <name> # add a shadcn component
docker compose up -d              # start PostgreSQL
pnpm prisma migrate dev --name <name>
pnpm prisma generate
pnpm prisma studio
```

## Current phase
Check `docs/TASKS.md`. Do only the phase/task requested. In the UI phase: **no backend logic**, use typed mock data.

## MCP usage
- **Google Stitch MCP**: source of truth for screens and design tokens (project `1154367852638652517`). Inventory screens before coding.
- **shadcn MCP**: search the registry before writing any UI component. Install, don't hand-write, shadcn primitives.

## Code rules
- TypeScript strict, no `any`, no unused code.
- Server Components by default; `"use client"` only for leaf components that need interactivity.
- Pages are thin: compose components, fetch data, nothing else.
- Business logic in `src/lib/` or `src/services/`, never inside components or route handlers directly.
- Validate all input on the server with Zod. Share schemas between client forms and API.
- Permission checks go through `lib/permissions.ts` only; never inline role string comparisons.
- Never return `password` from any query or response. Use Prisma `select`.
- Use `cn()` for class merging. No inline styles, no hardcoded colors (use theme tokens).
- One Prisma client instance (`lib/prisma.ts` singleton).
- Secrets only in `.env` (never committed); keep `.env.example` current.

## Next.js 16 notes (verify against installed docs, don't assume older versions)
- Request APIs are async: `await cookies()`, `await headers()`, `await params`, `await searchParams`.
- `middleware.ts` is replaced by `proxy.ts` in Next 16.
- Proxy/middleware does only a fast token check and redirect. **Real authorisation happens in route handlers and server code.**

## Git
Small commits, conventional messages (`feat:`, `fix:`, `chore:`, `docs:`). Don't commit `.env`, `node_modules`, `.next`.

## Definition of done (every task)
1. Matches `docs/SPEC.md` and `docs/DESIGN.md`.
2. `pnpm lint` and `pnpm build` pass.
3. No unrelated refactors or new dependencies without asking.
4. `docs/TASKS.md` updated (tick the box, add follow-ups).
5. Short summary of what changed and anything uncertain.

## Ask before
Adding a dependency, changing the Prisma schema, changing the permission matrix, or deleting files.