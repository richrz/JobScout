/**
 * Sync existing Postgres jobs to Cloud Talent Solution.
 *
 * Run: npx tsx scripts/sync-jobs-to-cts.ts
 *
 * This pushes all jobs that don't yet have a ctsJobName to CTS.
 * Safe to run multiple times — idempotent via requisitionId (Postgres job ID).
 */

import { PrismaClient } from '@prisma/client';
import { upsertJob, isCtsEnabled, ctsHealthCheck, type CtsJobInput } from '../src/lib/cts/talent-service';

const prisma = new PrismaClient();

async function main() {
  console.log('=== CTS Job Sync ===\n');

  // Check CTS connectivity
  const health = await ctsHealthCheck();
  console.log(`CTS status: ${health.ok ? '✅' : '❌'} ${health.message}`);
  if (!health.ok) {
    console.error('\nPlease configure CTS environment variables:');
    console.error('  GOOGLE_CLOUD_PROJECT_ID=your-project-id');
    console.error('  CTS_TENANT_ID=your-tenant-id (default: "default")');
    console.error('  GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json');
    process.exit(1);
  }

  // Find jobs not yet synced to CTS
  const unsyncedJobs = await prisma.job.findMany({
    where: { ctsJobName: null },
    orderBy: { postedAt: 'desc' },
  });

  console.log(`\nFound ${unsyncedJobs.length} jobs to sync.\n`);

  if (unsyncedJobs.length === 0) {
    console.log('All jobs already synced!');
    return;
  }

  let success = 0;
  let failed = 0;

  for (const job of unsyncedJobs) {
    const input: CtsJobInput = {
      postgresId: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      location: job.location,
      salary: job.salary,
      sourceUrl: job.sourceUrl,
      postedAt: job.postedAt,
      source: job.source,
    };

    try {
      const ctsJobName = await upsertJob(input);

      await prisma.job.update({
        where: { id: job.id },
        data: { ctsJobName },
      });

      success++;
      process.stdout.write(`\r  Synced ${success}/${unsyncedJobs.length} (${failed} failed)`);
    } catch (err: any) {
      failed++;
      console.error(`\n  ❌ Failed: ${job.title} @ ${job.company}: ${err?.message || err}`);
    }
  }

  console.log(`\n\n✅ Sync complete: ${success} synced, ${failed} failed out of ${unsyncedJobs.length} total.`);
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
