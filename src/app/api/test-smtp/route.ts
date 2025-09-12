import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    const envCheck = {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_FROM: !!process.env.SMTP_FROM,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    };

    console.log('=== TESTE DE CONFIGURAÇÃO SMTP ===');
    console.log('Variáveis de ambiente:', envCheck);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***configurado***' : 'NÃO CONFIGURADO');
    console.log('SMTP_FROM:', process.env.SMTP_FROM);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

    // Verificar se todas as variáveis estão configuradas
    const missingVars = Object.entries(envCheck)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        missing: missingVars,
        envCheck,
      }, { status: 400 });
    }

    // Testar conexão SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso');

    // Enviar email de teste
    const testEmail = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER, // Enviar para o próprio usuário
      subject: 'Teste de Configuração SMTP - Águia Soluções',
      html: `
        <h2>✅ Teste de Configuração SMTP</h2>
        <p>Se você recebeu este email, a configuração SMTP está funcionando corretamente!</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p><strong>Servidor:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
        <p><strong>Usuário:</strong> ${process.env.SMTP_USER}</p>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Email de teste enviado:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Configuração SMTP funcionando corretamente!',
      emailSent: true,
      messageId: info.messageId,
      envCheck,
    });

  } catch (error) {
    console.error('❌ Erro no teste SMTP:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro na configuração SMTP',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      envCheck: {
        SMTP_HOST: !!process.env.SMTP_HOST,
        SMTP_PORT: !!process.env.SMTP_PORT,
        SMTP_USER: !!process.env.SMTP_USER,
        SMTP_PASS: !!process.env.SMTP_PASS,
        SMTP_FROM: !!process.env.SMTP_FROM,
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      },
    }, { status: 500 });
  }
}
