const fs = require('fs');
const path = require('path');

const dockerfilePath = path.join(__dirname, '../Dockerfile');

if (!fs.existsSync(dockerfilePath)) {
  console.error(`Dockerfile not found at: ${dockerfilePath}`);
  process.exit(1);
}

const content = fs.readFileSync(dockerfilePath, 'utf8');

const requiredPatterns = [
  /FROM.*AS\s+deps/i,
  /FROM.*AS\s+builder/i,
  /FROM.*AS\s+runner/i,
  /COPY --from=builder/i
];

let missingPatterns = [];

requiredPatterns.forEach(pattern => {
  if (!pattern.test(content)) {
    missingPatterns.push(pattern.toString());
  }
});

if (missingPatterns.length > 0) {
  console.error('Dockerfile missing multi-stage build patterns:', missingPatterns);
  process.exit(1);
}

console.log('Dockerfile verified successfully.');
process.exit(0);
