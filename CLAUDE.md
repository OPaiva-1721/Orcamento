# CLAUDE.md — Orcamento V2

Guia de contexto para o Claude Code. Leia antes de qualquer tarefa.

## O que é este projeto

Sistema de gestão de orçamentos para a Águia Soluções. Monorepo pnpm + Turborepo com dois apps e quatro pacotes internos.

## Estrutura do monorepo

```
apps/
  api/   NestJS 11 — Clean Architecture / DDD, porta 3001
  web/   React 19 + Vite 8 — SPA, porta 5173
packages/
  db/            Drizzle ORM, schema, migrações, cliente PG
  pdf/           Geração de PDF com pdf-lib
  shared-types/  Tipos e interfaces compartilhados (Cliente, Orcamento, etc.)
  validators/    DTOs e schemas de validação
```

## Como rodar

```bash
pnpm install
cp env.example .env        # preencher credenciais
pnpm docker:up             # sobe Postgres 16
pnpm db:migrate            # executa migrações Drizzle
pnpm dev                   # API + Web em paralelo via Turbo
```

Scripts raiz relevantes: `db:generate`, `db:push`, `db:migrate`, `docker:up`, `docker:down`, `docker:logs`.

## API (`apps/api`)

### Camadas (ordem de dependência)

```
domain → application → infrastructure → presentation
```

- **domain**: entidades, value objects (`CnpjVO`, `OrcamentoStatusVO`), interfaces de repositório, domain exceptions
- **application**: use cases (um arquivo por caso de uso), queries de dashboard, event handlers de email
- **infrastructure**: repositórios Drizzle, Firebase Admin, Nodemailer, pdf-lib
- **presentation**: controllers NestJS, `FirebaseAuthGuard`, `DomainExceptionFilter`, `ResponseTransformInterceptor`, `@CurrentUser()` decorator

### Padrões importantes

**Multi-tenant**: todo repositório recebe `ownerId: string` derivado do Firebase token. Nunca vem do body. Injetado pelo controller via `@CurrentUser() user` → `user.uid`.

**Resposta HTTP**: `ResponseTransformInterceptor` envolve toda resposta em `{ success: true, data: T }`. Erros de domínio retornam `{ success: false, error: string, code: string }`.

**Eventos de domínio**: criar orçamento dispara `OrcamentoCriadoEvent` → `OrcamentoCriadoHandler` → gera PDF uma vez e envia para todos os destinatários.

**Guards globais (ordem no `AppModule`)**:
1. `ThrottlerGuard` — 60 req/min por IP (global)
2. `FirebaseAuthGuard` — todos os endpoints requerem token, exceto `@Public()`

**Filters globais (ordem)**:
1. `AllExceptionsFilter` — captura tudo, sem vazamento de stack trace
2. `DomainExceptionFilter` — mapeia domain exceptions para HTTP status

**ValidationPipe**: `whitelist: true`, `forbidNonWhitelisted: true`. Campos extras no body = 400.

### Status de Orçamento

Definidos em `@orcamento/shared-types`. Valores: `"Pendente"`, `"Aprovado"`, `"Rejeitado"`, `"Cancelado"`, `"Em Andamento"`, `"Concluído"`.

### Endpoints resumidos

```
GET/POST        /clientes               ?q= ?page= ?limit=
GET/PUT/DELETE  /clientes/:id
GET/POST        /destinatarios          ?clienteId= ?page= ?limit=
GET/PUT/DELETE  /destinatarios/:id
GET/POST        /orcamentos             ?clienteId= ?status= ?page= ?limit=
GET/PUT/DELETE  /orcamentos/:id
GET             /dashboard/stats
POST            /orcamentos/:id/emails          rate limit: 5/min
GET             /orcamentos/:id/pdf             retorna binário PDF
GET             /orcamentos/:id/pdf?tipo=editavel  retorna binário PDF editável
```

## Web (`apps/web`)

SPA React com Firebase auth client-side. Rotas protegidas redirecionam para `/login` quando `user === null`.

**`lib/api-client.ts`**: wrapper de fetch que injeta Firebase ID Token automaticamente e desempacota `{ data }` da resposta. Lança `ApiError` com `status` e `code`.

**`contexts/AuthContext.tsx`**: expõe `user`, `loading`, `signIn(email, password)`, `signOut()`.

**Hooks React Query**: `useClientes`, `useDestinatarios`, `useOrcamentos` — cada um gerencia cache, mutations e invalidação.

Variável de ambiente chave: `VITE_API_BASE_URL` (padrão: `http://localhost:3001`).

## Pacotes internos

Sempre importar por alias de workspace, não por caminho relativo:

```ts
import { OrcamentoStatus } from '@orcamento/shared-types';
import { gerarPDF }        from '@orcamento/pdf';
```

Ao alterar `@orcamento/shared-types` ou `@orcamento/validators`, o Turbo garante rebuild antes dos apps — mas rode `pnpm build` na raiz se algo não refletir em dev.

## Banco de dados

- **ORM**: Drizzle (pacote `@orcamento/db`)
- **Schema**: `packages/db/src/schema/*.schema.ts`
- **Migrações**: `packages/db/src/migrations/` — geradas com `pnpm db:generate`, aplicadas com `pnpm db:migrate`
- **Nunca** usar `db:push` em produção; apenas `db:migrate`

## Testes

```bash
pnpm --filter api test          # unitários (jest)
pnpm --filter api test:e2e      # end-to-end (supertest)
pnpm --filter api test:cov      # cobertura
```

Testes unitários ficam em `src/**/*.spec.ts`. E2E em `apps/api/test/`.

## Convenções de código

- **Commits**: Conventional Commits — `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`
- **Imports**: absolutos por alias de workspace para pacotes; relativos para arquivos dentro do mesmo app
- **DTOs**: ficam junto ao use case que os consome (`create-orcamento.dto.ts` ao lado de `create-orcamento.use-case.ts`)
- **Exceptions de domínio**: estendem `DomainException` em `domain/shared/exceptions/`; o `DomainExceptionFilter` mapeia automaticamente para o HTTP status correto
- **Novos repositórios**: implementar a interface de `domain/*/repositories/`, registrar no módulo NestJS correspondente com o token de injeção (`ORCAMENTO_REPOSITORY`, etc.)

## Variáveis de ambiente necessárias

Ver `env.example` na raiz. Resumo das obrigatórias para dev local:

| Variável | Onde usar |
|---|---|
| `DATABASE_URL` | API + pacote db |
| `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY` | API (Firebase Admin) |
| `SMTP_*` | API (Nodemailer) |
| `VITE_FIREBASE_*` | Web (Firebase client) |
| `VITE_API_BASE_URL` | Web |

## Docker

- **Dev**: `docker-compose.yml` — Postgres + API + Web
- **Prod**: `docker-compose.prod.yml` — adiciona nginx com TLS (Let's Encrypt), requer `DOMAIN` e `SSL_EMAIL`
