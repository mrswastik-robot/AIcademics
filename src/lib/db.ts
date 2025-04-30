import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient;
}

export let prisma: PrismaClient;

// Check if we're in a browser environment
const isServer = typeof window === 'undefined';

if (!isServer) {
  // Client-side - create a mock or placeholder
  // This prevents the server-only PrismaClient from being included in client bundles
  // @ts-ignore - Intentionally using a placeholder for client-side
  prisma = new Proxy({}, {
    get: () => {
      throw new Error('PrismaClient cannot be used on the client side');
    }
  });
} else {
  // Server-side - use the actual PrismaClient
  if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
  } else {
    if (!global.cachedPrisma) {
      global.cachedPrisma = new PrismaClient();
    }
    prisma = global.cachedPrisma;
  }
}