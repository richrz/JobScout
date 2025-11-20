const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error(`schema.prisma not found at: ${schemaPath}`);
  process.exit(1);
}

const content = fs.readFileSync(schemaPath, 'utf8');

const requiredModels = ['User', 'Profile', 'Job', 'Application', 'Config'];
let missingModels = [];

requiredModels.forEach(model => {
  if (!content.includes(`model ${model} {`)) {
    missingModels.push(model);
  }
});

if (missingModels.length > 0) {
  console.error('Missing models in schema.prisma:', missingModels);
  process.exit(1);
}

// Basic relationship checks (regex is brittle but sufficient for this check)
const relationships = [
    { model: 'User', field: 'profile' },
    { model: 'User', field: 'applications' },
    { model: 'User', field: 'config' },
    { model: 'Profile', field: 'userId' },
    { model: 'Job', field: 'applications' },
    { model: 'Application', field: 'userId' },
    { model: 'Application', field: 'jobId' },
    { model: 'Config', field: 'userId' }
];

let missingRelations = [];

relationships.forEach(rel => {
    // Look for field definition within the model block
    const modelRegex = new RegExp(`model ${rel.model} \{[^}]*\}`, 's');
    const match = content.match(modelRegex);
    if (match) {
        const modelBody = match[0];
        if (!modelBody.includes(rel.field)) {
            missingRelations.push(`${rel.model}.${rel.field}`);
        }
    } else {
        // Model missing (already caught above), skip relation check
    }
});

if (missingRelations.length > 0) {
    console.error('Missing relationships:', missingRelations);
    process.exit(1);
}


console.log('Prisma schema structure verified successfully.');
process.exit(0);
