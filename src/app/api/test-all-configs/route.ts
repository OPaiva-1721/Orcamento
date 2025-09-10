import { NextResponse } from 'next/server';
import { prismaDefault, prismaWithoutPooler, prismaVercel } from '@/lib/prisma-alternative';

export async function GET() {
  const results: any[] = [];
  
  // Teste 1: Configuração padrão
  try {
    await prismaDefault.$connect();
    const result1 = await prismaDefault.$queryRaw`SELECT 1 as test`;
    results.push({
      config: 'Padrão (com pgbouncer)',
      success: true,
      result: result1
    });
  } catch (error) {
    results.push({
      config: 'Padrão (com pgbouncer)',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  } finally {
    await prismaDefault.$disconnect();
  }
  
  // Teste 2: Sem pgbouncer
  try {
    await prismaWithoutPooler.$connect();
    const result2 = await prismaWithoutPooler.$queryRaw`SELECT 1 as test`;
    results.push({
      config: 'Sem pgbouncer',
      success: true,
      result: result2
    });
  } catch (error) {
    results.push({
      config: 'Sem pgbouncer',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  } finally {
    await prismaWithoutPooler.$disconnect();
  }
  
  // Teste 3: Com SSL mode
  try {
    await prismaVercel.$connect();
    const result3 = await prismaVercel.$queryRaw`SELECT 1 as test`;
    results.push({
      config: 'Com sslmode=require',
      success: true,
      result: result3
    });
  } catch (error) {
    results.push({
      config: 'Com sslmode=require',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  } finally {
    await prismaVercel.$disconnect();
  }
  
  const successfulConfigs = results.filter(r => r.success);
  
  return NextResponse.json({
    message: 'Teste de todas as configurações',
    results,
    recommendation: successfulConfigs.length > 0 
      ? `Use a configuração: ${successfulConfigs[0].config}`
      : 'Nenhuma configuração funcionou',
    timestamp: new Date().toISOString()
  });
}
