const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../prisma/seed.ts');
const packageJsonPath = path.join(__dirname, '../package.json');

if (!fs.existsSync(seedPath)) {
  console.error(`seed.ts not found at: ${seedPath}`);
  process.exit(1);
}

const seedContent = fs.readFileSync(seedPath, 'utf8');
if (!seedContent.includes('prisma.user.create') && !seedContent.includes('prisma.user.upsert')) {
    console.error('seed.ts does not appear to create users');
    process.exit(1);
}

const packageJson = require(packageJsonPath);
if (!packageJson.prisma || !packageJson.prisma.seed) {
    console.error('package.json missing prisma.seed configuration');
    process.exit(1);
}

console.log('Seed configuration verified successfully.');
process.exit(0);
