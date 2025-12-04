#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const checkTaskMasterVersion = () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const expectedVersion = '0.37.0';
  const actualVersion = packageJson.devDependencies?.['task-master-ai'] || packageJson.dependencies?.['task-master-ai'];

  console.log('🔍 Verifying Task Master version...');
  console.log(`Expected: ${expectedVersion}`);
  console.log(`Actual: ${actualVersion}`);

  if (actualVersion === expectedVersion) {
    console.log('✅ Task Master is correctly pinned to version 0.34.0');
    process.exit(0);
  } else {
    console.log('❌ Task Master version has been changed!');
    console.log('This violates the stability requirements.');
    console.log(`Reverting to version ${expectedVersion}...`);

    if (packageJson.devDependencies?.['task-master-ai']) {
        packageJson.devDependencies['task-master-ai'] = expectedVersion;
    } else {
        packageJson.dependencies['task-master-ai'] = expectedVersion;
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    console.log(`✅ Reverted to version ${expectedVersion}`);
    process.exit(1);
  }
};

checkTaskMasterVersion();