import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.ACCELERATE_URL || process.env.DATABASE_URL!,
    },
  },
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
