import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    },
    database: {
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_STARTS_WITH: process.env.DATABASE_URL?.substring(0, 30) || 'N/A',
      DATABASE_URL_ENDS_WITH: process.env.DATABASE_URL?.substring(-20) || 'N/A',
    },
    prisma: {
      clientVersion: '6.15.0',
      binaryTargets: ['native', 'linux-musl']
    }
  };

  try {
    // Testar conexão com Prisma
    debugInfo.prisma.connectionTest = 'Tentando conectar...';
    
    await prisma.$connect();
    debugInfo.prisma.connectionTest = 'Conectado com sucesso!';
    
    // Testar query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    debugInfo.prisma.queryTest = 'Query executada com sucesso!';
    debugInfo.prisma.queryResult = result;
    
    // Testar contagem de tabelas
    const clientes = await prisma.cliente.count();
    debugInfo.prisma.tables = {
      clientes,
      destinatarios: await prisma.destinatario.count(),
      orcamentos: await prisma.orcamento.count()
    };
    
    debugInfo.status = 'SUCCESS';
    
  } catch (error) {
    debugInfo.status = 'ERROR';
    debugInfo.error = {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    };
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignorar erro de disconnect
    }
  }

  return NextResponse.json(debugInfo, { 
    status: debugInfo.status === 'SUCCESS' ? 200 : 500 
  });
}
