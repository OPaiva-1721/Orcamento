import { PrismaClient } from '../../../../../generated/prisma';
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

// Função para enviar email para destinatários específicos
async function enviarEmailParaDestinatarios(orcamento, pdfBuffer, destinatarios) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resultados = [];

  for (const destinatario of destinatarios) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: destinatario.email,
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
                  <strong>${obterSaudacao()} Sr.(a) ${destinatario.nome}</strong>, segue em anexo o orçamento solicitado.
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

      await transporter.sendMail(mailOptions);
      
      // Atualizar status do destinatário no banco
      await prisma.orcamentoDestinatario.update({
        where: {
          orcamentoId_destinatarioId: {
            orcamentoId: orcamento.id,
            destinatarioId: destinatario.id
          }
        },
        data: {
          emailEnviado: true,
          dataEnvio: new Date()
        }
      });

      resultados.push({
        destinatario: destinatario.nome,
        email: destinatario.email,
        status: 'enviado',
        error: null
      });

    } catch (error) {
      console.error(`Erro ao enviar email para ${destinatario.email}:`, error);
      
      resultados.push({
        destinatario: destinatario.nome,
        email: destinatario.email,
        status: 'erro',
        error: error.message
      });
    }
  }

  return resultados;
}

export default async function handler(req, res) {
  const { id } = req.query;
  const orcamentoId = parseInt(id);

  if (req.method === 'POST') {
    const { destinatarioIds } = req.body;

    if (!destinatarioIds || !Array.isArray(destinatarioIds)) {
      return res.status(400).json({ error: 'destinatarioIds deve ser um array' });
    }

    try {
      // Buscar o orçamento com todos os dados necessários
      const orcamento = await prisma.orcamento.findUnique({
        where: { id: orcamentoId },
        include: {
          cliente: true,
          orcamentoDestinatarios: {
            where: {
              destinatarioId: {
                in: destinatarioIds.map(id => parseInt(id))
              }
            },
            include: {
              destinatario: true
            }
          }
        }
      });

      if (!orcamento) {
        return res.status(404).json({ message: 'Orçamento não encontrado' });
      }

      if (orcamento.orcamentoDestinatarios.length === 0) {
        return res.status(400).json({ error: 'Nenhum destinatário encontrado para os IDs fornecidos' });
      }

      // Verificar se as credenciais de email estão configuradas
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(400).json({ error: 'Credenciais de email não configuradas' });
      }

      // Gerar PDF e enviar emails
      const pdfBuffer = await gerarPDF(orcamento);
      const destinatarios = orcamento.orcamentoDestinatarios.map(od => od.destinatario);
      const resultados = await enviarEmailParaDestinatarios(orcamento, pdfBuffer, destinatarios);

      const emailsEnviados = resultados.filter(r => r.status === 'enviado').length;
      const emailsComErro = resultados.filter(r => r.status === 'erro').length;

      return res.status(200).json({
        message: `${emailsEnviados} email(s) enviado(s) com sucesso${emailsComErro > 0 ? `, ${emailsComErro} com erro` : ''}`,
        resultados
      });

    } catch (error) {
      console.error('Erro ao reenviar emails:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ message: 'Método não permitido' });
}
