#!/usr/bin/env node

/**
 * Script de Migração para Supabase
 * 
 * Este script ajuda a migrar do SQLite para o Supabase PostgreSQL
 * Execute: node migrate-to-supabase.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando migração para Supabase...\n');

// Verificar se o arquivo .env.local existe
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('📝 Crie o arquivo .env.local com suas credenciais do Supabase:');
  console.log(`
DATABASE_URL="postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=gabryelpaiva123@gmail.com
SMTP_PASS=ufyh cyye htcb amvb
SMTP_FROM=noreply@empresa.com
NEXTAUTH_URL=http://localhost:3000
  `);
  process.exit(1);
}

// Verificar se a DATABASE_URL está configurada
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('DATABASE_URL=') || envContent.includes('[YOUR-PASSWORD]')) {
  console.log('❌ DATABASE_URL não configurada corretamente!');
  console.log('📝 Configure sua URL do Supabase no arquivo .env.local');
  process.exit(1);
}

console.log('✅ Arquivo .env.local encontrado e configurado');

try {
  // 1. Gerar cliente Prisma
  console.log('\n📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma gerado');

  // 2. Executar migração
  console.log('\n🗄️ Executando migração para Supabase...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Migração executada com sucesso');

  // 3. Verificar conexão
  console.log('\n🔍 Verificando conexão com o banco...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Conexão verificada');

  // 4. Executar seed (se existir)
  const seedPath = path.join(__dirname, 'seed.js');
  if (fs.existsSync(seedPath)) {
    console.log('\n🌱 Executando seed dos dados...');
    execSync('node seed.js', { stdio: 'inherit' });
    console.log('✅ Seed executado');
  }

  console.log('\n🎉 Migração para Supabase concluída com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute: npm run dev');
  console.log('2. Teste a aplicação em http://localhost:3000');
  console.log('3. Verifique as tabelas no Supabase Dashboard');
  console.log('\n🔗 Acesse seu projeto: https://supabase.com/dashboard');

} catch (error) {
  console.error('\n❌ Erro durante a migração:', error.message);
  console.log('\n🔧 Soluções comuns:');
  console.log('1. Verifique se a DATABASE_URL está correta');
  console.log('2. Confirme se o projeto Supabase está ativo');
  console.log('3. Execute: npx prisma migrate reset --force');
  console.log('4. Tente novamente: node migrate-to-supabase.js');
  process.exit(1);
}
