# API — Sistema de Orçamentos

NestJS 11 com arquitetura Clean/DDD. Porta padrão: **3001**.

## Arquitetura

```
src/
├── domain/           # Entidades, Value Objects, interfaces de repositório, exceptions
│   ├── cliente/
│   ├── destinatario/
│   ├── email/
│   ├── orcamento/
│   └── shared/
├── application/      # Use cases, queries, event handlers
│   ├── cliente/
│   ├── dashboard/
│   ├── destinatario/
│   ├── email/
│   └── orcamento/
├── infrastructure/   # Implementações concretas
│   ├── auth/firebase/     # Firebase Admin SDK
│   ├── database/drizzle/  # Repositórios Drizzle + PG
│   ├── email/nodemailer/  # Envio de email
│   └── pdf/pdf-lib/       # Geração de PDF
└── presentation/
    └── http/              # Controllers, guards, filters, interceptors, decorators
```

Fluxo: `HTTP → FirebaseAuthGuard → Controller → Use Case → Repository (Drizzle) → PostgreSQL`

Eventos de domínio via `@nestjs/event-emitter`: ao criar orçamento, dispara `OrcamentoCriadoEvent` → `OrcamentoCriadoHandler` → envia email com PDF anexado.

## Autenticação

Firebase ID Token obrigatório em todos os endpoints (exceto rotas marcadas com `@Public()`).

```
Authorization: Bearer <firebase-id-token>
```

O `uid` do token é usado como `ownerId` em todas as queries — isolamento multi-tenant por linha.

## Endpoints

### Clientes — `GET /clientes`
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/clientes` | Listar (`?q=`, `?page=`, `?limit=`) |
| `POST` | `/clientes` | Criar |
| `GET` | `/clientes/:id` | Buscar por ID |
| `PUT` | `/clientes/:id` | Atualizar |
| `DELETE` | `/clientes/:id` | Remover |

### Destinatários — `GET /destinatarios`
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/destinatarios` | Listar (`?clienteId=`, `?page=`, `?limit=`) |
| `POST` | `/destinatarios` | Criar |
| `GET` | `/destinatarios/:id` | Buscar por ID |
| `PUT` | `/destinatarios/:id` | Atualizar |
| `DELETE` | `/destinatarios/:id` | Remover |

### Orçamentos — `GET /orcamentos`
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/orcamentos` | Listar (`?clienteId=`, `?status=`, `?page=`, `?limit=`) |
| `POST` | `/orcamentos` | Criar (dispara evento de email) |
| `GET` | `/orcamentos/:id` | Buscar por ID |
| `PUT` | `/orcamentos/:id` | Atualizar |
| `DELETE` | `/orcamentos/:id` | Remover |

### Outros
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/dashboard/stats` | Estatísticas do dashboard |
| `POST` | `/orcamentos/:id/emails` | Enviar PDF por email (rate limit: 5/min) |
| `GET` | `/orcamentos/:id/pdf` | Gerar PDF padrão (binário) |
| `GET` | `/orcamentos/:id/pdf?tipo=editavel` | Gerar PDF com campos editáveis |

## Status de Orçamento

Valores válidos (definidos em `@orcamento/shared-types`):

| Valor | Constante |
|---|---|
| `"Pendente"` | `ORCAMENTO_STATUS.PENDENTE` |
| `"Aprovado"` | `ORCAMENTO_STATUS.APROVADO` |
| `"Rejeitado"` | `ORCAMENTO_STATUS.REJEITADO` |
| `"Cancelado"` | `ORCAMENTO_STATUS.CANCELADO` |
| `"Em Andamento"` | `ORCAMENTO_STATUS.EM_ANDAMENTO` |
| `"Concluído"` | `ORCAMENTO_STATUS.CONCLUIDO` |

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://orcamento:senha@localhost:5432/orcamento
FRONTEND_URL=http://localhost:5173
PORT=3001

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Desenvolvimento

```bash
# Na raiz do monorepo
pnpm docker:up   # sobe Postgres
pnpm db:migrate  # executa migrações

# Só a API em watch mode
pnpm --filter api start:dev
```

## Testes

```bash
pnpm --filter api test          # unitários
pnpm --filter api test:e2e      # end-to-end
pnpm --filter api test:cov      # cobertura
```

## Segurança

- `helmet()` — headers HTTP seguros
- `ValidationPipe` com `whitelist: true` e `forbidNonWhitelisted: true`
- Throttle global + rate limit específico em `POST /orcamentos/:id/emails` (5 req/min)
- `trust proxy 1` para IP real via `X-Forwarded-For` (atrás do nginx)
- Stack traces nunca expostos em produção (`AllExceptionsFilter`)
