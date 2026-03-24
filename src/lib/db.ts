import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
// Note: Using simple initialization instead of global caching to avoid Turbopack cache issues
const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export default db
export { db }
