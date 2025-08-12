import { PrismaClient } from '../../../../generated/prisma';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

// Função para obter saudação baseada no horário
function obterSaudacao() {
  const hora = new Date().getHours();
  
  if (hora >= 5 && hora < 12) {
    return 'Bom dia';
  } else if (hora >= 12 && hora < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

// Função para gerar PDF
async function gerarPDF(orcamento) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const htmlContent = `
    <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: "Roboto", sans-serif;
            background-color: #fffbfb;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 10px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            width: 80px;
            margin-bottom: 10px;
        }
        .title {
            font-size: 36px;
            font-weight: 550;
            text-transform: uppercase;
            color: #000000;
            margin-bottom: 20px;
        }
        .info {
            font-size: 22px;
            font-weight: 550;
            color: #000000;
            margin-bottom: 10px;
        }
        .divider {
            border-top: 1px solid #ddd;
            margin: 20px 0;
        }
        .client-info, .budget-info {
            margin-bottom: 20px;
        }
        .total {
            font-size: 24px;
            font-weight: 700;
            color: #000000;
            margin-top: 10px;
        }
    </style>
</head>
<body>

<div class="container">
    <!-- Header -->
    <div class="header">
        <img src="logo.png" alt="Logo da Empresa">
        <div class="title">Águia Soluções em Montagens e Manutenções Industriais Ltda.</div>
    </div>

    <!-- Informações da empresa -->
    <div class="info">CNPJ: 53.956.317/0001-62 | IE: 91054587-60</div>
    <div class="info">Telefone: (44) 9 9828-0425 – Robson Neves</div>
    <div class="info">Endereço: Rua Luiz Donin, 3366</div>
    <div class="info">Bairro: Jardim Progresso</div>
    <div class="info">Cidade: Palotina-PR</div>

    <div class="divider"></div>

    <!-- Informações do orçamento -->
    <div class="client-info">
        <div class="info">Cliente: ${orcamento.cliente.nome}</div>
        <div class="info">Orçamento: ${orcamento.id}</div>
    </div>

    <div class="divider"></div>

    <!-- Descrição do serviço -->
    <div class="budget-info">
        <div class="info">Descrição: ${orcamento.descricao}</div>
        <div class="info">Valor: R$ ${orcamento.preco.toFixed(2).replace('.', ',')}</div>
        <div class="info">Forma de Pagamento: 07 dias após a emissão da nota fiscal.</div>
    </div>

    <div class="total">
        <p>Total: R$ ${orcamento.preco.toFixed(2).replace('.', ',')}</p>
    </div>
</div>

</body>
</html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
  return pdfBuffer;
}

// Função para enviar email
async function enviarEmail(orcamento, pdfBuffer) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: orcamento.destinatario.email,
    subject: `Orçamento ${orcamento.id} - Águia Soluções`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; font-size: 24px; margin: 0; font-weight: 600;">Águia Soluções</h1>
            <p style="color: #7f8c8d; margin: 5px 0; font-size: 14px;">Montagens e Manutenções Industriais Ltda.</p>
          </div>
          
                     <div style="border-left: 4px solid #3498db; padding-left: 20px; margin: 20px 0;">
             <p style="font-size: 16px; color: #2c3e50; margin: 0 0 15px 0; line-height: 1.6;">
               <strong>${obterSaudacao()} Sr.(a) ${orcamento.destinatario.nome}</strong>, segue em anexo o orçamento solicitado.
             </p>
           </div>
          
          <p style="color: #7f8c8d; font-size: 14px; margin: 20px 0; text-align: center;">
            Qualquer dúvida estamos à disposição.
          </p>
          
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 20px;">
            <p style="color: #2c3e50; margin: 5px 0; font-size: 14px; font-weight: 600;">Atenciosamente,</p>
            <p style="color: #2c3e50; margin: 5px 0; font-size: 14px; font-weight: 600;">Águia Soluções em Montagens e Manutenções Industriais Ltda.</p>
            <p style="color: #3498db; margin: 5px 0; font-size: 14px;">📞 Telefone: (44) 9 9828-0425</p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `orcamento-${orcamento.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return await transporter.sendMail(mailOptions);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Buscar orçamentos com filtros opcionais
    const { clienteId, destinatarioId, status } = req.query;
    
    let where = {};
    
    if (clienteId) {
      where.clienteId = parseInt(clienteId);
    }
    
    if (destinatarioId) {
      where.destinatarioId = parseInt(destinatarioId);
    }
    
    if (status) {
      where.status = status;
    }

    // Buscar todos os orçamentos
    const orcamentos = await prisma.orcamento.findMany({
      where,
      include: {
        cliente: true, // Incluir dados do cliente
        destinatario: true, // Incluir dados do destinatário
      },
      orderBy: {
        dataInicio: 'desc', // Ordenar por data de início (mais recente primeiro)
      },
    });
    return res.status(200).json(orcamentos);
  }

  if (req.method === 'POST') {
    const {
      clienteId,
      destinatarioId,
      descricao,
      preco,
      status,
      formaPagamento,
      dataInicio,
      dataTermino,
    } = req.body;

    // Criar um novo orçamento
    try {
      const orcamento = await prisma.orcamento.create({
        data: {
          clienteId,
          destinatarioId,
          descricao,
          preco,
          status,
          formaPagamento,
          dataInicio: new Date(dataInicio),
          dataTermino: new Date(dataTermino),
        },
        include: {
          cliente: true,
          destinatario: true,
        },
      });

      // Enviar email automaticamente (se as credenciais estiverem configuradas)
      let emailEnviado = false;
      let emailError = null;

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
          const pdfBuffer = await gerarPDF(orcamento);
          await enviarEmail(orcamento, pdfBuffer);
          emailEnviado = true;
        } catch (emailErr) {
          console.error('Erro ao enviar email:', emailErr);
          emailError = emailErr.message;
        }
      }

      return res.status(201).json({
        ...orcamento,
        emailEnviado,
        emailError: emailError ? `Email não enviado: ${emailError}` : null,
        message: emailEnviado 
          ? 'Orçamento criado e email enviado com sucesso!' 
          : 'Orçamento criado com sucesso! (Email não enviado - verifique as credenciais)'
      });
    } catch (error) {
      return res.status(400).json({ errors: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
