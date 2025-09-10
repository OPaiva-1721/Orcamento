import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Testar diferentes configurações de URL
    const originalUrl = process.env.DATABASE_URL;
    
    if (!originalUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL não configurada',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    // URL sem pgbouncer
    const urlWithoutPooler = originalUrl.replace('?pgbouncer=true', '');
    
    // Testar com URL direta (sem pooler)
    process.env.DATABASE_URL = urlWithoutPooler;
    
    // Importar Prisma dinamicamente para testar
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      
      return NextResponse.json({
        success: true,
        message: 'Conexão funcionou sem pgbouncer!',
        testResult: result,
        urlUsed: 'URL sem pgbouncer',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        urlUsed: 'URL sem pgbouncer',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
      // Restaurar URL original
      process.env.DATABASE_URL = originalUrl;
    }
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erro no teste de conexão',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
