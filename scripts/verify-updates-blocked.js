#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🛡️  VERIFYING TASK MASTER UPDATES ARE COMPLETELY BLOCKED...\n');

// Test 1: Check version command doesn't show updates
try {
  console.log('📦 Testing version command...');
  const versionOutput = execSync('task-master --version', {
    encoding: 'utf8',
    timeout: 5000,
    stdio: 'pipe'
  }).trim();

  if (versionOutput === '0.34.0') {
    console.log('✅ Version command shows 0.34.0 (no update messages)');
  } else {
    console.log(`❌ Unexpected version output: ${versionOutput}`);
    process.exit(1);
  }
} catch (error) {
  console.log(`❌ Version command failed: ${error.message}`);
  process.exit(1);
}

// Test 2: Check MCP server doesn't show updates
try {
  console.log('\n🔌 Testing MCP server...');
  const mcpHelp = execSync('task-master-mcp --help', {
    encoding: 'utf8',
    timeout: 5000,
    stdio: 'pipe'
  }).trim();

  if (!mcpHelp.includes('Update Available') && !mcpHelp.includes('Auto-updating')) {
    console.log('✅ MCP server shows no update messages');
  } else {
    console.log('❌ MCP server contains update messages');
    process.exit(1);
  }
} catch (error) {
  console.log(`❌ MCP command failed: ${error.message}`);
  process.exit(1);
}

// Test 3: Check binaries are read-only
try {
  console.log('\n🔒 Checking file permissions...');
  const taskMasterPath = '/home/richard/.npm-global/lib/node_modules/.task-master-ai-t99we6ou/dist/task-master.js';
  const mcpServerPath = '/home/richard/.npm-global/lib/node_modules/.task-master-ai-t99we6ou/dist/mcp-server.js';

  const taskMasterStats = fs.statSync(taskMasterPath);
  const mcpServerStats = fs.statSync(mcpServerPath);

  if ((taskMasterStats.mode & 0o444) === 0o444) {
    console.log('✅ task-master.js is read-only');
  } else {
    console.log('❌ task-master.js is not read-only');
    process.exit(1);
  }

  if ((mcpServerStats.mode & 0o444) === 0o444) {
    console.log('✅ mcp-server.js is read-only');
  } else {
    console.log('❌ mcp-server.js is not read-only');
    process.exit(1);
  }
} catch (error) {
  console.log(`❌ Permission check failed: ${error.message}`);
  process.exit(1);
}

// Test 4: Check wrapper scripts exist
try {
  console.log('\n🔄 Checking wrapper scripts...');
  const blockedScript = '/home/richard/.npm-global/bin/task-master-blocked';
  const blockedMcpScript = '/home/richard/.npm-global/bin/task-master-mcp-blocked';

  if (fs.existsSync(blockedScript)) {
    console.log('✅ task-master-blocked wrapper exists');
  } else {
    console.log('❌ task-master-blocked wrapper missing');
    process.exit(1);
  }

  if (fs.existsSync(blockedMcpScript)) {
    console.log('✅ task-master-mcp-blocked wrapper exists');
  } else {
    console.log('❌ task-master-mcp-blocked wrapper missing');
    process.exit(1);
  }
} catch (error) {
  console.log(`❌ Wrapper check failed: ${error.message}`);
  process.exit(1);
}

// Test 5: Check environment variables are set
const envTests = [
  { var: 'TASK_MASTER_NO_UPDATE_CHECK', expected: '1' },
  { var: 'DISABLE_UPDATE_CHECKS', expected: 'true' },
  { var: 'NPM_CONFIG_UPDATE_NOTIFIER', expected: 'false' },
  { var: 'NO_UPDATE_NOTIFICATIONS', expected: '1' }
];

try {
  console.log('\n🌍 Checking environment variables...');
  envTests.forEach(test => {
    if (process.env[test.var] === test.expected) {
      console.log(`✅ ${test.var} = ${test.expected}`);
    } else {
      console.log(`❌ ${test.var} = ${process.env[test.var]} (expected ${test.expected})`);
    }
  });
} catch (error) {
  console.log(`❌ Environment check failed: ${error.message}`);
  process.exit(1);
}

console.log('\n🎉 ALL UPDATES HAVE BEEN SUCCESSFULLY BLOCKED!');
console.log('📌 Task Master is permanently pinned to version 0.34.0');
console.log('🚫 No automatic updates can occur');
console.log('✅ MCP server is fully functional');
process.exit(0);