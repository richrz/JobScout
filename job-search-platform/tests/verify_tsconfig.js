const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(__dirname, '../tsconfig.json');
const nextConfigPath = path.join(__dirname, '../next.config.ts');

if (!fs.existsSync(tsconfigPath)) {
  console.error(`tsconfig.json not found at: ${tsconfigPath}`);
  process.exit(1);
}

if (!fs.existsSync(nextConfigPath)) {
  console.error(`next.config.ts not found at: ${nextConfigPath}`);
  process.exit(1);
}

// Validate tsconfig paths
try {
  // Remove comments from JSON (simple regex, might fail on complex comments)
  const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8').replace(/\/\/.*$/gm, '');
  const tsconfig = JSON.parse(tsconfigContent);
  
  if (!tsconfig.compilerOptions || !tsconfig.compilerOptions.paths) {
    console.error('tsconfig.json missing compilerOptions.paths');
    process.exit(1);
  }

  const paths = tsconfig.compilerOptions.paths;
  if (!paths['@/*'] || !paths['@/*'].includes('./src/*')) {
     console.error('tsconfig.json missing "@/*": ["./src/*"] path alias');
     process.exit(1);
  }
} catch (e) {
  console.error('Failed to parse tsconfig.json:', e.message);
  process.exit(1);
}

// Validate next.config.ts for typedRoutes
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
if (!nextConfigContent.includes('typedRoutes: true')) {
  console.error('next.config.ts missing experimental.typedRoutes: true');
  process.exit(1);
}

console.log('TypeScript configuration verified successfully.');
process.exit(0);
