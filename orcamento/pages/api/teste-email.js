import nodemailer from 'nodemailer';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(400).json({ 
        message: 'Credenciais de email não configuradas',
        emailUser: process.env.EMAIL_USER ? 'Configurado' : 'Não configurado',
        emailPass: process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'
      });
    }

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Testar conexão
    await transporter.verify();

    // Enviar email de teste
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar para você mesmo
      subject: 'Teste de Email - Sistema de Orçamentos',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; font-size: 28px; margin: 0; font-weight: 600;">🎉 Teste de Email</h1>
              <p style="color: #7f8c8d; margin: 5px 0; font-size: 16px;">Sistema de Orçamentos - Águia Soluções</p>
            </div>
            
                         <div style="background-color: #d5f4e6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #27ae60;">
               <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">✅ Status do Sistema</h3>
               <p style="color: #34495e; margin: 8px 0; font-size: 16px; line-height: 1.6;">
                 <strong>${obterSaudacao()}! Email funcionando perfeitamente!</strong>
               </p>
               <p style="color: #34495e; margin: 8px 0; font-size: 14px;">
                 <strong>Data do Teste:</strong> ${new Date().toLocaleString('pt-BR')}
               </p>
             </div>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">📋 Funcionalidades Testadas</h3>
              <ul style="color: #34495e; margin: 8px 0; font-size: 14px; line-height: 1.6;">
                <li>✅ Configuração do Nodemailer</li>
                <li>✅ Variáveis de ambiente</li>
                <li>✅ Conexão com Gmail</li>
                <li>✅ Envio de email</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 20px; text-align: center;">
              <p style="color: #2c3e50; margin: 5px 0; font-size: 14px; font-weight: 600;">Sistema de Orçamentos</p>
              <p style="color: #3498db; margin: 5px 0; font-size: 14px;">🚀 Pronto para uso!</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'Email de teste enviado com sucesso!',
      messageId: info.messageId,
      emailUser: process.env.EMAIL_USER,
      emailPass: 'Configurado'
    });

  } catch (error) {
    console.error('Erro no teste de email:', error);
    res.status(500).json({ 
      message: 'Erro ao enviar email de teste',
      error: error.message,
      emailUser: process.env.EMAIL_USER,
      emailPass: process.env.EMAIL_PASS ? 'Configurado' : 'Não configurado'
    });
  }
}
