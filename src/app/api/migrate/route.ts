import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Executar migração do banco
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Cliente" (
      "id" SERIAL PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "cnpj" TEXT NOT NULL,
      "email" TEXT UNIQUE NOT NULL,
      "telefone" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    );`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Destinatario" (
      "id" SERIAL PRIMARY KEY,
      "nome" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "clienteId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE
    );`;

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Orcamento" (
      "id" SERIAL PRIMARY KEY,
      "descricao" TEXT NOT NULL,
      "preco" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'Pendente',
      "formaPagamento" BOOLEAN NOT NULL DEFAULT false,
      "dataInicio" TIMESTAMP(3) NOT NULL,
      "dataTermino" TIMESTAMP(3),
      "clienteId" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE
    );`;

    return NextResponse.json({ 
      message: 'Migração executada com sucesso!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na migração:', error);
    return NextResponse.json({ 
      error: 'Erro na migração',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
