# Nexus v2

> Skill-driven workflows para Claude Code — MCP server + CLI, zero runtime dependencies.

Nexus é um sistema de skills em Markdown que ensina Claude a trabalhar com processos estruturados. Cada skill contém instruções, mecanismos de enforcement (Iron Laws, HARD-GATEs, Red Flags) e referências a outras skills formando workflows encadeados.

---

## Como funciona

```
~/.claude.json (ou settings.json)
    └── nexus MCP server (bin/nexus-mcp)
            ├── nexus_list  → lista as skills disponíveis
            └── nexus_get   → carrega o SKILL.md completo

~/.claude/CLAUDE.md (global)
    └── instrução EXTREMELY-IMPORTANT: chamar nexus_list + nexus_get("using-nexus") em toda sessão
```

Ao iniciar uma sessão, Claude chama `nexus_list`, identifica quais skills se aplicam à tarefa, e carrega cada uma via `nexus_get` antes de agir.

---

## Estrutura do projeto

```
nexus/
├── bin/
│   ├── nexus          # CLI: validate, graph
│   └── nexus-mcp      # MCP stdio server (JSON-RPC 2.0)
├── skills/            # skills — uma por diretório
│   ├── using-nexus/SKILL.md          # bootstrap (lido primeiro)
│   ├── brainstorming/SKILL.md
│   ├── writing-plans/SKILL.md
│   ├── executing-plans/SKILL.md
│   ├── test-driven-development/SKILL.md
│   ├── systematic-debugging/SKILL.md
│   ├── requesting-code-review/SKILL.md
│   ├── verification-before-completion/SKILL.md
│   ├── finishing-a-development-branch/SKILL.md
│   ├── subagent-driven-development/SKILL.md
│   ├── using-git-worktrees/SKILL.md
│   ├── writing-skills/SKILL.md       # meta-skill para criar skills
│   └── ui-ux-pro-max/SKILL.md
├── docs/
│   └── skill-graph.md  # grafo Mermaid auto-gerado
└── specs/              # specs de design e histórico
```

---

## Skills disponíveis

| Skill                            | Quando usar                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `using-nexus`                    | Início de qualquer conversa — bootstrap                       |
| `brainstorming`                  | Antes de implementar qualquer feature ou mudança              |
| `writing-plans`                  | Quando tem spec/requisito para tarefa multi-step              |
| `executing-plans`                | Quando tem plano escrito para executar                        |
| `test-driven-development`        | Antes de escrever qualquer código de implementação            |
| `systematic-debugging`           | Ao encontrar bug, falha de teste ou comportamento inesperado  |
| `requesting-code-review`         | Ao completar tarefa ou antes de merge                         |
| `verification-before-completion` | Antes de afirmar que o trabalho está pronto                   |
| `finishing-a-development-branch` | Quando implementação está completa e precisa integrar         |
| `subagent-driven-development`    | Quando tem 2+ tarefas independentes para executar em paralelo |
| `using-git-worktrees`            | Ao iniciar feature que precisa de isolamento                  |
| `writing-skills`                 | Ao criar ou editar skills                                     |
| `ui-ux-pro-max`                  | Ao projetar UI/UX — layouts, estilos, paletas, fontes         |

---

## Configuração MCP

### Claude Code (`~/.claude.json` ou `~/.claude/settings.json`)

```json
"mcpServers": {
  "nexus": {
    "type": "stdio",
    "command": "/opt/homebrew/opt/node@22/bin/node",
    "args": ["/Users/macmini/server/apps/nexus/bin/nexus-mcp"]
  }
}
```

### OpenCode (`~/.opencode/opencode.json`)

```json
"mcp": {
  "nexus": {
    "type": "local",
    "command": ["node", "/Users/macmini/server/apps/nexus/bin/nexus-mcp"]
  }
}
```

### Instrução global (`~/.claude/CLAUDE.md`)

O arquivo global já contém o bloco `EXTREMELY-IMPORTANT` que força Claude a chamar `nexus_list` + `nexus_get("using-nexus")` no início de toda sessão.

---

## CLI

```bash
# Validar todas as skills (frontmatter, enforcement, chain integrity)
node bin/nexus validate

# Regenerar grafo Mermaid em docs/skill-graph.md
node bin/nexus graph

# Sincronizar skills de specs/ para skills/ (apenas novas, não sobrescreve)
node bin/nexus sync
```

O `validate` falha com exit 1 se houver erros — integrado no GitHub Actions (`.github/workflows/update-graph.yml`).

---

## Criar uma nova skill

Peça ao Claude Code: **"Crie uma skill no Nexus para [descrição]"**

Claude vai seguir a skill `writing-skills` e automaticamente:

1. Criar `skills/<nome>/SKILL.md` com frontmatter e enforcement corretos
2. Adicionar a skill na lista de `skills/using-nexus/SKILL.md`
3. Rodar `node bin/nexus validate` para verificar

O MCP lê do disco em cada chamada — a skill fica disponível imediatamente na mesma sessão, sem restart.

### Estrutura de uma SKILL.md

```markdown
---
name: nome-da-skill
description: Descrição humana clara (usada no nexus_list)
whenToUse: Use when [gatilho de ativação — máx 250 chars]
---

## Overview

[Princípio central]

## [Conteúdo da skill]

[Processo, metodologia, referências]

## Red Flags (obrigatório para process skills)

| Thought                | Reality               |
| ---------------------- | --------------------- |
| "Racionalização comum" | "Por que está errado" |

## Integration

**REQUIRED SUB-SKILL:** nexus:outra-skill (quando aplicável)
```

**Enforcement obrigatório** para process skills (pelo menos um):

- `<IRON-LAW>` — regra absoluta sem exceção
- `<HARD-GATE>` — verificação explícita antes de avançar
- Red Flags table com racionalizações + refutações

---

## Segurança

O `nexus_get` valida que o path resolvido está dentro de `skills/` antes de ler — path traversal via `../` é bloqueado com retorno de `not found`.

---

## Desenvolvimento

```bash
# Após editar qualquer skill
node bin/nexus validate

# Para verificar o grafo atualizado
node bin/nexus graph
cat docs/skill-graph.md
```

Não há `npm install`, `npm run build` ou processo de compilação — os binários são ESM puro.
