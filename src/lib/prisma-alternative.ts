import { PrismaClient } from '@prisma/client';

// Versão alternativa do Prisma Client para testar diferentes configurações
const createPrismaClient = (url?: string) => {
  const client = new PrismaClient({
    datasources: url ? {
      db: {
        url: url
      }
    } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  
  return client;
};

// Cliente padrão
export const prismaDefault = createPrismaClient();

// Cliente sem pgbouncer
export const prismaWithoutPooler = createPrismaClient(
  process.env.DATABASE_URL?.replace('?pgbouncer=true', '')
);

// Cliente com configuração específica para Vercel
export const prismaVercel = createPrismaClient(
  process.env.DATABASE_URL?.replace('?pgbouncer=true', '?sslmode=require')
);

export { createPrismaClient };
