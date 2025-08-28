import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Initialize database with proper SQLite settings
export async function initializeDatabase() {
  try {
    // Set SQLite WAL mode and FULL synchronous for atomic writes
    await prisma.$executeRaw`PRAGMA journal_mode=WAL;`;
    await prisma.$executeRaw`PRAGMA synchronous=FULL;`;
    
    console.log('✅ Database initialized with WAL mode and FULL synchronous');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Ensure database is initialized on import
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

