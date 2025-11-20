const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error(`schema.prisma not found at: ${schemaPath}`);
  process.exit(1);
}

const content = fs.readFileSync(schemaPath, 'utf8');

const requiredIndexes = [
    { model: 'User', index: '@@index([email])' },
    { model: 'Job', index: '@@index([postedAt, source])' },
    { model: 'Job', index: '@@index([cityMatch, compositeScore])' },
    { model: 'Application', index: '@@index([userId, status])' },
    { model: 'Application', index: '@@index([jobId])' }
];

let missingIndexes = [];

requiredIndexes.forEach(req => {
    // Find model block
    const modelRegex = new RegExp(`model ${req.model} \{[^}]*\}`, 's');
    const match = content.match(modelRegex);
    if (match) {
        const modelBody = match[0];
        // Check for index string (escaping brackets for regex if needed, but simple string search is robust enough here if exact)
        if (!modelBody.includes(req.index)) {
            missingIndexes.push(`${req.model}: ${req.index}`);
        }
    } else {
        missingIndexes.push(`Model ${req.model} not found`);
    }
});

if (missingIndexes.length > 0) {
    console.error('Missing indexes:', missingIndexes);
    process.exit(1);
}

console.log('All required indexes verified.');
process.exit(0);
