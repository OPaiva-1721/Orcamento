import nodemailer from 'nodemailer';

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
    const transporter = nodemailer.createTransporter({
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
        <h2>Teste de Email</h2>
        <p>Este é um email de teste do sistema de orçamentos.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> Email funcionando corretamente!</p>
        <br>
        <p>Sistema de Orçamentos - Águia Soluções</p>
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
