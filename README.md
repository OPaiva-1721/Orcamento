# 🏢 Sistema de Orçamentos - Águia Soluções

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)

**Sistema completo de gestão de orçamentos com design moderno, responsivo e funcionalidades avançadas**

[🚀 Demo](#-demo) • [📖 Documentação](#-documentação) • [🛠️ Instalação](#-instalação) • [📱 Mobile](#-versão-mobile)

</div>

## ✨ **Funcionalidades Principais**

### 🎯 **Gestão Completa**
- **👥 Clientes**: Cadastro e gestão com validação de CNPJ e email único
- **📧 Destinatários**: Sistema de múltiplos destinatários por cliente
- **📋 Orçamentos**: Criação com datas flexíveis (data de término opcional)
- **📊 Dashboard**: Visão geral com estatísticas e métricas

### 📄 **Geração de PDFs Profissional**
- **📑 PDF Padrão**: Layout limpo e organizado com logo da empresa
- **✏️ PDF Editável**: Campos destacados para modificação posterior
- **🎨 Design Minimalista**: Tipografia moderna e espaçamentos otimizados
- **📱 Responsivo**: Compatível com impressão em qualquer dispositivo

### 📧 **Sistema de Emails Avançado**
- **📨 Template Minimalista**: Design moderno e profissional
- **🔄 Envio em Lote**: Múltiplos destinatários simultaneamente
- **📎 Anexos Automáticos**: PDF anexado automaticamente
- **📊 Rastreamento**: Controle de emails enviados e status

### 📱 **Versão Mobile**
- **🎨 Design Responsivo**: Interface adaptada para mobile
- **👆 Touch-Friendly**: Botões e elementos otimizados para toque
- **🔄 Pull-to-Refresh**: Atualização por gesto de puxar
- **📱 Bottom Navigation**: Navegação intuitiva no mobile
- **📊 Tabelas Responsivas**: Layout em cards para telas pequenas

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **⚡ Next.js 15** - Framework React com App Router
- **🔷 TypeScript 5** - Tipagem estática
- **🎨 Tailwind CSS 4** - Estilização utilitária
- **📱 Responsive Design** - Mobile-first approach

### **Backend**
- **🗄️ Prisma ORM** - Gerenciamento de banco de dados
- **🐘 PostgreSQL** - Banco de dados relacional
- **☁️ Supabase** - PostgreSQL gerenciado na nuvem
- **📧 Nodemailer** - Sistema de emails

### **PDFs e Documentos**
- **📄 PDF-lib** - Geração e manipulação de PDFs
- **🎨 Design System** - Layout padronizado e profissional

### **UI/UX**
- **🎯 Componentes Reutilizáveis** - Sistema de design consistente
- **📱 Mobile-First** - Otimizado para dispositivos móveis
- **♿ Acessibilidade** - Contraste e navegação otimizados

## 🚀 **Instalação Rápida**

### **📋 Pré-requisitos**
- **Node.js 18+** (recomendado: 20+)
- **npm, yarn, pnpm ou bun**
- **Conta no Supabase** (gratuita)

### **⚡ Instalação em 3 Passos**

#### **1️⃣ Clone e Instale**
```bash
# Clone o repositório
git clone <seu-repositorio>
cd orcamento

# Instale as dependências
npm install
```

#### **2️⃣ Configure o Supabase**
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o .env com suas credenciais do Supabase
# DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"
```

#### **3️⃣ Execute a Migração**
```bash
# Migração automática para Supabase
npm run migrate:supabase

# Ou manualmente:
npx prisma generate
npx prisma migrate dev --name init
node seed.js
```

#### **4️⃣ Inicie o Projeto**
```bash
# Modo desenvolvimento
npm run dev

# Acesse: http://localhost:3000
```

## ☁️ **Configuração do Supabase**

### **🎯 Criar Projeto**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a senha do banco e Project Reference

### **🔑 Obter Credenciais**
1. Vá em **Settings → Database**
2. Copie a **Connection string** (role: postgres)
3. Substitua `[YOUR-PASSWORD]` pela sua senha

### **📝 Exemplo de .env**
```env
# Supabase Database
DATABASE_URL="postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres"

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=noreply@empresa.com

# App
NEXTAUTH_URL=http://localhost:3000
```

## 📁 **Estrutura do Projeto**

```
orcamento/
├── 📁 src/
│   ├── 📁 app/                    # Next.js 15 App Router
│   │   ├── 📁 api/                # API Routes
│   │   │   ├── 📁 clientes/       # CRUD de clientes
│   │   │   ├── 📁 destinatarios/  # CRUD de destinatários
│   │   │   ├── 📁 orcamentos/     # CRUD de orçamentos
│   │   │   ├── 📁 enviar-email/   # Sistema de emails
│   │   │   ├── 📁 gerar-pdf/      # Geração de PDFs
│   │   │   └── 📁 gerar-pdf-editavel-simples/
│   │   ├── 📁 dashboard/          # Dashboard principal
│   │   ├── 📁 clientes/           # Páginas de clientes
│   │   ├── 📁 destinatarios/      # Páginas de destinatários
│   │   ├── 📁 orcamentos/         # Páginas de orçamentos
│   │   ├── 📄 layout.tsx          # Layout principal
│   │   ├── 📄 page.tsx            # Página inicial
│   │   └── 📄 globals.css         # Estilos globais
│   ├── 📁 components/             # Componentes reutilizáveis
│   │   └── 📁 ui/                 # Componentes de UI
│   │       ├── 📄 sidebar.tsx     # Sidebar responsiva
│   │       ├── 📄 bottom-navigation.tsx # Navegação mobile
│   │       ├── 📄 responsive-table.tsx  # Tabela responsiva
│   │       ├── 📄 pull-to-refresh.tsx   # Pull-to-refresh
│   │       └── 📄 mobile-form.tsx       # Formulários mobile
│   ├── 📁 lib/                    # Utilitários
│   │   ├── 📄 prisma.ts          # Cliente Prisma
│   │   └── 📄 utils.ts           # Funções utilitárias
│   └── 📁 types/                  # Definições TypeScript
│       └── 📄 index.ts           # Tipos da aplicação
├── 📁 prisma/
│   ├── 📄 schema.prisma          # Schema do banco
│   └── 📁 migrations/            # Migrações
├── 📁 public/
│   └── 🖼️ logoaguia.png         # Logo da empresa
├── 📄 package.json               # Dependências e scripts
├── 📄 tailwind.config.js         # Configuração Tailwind
├── 📄 next.config.js             # Configuração Next.js
├── 📄 migrate-to-supabase.js     # Script de migração
├── 📄 seed.js                    # Seed do banco
└── 📚 *.md                       # Documentação
```

## 🎯 **Scripts Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | 🚀 Inicia servidor de desenvolvimento |
| `npm run build` | 🏗️ Build para produção |
| `npm run start` | ▶️ Inicia servidor de produção |
| `npm run lint` | 🔍 Executa linter |
| `npm run db:generate` | 🔧 Gera cliente Prisma |
| `npm run db:push` | 📤 Sincroniza schema com banco |
| `npm run db:migrate` | 🗄️ Executa migrações |
| `npm run db:studio` | 🎨 Interface visual do banco |
| `npm run db:reset` | 🔄 Reseta banco (cuidado!) |
| `npm run migrate:supabase` | ☁️ Migração automática para Supabase |

## 📊 **Modelo de Dados**

### **👥 Cliente**
```typescript
{
  id: number
  nome: string
  cnpj: string
  email: string (único)
  telefone: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### **📧 Destinatário**
```typescript
{
  id: number
  nome: string
  email: string
  clienteId: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### **📋 Orçamento**
```typescript
{
  id: number
  descricao: string
  preco: number
  status: string (default: "Pendente")
  formaPagamento: boolean (false = "À vista", true = "7 dias após vencimento")
  dataInicio: DateTime
  dataTermino: DateTime? (opcional)
  clienteId: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🛣️ **API Routes**

### **👥 Clientes**
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/clientes` | Listar clientes |
| `POST` | `/api/clientes` | Criar cliente |
| `GET` | `/api/clientes/[id]` | Buscar cliente |
| `PUT` | `/api/clientes/[id]` | Atualizar cliente |
| `DELETE` | `/api/clientes/[id]` | Deletar cliente |

### **📧 Destinatários**
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/destinatarios` | Listar destinatários |
| `POST` | `/api/destinatarios` | Criar destinatário |
| `GET` | `/api/destinatarios/[id]` | Buscar destinatário |
| `PUT` | `/api/destinatarios/[id]` | Atualizar destinatário |
| `DELETE` | `/api/destinatarios/[id]` | Deletar destinatário |

### **📋 Orçamentos**
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/orcamentos` | Listar orçamentos |
| `POST` | `/api/orcamentos` | Criar orçamento |
| `GET` | `/api/orcamentos/[id]` | Buscar orçamento |
| `PUT` | `/api/orcamentos/[id]` | Atualizar orçamento |
| `DELETE` | `/api/orcamentos/[id]` | Deletar orçamento |

### **📄 PDFs e Emails**
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/gerar-pdf` | Gerar PDF padrão |
| `POST` | `/api/gerar-pdf-editavel-simples` | Gerar PDF editável |
| `POST` | `/api/enviar-email` | Enviar orçamento por email |

## 📱 **Versão Mobile**

### **🎨 Design Responsivo**
- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Breakpoints**: `xs: 475px`, `sm: 640px`, `md: 768px`, `lg: 1024px`
- **Touch-Friendly**: Botões com tamanho mínimo de 44px
- **Safe Areas**: Suporte para iPhone com notch

### **🔄 Componentes Mobile**
- **Sidebar Responsiva**: Colapsa em mobile com overlay
- **Bottom Navigation**: Navegação intuitiva na parte inferior
- **Pull-to-Refresh**: Atualização por gesto de puxar
- **Responsive Table**: Tabelas que viram cards em mobile
- **Mobile Forms**: Formulários otimizados para touch

### **📊 Layout Adaptativo**
```css
/* Desktop: Sidebar fixa + conteúdo */
@media (min-width: 1024px) {
  .layout { display: grid; grid-template-columns: 256px 1fr; }
}

/* Mobile: Sidebar colapsável + bottom nav */
@media (max-width: 1023px) {
  .layout { display: block; padding-bottom: 80px; }
}
```

## 🎨 **Design System**

### **🎯 Cores**
- **Primary**: `#1e40af` (Azul principal)
- **Secondary**: `#3b82f6` (Azul claro)
- **Success**: `#059669` (Verde)
- **Warning**: `#f59e0b` (Amarelo)
- **Error**: `#ef4444` (Vermelho)

### **📝 Tipografia**
- **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- **Headings**: `font-weight: 600-700`
- **Body**: `font-weight: 400-500`
- **Mobile**: `font-size: 16px` (previne zoom no iOS)

### **📐 Espaçamentos**
- **Padding**: `p-4 lg:p-6` (responsivo)
- **Margins**: `space-y-4 lg:space-y-6`
- **Border Radius**: `rounded-lg` (8px)
- **Shadows**: `shadow-sm` a `shadow-lg`

## 📝 **Exemplos de Uso**

### **👥 Criar Cliente**
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Empresa ABC Ltda",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@empresaabc.com",
    "telefone": "(11) 99999-9999"
  }'
```

### **📋 Criar Orçamento**
```bash
curl -X POST http://localhost:3000/api/orcamentos \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Desenvolvimento de Sistema Web",
    "preco": 15000.00,
    "status": "Pendente",
    "formaPagamento": false,
    "dataInicio": "2024-01-15T00:00:00.000Z",
    "dataTermino": "2024-03-15T00:00:00.000Z",
    "clienteId": 1,
    "destinatarioIds": [1, 2]
  }'
```

### **📄 Gerar PDF**
```bash
curl -X POST http://localhost:3000/api/gerar-pdf \
  -H "Content-Type: application/json" \
  -d '{"orcamentoId": 1}' \
  --output orcamento_aguia_1.pdf
```

### **📧 Enviar Email**
```bash
curl -X POST http://localhost:3000/api/enviar-email \
  -H "Content-Type: application/json" \
  -d '{
    "orcamentoId": 1,
    "destinatarioIds": [1, 2]
  }'
```

## 🚀 **Deploy**

### **☁️ Vercel (Recomendado)**
```bash
# Instale o Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure variáveis de ambiente no dashboard
```

### **🐳 Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **☁️ Outras Plataformas**
- **Railway**: Conecte diretamente ao repositório
- **Netlify**: Configure build command como `npm run build`
- **Heroku**: Use buildpack do Node.js
- **DigitalOcean**: App Platform com PostgreSQL

## 🐛 **Solução de Problemas**

### **❌ Erro de Conexão com Banco**
```bash
# Verifique se o Supabase está ativo
# Confirme as credenciais no .env
# Teste a conexão
npx prisma db push
```

### **❌ Erro de Build**
```bash
# Limpe o cache
rm -rf .next node_modules
npm install
npm run build
```

### **❌ Problemas com PDFs**
- Verifique se o `pdf-lib` está instalado
- Confirme se o logo está em `public/logoaguia.png`
- Teste a geração: `curl -X POST /api/gerar-pdf`

### **❌ Emails não Enviam**
- Verifique as credenciais SMTP no `.env`
- Confirme se a senha do Gmail é de app (não da conta)
- Teste com um email simples primeiro

## 📚 **Documentação Adicional**

- 📧 **[Melhorias do Email](MELHORIAS_EMAIL.md)** - Template minimalista
- 📱 **[Melhorias Mobile](MELHORIAS_MOBILE.md)** - Design responsivo
- 📄 **[Melhorias dos PDFs](MELHORIAS_PDF.md)** - Layout profissional
- ☁️ **[Migração Supabase](MIGRACAO_SUPABASE.md)** - Guia completo
- 🗑️ **[Limpeza de Arquivos](LIMPEZA_ARQUIVOS.md)** - Organização do projeto

## 🤝 **Contribuindo**

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

## 📄 **Licença**

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

- 🐛 **Bugs**: Abra uma [issue](../../issues) no GitHub
- 💡 **Sugestões**: Use as [discussions](../../discussions)
- 📧 **Contato**: [seu-email@exemplo.com]

---

<div align="center">

**🏢 Sistema de Orçamentos - Águia Soluções**

*Desenvolvido com ❤️ usando Next.js 15, TypeScript, Tailwind CSS e Supabase*

[⬆️ Voltar ao topo](#-sistema-de-orçamentos---águia-soluções)

</div>