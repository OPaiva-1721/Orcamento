# 🔧 Configuração do Sistema de Orçamentos

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- PostgreSQL (ou SQLite para desenvolvimento)
- Conta Gmail para envio de emails

## 🚀 Passo a Passo da Configuração

### 1. 📁 Criar Arquivo `.env`

Copie o arquivo `env.example` para `.env` na raiz do projeto:

```bash
copy env.example .env
```

### 2. 🗄️ Configurar Banco de Dados

#### Opção A: PostgreSQL (Recomendado para Produção)

1. **Instalar PostgreSQL:**
   - Windows: https://www.postgresql.org/download/windows/
   - Ou usar XAMPP com PostgreSQL

2. **Criar Banco de Dados:**
   ```sql
   CREATE DATABASE orcamentos_aguia;
   ```

3. **Configurar no `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/orcamentos_aguia"
   ```

#### Opção B: SQLite (Mais Simples para Desenvolvimento)

1. **Alterar o schema.prisma:**
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Configurar no `.env`:**
   ```env
   DATABASE_URL="file:./dev.db"
   ```

### 3. 📧 Configurar Email

1. **Acessar:** https://myaccount.google.com/apppasswords
2. **Gerar senha de aplicativo** para o email da empresa
3. **Configurar no `.env`:**
   ```env
   EMAIL_USER="aguia.solucoes@gmail.com"
   EMAIL_PASS="senha_de_app_gerada"
   ```

### 4. 🔄 Executar Comandos

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Executar migrações (criar tabelas)
npx prisma migrate dev

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📊 Estrutura do Banco

O sistema criará automaticamente estas tabelas:

- **`Cliente`** - Dados dos clientes
- **`Destinatario`** - Destinatários dos emails
- **`Orcamento`** - Orçamentos da empresa

## 🔍 Verificar Configuração

### Testar Banco de Dados:
```bash
npx prisma studio
```

### Testar Email:
Acesse: `http://localhost:3000/api/teste-email`

## 🛠️ Comandos Úteis

```bash
# Ver dados no banco
npx prisma studio

# Resetar banco (cuidado!)
npx prisma migrate reset

# Ver logs do Prisma
DEBUG="prisma:query" npm run dev

# Gerar novo cliente Prisma
npx prisma generate
```

## ❗ Problemas Comuns

### Erro: "Database connection failed"
- Verifique se o PostgreSQL está rodando
- Confirme a senha no DATABASE_URL
- Teste a conexão no pgAdmin

### Erro: "Email authentication failed"
- Use senha de aplicativo, não senha normal
- Verifique se o email está correto
- Confirme se a verificação em 2 etapas está ativada

### Erro: "Prisma client not generated"
- Execute: `npx prisma generate`
- Verifique se o schema.prisma está correto

## 📞 Suporte

Para dúvidas sobre configuração, consulte:
- Documentação Prisma: https://www.prisma.io/docs
- Configuração Gmail: https://support.google.com/accounts/answer/185833
