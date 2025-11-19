const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../job-search-platform/package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at: ${packageJsonPath}`);
  process.exit(1);
}

const packageJson = require(packageJsonPath);
const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};

const requiredDependencies = [
  '@prisma/client',
  'zod',
  'react-hook-form',
  '@hookform/resolvers',
  'next-auth',
  'bcrypt',
  'jsonwebtoken',
  'framer-motion',
  'recharts',
  '@langchain/openai',
  '@langchain/anthropic',
  'langchain',
  'mapbox-gl',
  'react-map-gl',
  '@dnd-kit/core',
  '@dnd-kit/sortable'
];

const requiredDevDependencies = [
  'prisma',
  '@types/mapbox-gl',
  '@types/bcrypt',
  '@types/jsonwebtoken'
];

let missingDeps = [];
let missingDevDeps = [];

requiredDependencies.forEach(dep => {
  if (!dependencies[dep]) {
    missingDeps.push(dep);
  }
});

requiredDevDependencies.forEach(dep => {
  if (!devDependencies[dep]) {
    missingDevDeps.push(dep);
  }
});

if (missingDeps.length > 0 || missingDevDeps.length > 0) {
  console.error('Missing dependencies:', missingDeps);
  console.error('Missing devDependencies:', missingDevDeps);
  process.exit(1);
}

console.log('All required dependencies are present.');
process.exit(0);
