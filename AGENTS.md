# AGENTS.md

Este arquivo orienta o opencode (opencode.ai) ao trabalhar com código neste repositório.

---

## Regras Obrigatórias

Os arquivos em `.claude/rules/` (`architecture.md`, `general.md` e `typescript.md`) definem as regras de arquitetura, código e estilo do projeto. **Todas devem ser seguidas obrigatoriamente** durante o desenvolvimento. Consulte-os antes de qualquer alteração.

---

## Visão Geral

API REST de treinos construída com **Fastify 5**, **TypeScript**, **Prisma 7** e **Better-Auth**. Executa em Node.js 24.x com pnpm 11.28.5 (ambos obrigatórios via `engine-strict` no `.npmrc`).

---

## Stack

| Camada       | Tecnologia                                                         |
| ------------ | ------------------------------------------------------------------ |
| Runtime      | Node 24, ESM (`"type": "module"`), TypeScript 5.9 strict           |
| Servidor     | Fastify 5 com `ZodTypeProvider` (validação e serialização via Zod) |
| Banco        | PostgreSQL 16, Prisma 7.4, `@prisma/adapter-pg` (connection pool)  |
| Autenticação | Better-Auth com email/senha, adaptador Prisma, plugin `openAPI`    |
| Documentação | Scalar em `/docs`, Swagger JSON em `/swagger.json`                 |
| Testes       | Vitest 5 (integração com `app.inject`)                             |

---

## Estrutura de Diretórios

```
src/
  index.ts             — Bootstrap do servidor (listen)
  app.ts               — Aplicação Fastify, middlewares e registro de rotas
  routes/              — Handlers das rotas (módulos plugin do Fastify)
  usecases/            — Lógica de negócio (uma classe por caso de uso)
  schemas/             — Schemas Zod para validação e tipos OpenAPI
  errors/              — Classes de erro customizadas
  lib/                 — Infraestrutura compartilhada
    db.ts                → PrismaClient (singleton com adapter pg)
    auth.ts              → Better-Auth
    auth-session.ts      → getSession (wrapper de auth.api.getSession)
    config.ts            → CORS, origins, rate limit e trust proxy
    route-error-handler.ts → Mapeia erros customizados para respostas HTTP
    workout-mappers.ts   → Mappers Prisma → DTO e includes compartilhados
  generated/prisma/    — Saída do Prisma Client (gitignored, regenerado)
prisma/
  schema.prisma        — Modelo de dados
  migrations/          — Migrations versionadas
tests/                 — Testes de integração (Vitest)
```

---

## Setup

```bash
pnpm install                   # pnpm apenas — .npmrc força engine-strict
cp .env.example .env           # Windows: Copy-Item .env.example .env
docker compose up -d           # Inicia PostgreSQL 16 na porta 5433
pnpm db:generate               # Gera Prisma Client → src/generated/prisma/
pnpm db:deploy                 # Aplica migrations no banco
pnpm dev                       # Inicia servidor dev com tsx --watch
```

**Pré-requisitos**: Node.js 24.x e pnpm 11.28.5 (`engines.node` / `devEngines` no `package.json`).

---

## Variáveis de Ambiente

Copie/use o arquivo `.env` na raiz do projeto. Variáveis obrigatórias:

| Variável             | Descrição                                                         |
| -------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`       | String de conexão PostgreSQL                                      |
| `BETTER_AUTH_SECRET` | String aleatória para o Better-Auth                               |
| `BETTER_AUTH_URL`    | URL base usada pelo Better-Auth (padrão: `http://localhost:3000`) |
| `PORT`               | Porta do servidor (padrão: `3000`)                                |

> O `docker-compose.yml` publica o PostgreSQL em `127.0.0.1:5433` e cria o banco `bootcamp-treinos-api`. O `.env.example` já aponta para essa porta/banco.

---

## Comandos

| Comando                             | Descrição                                                    |
| ----------------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                          | Inicia servidor dev com hot-reload (tsx --watch)             |
| `pnpm build`                        | Compila TypeScript para `dist/` (`tsc`)                      |
| `pnpm start`                        | Inicia em produção (`node dist/index.js`)                    |
| `pnpm typecheck`                    | Verifica tipos sem emitir (`tsc --noEmit`)                   |
| `pnpm lint` / `pnpm lint:fix`       | Executa/corrige ESLint                                       |
| `pnpm format` / `pnpm format:check` | Executa/verifica Prettier                                    |
| `pnpm test`                         | Gera Prisma Client, compila testes e roda Vitest             |
| `pnpm test:coverage`                | Roda testes com cobertura (thresholds no `vitest.config.ts`) |
| `pnpm check`                        | typecheck + lint + format:check + test:coverage              |
| `pnpm db:generate`                  | Regenera o Prisma Client após alterações no schema           |
| `pnpm db:migrate`                   | Cria/aplica migration em desenvolvimento                     |
| `pnpm db:deploy`                    | Aplica migrations pendentes                                  |
| `pnpm db:status`                    | Mostra o status das migrations                               |

---

## Convenções

### Imports (ESM)

- Todos os imports locais **devem** usar extensão `.js` (ex: `from "../lib/db.js"`).
- Ordenação de imports é aplicada pelo `eslint-plugin-simple-import-sort` (builtins → externos → internos). Execute `pnpm lint:fix` antes de commitar.
- **Sempre** prefira named exports. Evite default exports a menos que estritamente necessário.

### Zod

- **Sempre** importe de `zod/v4`: `import z from "zod/v4"`. **Nunca** use Zod v3.
- Schemas Zod em `src/schemas/index.ts` funcionam como schemas de request/response do OpenAPI via `fastify-type-provider-zod`.
- Use validadores nativos sempre que possível: `z.url()`, `z.uuid()`, `z.iso.date()`, `z.iso.datetime()`, etc.
- Enums do Prisma (ex: `WeekDay`) devem ser referenciados com `z.enum(WeekDay)`, importando de `../generated/prisma/enums.js`.

### Rotas

- Siga princípios REST: `GET /recurso`, `POST /recurso`, `GET /recurso/:id/sub`, etc.
- Rotas **nunca** contêm regras de negócio — apenas validação (Zod), autenticação e orquestração.
- Toda rota deve instanciar e chamar um use case.
- Erros lançados pelo use case devem ser tratados no handler da rota com try/catch (use `sendRouteError` para o mapeamento padrão).
- **Sempre** inclua `tags` e `summary` no schema da rota para a documentação Swagger/OpenAPI.

### Autenticação

- Para rotas protegidas, recupere a sessão com `getSession(request)` de `src/lib/auth-session.ts` (que usa `auth.api.getSession` + `fromNodeHeaders` de `better-auth/node`).
- `fromNodeHeaders` converte os headers do Fastify para o formato esperado pelo Better-Auth.

### Use Cases

- Arquivos de use case usam **PascalCase** (ex: `CreateWorkoutPlan.ts`).
- Todo use case é uma classe com um método `execute`.
- Parâmetros de entrada devem ser uma interface `InputDto` definida inline no mesmo arquivo.
- O retorno deve ser tipado com uma interface `OutputDto` definida inline no mesmo arquivo. **Nunca** retorne o model do Prisma diretamente — use os mappers de `src/lib/workout-mappers.ts`.
- Use cases chamam o Prisma diretamente (sem camada de repositório).
- **Nunca** capture erros no use case com try/catch. Lance exceções customizadas de `src/errors/index.ts`.

### Erros

- Erros customizados são classes em `src/errors/index.ts` que estendem `Error`.
- Exemplos existentes: `NotFoundError`.
- O handler da rota mapeia cada erro customizado para o status HTTP correspondente (ex: `NotFoundError` → 404). O helper `sendRouteError` centraliza esse mapeamento.

### Nomenclatura

| Elemento          | Convenção  | Exemplo                      |
| ----------------- | ---------- | ---------------------------- |
| Arquivos          | kebab-case | `workout-plan.ts`, `auth.ts` |
| Use cases         | PascalCase | `CreateWorkoutPlan.ts`       |
| Classes           | PascalCase | `CreateWorkoutPlan`          |
| Funções/Variáveis | camelCase  | `execute`, `workoutPlanId`   |
| Interfaces        | PascalCase | `InputDto`, `OutputDto`      |
| Funções           | verbos     | `execute`, `validate`        |

### Datas

- Utilize a biblioteca `dayjs` para manipular e formatar datas (quando necessário).

---

## Fluxo de uma Feature

1. **Schema** (`src/schemas/index.ts`): defina schemas Zod para validação do corpo, parâmetros de rota e respostas.
2. **Erro** (`src/errors/index.ts`): crie classes de erro customizadas se necessário.
3. **Use Case** (`src/usecases/`): implemente a classe com os DTOs inline, chamando o Prisma e lançando erros.
4. **Rota** (`src/routes/`): registre o endpoint com `ZodTypeProvider`, autenticação, `tags` e `summary`, tratando os erros do use case.

---

## Testes

- Testes de integração ficam em `tests/` e usam `app.inject` com um banco PostgreSQL de teste (`<banco>-test`), criado e migrado pelo `tests/global-setup.ts`.
- Rode `pnpm test` (requer Docker/PostgreSQL ativo).
- Thresholds de cobertura: 75% branches, 90% functions/lines/statements.

---

## Observações

- `tsconfig.json` define `"outDir": "./dist"`, portanto `pnpm build` gera `dist/`.
- O banco de testes é derivado de `DATABASE_URL` (sufixo `-test`), salvo se `TEST_DATABASE_NAME` for definido.

### Git

- **NUNCA** faça commits sem autorização explícita do usuário. Sempre solicite permissão antes de commitar.
- Use [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
