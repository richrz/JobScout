const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'postcss.config.mjs',
  'next.config.ts'
];

let missingFiles = [];

if (!fs.existsSync(projectDir)) {
  console.error(`Project directory not found: ${projectDir}`);
  process.exit(1);
}

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(projectDir, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('Missing required files:', missingFiles);
  process.exit(1);
}

console.log('Project structure verified successfully.');
process.exit(0);
