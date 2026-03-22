import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** Single client per runtime (dev HMR + warm serverless invocations). */
export const prisma = globalForPrisma.prisma ?? createPrisma();

if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;
