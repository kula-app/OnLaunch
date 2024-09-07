import { PrismaClient } from '@prisma/client';

// Creates a shared singleton which is stored in the global context `globalThis`.
// Otherwise it might happen, that too many connections are opened at the same time.
//
// References:
//  - https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
//  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis

/// Creates the client
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Typed access to the global context
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
