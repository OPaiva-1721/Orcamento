import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Teste 1: Verificar se as variáveis de ambiente estão disponíveis
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    // Teste 2: Tentar importar o Prisma
    let prismaImport = false;
    let prismaError = null;
    
    try {
      const { prisma } = await import('@/lib/prisma');
      prismaImport = true;
      
      // Teste 3: Tentar conectar com o banco
      let connectionTest = false;
      let connectionError = null;
      
      try {
        await prisma.$connect();
        connectionTest = true;
        await prisma.$disconnect();
      } catch (error) {
        connectionError = error instanceof Error ? error.message : 'Erro desconhecido';
      }
      
      return NextResponse.json({
        success: true,
        tests: {
          hasDatabaseUrl,
          nodeEnv,
          prismaImport,
          connectionTest,
          connectionError
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      prismaError = error instanceof Error ? error.message : 'Erro desconhecido';
    }
    
    return NextResponse.json({
      success: false,
      tests: {
        hasDatabaseUrl,
        nodeEnv,
        prismaImport,
        prismaError
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro no diagnóstico',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
