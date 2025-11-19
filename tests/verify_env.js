const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '../job-search-platform/.env.example');
const envTsPath = path.join(__dirname, '../job-search-platform/src/env.ts');

if (!fs.existsSync(envExamplePath)) {
  console.error(`.env.example not found at: ${envExamplePath}`);
  process.exit(1);
}

if (!fs.existsSync(envTsPath)) {
  console.error(`src/env.ts not found at: ${envTsPath}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envExamplePath, 'utf8');
const requiredKeys = [
  'DATABASE_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
];

let missingKeys = [];

requiredKeys.forEach(key => {
  if (!envContent.includes(key)) {
    missingKeys.push(key);
  }
});

if (missingKeys.length > 0) {
  console.error('Missing keys in .env.example:', missingKeys);
  process.exit(1);
}

console.log('Environment configuration verified successfully.');
process.exit(0);
