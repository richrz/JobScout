import { NextResponse } from 'next/server';
import { ctsHealthCheck, isCtsEnabled } from '@/lib/cts/talent-service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const health = await ctsHealthCheck();

  const [totalJobs, syncedJobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { ctsJobName: { not: null } } }),
  ]);

  return NextResponse.json({
    cts: {
      enabled: isCtsEnabled(),
      ...health,
    },
    sync: {
      totalJobs,
      syncedToCts: syncedJobs,
      pendingSync: totalJobs - syncedJobs,
    },
  });
}
