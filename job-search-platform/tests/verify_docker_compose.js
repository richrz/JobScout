const fs = require('fs');
const path = require('path');

const composePath = path.join(__dirname, '../docker-compose.yml');
const nginxPath = path.join(__dirname, '../nginx.conf');

if (!fs.existsSync(composePath)) {
  console.error(`docker-compose.yml not found at: ${composePath}`);
  process.exit(1);
}

if (!fs.existsSync(nginxPath)) {
  console.error(`nginx.conf not found at: ${nginxPath}`);
  process.exit(1);
}

const composeContent = fs.readFileSync(composePath, 'utf8');

const requiredServices = [
  'app:',
  'db:',
  'n8n:',
  'redis:',
  'nginx:'
];

let missingServices = [];

requiredServices.forEach(service => {
  if (!composeContent.includes(service)) {
    missingServices.push(service.replace(':', ''));
  }
});

if (missingServices.length > 0) {
  console.error('Missing services in docker-compose.yml:', missingServices);
  process.exit(1);
}

console.log('docker-compose.yml verified successfully.');
process.exit(0);
