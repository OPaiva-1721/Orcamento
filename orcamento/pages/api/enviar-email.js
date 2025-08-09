import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { orcamentoId, destinatarioEmail } = req.body;

    if (!orcamentoId || !destinatarioEmail) {
      return res.status(400).json({ 
        message: 'ID do orçamento e email do destinatário são obrigatórios' 
      });
    }

    // Buscar dados do orçamento no banco
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: parseInt(orcamentoId) },
      include: {
        cliente: true,
        destinatario: true,
      },
    });

    if (!orcamento) {
      return res.status(404).json({ message: 'Orçamento não encontrado' });
    }

    // Gerar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          .component-1,
          .component-1 * {
            box-sizing: border-box;
          }
          .component-1 {
            height: 786px;
            position: relative;
          }
          .rectangle-1 {
            background: #fffbfb;
            width: 100%;
            height: 100%;
            position: absolute;
            right: 0%;
            left: 0%;
            bottom: 0%;
            top: 0%;
          }
          .guia-solu-es-em-montagens-e-manuten-es-industriais-ltda {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 36px;
            font-weight: 550;
            text-transform: uppercase;
            position: absolute;
            right: 1.99%;
            left: 1.99%;
            width: 96.02%;
            bottom: 78.24%;
            top: 13.61%;
            height: 8.14%;
          }
          .cnpj {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            text-transform: uppercase;
            position: absolute;
            right: 21.71%;
            left: 1.83%;
            width: 76.45%;
            bottom: 71.37%;
            top: 26.84%;
            height: 1.78%;
          }
          .telefone {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            text-transform: uppercase;
            position: absolute;
            right: 23.7%;
            left: 1.83%;
            width: 74.46%;
            bottom: 65.9%;
            top: 32.32%;
            height: 1.78%;
          }
          .endere-o {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 40.06%;
            left: 1.68%;
            width: 58.26%;
            bottom: 59.54%;
            top: 37.53%;
            height: 2.93%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .bairro {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            text-transform: uppercase;
            position: absolute;
            right: 38.23%;
            left: 1.68%;
            width: 60.09%;
            bottom: 53.94%;
            top: 43.13%;
            height: 2.93%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .cidade {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            text-transform: uppercase;
            position: absolute;
            right: 45.26%;
            left: 1.83%;
            width: 52.91%;
            bottom: 48.47%;
            top: 48.6%;
            height: 2.93%;
          }
          .div {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 0.61%;
            left: 1.68%;
            width: 97.71%;
            bottom: 43.77%;
            top: 55.47%;
            height: 0.76%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .cliente {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 47.4%;
            left: 1.83%;
            width: 50.76%;
            bottom: 37.66%;
            top: 60.05%;
            height: 2.29%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .or-amento {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 54.89%;
            left: 1.83%;
            width: 43.27%;
            bottom: 31.81%;
            top: 66.28%;
            height: 1.91%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .descri-o {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 12.23%;
            left: 1.68%;
            width: 86.09%;
            bottom: 21.12%;
            top: 77.35%;
            height: 1.53%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .valor {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 72.17%;
            left: 1.99%;
            width: 25.84%;
            bottom: 9.41%;
            top: 87.66%;
            height: 2.93%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .forma-de-pagamento {
            color: #000000;
            text-align: left;
            font-family: "Roboto-Medium", sans-serif;
            font-size: 22px;
            font-weight: 550;
            position: absolute;
            right: 8.41%;
            left: 1.83%;
            width: 89.76%;
            bottom: 4.45%;
            top: 93.38%;
            height: 2.16%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
        </style>
      </head>
      <body>
        <div class="component-1">
          <div class="rectangle-1"></div>
          <div class="guia-solu-es-em-montagens-e-manuten-es-industriais-ltda">
            Águia soluções em montagens e manutenções industriais ltda.
          </div>
          <div class="cnpj">CNPJ:53.956.317/0001-62 IE:91054587-60</div>
          <div class="telefone">Telefone:(44)9 9828-0425– Robson Neves</div>
          <div class="endere-o">ENDEREÇO:Rua Luiz Donin,3366</div>
          <div class="bairro">BAIRRO:Jardim Progresso</div>
          <div class="cidade">CIDADE:Palotina-PR</div>
          <div class="div">========================================================</div>
          <div class="cliente">Cliente: ${orcamento.cliente.nome}</div> 
          <div class="or-amento">Orçamento: ${orcamento.id}</div>
          <div class="descri-o">Descrição: ${orcamento.descricao}</div>
          <div class="valor">Valor: R$ ${orcamento.preco.toFixed(2).replace('.', ',')}</div>
          <div class="forma-de-pagamento">
            Forma de pagamento: ${orcamento.formaPagamento}
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

    // Configurar transporter de email (você precisa configurar suas credenciais)
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // ou outro serviço
      auth: {
        user: process.env.EMAIL_USER, // seu email
        pass: process.env.EMAIL_PASS, // sua senha de app
      },
    });

    // Configurar email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarioEmail,
      subject: `Orçamento ${orcamento.id} - Águia Soluções`,
      html: `
        <h2>Orçamento ${orcamento.id}</h2>
        <p>Prezado(a) ${orcamento.destinatario.nome},</p>
        <p>Segue em anexo o orçamento solicitado.</p>
        <p><strong>Cliente:</strong> ${orcamento.cliente.nome}</p>
        <p><strong>Descrição:</strong> ${orcamento.descricao}</p>
        <p><strong>Valor:</strong> R$ ${orcamento.preco.toFixed(2).replace('.', ',')}</p>
        <p><strong>Forma de Pagamento:</strong> ${orcamento.formaPagamento}</p>
        <br>
        <p>Atenciosamente,</p>
        <p>Águia Soluções em Montagens e Manutenções Industriais Ltda.</p>
        <p>Telefone: (44) 9 9828-0425</p>
      `,
      attachments: [
        {
          filename: `orcamento-${orcamento.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Email enviado com sucesso!',
      orcamentoId: orcamento.id,
      destinatario: destinatarioEmail
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar email', 
      error: error.message 
    });
  }
}
