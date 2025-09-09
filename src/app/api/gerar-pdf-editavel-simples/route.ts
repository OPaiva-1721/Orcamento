import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/gerar-pdf-editavel-simples - Gerar PDF editável simples
export async function POST(request: NextRequest) {
  try {
    const { orcamentoId } = await request.json();

    if (!orcamentoId) {
      return NextResponse.json(
        { success: false, error: 'ID do orçamento é obrigatório' },
        { status: 400 }
      );
    }

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: parseInt(orcamentoId) },
      include: {
        cliente: true,
        destinatarios: true,
      },
    });

    if (!orcamento) {
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    const pdfBuffer = await gerarPDFEditavelSimples(orcamento);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="orcamento_aguia_editavel_${orcamento.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF editável:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar PDF editável simples baseado no modelo HTML/CSS original
async function gerarPDFEditavelSimples(orcamento: any): Promise<Buffer> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  // Função para converter "top: X%" do CSS em coordenada Y no PDF
  function cssTopToPdfY(percentTop: number, pageHeight: number) {
    return pageHeight - (pageHeight * (percentTop / 100));
  }

  // Fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const lightGray = rgb(0.9, 0.9, 0.9);

  // Fundo branco
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: white,
  });

  // Logo
  try {
    const logoPath = "./public/logoaguia.png";
    const fs = await import("fs");
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);

      const logoX = width * 0.78; // left: 78%
      const logoY = height - 12 - 160; // top: 12px, height 150
      const logoWidth = width * 0.20; // 20%
      const logoHeight = 160;

      page.drawImage(logoImage, {
        x: logoX,
        y: logoY,
        width: logoWidth,
        height: logoHeight,
      });
    }
  } catch {
    console.log("Logo não encontrado, continuando sem logo");
  }

  // Empresa
  page.drawText("ÁGUIA SOLUÇÕES INDUSTRIAIS LTDA.", {
    x: width * 0.0183, // left: 1.83%
    y: cssTopToPdfY(16.11, height), // top: 16.11%
    size: 28,
    font: boldFont,
    color: black,
  });

  // CNPJ
  page.drawText("CNPJ: 53.956.317/0001-62", {
    x: width * 0.0183,
    y: cssTopToPdfY(26.84, height), // top: 26.84%
    size: 18,
    font: boldFont,
    color: black,
  });

  // Telefone
  page.drawText("TELEFONE: (44) 9 9828-0425", {
    x: width * 0.0183,
    y: cssTopToPdfY(32.32, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Endereço
  page.drawText("ENDEREÇO: RUA LUIZ DONIN, 3366", {
    x: width * 0.0168,
    y: cssTopToPdfY(37.53, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Bairro
  page.drawText("BAIRRO: JARDIM PROGRESSO", {
    x: width * 0.0168,
    y: cssTopToPdfY(43.13, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Cidade
  page.drawText("CIDADE: PALOTINA-PR", {
    x: width * 0.0183,
    y: cssTopToPdfY(48.6, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Linha separadora
  page.drawLine({
    start: { x: width * 0.0168, y: cssTopToPdfY(55.47, height) },
    end: { x: width * 0.9961, y: cssTopToPdfY(55.47, height) },
    thickness: 2,
    color: black,
  });

  // Cliente - NÃO EDITÁVEL
  page.drawText(`CLIENTE: ${orcamento.cliente.nome}`, {
    x: width * 0.0183,
    y: cssTopToPdfY(60.05, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Orçamento - NÃO EDITÁVEL
  page.drawText(`ORÇAMENTO: ${orcamento.id}`, {
    x: width * 0.0183,
    y: cssTopToPdfY(66.28, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Descrição - EDITÁVEL
  const descricaoY = cssTopToPdfY(77.35, height);
  
  // Fundo cinza para campo editável
  page.drawRectangle({
    x: width * 0.0168,
    y: descricaoY - 5,
    width: width * 0.8777, // right: 12.23% = 87.77% de largura
    height: 25,
    color: lightGray,
    borderColor: black,
    borderWidth: 1,
  });
  
  page.drawText(`DESCRIÇÃO: ${orcamento.descricao}`, {
    x: width * 0.0168,
    y: descricaoY,
    size: 18,
    font: boldFont,
    color: black,
  });

  // Valor - EDITÁVEL
  const valorY = cssTopToPdfY(87.66, height);
  
  // Fundo cinza para campo editável
  page.drawRectangle({
    x: width * 0.0199,
    y: valorY - 5,
    width: width * 0.2584, // right: 72.17% = 25.84% de largura
    height: 25,
    color: lightGray,
    borderColor: black,
    borderWidth: 1,
  });
  
  page.drawText(
    `VALOR: R$ ${orcamento.preco.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    {
      x: width * 0.0199,
      y: valorY,
      size: 18,
      font: boldFont,
      color: black,
    }
  );

  // Forma de pagamento - EDITÁVEL
  const pagamentoY = cssTopToPdfY(93.38, height);
  const formaPagamento = orcamento.formaPagamento
    ? "7 DIAS APÓS VENCIMENTO DA NOTA"
    : "À VISTA";
  
  // Fundo cinza para campo editável
  page.drawRectangle({
    x: width * 0.0183,
    y: pagamentoY - 5,
    width: width * 0.8976, // right: 8.41% = 89.76% de largura
    height: 25,
    color: lightGray,
    borderColor: black,
    borderWidth: 1,
  });
  
  page.drawText(`FORMA DE PAGAMENTO: ${formaPagamento}`, {
    x: width * 0.0183,
    y: pagamentoY,
    size: 18,
    font: boldFont,
    color: black,
  });

  // Instruções no rodapé
  const instrucoesY = height * 0.05; // 5% do topo
  page.drawText('INSTRUÇÕES: Campos destacados em cinza podem ser editados diretamente no PDF.', {
    x: width * 0.0183,
    y: instrucoesY,
    size: 12,
    font: font,
    color: black,
  });

  return Buffer.from(await pdfDoc.save());
}
