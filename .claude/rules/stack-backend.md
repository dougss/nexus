---
paths:
  - "server/src/**/*.ts"
  - "server/test/**/*.ts"
  - "server/drizzle.config.ts"
---

# Backend — Fastify + Drizzle + MCP

## TypeScript

- ESM only: sempre `.js` em imports (`import { foo } from "./bar.js"`)
- Sem `any` implícito — use cast explícito com comentário se necessário
- Prefer type inference; interfaces explícitas apenas para contratos públicos
- `strict: true` — não desabilitar checks

## Fastify

- Rotas registradas via plugin (`async function(app: FastifyInstance)`) em `routes/`
- Tipagem de `req.params` e `req.body` via type assertion (`as { field: type }`)
- Sem Zod nas rotas REST — apenas type assertions inline
- Retornar erros com `reply.status(N).send({ error: "mensagem" })`
- Logger do Fastify está ativo (`logger: true`) — não usar `console.log` nas rotas

## Drizzle ORM

- Schema definido em `db/schema.ts` — não modificar migrations manualmente
- Após mudar schema: `npm run db:generate` → `npm run db:migrate`
- Queries tipadas: `.select().from(table).where(eq(table.field, value))`
- Para queries com vector/pgvector usar `sql` template tag: `sql\`SELECT ... WHERE embedding <=> ${vec}::vector\``
- `getDb()` sempre — nunca instanciar `pg.Pool` diretamente

## Serviços

- Funções puras async, sem classes, sem singletons além do DB
- `embeddings.ts`: gera via Ollama HTTP. Se falhar, propagar erro — o chamador decide o fallback
- `resolver.ts`: `SIMILARITY_THRESHOLD = 0.3`, `MAX_RESULTS = 5` — ajustar aqui se necessário
- `graph.ts`: `traverseExtends` segue relações `extends` para montar workflow chain

## MCP Tools

- Registrar ferramentas via `server.registerTool(name, { description, inputSchema }, handler)`
- `inputSchema` usa Zod schemas
- Retornar `{ content: [{ type: "text", text: string }] }`
- Erros devem propagar — o SDK MCP lida com o formato de erro

## Testes

- Arquivo de teste em `test/services/`, mesmo nome do service
- Chamar `cleanDb()` de `test/setup.ts` no início de cada test suite
- `fileParallelism: false` — testes rodam em série para evitar conflitos no DB
- Timeout: 10s por teste
- DB: `nexus_test` (definido em `vitest.config.ts`, não mudar)
