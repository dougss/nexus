# AGENTS.md

## Project

**Nexus** — Central skills registry + semantic search + workflow graph. MCP server (2 tools) + React dashboard. Node.js monorepo with `server/` (Fastify + Drizzle + pgvector) and `dashboard/` (React 19 + Vite + Tailwind).

## Stack

- **Backend:** Node.js 22, TypeScript 5.7, Fastify 5, Drizzle ORM, PostgreSQL 16 + pgvector, MCP SDK, Zod, Ollama (nomic-embed-text embeddings)
- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4, shadcn/ui, @xyflow/react, react-router-dom 7
- **Testing:** Vitest 3 (server only, real `nexus_test` DB, no mocks)

## Commands

- Dev server: `cd server && npm run dev` (port 3002)
- Dev MCP: `cd server && npm run dev:mcp`
- Build server: `cd server && npm run build`
- Build dashboard: `cd dashboard && npm run build`
- Test: `cd server && npm run test`
- DB migrate: `cd server && npm run db:generate && npm run db:migrate`

## Key Conventions

1. All server imports use `.js` extension even for `.ts` files (ESM Node requirement)
2. Never edit `dashboard/src/components/ui/` — shadcn/ui auto-generated
3. Never call `fetch` directly in dashboard components — use `api/client.ts`
4. Tests always use `nexus_test` DB — never run against production `nexus`
5. Zod validation only in `server/src/mcp/tools.ts` — REST routes use inline type assertions
6. `getDb()` from `db/client.ts` always — never instantiate `pg.Pool` directly
7. `cn()` from `lib/utils.ts` for all conditional Tailwind classes

## Skills available

| Skill              | Description                           | Invoke with           |
| ------------------ | ------------------------------------- | --------------------- |
| technical-analysis | Generates execution plan for a task   | `/technical-analysis` |
| code-review        | Reviews code for quality and security | `/code-review`        |
| task-creator       | Creates formatted GitHub issues       | `/task-creator`       |
