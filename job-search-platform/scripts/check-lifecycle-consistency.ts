import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEGACY_MAP: Record<string, string> = {
  interested: 'INTERESTED',
  applied: 'APPLIED',
  screening: 'SCREENING',
  interview: 'INTERVIEW',
  offer: 'OFFER',
  follow_up: 'FOLLOW_UP',
  dormant: 'DORMANT',
  archived: 'ARCHIVED',
  passed: 'PASSED',
  discovered: 'INTERESTED',
  rejected: 'ARCHIVED',
};

async function main() {
  const workspaces = await prisma.workspace.findMany({
    select: { id: true, status: true, application: { select: { id: true, status: true } } },
    where: { status: { not: 'ARCHIVED' } },
    take: 200,
  });

  let ok = 0, mismatches = 0;
  for (const ws of workspaces) {
    if (!ws.application) { ok++; continue; }
    const expected = LEGACY_MAP[ws.application.status] ?? ws.application.status.toUpperCase();
    if (ws.status === expected || ws.status === 'PASSED') { ok++; }
    else {
      console.log(`MISMATCH ws.status=${ws.status} app.status=${ws.application.status} expected=${expected}`);
      mismatches++;
    }
  }
  console.log(`\nChecked ${workspaces.length} workspaces: ${ok} consistent, ${mismatches} mismatches`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
