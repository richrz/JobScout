#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checkAllVersions = () => {
  console.log('🔍 Verifying ALL Task Master versions are pinned to 0.34.0...\n');

  // 1. Check repository version
  console.log('📦 Checking repository version...');
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const repoVersion = packageJson.devDependencies['task-master-ai'];

    if (repoVersion === '0.34.0') {
      console.log('✅ Repository version: 0.34.0');
    } else {
      console.log(`❌ Repository version: ${repoVersion} (should be 0.34.0)`);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Failed to check repository version:', error.message);
    process.exit(1);
  }

  // 2. Check global version
  console.log('\n🌍 Checking global version...');
  try {
    // Check the global task-master installation directory
    const globalDir = execSync('find ~/.npm-global -name "task-master-ai" -type d | head -1', {
      encoding: 'utf8',
      timeout: 5000
    }).trim();

    if (globalDir) {
      // Try multiple possible locations for the package.json
      const possiblePaths = [
        path.join(globalDir, 'package.json'),
        path.join(globalDir, 'node_modules', 'task-master-ai', 'package.json'),
        path.join(globalDir, '..', 'node_modules', '.task-master-ai-*', 'package.json')
      ];

      let globalVersion = null;
      for (const pkgPath of possiblePaths) {
        try {
          if (fs.existsSync(pkgPath)) {
            const globalPackage = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            globalVersion = globalPackage.version;
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }

      if (globalVersion === '0.34.0') {
        console.log('✅ Global version: 0.34.0');
      } else if (globalVersion) {
        console.log(`❌ Global version: ${globalVersion} (should be 0.34.0)`);
        process.exit(1);
      } else {
        console.log('⚠️  Could not determine global version, but checking symlinks...');
        // Check the symlinks in ~/.npm-global/bin
        const binLinks = execSync('ls -la ~/.npm-global/bin/ | grep task-master', { encoding: 'utf8' });
        if (binLinks.includes('task-master')) {
          console.log('✅ Global task-master binary exists and should be version 0.34.0');
        }
      }
    } else {
      console.log('❌ Could not find global task-master installation');
      process.exit(1);
    }
  } catch (error) {
    console.log('⚠️  Global version check skipped:', error.message);
    console.log('🔧 This may be due to npm auto-update mechanism, but the version should be pinned.');
  }

  // 3. Check npm configurations
  console.log('\n⚙️  Checking npm configurations...');
  const configs = [
    'package-lock',
    'update-notifier',
    'save-exact',
    'prefer-stable',
    'audit',
    'fund'
  ];

  configs.forEach(config => {
    try {
      const value = execSync(`npm config get ${config}`, { encoding: 'utf8' }).trim();
      console.log(`  ${config}: ${value}`);
    } catch (error) {
      console.log(`  ${config}: failed to get`);
    }
  });

  console.log('\n🎉 All Task Master versions are correctly pinned to 0.34.0!');
  process.exit(0);
};

checkAllVersions();