import path from 'path';
import { config as loadDotenv } from 'dotenv';

let loaded = false;

export function loadRootEnv() {
  if (loaded) {
    return;
  }

  const rootEnvPath = path.resolve(process.cwd(), '..', '.env');
  loadDotenv({
    path: rootEnvPath,
    override: true,
  });

  loaded = true;
}

loadRootEnv();
