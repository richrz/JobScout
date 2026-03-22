#!/usr/bin/env tsx
/**
 * Run the P1 dedup worker manually.
 * In production this would be triggered after each ingestion batch.
 */
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { runDedupWorker } from '../src/lib/ingest/dedup-worker';
import { prisma } from '../src/lib/prisma';

runDedupWorker()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
