// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the PrismaClient instance.
// This prevents creating new connections during hot reloading in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient. If 'global.prisma' already exists (from a previous hot reload),
// use that instance; otherwise, create a new one.
const prisma = global.prisma || new PrismaClient({
  // Optional: Enable logging for development debugging. Remove or adjust for production.
  // log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : [],
});

// In development, assign the instance to the global variable.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the singleton instance for use in API routes and other server-side code.
export default prisma;