import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createEditablePDF(orcamentoData) {
  try {
    // Caminho para o PDF template (você precisará adicionar este arquivo)
    const templatePath = path.join(process.cwd(), 'public', 'template-orcamento.pdf');
    
    // Verificar se o arquivo template existe
    if (!fs.existsSync(templatePath)) {
      throw new Error('Arquivo template PDF não encontrado. Adicione o arquivo template-orcamento.pdf na pasta public/');
    }

    // Carregar o PDF original
    const existingPdfBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Obter a primeira página do PDF
    const page = pdfDoc.getPages()[0];

    // Criar campos de formulário editáveis
    const form = pdfDoc.getForm();

    // Nome do Cliente
    const clientNameField = form.createTextField('clientName');
    clientNameField.setText(orcamentoData.cliente?.nome || 'Nome do Cliente');
    clientNameField.addToPage(page, { x: 50, y: 320, width: 200, height: 25 });

    // ID do Orçamento
    const budgetIdField = form.createTextField('budgetId');
    budgetIdField.setText(orcamentoData.id?.toString() || '000');
    budgetIdField.addToPage(page, { x: 50, y: 290, width: 100, height: 25 });

    // Descrição do Serviço
    const serviceDescriptionField = form.createTextField('serviceDescription');
    serviceDescriptionField.setText(orcamentoData.descricao || 'Descrição do serviço');
    serviceDescriptionField.addToPage(page, { x: 50, y: 210, width: 500, height: 100 });

    // Valor Total do Serviço
    const serviceValueField = form.createTextField('serviceValue');
    const valorFormatado = orcamentoData.preco 
      ? `R$ ${orcamentoData.preco.toFixed(2).replace('.', ',')}`
      : 'R$ 0,00';
    serviceValueField.setText(valorFormatado);
    serviceValueField.addToPage(page, { x: 50, y: 150, width: 150, height: 25 });

    // Salvar o PDF com os campos editáveis
    const pdfBytes = await pdfDoc.save();

    // Retornar o PDF gerado (em formato binário)
    return pdfBytes;
  } catch (error) {
    console.error('Erro ao criar PDF editável:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { orcamentoData } = req.body;

    if (!orcamentoData) {
      return res.status(400).json({ message: 'Dados do orçamento são obrigatórios' });
    }

    const pdfBytes = await createEditablePDF(orcamentoData);

    // Definir os cabeçalhos para o download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=orcamento_${orcamentoData.id || 'editavel'}.pdf`);
    
    // Enviar o PDF gerado para o cliente
    res.send(pdfBytes);
  } catch (error) {
    console.error('Erro no endpoint:', error);
    res.status(500).json({ 
      message: 'Erro ao gerar PDF editável',
      error: error.message 
    });
  }
}
