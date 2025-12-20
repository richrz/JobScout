#!/usr/bin/env node

/**
 * Finds a random available TCP port in the 3001–3999 range.
 * If PORT is already set, it is printed unchanged.
 */
const net = require('net');

const MIN_PORT = 3001;
const MAX_PORT = 3999;
const MAX_ATTEMPTS = 50;

if (process.env.PORT) {
  process.stdout.write(String(process.env.PORT));
  process.exit(0);
}

function getRandomPort() {
  return Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

async function findPort() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = getRandomPort();
    // Never allow 3000, even if the range is adjusted in the future.
    if (candidate === 3000) continue;
    // eslint-disable-next-line no-await-in-loop
    const available = await isPortAvailable(candidate);
    if (available) return candidate;
  }
  return null;
}

(async () => {
  const port = await findPort();
  if (!port) {
    console.error('No free port found in the 3001–3999 range.');
    process.exit(1);
  }
  process.stdout.write(String(port));
})();
