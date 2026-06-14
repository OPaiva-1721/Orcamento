# Web — Sistema de Orçamentos

React 19 + Vite 8 SPA. Porta de desenvolvimento: **5173**.

## Stack

- **React 19** + **TypeScript 6**
- **Vite 8** — build e dev server
- **React Router v7** — roteamento client-side
- **TanStack Query v5** — cache e estado de servidor
- **Firebase** — autenticação (email/senha)
- **Tailwind CSS 4** + `lucide-react`
- **`@orcamento/shared-types`** — tipos compartilhados com a API

## Estrutura

```
src/
├── contexts/
│   └── AuthContext.tsx     # Firebase auth state (user, signIn, signOut)
├── hooks/
│   ├── useClientes.ts
│   ├── useDestinatarios.ts
│   └── useOrcamentos.ts    # React Query hooks para cada recurso
├── lib/
│   ├── api-client.ts       # fetch wrapper com Firebase token + ApiError
│   ├── firebase.ts         # inicialização do Firebase client
│   ├── config.ts
│   └── utils.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── clientes/           # list / novo / editar
│   ├── destinatarios/      # list / novo / editar
│   └── orcamentos/         # list / novo / editar
├── components/
│   └── layout/
│       ├── Layout.tsx
│       ├── Sidebar.tsx
│       └── BottomNavigation.tsx
└── router.tsx              # definição das rotas protegidas
```

## Autenticação

Firebase email/senha no lado cliente. `AuthContext` expõe `user`, `loading`, `signIn`, `signOut`.

Todas as chamadas à API incluem automaticamente o Firebase ID Token:

```ts
// lib/api-client.ts
headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
```

Rotas protegidas redirecionam para `/login` quando `user === null`.

## Variáveis de Ambiente

Crie `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

## Desenvolvimento

```bash
# Na raiz do monorepo
pnpm --filter web dev
# http://localhost:5173

# Ou via Turborepo (inicia API + Web juntos)
pnpm dev
```

## Build

```bash
pnpm --filter web build   # gera dist/
pnpm --filter web preview # serve o build localmente
```

## Comunicação com a API

`lib/api-client.ts` exporta helpers tipados:

```ts
api.get<Cliente[]>('/clientes')
api.post<Orcamento>('/orcamentos', body)
api.put<Cliente>('/clientes/1', body)
api.delete('/clientes/1')
```

Respostas no formato `{ success: true, data: T }` são desempacotadas automaticamente. Erros lançam `ApiError` com `status` e `code`.
