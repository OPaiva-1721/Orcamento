# Sistema de Orçamentos — Águia Soluções

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)
![Turborepo](https://img.shields.io/badge/Turborepo-pnpm-EF4444?style=for-the-badge&logo=turborepo)

**Monorepo para gestão de orçamentos — API NestJS + SPA React, arquitetura DDD/Clean**

</div>

## Estrutura

```
orcamento-monorepo/
├── apps/
│   ├── api/          # NestJS 11 — Clean Architecture / DDD
│   └── web/          # React 19 + Vite — SPA
├── packages/
│   ├── db/           # Drizzle ORM + migrações (compartilhado)
│   ├── pdf/          # Geração de PDF com pdf-lib
│   ├── shared-types/ # Tipos TypeScript compartilhados
│   └── validators/   # Schemas de validação (Zod / class-validator)
├── docker-compose.yml       # Dev: Postgres + API + Web
├── docker-compose.prod.yml  # Prod: nginx + TLS
└── turbo.json
```

## Stack

### API (`apps/api`)
- **NestJS 11** com arquitetura em camadas: `domain → application → infrastructure → presentation`
- **Drizzle ORM** + **PostgreSQL 16**
- **Firebase Admin** para autenticação JWT
- **Nodemailer** para envio de orçamentos por email
- **NestJS EventEmitter** — eventos de domínio (ex.: `OrcamentoCriado → enviar email`)
- **Helmet** + throttling + `ValidationPipe` com `forbidNonWhitelisted`

### Web (`apps/web`)
- **React 19** + **Vite 8**
- **TanStack Query v5** para cache e estado de servidor
- **React Router v7**
- **Firebase** (auth client-side)
- **Tailwind CSS 4** + `lucide-react`

### Pacotes internos
| Pacote | Conteúdo |
|---|---|
| `@orcamento/db` | Schema Drizzle, migrações, cliente PG |
| `@orcamento/pdf` | Geração de PDF com logo da empresa |
| `@orcamento/shared-types` | Tipos de domínio compartilhados |
| `@orcamento/validators` | DTOs e schemas de validação |

## Pré-requisitos

- **Node.js 20+**
- **pnpm 10+**
- **Docker + Docker Compose** (para desenvolvimento local)

## Instalação

```bash
# Clone e instale dependências
git clone <repositorio>
cd orcamento-monorepo
pnpm install

# Configure as variáveis de ambiente
cp env.example .env
# Edite .env com suas credenciais (ver seção abaixo)
```

## Variáveis de Ambiente

```env
# Banco de Dados
POSTGRES_DB=orcamento
POSTGRES_USER=orcamento
POSTGRES_PASSWORD=CHANGE_ME_STRONG_RANDOM_VALUE
DATABASE_URL="postgresql://orcamento:CHANGE_ME@localhost:5432/orcamento"

# Email (SMTP / Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=noreply@empresa.com

# CORS
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK (API)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Produção (nginx + TLS)
DOMAIN=
SSL_EMAIL=
```

## Desenvolvimento

```bash
# Sobe Postgres via Docker
pnpm docker:up

# Executa migrações
pnpm db:migrate

# Inicia todos os apps em paralelo (Turborepo)
pnpm dev

# API:  http://localhost:3001
# Web:  http://localhost:5173
```

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia API + Web em modo watch |
| `pnpm build` | Build de todos os pacotes (ordem correta via Turbo) |
| `pnpm lint` | ESLint em todos os workspaces |
| `pnpm db:generate` | Gera artefatos Drizzle |
| `pnpm db:push` | Sincroniza schema com o banco |
| `pnpm db:migrate` | Executa migrações |
| `pnpm docker:up` | Sobe Postgres + API + Web via Docker |
| `pnpm docker:down` | Para os containers |
| `pnpm docker:logs` | Acompanha logs da API |

## Testes (API)

```bash
cd apps/api

# Unitários
pnpm test

# E2E
pnpm test:e2e

# Cobertura
pnpm test:cov
```

## Arquitetura da API

```
src/
├── domain/           # Entidades, VOs, exceptions, interfaces de repositório
├── application/      # Use cases, queries, event handlers
├── infrastructure/   # Drizzle repos, Firebase, Nodemailer, pdf-lib
└── presentation/     # Controllers NestJS, guards, filters, interceptors
```

Fluxo de autenticação: Firebase ID Token → `AuthGuard` → `@CurrentUser()` decorator → isolamento por tenant nos repositórios.

## Docker (Produção)

```bash
# Build e sobe com nginx + TLS (Let's Encrypt)
docker-compose -f docker-compose.prod.yml up -d
```

Requer `DOMAIN` e `SSL_EMAIL` definidos no `.env`.

## Modelo de Dados

### Cliente
- `id`, `nome`, `cnpj`, `email` (único), `telefone`
- Possui múltiplos **Destinatários** e **Orçamentos**

### Destinatário
- `id`, `nome`, `email`, `clienteId`

### Orçamento
- `id`, `descricao`, `preco`, `status`, `formaPagamento`
- `dataInicio`, `dataTermino` (opcional), `clienteId`
- Ao ser criado, dispara evento que envia email PDF para os destinatários

## API — Endpoints Principais

| Método | Rota | Descrição |
|---|---|---|
| `GET/POST` | `/clientes` | Listar / criar clientes |
| `GET/PUT/DELETE` | `/clientes/:id` | Buscar / atualizar / remover |
| `GET/POST` | `/destinatarios` | Listar / criar destinatários |
| `GET/PUT/DELETE` | `/destinatarios/:id` | Buscar / atualizar / remover |
| `GET/POST` | `/orcamentos` | Listar / criar orçamentos |
| `GET/PUT/DELETE` | `/orcamentos/:id` | Buscar / atualizar / remover |
| `POST` | `/email/enviar` | Enviar orçamento por email |
| `POST` | `/pdf/gerar` | Gerar PDF do orçamento |
| `GET` | `/dashboard/stats` | Estatísticas gerais |

Todos os endpoints requerem Firebase ID Token no header `Authorization: Bearer <token>`.
