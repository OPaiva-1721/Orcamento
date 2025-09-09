import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuração do Prisma com tratamento de erro para build
const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/orcamento'
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] as Prisma.LogLevel[] : ['error'] as Prisma.LogLevel[],
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
