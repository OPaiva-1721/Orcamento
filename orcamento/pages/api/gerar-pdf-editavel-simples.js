import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createEditablePDFFromScratch(orcamentoData) {
  try {
    // Criar um novo documento PDF
    const pdfDoc = await PDFDocument.create();
    
    // Adicionar uma página
    const page = pdfDoc.addPage([595, 842]); // Tamanho A4
    
    // Obter fontes
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Carregar e incorporar a logo
    let logoImage = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logoaguia.png');
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
      }
    } catch (logoError) {
      console.log('Logo não encontrada, continuando sem logo:', logoError.message);
    }
    
    // Configurações de texto
    const titleFontSize = 24;
    const subtitleFontSize = 16;
    const normalFontSize = 12;
    const smallFontSize = 10;
    
    // Cores
    const black = rgb(0, 0, 0);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const blue = rgb(0.2, 0.4, 0.8);
    
    // Margens
    const margin = 50;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    
    // Desenhar a logo se disponível
    if (logoImage) {
      const logoWidth = 80;
      const logoHeight = (logoWidth * logoImage.height) / logoImage.width;
      page.drawImage(logoImage, {
        x: margin,
        y: pageHeight - margin - 80,
        width: logoWidth,
        height: logoHeight,
      });
    }
    
    // Título principal
    page.drawText('ÁGUIA SOLUÇÕES EM MONTAGENS E MANUTENÇÕES INDUSTRIAIS LTDA.', {
      x: margin + (logoImage ? 100 : 0), // Ajustar posição se houver logo
      y: pageHeight - margin - 50,
      size: 18,
      font: helveticaBold,
      color: black,
    });
    
    // Informações da empresa
    page.drawText('CNPJ: 53.956.317/0001-62 | IE: 91054587-60', {
      x: margin,
      y: pageHeight - margin - 120,
      size: smallFontSize,
      font: helveticaFont,
      color: darkGray,
    });
    
    page.drawText('Telefone: (44) 9 9828-0425 – Robson Neves', {
      x: margin,
      y: pageHeight - margin - 140,
      size: smallFontSize,
      font: helveticaFont,
      color: darkGray,
    });
    
    page.drawText('Endereço: Rua Luiz Donin, 3366', {
      x: margin,
      y: pageHeight - margin - 160,
      size: smallFontSize,
      font: helveticaFont,
      color: darkGray,
    });
    
    page.drawText('Bairro: Jardim Progresso', {
      x: margin,
      y: pageHeight - margin - 180,
      size: smallFontSize,
      font: helveticaFont,
      color: darkGray,
    });
    
    page.drawText('Cidade: Palotina-PR', {
      x: margin,
      y: pageHeight - margin - 200,
      size: smallFontSize,
      font: helveticaFont,
      color: darkGray,
    });
    
    // Linha separadora
    page.drawLine({
      start: { x: margin, y: pageHeight - margin - 180 },
      end: { x: pageWidth - margin, y: pageHeight - margin - 180 },
      thickness: 1,
      color: black,
    });
    
    // Criar formulário
    const form = pdfDoc.getForm();
    
    // Campo para Nome do Cliente
    const clientNameField = form.createTextField('clientName');
    clientNameField.setText(orcamentoData.cliente?.nome || 'Nome do Cliente');
    clientNameField.addToPage(page, { 
      x: margin, 
      y: pageHeight - margin - 220, 
      width: 300, 
      height: 25 
    });
    
    // Label do cliente
    page.drawText('Cliente:', {
      x: margin,
      y: pageHeight - margin - 210,
      size: normalFontSize,
      font: helveticaBold,
      color: black,
    });
    
    // Campo para ID do Orçamento
    const budgetIdField = form.createTextField('budgetId');
    budgetIdField.setText(orcamentoData.id?.toString() || '000');
    budgetIdField.addToPage(page, { 
      x: margin + 350, 
      y: pageHeight - margin - 220, 
      width: 150, 
      height: 25 
    });
    
    // Label do orçamento
    page.drawText('Orçamento Nº:', {
      x: margin + 350,
      y: pageHeight - margin - 210,
      size: normalFontSize,
      font: helveticaBold,
      color: black,
    });
    
    // Linha separadora
    page.drawLine({
      start: { x: margin, y: pageHeight - margin - 260 },
      end: { x: pageWidth - margin, y: pageHeight - margin - 260 },
      thickness: 1,
      color: black,
    });
    
    // Campo para Descrição do Serviço
    const serviceDescriptionField = form.createTextField('serviceDescription');
    serviceDescriptionField.setText(orcamentoData.descricao || 'Descrição do serviço');
    serviceDescriptionField.addToPage(page, { 
      x: margin, 
      y: pageHeight - margin - 350, 
      width: pageWidth - 2 * margin, 
      height: 80 
    });
    
    // Label da descrição
    page.drawText('Descrição do Serviço:', {
      x: margin,
      y: pageHeight - margin - 320,
      size: normalFontSize,
      font: helveticaBold,
      color: black,
    });
    
    // Campo para Valor
    const serviceValueField = form.createTextField('serviceValue');
    const valorFormatado = orcamentoData.preco 
      ? `R$ ${orcamentoData.preco.toFixed(2).replace('.', ',')}`
      : 'R$ 0,00';
    serviceValueField.setText(valorFormatado);
    serviceValueField.addToPage(page, { 
      x: margin, 
      y: pageHeight - margin - 420, 
      width: 200, 
      height: 25 
    });
    
    // Label do valor
    page.drawText('Valor Total:', {
      x: margin,
      y: pageHeight - margin - 410,
      size: normalFontSize,
      font: helveticaBold,
      color: black,
    });
    
    // Campo para Forma de Pagamento
    const paymentField = form.createTextField('paymentMethod');
    paymentField.setText(orcamentoData.formaPagamento || '07 dias após a emissão da nota fiscal');
    paymentField.addToPage(page, { 
      x: margin, 
      y: pageHeight - margin - 480, 
      width: 400, 
      height: 25 
    });
    
    // Label da forma de pagamento
    page.drawText('Forma de Pagamento:', {
      x: margin,
      y: pageHeight - margin - 470,
      size: normalFontSize,
      font: helveticaBold,
      color: black,
    });
    
    // Linha separadora
    page.drawLine({
      start: { x: margin, y: pageHeight - margin - 520 },
      end: { x: pageWidth - margin, y: pageHeight - margin - 520 },
      thickness: 1,
      color: black,
    });
    
    // Total destacado
    page.drawText('TOTAL:', {
      x: margin,
      y: pageHeight - margin - 560,
      size: subtitleFontSize,
      font: helveticaBold,
      color: blue,
    });
    
    const totalValueField = form.createTextField('totalValue');
    totalValueField.setText(valorFormatado);
    totalValueField.addToPage(page, { 
      x: margin + 100, 
      y: pageHeight - margin - 570, 
      width: 200, 
      height: 30 
    });
    
    // Data
    const currentDate = new Date().toLocaleDateString('pt-BR');
    page.drawText(`Data: ${currentDate}`, {
      x: margin,
      y: margin + 50,
      size: smallFontSize,
      font: helveticaFont,
      color: darkGray,
    });
    
    // Salvar o PDF
    const pdfBytes = await pdfDoc.save();
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

    const pdfBytes = await createEditablePDFFromScratch(orcamentoData);

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
