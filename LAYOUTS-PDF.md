# 📄 Layouts Padronizados dos PDFs

## ✅ **Padronização Concluída**

Todos os PDFs do sistema agora seguem o **mesmo layout padrão**:

### **🎨 Elementos Padronizados:**

1. **🖼️ Logo da Empresa**
   - Arquivo: `public/logoaguia.png`
   - Posição: Canto superior esquerdo
   - Tamanho: 19.27% da largura, 73px altura

2. **🏢 Nome da Empresa**
   - Texto: "ÁGUIA SOLUÇÕES EM MONTAGENS E MANUTENÇÕES INDUSTRIAIS LTDA."
   - Fonte: Roboto-Medium, 36px
   - Estilo: Maiúsculas, negrito

3. **📋 Informações da Empresa**
   - CNPJ: 53.956.317/0001-62 | IE: 91054587-60
   - Telefone: (44) 9 9828-0425 – Robson Neves
   - Endereço: Rua Luiz Donin, 3366
   - Bairro: Jardim Progresso
   - Cidade: Palotina-PR

4. **📊 Dados do Orçamento**
   - Cliente: [Nome do cliente]
   - Orçamento: [ID do orçamento]
   - Descrição: [Descrição do serviço]
   - Valor: R$ [Valor formatado]
   - Forma de pagamento: [Condições de pagamento]

---

## 📁 **Arquivos Padronizados:**

### **1. `index.js` (Orcamento/index.js)**
- ✅ **Layout completo** com logo
- ✅ **Email automático** ao criar orçamento
- ✅ **PDF profissional** anexado

### **2. `enviar-email.js`**
- ✅ **Layout completo** com logo
- ✅ **Email manual** para reenvio
- ✅ **PDF profissional** anexado

### **3. `gerar-pdf.js`**
- ✅ **Layout completo** com logo
- ✅ **Download direto** do PDF
- ✅ **PDF profissional** para impressão

### **4. `gerar-pdf-editavel-simples.js`**
- ✅ **Layout adaptado** para PDF nativo
- ✅ **Campos editáveis** no PDF
- ✅ **Logo incluída** quando disponível

---

## 🎯 **Características do Layout:**

### **📐 Dimensões:**
- **Formato:** A4 (595 x 842 pontos)
- **Orientação:** Retrato
- **Margens:** 50 pontos

### **🎨 Estilo Visual:**
- **Fundo:** Branco (#fffbfb)
- **Texto:** Preto (#000000)
- **Fonte:** Roboto-Medium (HTML) / Helvetica (PDF)
- **Layout:** Profissional e limpo

### **📱 Responsividade:**
- **Posicionamento:** Absoluto (HTML/CSS)
- **Escala:** Adaptável para impressão
- **Compatibilidade:** Todos os leitores de PDF

---

## 🔧 **Tecnologias Utilizadas:**

### **HTML/CSS (Puppeteer):**
- **Arquivos:** `index.js`, `enviar-email.js`, `gerar-pdf.js`
- **Vantagens:** Layout preciso, controle total do design
- **Desvantagens:** PDF estático

### **PDF Nativo (PDF-Lib):**
- **Arquivo:** `gerar-pdf-editavel-simples.js`
- **Vantagens:** PDF editável, campos de formulário
- **Desvantagens:** Layout mais simples

---

## 📋 **Exemplo de Uso:**

```javascript
// Todos os PDFs têm o mesmo visual
const pdf1 = await fetch('/api/Orcamento', { method: 'POST', body: dados });
const pdf2 = await fetch('/api/gerar-pdf', { method: 'POST', body: { orcamentoId: 123 } });
const pdf3 = await fetch('/api/enviar-email', { method: 'POST', body: { orcamentoId: 123, email: 'cliente@email.com' } });
const pdf4 = await fetch('/api/gerar-pdf-editavel-simples', { method: 'POST', body: { orcamentoData: dados } });
```

**Resultado:** Todos os PDFs terão o **mesmo layout profissional** com logo da empresa!

---

## ✅ **Benefícios da Padronização:**

1. **🎨 Identidade Visual Consistente**
2. **📊 Informações Padronizadas**
3. **🖼️ Logo em Todos os PDFs**
4. **📱 Compatibilidade Garantida**
5. **🎯 Experiência do Usuário Uniforme**

**Todos os PDFs agora seguem o mesmo padrão profissional da Águia Soluções!**
