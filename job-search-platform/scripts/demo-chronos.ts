#!/usr/bin/env npx tsx
import { injectSimulatedJobs } from '../src/lib/simulation/simulator-service';
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║        TASK 45 DEMO: Chronos Ingress Simulator               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('Step 1: Cleaning up previous demo data...');
    const deleted = await prisma.job.deleteMany({
        where: { source: 'chronos-sim' }
    });
    console.log(`✅ Deleted ${deleted.count} old simulated jobs.\n`);

    console.log('Step 2: Simulating "One Hour" of Ingress...');
    console.log('Rolling for 10 jobs with a 50% "Chaos/Junk" ratio...');
    console.log('─'.repeat(50));

    const jobs = await injectSimulatedJobs(10, 0.5);

    console.log('\nStep 3: Verifying Results...');
    console.log('─'.repeat(50));

    jobs.forEach((job, i) => {
        const isElite = job.title.includes('AI') || job.title.includes('Glassmorphism') || job.title.includes('Product Overhaul');
        const icon = isElite ? '💎' : '🗑️';
        console.log(`[${i + 1}] ${icon} ${job.title.padEnd(40)} | ${job.company}`);
    });

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ CHRONOS IS LIVE!                       ║');
    console.log('║  The engine can now simulate market noise and elite roles.   ║');
    console.log('║                                                              ║');
    console.log('║  Run this again to roll a new batch.                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
