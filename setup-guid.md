# Crewbase – Setup Guide

Next.js 16 · Prisma 6 · PostgreSQL (Docker) · pnpm

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/itsarman001/crewbase.git
cd crewbase
pnpm install

# 2. Create your env file
cp .env.example .env

# 3. Start the database
docker compose up -d

# 4. Apply migrations and generate the Prisma client
pnpm prisma migrate dev

# 5. Seed the database
pnpm prisma db seed

# 6. Run the app
pnpm dev
```

Open <http://localhost:3000>.

## What Each Step Does

| Step     | Command                   | Purpose                                                                          |
| -------- | ------------------------- | -------------------------------------------------------------------------------- |
| Env      | `cp .env.example .env`    | Sets `DATABASE_URL`, Postgres credentials, JWT secret                            |
| Database | `docker compose up -d`    | Starts Postgres in a container                                                   |
| Migrate  | `pnpm prisma migrate dev` | Creates all tables from the committed migrations and generates the Prisma client |
| Seed     | `pnpm prisma db seed`     | Inserts starter teams and users                                                  |
| Run      | `pnpm dev`                | Starts the Next.js dev server                                                    |

## Migrate vs Push vs Seed

| Command                                 | Use when                                               |
| --------------------------------------- | ------------------------------------------------------ |
| `pnpm prisma migrate dev --name <name>` | You changed `schema.prisma` (creates a migration file) |
| `pnpm prisma migrate deploy`            | Production/CI, applies existing migrations only        |
| `pnpm prisma db push`                   | Quick experiments only, no migration history           |
| `pnpm prisma db seed`                   | Insert starter data                                    |
| `pnpm prisma migrate reset`             | Wipe the DB, re-run migrations and seed (dev only)     |
| `pnpm prisma studio`                    | Browse data in the browser                             |

Pick `migrate` **or** `db push` for the project, not both. Stick with `migrate dev`.

## Daily Use

| Situation                 | Command                                       |
| ------------------------- | --------------------------------------------- |
| Start working             | `docker compose up -d` then `pnpm dev`        |
| Stop working              | `docker compose stop`                         |
| Schema changed            | `pnpm prisma migrate dev --name what_changed` |
| Pulled new migrations     | `pnpm install` then `pnpm prisma migrate dev` |
| Fresh data                | `pnpm prisma migrate reset`                   |
| Delete DB data completely | `docker compose down -v`, then redo steps 3–5 |

## Troubleshooting

| Problem                                        | Fix                                                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `P1001: Can't reach database`                  | Check the container is up: `docker compose ps`                                                 |
| `P1000: Authentication failed`                 | `.env` password differs from the existing volume. Run `docker compose down -v` and start again |
| Port 5432 already in use                       | Stop local Postgres, or change the port in `.env` and `DATABASE_URL`                           |
| `permission denied ... docker.sock` (Linux)    | `sudo usermod -aG docker $USER`, then log out and back in                                      |
| `@prisma/client did not initialize`            | Run `pnpm prisma generate`. If pnpm blocked build scripts, run `pnpm approve-builds`           |
| `Environment variable not found: DATABASE_URL` | `.env` must be in the project root                                                             |
| Drift detected                                 | Dev only: `pnpm prisma migrate reset`                                                          |

## Notes

- Never commit `.env`.
- `migrate reset` and `down -v` delete all data, so don't use them on a DB you care about.
