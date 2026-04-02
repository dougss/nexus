# Nexus Skill Router — Design Spec

> Redesign do MCP Server: substituir 8 tools CRUD por 2 tools inteligentes com busca semântica via pgvector + workflow via grafo.
> Date: 2026-03-30

## Overview

O MCP do Nexus expõe 8 tools genéricas (list, get, search, create, update, delete, link, unlink). Claude não sabe quando usá-las e precisa ser lembrado. O Skill Router substitui tudo por 2 tools: `nexus` (consulta inteligente) e `nexus_save` (persistir). Uma chamada resolve tudo — workflow, contexto do projeto, skills relacionadas.

**Problema:** Claude trata o Nexus como referência opcional. Usa superpowers nativos por padrão e só consulta Nexus quando o usuário cobra. As 8 tools genéricas não comunicam urgência nem orquestram workflow.

**Solução:** Uma tool `nexus` que é a fonte da verdade. Claude chama UMA vez e recebe tudo que precisa: qual workflow seguir, contexto do projeto, skills relevantes. Busca semântica via pgvector (Ollama local) garante que funciona com qualquer descrição, sem keywords fixas.

## Arquitetura

```
Claude → nexus(intent, phase?) → Nexus MCP Server
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              Ollama API         PostgreSQL            Grafo
              (embeddings)       (pgvector)         (skill_relations)
                    │                   │                   │
              embed intent       top-N similar       traverse extends
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                  JSON response
                                  (workflow + context + related)
```

## Tools MCP (2 tools, substituem as 8 anteriores)

### `nexus(intent, phase?)`

**Tool description (o que Claude vê):**

> REQUIRED: Call this before starting ANY task — implementation, debugging, planning, design, review, or exploration. Describe what you want to do and optionally which phase you're in. Returns the complete workflow to follow, project context, and related skills. This is your source of truth for how to work.

**Input:**

- `intent` (string, required) — Texto livre descrevendo o que quer fazer
- `phase` (string, optional) — Fase do workflow se conhecida (ex: "brainstorming", "executing-plans")

**Lógica de resolução:**

1. Gerar embedding do intent via Ollama (`nomic-embed-text`, 768 dims)
2. Buscar top-5 skills por similaridade coseno no PostgreSQL (pgvector)
3. Se `phase` informada: buscar skill pelo nome, percorrer links `extends` no grafo pra montar cadeia de workflow
4. Se `phase` não informada: usar as skills encontradas por similaridade, montar cadeia a partir delas se alguma for skill de workflow
5. Separar resultados em 3 categorias: workflow, context, related

**Response:**

```json
{
  "workflow": [
    {
      "phase": "executing-plans",
      "status": "current",
      "skill": {
        "name": "executing-plans",
        "displayName": "...",
        "content": "..."
      }
    },
    {
      "phase": "verification",
      "status": "next",
      "skill": {
        "name": "verification",
        "displayName": "...",
        "content": "..."
      }
    },
    {
      "phase": "code-review",
      "status": "next",
      "skill": { "name": "code-review", "displayName": "...", "content": "..." }
    }
  ],
  "context": [
    {
      "name": "finno-levels-spec",
      "displayName": "Finno — Financial Levels Spec",
      "similarity": 0.87,
      "content": "..."
    }
  ],
  "related": [
    {
      "name": "tdd-workflow",
      "displayName": "TDD Workflow",
      "similarity": 0.71,
      "content": "..."
    }
  ]
}
```

- **workflow** — Cadeia de fases ordenada. Skills de workflow têm links `extends` entre si no grafo. Conteúdo completo incluído.
- **context** — Skills de projeto (specs, plans, referências) encontradas por similaridade semântica. Conteúdo completo incluído.
- **related** — Skills adicionais relevantes (por similaridade ou links explícitos) que não são workflow nem context direto.

### `nexus_save(name, displayName, description, content, category?, tags?)`

**Tool description:**

> Save a skill, spec, plan, decision, or any knowledge artifact to Nexus. Use after completing work to persist learnings. Automatically generates embeddings for future semantic search. Upserts — creates if new, updates if exists.

**Input:**

- `name` (string, required) — Slug da skill
- `displayName` (string, required) — Nome legível
- `description` (string, required) — Descrição curta
- `content` (string, required) — Conteúdo Markdown
- `category` (string, optional) — Categoria
- `tags` (string[], optional) — Tags

**Lógica:**

1. Gerar embedding do content via Ollama
2. Upsert na tabela `skills` (INSERT ... ON CONFLICT UPDATE)
3. Retornar confirmação

## Schema Changes

### Tabela `skills` — nova coluna

```sql
ALTER TABLE skills ADD COLUMN embedding vector(768);
CREATE INDEX skills_embedding_idx ON skills USING hnsw (embedding vector_cosine_ops);
```

### Extensão pgvector

Já instalada no container (`pgvector/pgvector:pg16`). Precisa habilitar no database `nexus`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Nenhuma tabela nova

A tabela `skill_relations` já existe e suporta links `extends`/`depends_on` pro grafo de workflow.

## Embeddings — Stack

- **Runtime:** Ollama v0.17.0 (já instalado, `/opt/homebrew/bin/ollama`)
- **Modelo:** `nomic-embed-text` (768 dims, 274MB, precisa baixar)
- **API:** `POST http://localhost:11434/api/embed` (JSON)
- **Geração:** Automática ao salvar skill via `nexus_save`
- **Busca:** `SELECT ... ORDER BY embedding <=> $1 LIMIT 5` (cosine distance)
- **Fallback:** Se Ollama indisponível, cai pra match por nome/tags (`ILIKE`)

### Chamada Ollama

```
POST http://localhost:11434/api/embed
{
  "model": "nomic-embed-text",
  "input": "texto para gerar embedding"
}
→ { "embeddings": [[0.1, 0.2, ...]] }
```

## Workflow Chain — via Grafo

Não existe workflow hardcoded. A sequência vem dos relacionamentos `extends` na tabela `skill_relations`:

```
brainstorming --extends→ spec-writing --extends→ writing-plans --extends→ executing-plans --extends→ verification --extends→ code-review
```

Para montar a cadeia a partir de uma skill:

1. Buscar skill pelo nome
2. Seguir links `extends` recursivamente (source → target)
3. Ordenar pela sequência de travessia
4. Retornar com `current` na skill inicial, `next` nas seguintes

Se o usuário criar novos workflows (ex: `grill-me --extends→ spec-writing`), o grafo se adapta sem código novo.

## Estrutura de Arquivos

```
server/src/
├── mcp/
│   └── tools.ts              # REESCREVER: 8 tools → 2 (nexus + nexus_save)
├── services/
│   ├── skills.ts              # Manter (CRUD interno)
│   ├── graph.ts               # Manter + adicionar traverseExtends()
│   ├── embeddings.ts          # NOVO: gerar/buscar embeddings via Ollama
│   └── resolver.ts            # NOVO: lógica do nexus() — embeddings + grafo
├── routes/
│   └── api.ts                 # Manter (dashboard CRUD HTTP)
├── http.ts                    # Manter
└── mcp-stdio.ts               # Manter
```

2 arquivos novos, 1 reescrito, 1 modificado. HTTP API e dashboard não mudam.

## Resumo de Decisões

| Aspecto        | Decisão                                                       |
| -------------- | ------------------------------------------------------------- |
| Tools MCP      | 2: `nexus` (consulta) + `nexus_save` (persistir)              |
| CRUD no MCP    | Removido — mantido apenas no HTTP pro dashboard               |
| Matching       | pgvector embeddings (768 dims, Ollama nomic-embed-text local) |
| Workflow       | Grafo de relacionamentos `extends`, sem hardcode              |
| Fase           | Claude informa via `phase?` (opcional)                        |
| Embedding auto | `nexus_save` gera embedding automaticamente                   |
| Fallback       | Se Ollama indisponível, match por nome/tags                   |
| Custo          | Zero (Ollama local no Mac Mini M4)                            |

## Out of Scope

- Embeddings de chunks (dividir skills longas em pedaços)
- Re-ranking de resultados
- Cache de embeddings frequentes
- UI de busca semântica no dashboard
- Múltiplos workflows paralelos
