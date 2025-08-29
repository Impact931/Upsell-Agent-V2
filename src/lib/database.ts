import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export { prisma };

// Database connection helper
export async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Database disconnection helper
export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}

// Health check helper
export async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() };
  }
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

// Graceful shutdown helper
export function setupGracefulShutdown() {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received, closing database connection...`);
    await disconnectFromDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Database seeding helper (for development)
export async function seedDatabase() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Database seeding is only allowed in development environment');
  }

  console.log('🌱 Seeding database...');

  // Add seed data here if needed
  // Example:
  // await prisma.user.createMany({
  //   data: [...],
  //   skipDuplicates: true,
  // });

  console.log('✅ Database seeding completed');
}

export default prisma;