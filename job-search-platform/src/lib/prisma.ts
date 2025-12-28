import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isProduction = process.env.NODE_ENV === 'production';

// Fail fast if database URL is missing in production
if (!process.env.DATABASE_URL && isProduction) {
  throw new Error('DATABASE_URL is not set. Production database connection required.');
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
  });

if (!isProduction) globalForPrisma.prisma = prisma;

/**
 * Validates the database connection with retry logic.
 * Useful for container startup where DB might lag behind App.
 */
export async function ensureDbConnection(retries = 5, delay = 2000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('Successfully connected to the database.');
      return true;
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      console.warn(
        `Database connection attempt ${i + 1}/${retries} failed. ${isLastAttempt ? 'Giving up.' : `Retrying in ${delay}ms...`
        }`
      );
      if (isLastAttempt) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}
