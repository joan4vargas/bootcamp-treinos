# FIT.AI — bootcamp-treinos-frontend

Front-end web do FIT.AI (Next.js 16 + React 19 + TypeScript + Tailwind + shadcn/ui), consumindo a API `bootcamp-treinos-api`.

## Rodando

1. Suba a API na porta **8080** (veja o README-MUDANCAS.md da API).
2. Copie `.env.example` para `.env` (já vem com `NEXT_PUBLIC_API_URL=http://localhost:8080` e `NEXT_PUBLIC_BASE_URL=http://localhost:3000`).
3. Instale e rode:

```bash
pnpm install
npx orval        # regenera app/_lib/api/fetch-generated a partir do swagger da API
pnpm dev         # http://localhost:3000
```

## Estrutura

```
app/
├── _components/        componentes compartilhados (bottom-nav, workout-day-card, chat...)
├── _lib/               auth-client, datas, formatação, orval (api/)
├── auth/               tela de login (Google)
├── onboarding/         chat de cadastro inicial
├── profile/            perfil + sair da conta
├── stats/              sequência, heatmap de 3 meses e métricas
├── workout-plans/[id]/ plano de treino (7 dias)
│   └── days/[dayId]/   dia de treino (iniciar / concluir, server actions)
├── layout.tsx          fontes, NuqsAdapter e chat global
└── page.tsx            home
components/ui/          componentes shadcn/ui
.claude/rules/          regras do agente de IA
tasks/                  especificações 01–07 (Driven Specs)
```

## Observações

- Fontes (Inter Tight e Anton) via `@fontsource`, sem depender do Google Fonts no build.
- O `create-next-app@16` atual liga `cacheComponents` por padrão; foi desligado para seguir o modelo do roteiro (páginas dinâmicas com `headers()` e `redirect`).
- Cores extraídas do arquivo Figma: primária `#2b54ff`, sequência `#f06100`, borda `#f1f1f1` etc. (todas em `app/globals.css`).
