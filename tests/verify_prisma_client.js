const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../job-search-platform/src/lib/prisma.ts');

if (!fs.existsSync(clientPath)) {
  console.error(`prisma.ts not found at: ${clientPath}`);
  process.exit(1);
}

const content = fs.readFileSync(clientPath, 'utf8');

// Basic checks for singleton pattern and client instantiation
if (!content.includes('PrismaClient') || !content.includes('globalForPrisma')) {
    console.error('prisma.ts does not appear to implement the singleton pattern properly');
    process.exit(1);
}

console.log('Prisma client configuration verified successfully.');
process.exit(0);
