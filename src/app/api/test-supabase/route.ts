import { NextResponse } from 'next/server';

export async function GET() {
  const tests = [];
  
  // Teste 1: URL com pgbouncer
  const urlWithPooler = process.env.DATABASE_URL;
  tests.push({
    name: 'URL com pgbouncer',
    url: urlWithPooler ? urlWithPooler.substring(0, 50) + '...' : 'Não configurada',
    hasPooler: urlWithPooler?.includes('pgbouncer=true') || false
  });
  
  // Teste 2: URL sem pgbouncer (se possível)
  const urlWithoutPooler = urlWithPooler?.replace('?pgbouncer=true', '');
  tests.push({
    name: 'URL sem pgbouncer',
    url: urlWithoutPooler ? urlWithoutPooler.substring(0, 50) + '...' : 'Não disponível',
    available: !!urlWithoutPooler
  });
  
  // Teste 3: Verificar componentes da URL
  if (urlWithPooler) {
    const urlParts = {
      protocol: urlWithPooler.startsWith('postgresql://') ? 'postgresql' : 'outro',
      hasHost: urlWithPooler.includes('supabase.com'),
      hasPort: urlWithPooler.includes(':6543'),
      hasDatabase: urlWithPooler.includes('/postgres'),
      hasCredentials: urlWithPooler.includes('@'),
      hasPooler: urlWithPooler.includes('pgbouncer=true')
    };
    
    tests.push({
      name: 'Análise da URL',
      ...urlParts
    });
  }
  
  return NextResponse.json({
    message: 'Análise da configuração do Supabase',
    tests,
    timestamp: new Date().toISOString(),
    recommendations: [
      'Verifique se a URL está correta no painel do Vercel',
      'Confirme se o banco Supabase está ativo',
      'Teste a conexão diretamente no Supabase'
    ]
  });
}
