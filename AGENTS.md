# Agent Guide

## Workspace

- This is a pnpm 12.6.0 / Node 26 workspace managed by Turborepo; install from the repository root with `pnpm install`.
- Packages are `types` (shared Zod/TypeScript contracts, built to `types/dist`), `api` (Fastify + Prisma), and `web` (React/Vite).
- Build order matters: the API and web consume `@library/types`; `pnpm build` uses Turbo’s dependency graph to build `types` first.
- API entrypoint is `api/src/main.ts` (port 8080); web entrypoint is `web/src/main.tsx` (Vite serves on port 80 and opens a browser).

## Module structure

- `api/`
	- `src/main.ts` and `src/createApp.ts` wire the Fastify server.
	- `src/routes/` contains API routes.
	- `src/plugins/` contains integrations.
	- `src/config/` contains shared configuration.
	- `src/helpers/` contains utilities.
	- `src/types/` contains API types.
	- `prisma/` contains the schema, migrations, seed, and generated client.
	- `scripts/` contains interactive scripts.
- `types/`
	- `src/` contains shared contracts and schemas.
	- `src/index.ts` is the package entrypoint.
- `web/`
	- `src/main.tsx` and `src/App.tsx` are the app entrypoints.
	- `src/features/` contains domain screens and feature state.
	- `src/components/` contains reusable UI, form, and data-table components.
	- `src/hooks/` contains shared React hooks.
	- `src/utils/`, `src/config/`, and `src/types/` contain shared support code.
	- `public/` contains static assets.

## Commands

- `pnpm dev` starts all three package dev tasks; use `pnpm --filter @library/web dev`, `pnpm --filter @library/api dev`, or `pnpm --filter @library/types dev` for one package.
- `pnpm build` runs the production builds; `pnpm lint` runs Biome; `pnpm format` formats the repository with Biome.
- There are currently no test or standalone typecheck scripts; `web`’s typecheck is part of `pnpm build` (`tsc -b && vite build`).
- Biome is authoritative for formatting/linting: tabs, single-quoted JavaScript, 100-column width, and organized imports.

## API and database

- API commands load `api/.env`; `DATABASE_URL` must point to the PostgreSQL `library` database. The API also requires the checked-in `api/session-key`; do not replace it casually because it signs sessions.
- After dependency installation or Prisma schema changes, regenerate the client with `pnpm --filter @library/api exec prisma generate`.
- Apply migrations with `pnpm --filter @library/api exec prisma migrate dev` (or `prisma migrate deploy` when applying existing migrations); seed with `pnpm --filter @library/api exec prisma db seed`.
- Seeding is destructive for books, copies, members, and transactions: it deletes those records before inserting Faker-generated data. Creating an admin account is interactive: `pnpm --filter @library/api create-account`.
- Prisma schema and migrations live in `api/prisma`; generated client output is `api/prisma/.generated` and should not be edited or committed.

## Verification

- Before making any repository changes, state the planned approach briefly so the user can review it first.
- Before implementing a change, review the planned approach for likely bugs and risks.
- If requirements or implementation details are uncertain, ask rather than assume.
- Prefer the simplest solution; when multiple viable approaches exist, explain them briefly and let the user choose.
- Call out any suggestion that could simplify the implementation or improve the result before proceeding.
- Modify only files required for the task; do not format or refactor unrelated files.
- Follow the repository’s established conventions strictly.
- Avoid adding files unnecessarily; inline or colocate simple functions and logic, separating them only when complexity or reuse justifies it.
- For routine changes, run `pnpm lint` then `pnpm build`; run database commands only when the change touches Prisma/API persistence.
- No repository CI, test suite, or additional instruction files are present; do not invent a test command.
