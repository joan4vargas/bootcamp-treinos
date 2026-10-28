# Bootcamp Treinos API

[![CI](https://github.com/joan4vargas/bootcamp-treinos/actions/workflows/ci.yml/badge.svg)](https://github.com/joan4vargas/bootcamp-treinos/actions/workflows/ci.yml)

API REST para gerenciamento de planos de treino, construída com Node.js, TypeScript, Fastify, Prisma e better-auth.

## Stack

| Tecnologia  | Versão  |
| ----------- | ------- |
| Node.js     | 24.x    |
| pnpm        | 11.28.5 |
| TypeScript  | 5.9     |
| Fastify     | 5       |
| Prisma      | 7       |
| PostgreSQL  | 16      |
| better-auth | 1.7     |
| Zod         | 4       |
| Vitest      | 5       |

## Requisitos

- Node.js 24
- pnpm 11.28.5
- Docker e Docker Compose

## Setup

```bash
# 1. Instale as dependências
pnpm install

# 2. Crie o arquivo de ambiente
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Gere um segredo para o better-auth:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Preencha `BETTER_AUTH_SECRET` no `.env` com o valor gerado.

```bash
# 3. Suba o PostgreSQL
docker compose up -d

# 4. Gere o Prisma Client e aplique as migrations
pnpm db:generate
pnpm db:deploy

# 5. Inicie o servidor em modo de desenvolvimento
pnpm dev
```

A API estará disponível em `http://localhost:3000`.

## Documentação da API

| Recurso                | URL                                                       |
| ---------------------- | --------------------------------------------------------- |
| Scalar                 | `http://localhost:3000/docs`                              |
| OpenAPI principal      | `http://localhost:3000/swagger.json`                      |
| OpenAPI do better-auth | `http://localhost:3000/api/auth/open-api/generate-schema` |
| Healthcheck            | `http://localhost:3000/health`                            |

A documentação do Scalar possui duas fontes: **Bootcamp Treinos API** e **Auth API**.

## Variáveis de ambiente

| Variável                      | Descrição                          | Exemplo                                                              |
| ----------------------------- | ---------------------------------- | -------------------------------------------------------------------- |
| `HOST`                        | Interface de escuta                | `127.0.0.1` (container: `0.0.0.0`)                                   |
| `PORT`                        | Porta do servidor                  | `3000`                                                               |
| `DATABASE_URL`                | Conexão com o PostgreSQL           | `postgresql://postgres:password@localhost:5433/bootcamp-treinos-api` |
| `BETTER_AUTH_SECRET`          | Segredo usado pelo better-auth     | valor aleatório de 32 bytes                                          |
| `BETTER_AUTH_URL`             | URL base do better-auth            | `http://localhost:3000`                                              |
| `CORS_ORIGINS`                | Origens permitidas no CORS         | `http://localhost:3000,https://app.example.com`                      |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Origens extras confiadas pelo auth | `https://app.example.com`                                            |
| `RATE_LIMIT_MAX`              | Limite global por IP/minuto        | `100`                                                                |
| `RATE_LIMIT_WINDOW`           | Janela do limite global            | `1 minute`                                                           |
| `AUTH_RATE_LIMIT_MAX`         | Limite de auth por IP/minuto       | `20`                                                                 |
| `AUTH_RATE_LIMIT_WINDOW`      | Janela do limite de auth           | `1 minute`                                                           |
| `TRUST_PROXY`                 | Confia em `X-Forwarded-*`          | `false`                                                              |
| `POSTGRES_USER`               | Usuário do Compose de produção     | `postgres`                                                           |
| `POSTGRES_PASSWORD`           | Senha do Compose de produção       | valor forte e exclusivo                                              |
| `POSTGRES_DB`                 | Banco do Compose de produção       | `bootcamp-treinos-api`                                               |

`CORS_ORIGINS` e `BETTER_AUTH_TRUSTED_ORIGINS` aceitam listas separadas por vírgula. Se `CORS_ORIGINS` não for definido, a API usa `BETTER_AUTH_URL` como origem padrão. Wildcards não são aceitos com credenciais.

O `docker-compose.yml` expõe o PostgreSQL em `127.0.0.1:5433` com o banco `bootcamp-treinos-api`.

## Estrutura

```text
src/
  app.ts                  # Configuração do Fastify, plugins e rotas
  index.ts                # Inicialização do servidor
  lib/
    auth.ts               # Configuração do better-auth
    auth-session.ts       # Leitura da sessão a partir dos headers
    config.ts             # CORS, rate limit e trust proxy
    db.ts                 # Cliente Prisma compartilhado
    workout-access.ts     # Verificação de propriedade de planos/dias/exercícios
  routes/
    workout-plans.ts      # CRUD de planos
    workout-days.ts       # CRUD de dias
    workout-exercises.ts  # CRUD de exercícios
    workout-schemas.ts    # Schemas Zod compartilhados
prisma/
  schema.prisma
  migrations/
tests/
  helpers.ts
  auth-docs-cors.test.ts
  config.test.ts
  workout-plans.test.ts
  workout-days-exercises.test.ts
Dockerfile
docker-compose.prod.yml
```

## Modelo de dados

```text
User 1 ─── N WorkoutPlan 1 ─── N WorkoutDay 1 ─── N WorkoutExercise
```

- `WorkoutPlan` pertence a um `User`.
- `WorkoutDay` pertence a um `WorkoutPlan`.
- `WorkoutExercise` pertence a um `WorkoutDay`.
- O better-auth utiliza as tabelas `user`, `session`, `account` e `verification`.

## Autenticação

A autenticação é feita por cookie de sessão do better-auth.

| Método | Rota                      | Descrição                   |
| ------ | ------------------------- | --------------------------- |
| `POST` | `/api/auth/sign-up/email` | Cadastro com e-mail e senha |
| `POST` | `/api/auth/sign-in/email` | Login com e-mail e senha    |
| `GET`  | `/api/auth/get-session`   | Retorna a sessão atual      |
| `POST` | `/api/auth/sign-out`      | Encerra a sessão            |

As rotas de planos, dias e exercícios exigem sessão válida e retornam `401` sem autenticação.

### Exemplo de cadastro

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "name": "João",
    "email": "joao@example.com",
    "password": "SenhaForte123!"
  }'
```

O header `Origin` é necessário porque o better-auth valida as origens confiáveis configuradas em `CORS_ORIGINS` (ou `BETTER_AUTH_TRUSTED_ORIGINS`).

## Segurança

- `@fastify/helmet` adiciona headers de segurança em todas as respostas. A CSP é desativada apenas para não bloquear a interface do Scalar.
- `@fastify/rate-limit` aplica limite global de `100` requisições por minuto por IP e limite de `20` por minuto nas rotas de autenticação. Os valores são configuráveis por ambiente.
- O IP usado pelo rate limit do better-auth é derivado de `request.ip`; habilite `TRUST_PROXY=true` somente quando a API estiver atrás de um proxy confiável.
- `CORS_ORIGINS` usa allowlist explícita e não aceita `*` com credenciais.
- `pnpm audit:prod` verifica vulnerabilidades nas dependências de produção e também roda no CI.
- Ao excluir um usuário, planos, dias e exercícios são removidos por `ON DELETE CASCADE`.

## Endpoints de treino

### Planos

| Método   | Rota                 | Descrição                           |
| -------- | -------------------- | ----------------------------------- |
| `POST`   | `/workout-plans`     | Cria um plano com dias e exercícios |
| `GET`    | `/workout-plans`     | Lista os planos do usuário          |
| `GET`    | `/workout-plans/:id` | Busca um plano pelo ID              |
| `PATCH`  | `/workout-plans/:id` | Atualiza `name` e/ou `isActive`     |
| `DELETE` | `/workout-plans/:id` | Remove o plano e seus filhos        |

A listagem aceita:

| Parâmetro  | Valores           | Descrição                 |
| ---------- | ----------------- | ------------------------- |
| `isActive` | `true` ou `false` | Filtra pelo status        |
| `limit`    | `1` a `100`       | Quantidade de itens       |
| `offset`   | `>= 0`            | Deslocamento da paginação |

O total de registros é retornado no header `X-Total-Count`. A resposta continua sendo um array para preservar compatibilidade.

### Exemplo de criação de plano

```bash
curl -i -b cookies.txt -X POST http://localhost:3000/workout-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hipertrofia",
    "workoutDays": [
      {
        "name": "Treino A",
        "weekDay": "MONDAY",
        "isRest": false,
        "exercises": [
          {
            "name": "Supino reto",
            "order": 1,
            "sets": 4,
            "reps": 10,
            "restTimeInSeconds": 60
          }
        ]
      }
    ]
  }'
```

`isActive` assume `true` por padrão. `isRest` assume `false` e `exercises` assume `[]`.

### Exemplo de listagem

```bash
curl -i -b cookies.txt \
  "http://localhost:3000/workout-plans?isActive=true&limit=10&offset=0"
```

### Dias

| Método   | Rota                                 | Descrição                                |
| -------- | ------------------------------------ | ---------------------------------------- |
| `POST`   | `/workout-plans/:planId/days`        | Adiciona um dia ao plano                 |
| `PATCH`  | `/workout-plans/:planId/days/:dayId` | Atualiza `name`, `weekDay` e/ou `isRest` |
| `DELETE` | `/workout-plans/:planId/days/:dayId` | Remove o dia e seus exercícios           |

### Exercícios

| Método   | Rota                                                       | Descrição             |
| -------- | ---------------------------------------------------------- | --------------------- |
| `POST`   | `/workout-plans/:planId/days/:dayId/exercises`             | Adiciona um exercício |
| `PATCH`  | `/workout-plans/:planId/days/:dayId/exercises/:exerciseId` | Atualiza o exercício  |
| `DELETE` | `/workout-plans/:planId/days/:dayId/exercises/:exerciseId` | Remove o exercício    |

Exemplo para adicionar um dia:

```bash
curl -i -b cookies.txt -X POST \
  http://localhost:3000/workout-plans/<planId>/days \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Treino B",
    "weekDay": "TUESDAY",
    "isRest": false,
    "exercises": []
  }'
```

Exemplo para adicionar um exercício:

```bash
curl -i -b cookies.txt -X POST \
  http://localhost:3000/workout-plans/<planId>/days/<dayId>/exercises \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Remada curvada",
    "order": 1,
    "sets": 3,
    "reps": 12,
    "restTimeInSeconds": 60
  }'
```

## Scripts

| Comando               | Descrição                                                  |
| --------------------- | ---------------------------------------------------------- |
| `pnpm dev`            | Inicia o servidor com `tsx --watch`                        |
| `pnpm build`          | Compila o projeto com TypeScript                           |
| `pnpm start`          | Executa o build compilado                                  |
| `pnpm lint`           | Executa o ESLint                                           |
| `pnpm lint:fix`       | Executa o ESLint com correção automática                   |
| `pnpm format`         | Formata os arquivos com Prettier                           |
| `pnpm format:check`   | Verifica a formatação                                      |
| `pnpm audit:prod`     | Audita vulnerabilidades nas dependências de produção       |
| `pnpm typecheck`      | Executa o TypeScript sem emitir arquivos                   |
| `pnpm check`          | Executa typecheck, lint, formatação e testes com cobertura |
| `pnpm db:generate`    | Gera o Prisma Client                                       |
| `pnpm db:migrate`     | Cria/aplica migrations em desenvolvimento                  |
| `pnpm db:deploy`      | Aplica migrations existentes                               |
| `pnpm db:status`      | Verifica o status das migrations                           |
| `pnpm db:validate`    | Valida o schema Prisma                                     |
| `pnpm db:studio`      | Abre o Prisma Studio                                       |
| `pnpm test`           | Gera o client, faz typecheck dos testes e executa o Vitest |
| `pnpm test:coverage`  | Executa os testes e gera o relatório de cobertura          |
| `pnpm test:typecheck` | Apenas o typecheck dos testes                              |
| `pnpm test:watch`     | Executa o Vitest em modo watch                             |

## Docker

A imagem de produção é multi-stage, roda como usuário `node` e possui healthcheck em `/health`:

```bash
docker build -t bootcamp-treinos-api .
```

Para subir API, PostgreSQL e migrations com o Compose de produção:

```bash
cp .env.example .env
# Edite POSTGRES_PASSWORD, BETTER_AUTH_SECRET, BETTER_AUTH_URL e CORS_ORIGINS
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

O serviço `migrate` executa `pnpm db:deploy` e precisa terminar com sucesso antes de a API iniciar. O banco usa o volume `pgdata-prod`. Para derrubar os containers sem apagar os dados:

```bash
docker compose -f docker-compose.prod.yml down
```

Para remover também o volume do banco:

```bash
docker compose -f docker-compose.prod.yml down -v
```

O `Dockerfile` define `HOST=0.0.0.0` para permitir o acesso via portas publicadas. Em execuções locais fora do container, o padrão é `127.0.0.1`; ajuste `HOST` apenas se necessário. O `DATABASE_URL` do container deve apontar para um PostgreSQL acessível a partir da rede Docker.

## Testes

Os testes são de integração e usam `app.inject`, sem iniciar um servidor HTTP real.

```bash
pnpm test
```

Para executar com cobertura:

```bash
pnpm test:coverage
```

O relatório é gerado em `coverage/` nos formatos texto, HTML, LCOV e JSON summary. Os limites mínimos configurados são:

| Métrica    | Mínimo |
| ---------- | ------ |
| Statements | 90%    |
| Lines      | 90%    |
| Functions  | 90%    |
| Branches   | 75%    |

O comando `pnpm check` também executa os testes com cobertura.

O banco de testes é criado automaticamente a partir do `DATABASE_URL`:

```text
bootcamp-treinos-api-test
```

O `tests/global-setup.ts` cria o banco quando necessário e aplica as migrations. Cada arquivo de teste limpa as tabelas antes e depois da execução, sem alterar o banco de desenvolvimento.

Para remover o banco de teste:

```bash
docker exec bootcamp-treinos-db psql -U postgres -d postgres \
  -c 'DROP DATABASE IF EXISTS "bootcamp-treinos-api-test";'
```

### Cenários cobertos

- Criação de planos com dias e exercícios.
- Listagem com filtro e paginação.
- Busca, atualização e exclusão de planos.
- Validação de payloads e UUIDs.
- Isolamento de dados entre usuários.
- CRUD de dias e exercícios.
- Exclusão em cascata lógica de dias e exercícios.
- Exigência de autenticação.
- Sessão anônima e autenticada.
- Login, logout, senha inválida e cadastro duplicado.
- OpenAPI do better-auth.
- Swagger principal, rota raiz e documentação Scalar.
- Redirecionamento de `/docs` para `/docs/`.
- Preflight CORS e exposição de `X-Total-Count`.
- Parsing e validação de origens permitidas.
- Healthcheck e headers de segurança.
- Rate limit nas rotas de autenticação.
- Exclusão em cascata de planos, dias e exercícios ao remover usuário.
- Falha interna do handler de autenticação.

## CI

O workflow `.github/workflows/ci.yml` executa em `push`, `pull_request` e execução manual:

1. Instalação com `pnpm install --frozen-lockfile`.
2. Auditoria das dependências de produção.
3. Geração e validação do Prisma Client.
4. Aplicação e verificação das migrations.
5. Typecheck, ESLint e Prettier.
6. Testes com cobertura usando PostgreSQL 16 como serviço.
7. Upload do relatório de cobertura como artifact.
8. Build da aplicação.
9. Build da imagem Docker de produção.

O CI usa credenciais e segredo exclusivos para teste. Em produção, utilize secrets reais.

## Decisões de contrato

- `GET /workout-plans` retorna um array e expõe o total em `X-Total-Count`.
- `PATCH /workout-plans/:id` aceita apenas `name` e `isActive`.
- `DELETE /workout-plans/:id` remove exercícios, dias e o plano em transação.
- `DELETE /workout-plans/:planId/days/:dayId` remove os exercícios do dia em transação.
- O campo `WorkoutDay.updateAt` foi mantido conforme o schema original.
- As relações de treino usam `onDelete: Cascade` para garantir consistência ao excluir usuário, plano ou dia. As rotas de exclusão continuam usando transações para respostas previsíveis.
- A exclusão de usuário remove planos, dias e exercícios; não há endpoint público de exclusão de usuário.
