# 📧 Sistema de Múltiplos Destinatários

## Visão Geral

O sistema agora suporta **múltiplos destinatários por orçamento**, permitindo enviar o mesmo orçamento para várias pessoas simultaneamente. Cada destinatário receberá um email personalizado com o PDF do orçamento anexado.

## 🗄️ Mudanças no Banco de Dados

### Nova Tabela: `OrcamentoDestinatario`

Esta tabela faz a ligação entre orçamentos e destinatários:

```sql
model OrcamentoDestinatario {
  id            Int         @id @default(autoincrement())
  orcamentoId   Int
  destinatarioId Int
  emailEnviado  Boolean     @default(false)
  dataEnvio     DateTime?
  orcamento     Orcamento   @relation(fields: [orcamentoId], references: [id], onDelete: Cascade)
  destinatario  Destinatario @relation(fields: [destinatarioId], references: [id], onDelete: Cascade)
  
  @@unique([orcamentoId, destinatarioId])
}
```

**Campos importantes:**
- `emailEnviado`: Indica se o email foi enviado com sucesso
- `dataEnvio`: Data e hora do envio do email
- `@@unique([orcamentoId, destinatarioId])`: Evita duplicatas

## 🔧 APIs Disponíveis

### 1. Criar Orçamento com Múltiplos Destinatários

**Endpoint:** `POST /api/Orcamento`

**Corpo da requisição:**
```json
{
  "clienteId": 1,
  "destinatarioIds": [1, 2, 3], // Array de IDs dos destinatários
  "descricao": "Manutenção de equipamentos",
  "preco": 1500.00,
  "status": "pendente",
  "formaPagamento": "PIX",
  "dataInicio": "2024-01-15",
  "dataTermino": "2024-01-20"
}
```

**Resposta:**
```json
{
  "id": 1,
  "clienteId": 1,
  "descricao": "Manutenção de equipamentos",
  "preco": 1500.00,
  "status": "pendente",
  "formaPagamento": "PIX",
  "dataInicio": "2024-01-15T00:00:00.000Z",
  "dataTermino": "2024-01-20T00:00:00.000Z",
  "cliente": { ... },
  "orcamentoDestinatarios": [
    {
      "id": 1,
      "orcamentoId": 1,
      "destinatarioId": 1,
      "emailEnviado": true,
      "dataEnvio": "2024-01-15T10:30:00.000Z",
      "destinatario": {
        "id": 1,
        "nome": "João Silva",
        "email": "joao@empresa.com"
      }
    }
  ],
  "emailsEnviados": [
    {
      "destinatario": "João Silva",
      "email": "joao@empresa.com",
      "status": "enviado",
      "error": null
    }
  ],
  "message": "Orçamento criado e 3 email(s) enviado(s) com sucesso!"
}
```

### 2. Gerenciar Destinatários de um Orçamento

**Endpoint:** `GET /api/Orcamento/{id}/destinatarios`

**Resposta:**
```json
[
  {
    "id": 1,
    "orcamentoId": 1,
    "destinatarioId": 1,
    "emailEnviado": true,
    "dataEnvio": "2024-01-15T10:30:00.000Z",
    "destinatario": {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@empresa.com"
    }
  }
]
```

### 3. Adicionar Destinatários a um Orçamento

**Endpoint:** `POST /api/Orcamento/{id}/destinatarios`

**Corpo da requisição:**
```json
{
  "destinatarioIds": [4, 5]
}
```

**Resposta:**
```json
{
  "message": "2 destinatário(s) adicionado(s) com sucesso",
  "destinatarios": [...]
}
```

### 4. Remover Destinatários de um Orçamento

**Endpoint:** `DELETE /api/Orcamento/{id}/destinatarios`

**Corpo da requisição:**
```json
{
  "destinatarioIds": [4, 5]
}
```

**Resposta:**
```json
{
  "message": "2 destinatário(s) removido(s) com sucesso"
}
```

### 5. Reenviar Email para Destinatários Específicos

**Endpoint:** `POST /api/Orcamento/{id}/reenviar-email`

**Corpo da requisição:**
```json
{
  "destinatarioIds": [1, 2]
}
```

**Resposta:**
```json
{
  "message": "2 email(s) enviado(s) com sucesso",
  "resultados": [
    {
      "destinatario": "João Silva",
      "email": "joao@empresa.com",
      "status": "enviado",
      "error": null
    }
  ]
}
```

## 📊 Consultas de Orçamentos

### Buscar Orçamentos com Filtros

**Endpoint:** `GET /api/Orcamento?clienteId=1&destinatarioId=2&status=pendente`

**Resposta:**
```json
[
  {
    "id": 1,
    "clienteId": 1,
    "descricao": "Manutenção de equipamentos",
    "preco": 1500.00,
    "status": "pendente",
    "cliente": { ... },
    "orcamentoDestinatarios": [
      {
        "id": 1,
        "destinatarioId": 1,
        "emailEnviado": true,
        "dataEnvio": "2024-01-15T10:30:00.000Z",
        "destinatario": { ... }
      }
    ]
  }
]
```

## ✨ Funcionalidades

### 1. Envio Automático
- Ao criar um orçamento, emails são enviados automaticamente para todos os destinatários
- Cada destinatário recebe um email personalizado com seu nome

### 2. Rastreamento de Envios
- O sistema registra se cada email foi enviado com sucesso
- Armazena a data e hora do envio
- Permite identificar quais destinatários receberam o email

### 3. Reenvio Seletivo
- Possibilidade de reenviar emails apenas para destinatários específicos
- Útil quando um email falha ou precisa ser reenviado

### 4. Gerenciamento Flexível
- Adicionar ou remover destinatários de orçamentos existentes
- Evita duplicatas automaticamente
- Mantém histórico de envios

## 🔍 Exemplos de Uso

### Exemplo 1: Criar Orçamento para Múltiplos Destinatários
```javascript
const response = await fetch('/api/Orcamento', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clienteId: 1,
    destinatarioIds: [1, 2, 3], // Enviar para 3 pessoas
    descricao: "Manutenção preventiva",
    preco: 2500.00,
    status: "pendente",
    formaPagamento: "Boleto",
    dataInicio: "2024-01-15",
    dataTermino: "2024-01-25"
  })
});

const result = await response.json();
console.log(result.message); // "Orçamento criado e 3 email(s) enviado(s) com sucesso!"
```

### Exemplo 2: Adicionar Destinatário a Orçamento Existente
```javascript
const response = await fetch('/api/Orcamento/1/destinatarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destinatarioIds: [4] // Adicionar novo destinatário
  })
});
```

### Exemplo 3: Reenviar Email para Destinatários Específicos
```javascript
const response = await fetch('/api/Orcamento/1/reenviar-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destinatarioIds: [1, 2] // Reenviar apenas para estes
  })
});
```

## ⚠️ Considerações Importantes

1. **Credenciais de Email**: Certifique-se de que `EMAIL_USER` e `EMAIL_PASS` estão configurados no arquivo `.env`

2. **Limites do Gmail**: O Gmail tem limites de envio (500 emails por dia para contas gratuitas)

3. **Tratamento de Erros**: O sistema continua funcionando mesmo se alguns emails falharem

4. **Performance**: Para muitos destinatários, o envio pode demorar alguns segundos

5. **Backup**: Sempre faça backup antes de aplicar migrações no banco de dados

## 🚀 Próximos Passos

- [ ] Interface gráfica para gerenciar destinatários
- [ ] Relatórios de envio de emails
- [ ] Templates de email personalizáveis
- [ ] Notificações em tempo real
- [ ] Integração com outros provedores de email
