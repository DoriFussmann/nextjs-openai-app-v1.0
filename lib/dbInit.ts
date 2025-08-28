import { prisma } from "./prisma";

let initialized = false;
export async function ensureSqliteSafety() {
  if (initialized) return;
  initialized = true;
  try {
    await prisma.$executeRawUnsafe(`PRAGMA journal_mode=WAL;`);
    await prisma.$executeRawUnsafe(`PRAGMA synchronous=FULL;`);
    await prisma.$executeRawUnsafe(`PRAGMA foreign_keys=ON;`);
  } catch (e) {
    console.error("SQLite init failed", e);
  }
}

