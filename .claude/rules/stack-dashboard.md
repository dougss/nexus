---
paths:
  - "dashboard/src/**/*.tsx"
  - "dashboard/src/**/*.ts"
  - "dashboard/vite.config.ts"
---

# Dashboard — React 19 + Vite + Tailwind 4 + shadcn/ui

## React

- Functional components only, sem class components
- Props tipadas inline ou com `type Props = { ... }` (não `interface`)
- Hooks de estado: `useState` + `useEffect` — sem Redux, Zustand, Jotai
- Carregamento de dados: `useEffect(() => { api.method().then(set) }, [dep])`
- Custom hooks em `hooks/` para lógica reutilizável

## Importações

- Path alias `@/` → `dashboard/src/` — sempre preferir sobre caminhos relativos longos
- Ordem: libs externas → `@/components/ui/` → `@/components/` → `@/hooks/` → `@/api/` → `@/types`

## Componentes UI (shadcn)

- `components/ui/` são gerados pelo shadcn CLI — **NUNCA editar manualmente**
- Usar shadcn para primitivos: Button, Input, Dialog, Select, etc.
- Componentes de domínio ficam em `components/` (sem subpasta `ui/`)
- Nomenclatura: kebab-case no arquivo, PascalCase no export

## Tailwind CSS v4

- Sem arquivo `tailwind.config.js` — configuração via CSS em `main.css`
- Usar `cn()` de `lib/utils.ts` para classes condicionais (nunca concatenação manual)
- Sem `@apply` — preferir classes inline
- Tailwind Typography (`@tailwindcss/typography`) para renderizar markdown: classe `prose`

## API

- Toda comunicação com o servidor via `api/client.ts`
- `api` exporta métodos tipados: `api.listSkills()`, `api.getSkill(name)`, etc.
- Erros chegam como `Error` com `.message` da API — mostrar via `sonner` toast
- Nunca usar `fetch` diretamente em componentes

## Roteamento

- `react-router-dom` v7, `<Routes>` em `App.tsx`
- Navegação: `useNavigate()` hook ou `<Link>` component
- Params: `useParams<{ name: string }>()`

## @xyflow/react (Skill Graph)

- Nodes e Edges tipados conforme `types.ts` (`GraphNode`, `GraphEdge`)
- Estado do grafo via `useNodesState` / `useEdgesState`
- Custom node types registrados em `nodeTypes` prop do `<ReactFlow>`
