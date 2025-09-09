# 🚀 Migração para Supabase - Guia Completo

Este guia te ajudará a migrar do SQLite local para o Supabase (PostgreSQL na nuvem).

## 📋 **Pré-requisitos**

- ✅ Conta no Supabase (gratuita)
- ✅ Node.js instalado
- ✅ Projeto Next.js funcionando

## 🎯 **Passo 1: Configurar Projeto no Supabase**

### **1.1 Criar Conta e Projeto**
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub, Google ou email
4. Clique em "New Project"

### **1.2 Configurar Projeto**
```
Organization: [Sua organização]
Project Name: orcamento-aguia
Database Password: [Escolha uma senha forte]
Region: South America (São Paulo) - mais próximo
```

### **1.3 Aguardar Criação**
- ⏱️ **Tempo**: 2-3 minutos
- ✅ **Status**: "Project is ready"

## 🔑 **Passo 2: Obter Credenciais**

### **2.1 Database URL**
1. Vá em **Settings** → **Database**
2. Role: **postgres**
3. Copy a **Connection string**
4. Substitua `[YOUR-PASSWORD]` pela senha que você criou

**Exemplo:**
```
postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### **2.2 API Keys (Opcional)**
1. Vá em **Settings** → **API**
2. Copy **Project URL** e **anon public** key
3. Guarde para funcionalidades futuras

## ⚙️ **Passo 3: Configurar Variáveis de Ambiente**

### **3.1 Criar arquivo .env.local**
Crie o arquivo `orcamento/.env.local` com:

```env
# Configurações do Banco de Dados - Supabase
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"

# Configurações do Nodemailer (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gabryelpaiva123@gmail.com
SMTP_PASS=ufyh cyye htcb amvb
SMTP_FROM=noreply@empresa.com

# URL da aplicação
NEXTAUTH_URL=http://localhost:3000
```

### **3.2 Substituir Valores**
- `SUA_SENHA`: Senha do banco que você criou
- `SEU_PROJECT_REF`: ID do seu projeto (ex: abcdefghijklmnop)

## 🗄️ **Passo 4: Executar Migrações**

### **4.1 Instalar Dependências**
```bash
cd orcamento
npm install
```

### **4.2 Gerar Cliente Prisma**
```bash
npx prisma generate
```

### **4.3 Executar Migração**
```bash
npx prisma migrate dev --name init
```

### **4.4 Verificar Conexão**
```bash
npx prisma db push
```

## 🌱 **Passo 5: Seed dos Dados (Opcional)**

### **5.1 Executar Seed**
```bash
node seed.js
```

### **5.2 Verificar no Supabase**
1. Vá em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - `Cliente`
   - `Destinatario`
   - `Orcamento`
   - `EmailEnviado`
   - `StatusHistory`

## 🧪 **Passo 6: Testar Aplicação**

### **6.1 Iniciar Servidor**
```bash
npm run dev
```

### **6.2 Testar Funcionalidades**
1. ✅ **Criar cliente**
2. ✅ **Criar orçamento**
3. ✅ **Enviar email**
4. ✅ **Gerar PDF**

## 🔧 **Comandos Úteis**

### **Prisma Studio (Interface Visual)**
```bash
npx prisma studio
```

### **Reset do Banco (Cuidado!)**
```bash
npx prisma migrate reset
```

### **Ver Status das Migrações**
```bash
npx prisma migrate status
```

## 🚨 **Solução de Problemas**

### **Erro de Conexão**
```
Error: P1001: Can't reach database server
```
**Solução:**
- Verifique se a URL está correta
- Confirme se a senha está correta
- Verifique se o projeto está ativo no Supabase

### **Erro de Migração**
```
Error: P3005: The database schema is not empty
```
**Solução:**
```bash
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

### **Erro de Permissão**
```
Error: P1008: Operations timed out
```
**Solução:**
- Verifique se está usando a role `postgres`
- Confirme se o projeto não está pausado

## 📊 **Vantagens do Supabase**

### **✅ Benefícios**
- 🌐 **Acesso remoto** de qualquer lugar
- 🔒 **Backup automático** diário
- 📈 **Escalabilidade** automática
- 🛡️ **Segurança** enterprise-grade
- 🔄 **Sincronização** em tempo real
- 📱 **API REST** automática

### **✅ Recursos Gratuitos**
- 💾 **500MB** de armazenamento
- 🔗 **2GB** de transferência
- 👥 **50.000** usuários ativos
- ⏱️ **7 dias** de backup

## 🎉 **Próximos Passos**

### **Funcionalidades Futuras**
- 🔐 **Autenticação** com Supabase Auth
- 📊 **Dashboard** em tempo real
- 🔔 **Notificações** push
- 📱 **App mobile** com sincronização

### **Otimizações**
- 🚀 **CDN** para assets
- 🗜️ **Compressão** de imagens
- 📈 **Analytics** de uso
- 🔍 **Busca** full-text

## 📞 **Suporte**

### **Documentação**
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

### **Comunidade**
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**🎯 Após seguir este guia, sua aplicação estará rodando no Supabase com PostgreSQL na nuvem!**
