# Nexus

> Central skills registry + semantic search + workflow graph — MCP server + React dashboard

## Stack

| Layer             | Technology                | Version  | Notes                                             |
| ----------------- | ------------------------- | -------- | ------------------------------------------------- |
| Runtime           | Node.js                   | 22       | ESM (`"type": "module"`)                          |
| Backend language  | TypeScript                | 5.7      | strict mode, ES2022 target                        |
| HTTP server       | Fastify                   | 5        | serves API + dashboard static build               |
| MCP               | @modelcontextprotocol/sdk | 1.12     | stdio transport, 2 tools: `nexus` + `nexus_save`  |
| ORM               | Drizzle ORM               | 0.39     | SQL-first, no magic                               |
| DB                | PostgreSQL 16 + pgvector  | —        | user: `nexus`, DB: `nexus`, container: `postgres` |
| Validation        | Zod                       | 3.24     | only in MCP tool schemas                          |
| Embeddings        | Ollama nomic-embed-text   | —        | 768-dim vectors, `OLLAMA_URL` env var             |
| Frontend language | TypeScript + React        | 5.7 + 19 | strict, functional components only                |
| Build tool        | Vite                      | 6        | dashboard only                                    |
| Styling           | Tailwind CSS              | 4        | no config file (CSS-first v4)                     |
| Component library | shadcn/ui + Radix UI      | —        | primitives in `dashboard/src/components/ui/`      |
| Graph viz         | @xyflow/react             | 12       | skill relation graph                              |
| Routing           | react-router-dom          | 7        | client-side, 4 routes                             |
| Testing           | Vitest                    | 3        | server only, real DB (`nexus_test`), no mocks     |
| Package manager   | npm                       | —        | workspaces: `server/` + `dashboard/`              |

## Architecture

```
nexus/
├── server/                     # Fastify HTTP server + MCP stdio server
│   ├── src/
│   │   ├── db/
│   │   │   ├── client.ts       # Drizzle + pg connection singleton (getDb())
│   │   │   └── schema.ts       # skills + skill_relations tables, custom vector type
│   │   ├── mcp/
│   │   │   └── tools.ts        # registerTools() — nexus + nexus_save MCP tools
│   │   ├── routes/
│   │   │   └── api.ts          # Fastify REST routes (CRUD skills + graph + relations)
│   │   ├── services/
│   │   │   ├── embeddings.ts   # generateEmbedding() via Ollama, cosineSimilarity()
│   │   │   ├── graph.ts        # getGraph(), linkSkills(), traverseExtends()
│   │   │   ├── resolver.ts     # resolve() — semantic search + workflow chain builder
│   │   │   └── skills.ts       # CRUD + upsertSkill() with auto-embedding
│   │   ├── scripts/
│   │   │   ├── backfill-embeddings.ts  # One-off: generate embeddings for existing skills
│   │   │   ├── populate-skills.ts      # Seed skills from files
│   │   │   └── seed-workflow.ts        # Seed workflow skill graph
│   │   ├── http.ts             # Main entry: Fastify instance, static serving, SPA fallback
│   │   └── mcp-stdio.ts        # MCP entry: StdioServerTransport
│   ├── test/
│   │   ├── services/           # Integration tests (real DB)
│   │   └── setup.ts            # cleanDb() utility
│   ├── drizzle/                # Generated migrations
│   ├── drizzle.config.ts
│   ├── vitest.config.ts
│   └── tsconfig.json
├── dashboard/                  # React SPA, built to dashboard/dist/ and served by Fastify
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts       # Thin fetch wrapper, api.* methods
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui primitives (DO NOT edit manually)
│   │   │   └── *.tsx           # Domain components: skill-card, skill-graph, skill-form…
│   │   ├── hooks/
│   │   │   └── use-mobile.tsx
│   │   ├── lib/
│   │   │   └── utils.ts        # cn() helper (clsx + tailwind-merge)
│   │   ├── pages/              # Home, Skills, SkillDetail
│   │   ├── types.ts            # Shared TS types (Skill, Graph, GraphNode, GraphEdge)
│   │   ├── App.tsx             # Router + layout (SidebarProvider wraps Routes)
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── tsconfig.json
├── docs/
├── specs/
├── tsconfig.base.json          # Shared TS config (ES2022, strict, bundler resolution)
└── package.json                # Workspace root (npm workspaces)
```

## Domain Model

**Skill** — central entity. Has a `name` slug (unique), `displayName`, `description`, `content` (markdown), `category`, `tags[]`, optional `embedding` (vector 768), `model`, `enabled`, `version`.

**SkillRelation** — directed edge between two skills. `relationType`:

- `extends` — workflow chain (traverseExtends walks this)
- `related` — loose connection
- `tag` — auto-generated edge between skills sharing a tag (graph only, not in DB)

**Categories that indicate workflow skills** (used by resolver to route to `workflow` vs `context`):
`discovery`, `planning`, `execution`, `quality`, `development`, `debugging`

## Patterns & Conventions

### Backend

- All imports use `.js` extension even for `.ts` source files (ESM Node requirement)
- `getDb()` returns a singleton Drizzle instance — never import `pg.Pool` directly
- Services are plain async functions, no classes
- Zod schemas only in `mcp/tools.ts` — API routes use inline type assertions
- Drizzle queries: prefer typed `.select().from().where()` chains; use `sql` template tag for raw vector queries
- Scripts in `src/scripts/` are standalone — run with `tsx src/scripts/foo.ts`

### Dashboard

- Path alias `@/` maps to `dashboard/src/`
- All API calls go through `dashboard/src/api/client.ts` — never call `fetch` directly in components
- No state management library — local `useState`/`useEffect` only
- `components/ui/` = shadcn/ui primitives — never edit these files
- Domain components in `components/` (not `ui/`) — e.g. `skill-card.tsx`, `skill-graph.tsx`
- Types shared from `src/types.ts` — don't duplicate in components

### Naming

- Files: kebab-case (`skill-graph.tsx`, `embeddings.ts`)
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- DB columns: snake_case (mapped to camelCase in Drizzle schema)

## Data Fetching

Dashboard uses a thin fetch wrapper (`api/client.ts`). Pattern:

```ts
const [skills, setSkills] = useState<Skill[]>([]);
useEffect(() => {
  api.listSkills().then(setSkills);
}, []);
```

No React Query, SWR, or RTK Query. Error handling via try/catch or `.catch()`.

## Styling

Tailwind CSS v4 (CSS-first, no `tailwind.config.js`). Configured via `@import "tailwindcss"` in `main.css`.

`cn()` utility from `lib/utils.ts` combines `clsx` + `tailwind-merge` — always use for conditional classes.

shadcn/ui components use `class-variance-authority` for variants.

## Routing

react-router-dom v7, client-side only, 4 routes:

```
/             → Home (dashboard overview + graph)
/skills       → Skills list
/skills/new   → SkillDetail (create mode)
/skills/:name → SkillDetail (edit mode)
```

Fastify serves `index.html` for all non-`/api/*` routes (SPA fallback).

## Environment & Config

Server reads env via `dotenv/config` (imported at entry points). Key vars:

```
DATABASE_URL=postgres://nexus:nexus_local@127.0.0.1:5432/nexus
OLLAMA_URL=http://localhost:11434   # optional, defaults to this
PORT=3002                           # optional, defaults to 3002
```

Tests override `DATABASE_URL` via `vitest.config.ts` → `nexus_test` DB.

## Commands

```bash
# From workspace root
npm install                          # install all workspaces

# Server (from server/)
cd server
npm run dev                          # tsx watch src/http.ts (port 3002)
npm run dev:mcp                      # tsx src/mcp-stdio.ts (stdio)
npm run build                        # tsc → dist/
npm run test                         # vitest run (nexus_test DB)
npm run test:watch                   # vitest interactive
npm run db:generate                  # drizzle-kit generate (after schema changes)
npm run db:migrate                   # drizzle-kit migrate (apply migrations)

# Dashboard (from dashboard/)
cd dashboard
npm run dev                          # vite dev server
npm run build                        # tsc + vite build → dist/
npm run preview                      # vite preview

# Scripts (from server/, run with tsx)
npx tsx src/scripts/backfill-embeddings.ts
npx tsx src/scripts/populate-skills.ts
npx tsx src/scripts/seed-workflow.ts
```

## MCP Tools

Two tools registered in `server/src/mcp/tools.ts`:

**`nexus`** — call before any task. Takes `intent` (string) + optional `phase` (skill name). Returns `{ workflow, context, related }`.

- `workflow`: chain of skills via `traverseExtends` (if phase given)
- `context`: semantically similar non-workflow skills
- `related`: semantically similar workflow skills

**`nexus_save`** — upsert a skill with auto-embedding. Takes name, displayName, description, content, category, tags, model.

## Semantic Search

`resolver.ts` flow:

1. Generate embedding for intent via Ollama
2. pgvector cosine distance query (`<=>` operator)
3. Filter by `SIMILARITY_THRESHOLD = 0.3`
4. Split results: workflow categories → `related`, others → `context`
5. Fallback to ILIKE text search if Ollama is unavailable

## Anti-patterns

- **Never import `pg` directly** — always use `getDb()` from `db/client.ts`
- **Never edit `components/ui/`** — these are shadcn/ui auto-generated primitives
- **Never use `any` without a cast comment** — project uses strict TS
- **Never skip `.js` extension in server imports** — ESM Node requires it even for `.ts` files
- **Never run tests against `nexus` (production) DB** — tests always use `nexus_test`
- **Never call `fetch` directly in dashboard components** — use `api/client.ts`
- **Never add Zod validation to REST routes** — only MCP tools use Zod
- **Never hardcode `OLLAMA_URL` or `DATABASE_URL`** — always read from env
