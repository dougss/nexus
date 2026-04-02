# Domain — Skills & Workflow Graph

## Glossário

| Termo              | Definição                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Skill**          | Unidade de conhecimento/instrução. Identificada por `name` (slug único). `content` é markdown.                                            |
| **Embedding**      | Vetor 768-dim gerado pelo Ollama `nomic-embed-text`. Usado para busca semântica.                                                          |
| **Relation**       | Edge direcional entre duas skills. `extends` forma chains de workflow; `related` é conexão livre.                                         |
| **Workflow chain** | Sequência de skills ligadas por `extends`. Retornada pelo `nexus` MCP tool como `workflow[]`.                                             |
| **Phase**          | Nome de uma skill que representa uma etapa de processo (ex: `brainstorming`, `executing-plans`).                                          |
| **Category**       | String livre que classifica a skill. Categorias de workflow: `discovery`, `planning`, `execution`, `quality`, `development`, `debugging`. |
| **Tag**            | Array de strings para categorização adicional. Tags compartilhadas geram edges automáticos no grafo (não persistidos).                    |

## Invariantes

- `name` é único e imutável (é o identificador público usado pelo MCP e pela API)
- Embeddings têm 768 dimensões (nomic-embed-text) — não mudar o modelo sem regenerar todos os embeddings (`backfill-embeddings.ts`)
- `traverseExtends` para em ciclos (visited set) — garantido no código
- `SIMILARITY_THRESHOLD = 0.3` (em `resolver.ts`) — abaixo disso a skill é descartada

## Fluxo do MCP `nexus`

```
intent + phase?
    │
    ├── phase fornecido → traverseExtends(phase) → workflow[]
    │
    ├── generateEmbedding(intent) [Ollama]
    │       └── falhou? → fallbackResolve (ILIKE text search)
    │
    └── pgvector cosine search → filter by threshold → split by category
            ├── categoria de workflow → related[]
            └── outros → context[]
```

## Ao adicionar uma nova categoria de workflow

Editar o `Set` `WORKFLOW_CATEGORIES` em `server/src/services/resolver.ts`.

## Ao adicionar um novo tipo de relação

Criar o tipo string em `skill_relations.relation_type`. Atualizar `traverseExtends` se o novo tipo precisar ser seguido como workflow chain.
