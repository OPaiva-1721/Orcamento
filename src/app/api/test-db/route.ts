import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    
    // Verificar se as tabelas existem
    const clientes = await prisma.cliente.count();
    const destinatarios = await prisma.destinatario.count();
    const orcamentos = await prisma.orcamento.count();
    
    return NextResponse.json({ 
      message: 'Conexão com banco funcionando!',
      tables: {
        clientes,
        destinatarios,
        orcamentos
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao conectar com banco:', error);
    return NextResponse.json({ 
      error: 'Erro ao conectar com banco',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
