# 🔧 Guia de Solução de Problemas

## Erro: "Foreign key constraint violated"

### Problema
```
"errors": "\nInvalid `prisma.destinatario.create()` invocation:\n\n\nForeign key constraint violated on the (not available)"
```

### Causa
Este erro ocorre quando você tenta criar um destinatário com um `clienteId` que não existe na tabela `Cliente`.

### Solução

#### 1. Verificar Clientes Existentes
Primeiro, liste todos os clientes disponíveis:

```bash
GET /api/Clientes
```

**Exemplo de resposta:**
```json
[
  {
    "id": 1,
    "nome": "Empresa ABC Ltda",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@empresaabc.com",
    "telefone": "(11) 99999-9999"
  },
  {
    "id": 2,
    "nome": "Indústria XYZ",
    "cnpj": "98.765.432/0001-10",
    "email": "vendas@industriaxyz.com",
    "telefone": "(11) 88888-8888"
  }
]
```

#### 2. Criar um Cliente Primeiro (se necessário)
Se não existir nenhum cliente, crie um primeiro:

```bash
POST /api/Clientes
Content-Type: application/json

{
  "nome": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@empresaabc.com",
  "telefone": "(11) 99999-9999"
}
```

#### 3. Criar Destinatário com ClienteId Válido
Use um `clienteId` que existe:

```bash
POST /api/Destinatarios
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@empresaabc.com",
  "clienteId": 1  // Use um ID que existe
}
```

### Validações Implementadas

O sistema agora inclui validações automáticas:

1. **Verifica se o cliente existe** antes de criar o destinatário
2. **Valida formato do email** 
3. **Verifica duplicatas** de email
4. **Mensagens de erro claras** para cada tipo de problema

### Exemplos de Respostas de Erro

#### Cliente não encontrado:
```json
{
  "error": "Cliente com ID 999 não encontrado"
}
```

#### Email inválido:
```json
{
  "error": "Formato de email inválido"
}
```

#### Email duplicado:
```json
{
  "error": "Já existe um destinatário com este email"
}
```

#### Campos obrigatórios:
```json
{
  "error": "Nome, email e clienteId são obrigatórios"
}
```

## Outros Problemas Comuns

### 1. Erro de Conexão com Banco de Dados
**Sintoma:** `Error: connect ECONNREFUSED`

**Solução:**
- Verificar se o PostgreSQL está rodando
- Verificar as credenciais no arquivo `.env`
- Verificar se a porta 5432 está disponível

### 2. Erro de Email não Enviado
**Sintoma:** `Email não enviado - verifique as credenciais`

**Solução:**
- Verificar `EMAIL_USER` e `EMAIL_PASS` no `.env`
- Verificar se a senha de aplicativo do Gmail está correta
- Verificar se a conta Gmail tem autenticação de 2 fatores ativada

### 3. Erro de Prisma Client
**Sintoma:** `Module not found: Can't resolve '../../../generated/prisma'`

**Solução:**
```bash
cd orcamento
npx prisma generate
```

### 4. Erro de Migração
**Sintoma:** `Drift detected: Your database schema is not in sync`

**Solução:**
```bash
npx prisma migrate reset --force
npx prisma generate
```

## Fluxo Recomendado para Criar Orçamentos

### 1. Criar Cliente
```bash
POST /api/Clientes
{
  "nome": "Empresa ABC Ltda",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@empresaabc.com",
  "telefone": "(11) 99999-9999"
}
```

### 2. Criar Destinatários
```bash
POST /api/Destinatarios
{
  "nome": "João Silva",
  "email": "joao@empresaabc.com",
  "clienteId": 1
}
```

### 3. Criar Orçamento com Múltiplos Destinatários
```bash
POST /api/Orcamento
{
  "clienteId": 1,
  "destinatarioIds": [1, 2, 3],
  "descricao": "Manutenção de equipamentos",
  "preco": 1500.00,
  "status": "pendente",
  "formaPagamento": "PIX",
  "dataInicio": "2024-01-15",
  "dataTermino": "2024-01-20"
}
```

## Logs e Debug

### Habilitar Logs Detalhados
Para ver logs detalhados do Prisma, adicione ao `.env`:
```
DEBUG=prisma:*
```

### Verificar Status do Banco
```bash
npx prisma db pull
npx prisma generate
```

### Verificar Dados no Banco
```bash
npx prisma studio
```

## Contato para Suporte

Se os problemas persistirem:
1. Verifique os logs do servidor
2. Confirme se todas as dependências estão instaladas
3. Verifique se o banco de dados está acessível
4. Teste as APIs individualmente com Postman ou similar
