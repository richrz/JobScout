#!/usr/bin/env npx tsx
/**
 * Demo Script: Ingest Pipeline Verification (Task 38)
 * 
 * This script demonstrates the full ingest pipeline:
 * 1. Generates mock job data
 * 2. Normalizes and geocodes it
 * 3. Persists to the database via the job-service
 * 4. Fetches from the database to verify persistence
 * 5. Outputs success/failure summary
 * 
 * Run with: NEXT_PUBLIC_MOCK_MODE=true npx tsx scripts/demo-task-38.ts
 */

import { prisma } from '../src/lib/prisma';
import { saveJobs } from '../src/lib/job-service';
import { JobListing } from '../src/lib/job-scrapers';

const DEMO_JOBS: JobListing[] = [
    {
        title: 'AI Engineer - Demo Pipeline Test',
        company: 'Ingest Demo Corp',
        location: 'San Francisco, CA',
        description: 'This is a test job created by the Task 38 demo script to verify the ingest pipeline.',
        salary: '$180,000 - $220,000',
        source: 'indeed',
        sourceUrl: `https://demo.example.com/job/task38-demo-${Date.now()}`,
        postedAt: new Date(),
        scrapedAt: new Date()
    },
    {
        title: 'Full Stack Developer - Demo Test',
        company: 'Pipeline Verification LLC',
        location: 'Austin, TX',
        description: 'Another test job to verify batch processing in the ingest pipeline.',
        salary: '$150,000 - $185,000',
        source: 'linkedin',
        sourceUrl: `https://demo.example.com/job/task38-demo-2-${Date.now()}`,
        postedAt: new Date(),
        scrapedAt: new Date()
    }
];

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          TASK 38 DEMO: Ingest Pipeline Verification          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`📦 Mock Mode: ${process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    // Step 1: Show demo jobs
    console.log('Step 1: Demo Jobs to Ingest');
    console.log('─'.repeat(50));
    DEMO_JOBS.forEach((job, i) => {
        console.log(`  [${i + 1}] "${job.title}" at ${job.company}`);
        console.log(`      Location: ${job.location}`);
        console.log(`      Source: ${job.source}`);
    });
    console.log('');

    // Step 2: Run the saveJobs function (which normalizes + geocodes + persists)
    console.log('Step 2: Ingesting via saveJobs()...');
    console.log('─'.repeat(50));
    try {
        await saveJobs(DEMO_JOBS);
        console.log('  ✅ saveJobs() completed successfully.\n');
    } catch (error) {
        console.error('  ❌ saveJobs() FAILED:', error);
        process.exit(1);
    }

    // Step 3: Verify by fetching from database
    console.log('Step 3: Verifying Persistence in Database...');
    console.log('─'.repeat(50));

    const fetchedJobs = await prisma.job.findMany({
        where: {
            OR: DEMO_JOBS.map(j => ({ sourceUrl: j.sourceUrl }))
        },
        select: {
            id: true,
            title: true,
            company: true,
            latitude: true,
            longitude: true,
            createdAt: true
        }
    });

    if (fetchedJobs.length === DEMO_JOBS.length) {
        console.log(`  ✅ Found ${fetchedJobs.length}/${DEMO_JOBS.length} jobs in the database!\n`);
        fetchedJobs.forEach((job, i) => {
            console.log(`  [${i + 1}] ID: ${job.id}`);
            console.log(`      Title: ${job.title}`);
            console.log(`      Coords: (${job.latitude?.toFixed(4)}, ${job.longitude?.toFixed(4)})`);
            console.log(`      Created: ${job.createdAt.toISOString()}`);
        });
    } else {
        console.error(`  ❌ MISMATCH: Expected ${DEMO_JOBS.length} jobs, found ${fetchedJobs.length}`);
        process.exit(1);
    }

    // Step 4: Cleanup (optional - remove demo jobs)
    console.log('\nStep 4: Cleanup (removing demo jobs)...');
    console.log('─'.repeat(50));
    const deleteResult = await prisma.job.deleteMany({
        where: {
            OR: DEMO_JOBS.map(j => ({ sourceUrl: j.sourceUrl }))
        }
    });
    console.log(`  🗑️  Deleted ${deleteResult.count} demo jobs.\n`);

    // Final Summary
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ DEMO PASSED                            ║');
    console.log('║  The ingest pipeline is functioning correctly.               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error('Demo failed with error:', error);
    await prisma.$disconnect();
    process.exit(1);
});
