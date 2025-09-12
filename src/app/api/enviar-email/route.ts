import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configuração do nodemailer (você pode configurar com suas credenciais)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'seu-email@gmail.com',
    pass: process.env.SMTP_PASS || 'sua-senha-app',
  },
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== ENDPOINT ENVIAR EMAIL CHAMADO ===');
    const body = await request.json();
    const { orcamentoId, destinatarioIds } = body;

    console.log('Dados recebidos:', { orcamentoId, destinatarioIds });
    console.log('Tipo de destinatarioIds:', typeof destinatarioIds, Array.isArray(destinatarioIds));

    if (!orcamentoId || !destinatarioIds || !Array.isArray(destinatarioIds)) {
      console.error('❌ Dados inválidos recebidos');
      return NextResponse.json(
        { success: false, error: 'Orçamento ID e destinatários são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar orçamento com dados completos
    console.log('Buscando orçamento ID:', parseInt(orcamentoId));
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: parseInt(orcamentoId) },
      include: {
        cliente: true,
        destinatarios: {
          where: {
            id: { in: destinatarioIds.map(id => parseInt(id)) }
          }
        },
      },
    });

    console.log('Orçamento encontrado:', !!orcamento);
    if (orcamento) {
      console.log('Cliente:', orcamento.cliente?.nome);
      console.log('Destinatários encontrados:', orcamento.destinatarios.length);
      console.log('Destinatários:', orcamento.destinatarios.map(d => ({ id: d.id, nome: d.nome, email: d.email })));
    }

    if (!orcamento) {
      console.error('❌ Orçamento não encontrado');
      return NextResponse.json(
        { success: false, error: 'Orçamento não encontrado' },
        { status: 404 }
      );
    }

    if (orcamento.destinatarios.length === 0) {
      console.error('❌ Nenhum destinatário válido encontrado');
      return NextResponse.json(
        { success: false, error: 'Nenhum destinatário válido encontrado' },
        { status: 400 }
      );
    }

    const emailsEnviados = [];
    const erros = [];

    // Enviar email para cada destinatário
    for (const destinatario of orcamento.destinatarios) {
      try {
        console.log(`📧 Enviando email para: ${destinatario.nome} (${destinatario.email})`);
        
        // Gerar PDF do orçamento
        console.log('📄 Gerando PDF do orçamento...');
        const pdfBuffer = await gerarPDFOrcamento(orcamento);
        console.log('✅ PDF gerado com sucesso, tamanho:', pdfBuffer.length, 'bytes');

        // Configurar email
        const mailOptions = {
          from: process.env.SMTP_FROM || 'noreply@empresa.com',
          to: destinatario.email,
          subject: `Orçamento solicitado - Águia Soluções`,
          html: gerarHTMLEmail(orcamento, destinatario),
          attachments: [
            {
              filename: `orcamento_aguia_${orcamento.id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        };

        console.log('📤 Configurações do email:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          attachments: mailOptions.attachments.length
        });

        // Enviar email
        console.log('🚀 Enviando email via SMTP...');
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado com sucesso! MessageId:', result.messageId);

        // Registrar envio no banco
        await prisma.emailEnviado.upsert({
          where: {
            orcamentoId_destinatarioId: {
              orcamentoId: orcamento.id,
              destinatarioId: destinatario.id,
            },
          },
          update: {
            status: 'Enviado',
            dataEnvio: new Date(),
          },
          create: {
            orcamentoId: orcamento.id,
            destinatarioId: destinatario.id,
            status: 'Enviado',
            dataEnvio: new Date(),
          },
        });

        emailsEnviados.push({
          destinatario: destinatario.nome,
          email: destinatario.email,
          status: 'enviado',
          error: null,
        });

      } catch (error) {
        console.error(`Erro ao enviar email para ${destinatario.email}:`, error);
        
        // Registrar erro no banco
        await prisma.emailEnviado.upsert({
          where: {
            orcamentoId_destinatarioId: {
              orcamentoId: orcamento.id,
              destinatarioId: destinatario.id,
            },
          },
          update: {
            status: 'Erro',
          },
          create: {
            orcamentoId: orcamento.id,
            destinatarioId: destinatario.id,
            status: 'Erro',
          },
        });

        erros.push({
          destinatario: destinatario.nome,
          email: destinatario.email,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${emailsEnviados.length} email(s) enviado(s) com sucesso!`,
      data: {
        emailsEnviados,
        erros,
        total: orcamento.destinatarios.length,
      },
    });

  } catch (error) {
    console.error('Erro ao enviar emails:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar PDF do orçamento baseado no modelo HTML/CSS original
async function gerarPDFOrcamento(orcamento: any): Promise<Buffer> {
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

  // Cliente
  page.drawText(`CLIENTE: ${orcamento.cliente.nome}`, {
    x: width * 0.0183,
    y: cssTopToPdfY(60.05, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Orçamento
  page.drawText(`ORÇAMENTO: ${orcamento.id}`, {
    x: width * 0.0183,
    y: cssTopToPdfY(66.28, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Descrição
  page.drawText(`DESCRIÇÃO: ${orcamento.descricao}`, {
    x: width * 0.0168,
    y: cssTopToPdfY(77.35, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  // Valor
  page.drawText(
    `VALOR: R$ ${orcamento.preco.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    {
      x: width * 0.0199,
      y: cssTopToPdfY(87.66, height),
      size: 18,
      font: boldFont,
      color: black,
    }
  );

  // Forma de pagamento
  const formaPagamento = orcamento.formaPagamento
    ? "7 DIAS APÓS VENCIMENTO DA NOTA"
    : "À VISTA";

  page.drawText(`FORMA DE PAGAMENTO: ${formaPagamento}`, {
    x: width * 0.0183,
    y: cssTopToPdfY(93.38, height),
    size: 18,
    font: boldFont,
    color: black,
  });

  return Buffer.from(await pdfDoc.save());
}


// Função para gerar HTML do email
function gerarHTMLEmail(orcamento: any, destinatario: any): string {
  const valorFormatado = orcamento.preco.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
  
  const dataInicio = new Date(orcamento.dataInicio).toLocaleDateString('pt-BR');
  const dataTermino = orcamento.dataTermino 
    ? new Date(orcamento.dataTermino).toLocaleDateString('pt-BR')
    : 'A definir';
  
  const formaPagamento = orcamento.formaPagamento 
    ? '7 dias após o vencimento da nota' 
    : 'À vista';

  return `
    <!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orçamento #${orcamento.id} - Águia Soluções</title>
  <style>
    /* Reset e base */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1f2937; 
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    
    /* Container principal */
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    }
    
    /* Header minimalista */
    .header { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white; 
      padding: 32px 24px;
      text-align: center;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .orcamento-number {
      font-size: 14px;
      opacity: 0.85;
    }
    
    /* Conteúdo principal */
    .content { 
      padding: 32px 24px;
    }
    
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #111827;
    }
    
    .message {
      font-size: 15px;
      margin-bottom: 28px;
      color: #374151;
      line-height: 1.7;
    }
    
    /* Call to action */
    .cta-section {
      margin: 28px 0;
      text-align: center;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    .cta-button:hover {
      opacity: 0.9;
    }
    
    .cta-text {
      font-size: 14px;
      color: #0369a1;
      margin-top: 12px;
    }
    
    /* Assinatura */
    .signature {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .signature-text {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 6px;
    }
    
    .signature-name {
      font-weight: 600;
      color: #1f2937;
    }
    
    /* Footer */
    .footer { 
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-info {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 4px;
    }
    
    .footer-info:last-child {
      margin-bottom: 0;
    }
    
    /* Responsividade */
    @media only screen and (max-width: 600px) {
      .email-container {
        border-radius: 0;
      }
      
      .header, .content, .footer {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <div class="company-name">ÁGUIA SOLUÇÕES</div>
      <div class="orcamento-number">Orçamento #${orcamento.id}</div>
    </div>
    
    <!-- Conteúdo -->
    <div class="content">
      <div class="greeting">
        Olá <strong>${destinatario.nome}</strong>,
      </div>
      
      <div class="message">
        Segue em anexo o orçamento solicitado para <strong>${orcamento.cliente.nome}</strong>. 
        Todas as informações detalhadas estão no PDF abaixo.
      </div>
      
      <!-- Call to action -->
      <div class="cta-section">
        <p class="cta-text">Para mais informações ou esclarecimentos, entre em contato conosco.</p>
      </div>
      
      <!-- Assinatura -->
      <div class="signature">
        <p class="signature-text">Atenciosamente,</p>
        <p class="signature-name">Equipe Águia Soluções</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-info">
        <strong>Águia Soluções em Montagens e Manutenções Industriais Ltda.</strong>
      </div>
      <div class="footer-info">
        CNPJ: 53.956.317/0001-62 • IE: 91054587-60
      </div>
      <div class="footer-info">
        📞 (44) 9 9828-0425 – Robson Neves
      </div>
      <div class="footer-info">
        📍 Rua Luiz Donin, 3366 - Jardim Progresso - Palotina-PR
      </div>
    </div>
  </div>
</body>
</html>
`
;
}
