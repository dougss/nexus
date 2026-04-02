# Code Quality

Nunca usar placeholders (`// ... rest`, `// TODO: implement`, `/* existing code */`). Sempre código completo e funcional.

Toda feature nova deve ter testes. Toda correção de bug deve ter teste que reproduz o bug. Rodar testes existentes após cada mudança: `cd server && npm run test`.

Testes rodam contra `nexus_test` DB (nunca `nexus`). O `vitest.config.ts` já define isso via env. O `cleanDb()` de `test/setup.ts` deve ser chamado antes de cada teste que modifica dados.

Commits: `tipo(escopo): descrição`. Um commit por mudança lógica. Exemplo: `feat(resolver): add category filter to semantic search`.

Preferir mudanças pequenas e verificáveis. Após cada mudança: `cd server && npm run build` para confirmar que compila.

Nunca ignorar erros silenciosamente. `console.error` com contexto suficiente para debug. Seguir o padrão do projeto: erros de serviços externos (Ollama, DB) são logados e têm fallback ou propagam com mensagem clara.
