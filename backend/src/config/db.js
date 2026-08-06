const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Prisma driver adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the driver adapter
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
