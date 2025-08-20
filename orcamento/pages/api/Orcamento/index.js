import { PrismaClient } from '../../../generated/prisma';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

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
  // Carregar e converter logo para base64
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logoaguia.png');
    console.log('Tentando carregar logo de:', logoPath);
    
    if (fs.existsSync(logoPath)) {
      console.log('Logo encontrada, carregando...');
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      console.log('Logo convertida para base64, tamanho:', logoBase64.length);
    } else {
      console.log('Logo não encontrada em:', logoPath);
    }
  } catch (error) {
    console.log('Erro ao carregar logo:', error.message);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  console.log('Logo base64 disponível:', logoBase64 ? 'Sim' : 'Não');
  
  const htmlContent = `
  <!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento</title>
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
  background:rgb(255, 255, 255);
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
  font-size: 34px;
  font-weight: 500;
  text-transform: uppercase;
  position: absolute;
  right: 1.99%;
  left: 1.99%;
  width: 96.02%;
  bottom: 78.24%;
  top: 16%;
  height: 8.14%;
}
.logo-empresa {
  width: 45%;       
  height: auto;
  position: absolute;
  right: 80.7%;
  left: -12%;        
  top: -15px;     
  object-fit: contain;
  max-height: 250px;  
}
.cnpj {
  color: #000000;
  text-align: left;
  font-family: "Roboto-Medium", sans-serif;
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
  font-size: 20px;
  font-weight: 500;
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
    <div class="component-1">
  <div class="rectangle-1"></div>
  <div class="guia-solu-es-em-montagens-e-manuten-es-industriais-ltda">
    Águia soluções em montagens e manutenções industriais ltda.
  </div>
  ${logoBase64 ? `<img class="logo-empresa" src="${logoBase64}" alt="Logo da Empresa" />` : ''}
  <div class="cnpj">CNPJ: 53.956.317/0001-62 | IE: 91054587-60</div>
  <div class="telefone">Telefone: (44) 9 9828-0425 – Robson Neves</div>
  <div class="endere-o">ENDEREÇO: Rua Luiz Donin, 3366</div>
  <div class="bairro">BAIRRO: Jardim Progresso</div>
  <div class="cidade">CIDADE: Palotina-PR</div>
  <div class="div">
    ========================================================
  </div>
  <div class="cliente">Cliente: ${orcamento.cliente.nome}</div>
  <div class="or-amento">Orçamento: ${orcamento.id}</div>
  <div class="descri-o">Descrição: ${orcamento.descricao}</div>
  <div class="valor">Valor: R$ ${orcamento.preco.toFixed(2).replace('.', ',')}</div>
  <div class="forma-de-pagamento">Forma de pagamento: 07 dias após a emissão da nota fiscal.</div>
</div>
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
