# Mudanças na API para o front-end do FIT.AI

Este pacote traz só `src/`, `prisma/` e `.env.example`. **Substitua essas pastas no seu projeto** (mantenha seu `package.json`, `node_modules`, `docker-compose.yml` etc.).

## 1. Instalar as dependências novas

```bash
pnpm add ai@6.0.100 @ai-sdk/openai@3.0.33 dayjs@1.11.19
```

## 2. Atualizar o `.env`

Compare com o `.env.example`. As variáveis **novas ou alteradas** são:

| Variável | Valor | Por quê |
|---|---|---|
| `PORT` | `8080` | o Next usa a 3000 |
| `HOST` | `localhost` | escuta em IPv4 e IPv6 (o Next no Windows costuma resolver `localhost` para `::1`) |
| `BETTER_AUTH_URL` | `http://localhost:8080` | origem do cookie e do callback do Google |
| `CORS_ORIGINS` | `http://localhost:3000` | **obrigatório**: sem isso o CORS só libera a própria API e o front leva erro |
| `BETTER_AUTH_TRUSTED_ORIGINS` | `http://localhost:3000` | permite o `callbackURL` do front no login |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | do Google Cloud Console | login com Google |
| `OPENAI_API_KEY` | `sk-...` | chatbot (`gpt-4o-mini`) |

No Google Cloud Console: origem `http://localhost:8080` e redirect URI `http://localhost:8080/api/auth/callback/google`.

## 3. Banco de dados

```bash
pnpm exec prisma migrate dev     # aplica a migration 20261124230000_add_workout_sessions_and_train_data
pnpm exec prisma generate
```

A migration adiciona:
- tabela `WorkoutSession` (`startedAt`, `completedAt`) ligada ao `WorkoutDay`;
- `WorkoutDay.coverImageUrl` (opcional);
- `user.weightInGrams`, `heightInCentimeters`, `age`, `bodyFatPercentage` (opcionais).

## 4. Rotas novas

| Rota | operationId | Use case |
|---|---|---|
| `GET /home/:date` | `getHomeData` | `GetHomeData` |
| `GET /stats?from=&to=` | `getStats` | `GetStats` |
| `GET /me` | `getUserTrainData` | `GetUserTrainData` (retorna `null` se não cadastrado) |
| `PUT /me` | `upsertUserTrainData` | `UpsertUserTrainData` |
| `GET /workout-plans/:planId/days/:dayId` | `getWorkoutDay` | `GetWorkoutDay` (com `sessions`) |
| `POST /workout-plans/:planId/days/:dayId/sessions` | `startWorkoutSession` | `StartWorkoutSession` |
| `PATCH /workout-plans/:planId/days/:dayId/sessions/:sessionId` | `updateWorkoutSession` | `UpdateWorkoutSession` |
| `POST /ai` | `chatWithAi` | streaming do Vercel AI SDK com tools |

Todas as rotas antigas ganharam `operationId` (nomes das funções geradas pelo Orval).

## 5. Outras mudanças

- **Erros novos** (`src/errors`): `WorkoutPlanNotActiveError`, `RestDayError`, `SessionAlreadyStartedError`, `SessionAlreadyCompletedError` → todos viram **409** no `route-error-handler`.
- **`CreateWorkoutPlan`**: ao criar um plano ativo, desativa os outros planos ativos do usuário (numa transação). Assim só existe um "plano ativo", que é o que a home usa.
- **Respostas de dia de treino** agora trazem `coverImageUrl` e `estimatedDurationInSeconds` (estimativa: `séries × (reps × 4s + descanso)` por exercício).
- **Sequência (streak)**: conta dias seguidos com treino concluído; dias de descanso do plano ativo não quebram a sequência, e o dia de hoje ainda não treinado também não.
- **Taxa de conclusão**: sessões concluídas ÷ sessões iniciadas no período.
- **Auth**: `socialProviders.google` com `prompt: "select_account"` e `baseURL`. O login por e-mail/senha **continua habilitado** (útil para testar pelo `/docs`); remova `emailAndPassword` se quiser seguir o roteiro à risca.
- **IA** (`src/routes/ai.ts` + `src/lib/ai-prompt.ts`): tools `getUserTrainData`, `updateUserTrainData` (peso em gramas), `getWorkoutPlans` e `createWorkoutPlan` (sempre 7 dias, sem `coverImageUrl` para a IA não inventar URLs), limitado a 10 passos.

Para trocar para o Gemini: `pnpm add @ai-sdk/google@3.0.34`, troque o import em `src/routes/ai.ts` para `import { google } from "@ai-sdk/google"` e o modelo para `google("gemini-2.5-flash")`.

## Testado

Rodei a API com PostgreSQL 16 e testei: criação de plano, `/me`, `/home`, início/conclusão de sessão, conflitos 409 (sessão repetida e dia de descanso), `/stats` e o streaming do `/ai` (até a chamada à OpenAI, que não tinha chave no ambiente de teste).
