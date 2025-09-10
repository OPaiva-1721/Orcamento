import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      // Não mostrar o valor real da DATABASE_URL por segurança
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_STARTS_WITH: process.env.DATABASE_URL?.substring(0, 20) || 'N/A'
    };

    return NextResponse.json({
      message: 'Informações de ambiente',
      environment: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Erro ao obter informações de ambiente',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
