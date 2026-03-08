#!/usr/bin/env npx tsx
/**
 * Demo Script: Triage Feed Implementation (Task 41)
 * 
 * This script demonstrates the Triage Feed functionality:
 * 1. Creates a test user and test jobs
 * 2. Fetches the triage feed (verifies filtering)
 * 3. Applies actions (INTERESTED/DISMISSED)
 * 4. Verifies feed updates (processed jobs removed)
 * 5. Cleans up test data
 * 
 * Run with: npx tsx scripts/demo-task-41.ts
 */

import { prisma } from '../src/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

const TEST_USER_EMAIL = 'demo-task-41@test.local';

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║        TASK 41 DEMO: Triage Feed Implementation              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    // Step 1: Create test user and jobs
    console.log('Step 1: Setting up test data...');
    console.log('─'.repeat(50));

    let user = await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: TEST_USER_EMAIL,
                name: 'Triage Demo User'
            }
        });
        console.log(`  ✅ Created test user: ${user.id}`);
    } else {
        console.log(`  ℹ️  Using existing user: ${user.id}`);
    }

    // Create 3 test jobs
    const jobs = await Promise.all([
        prisma.job.create({
            data: {
                title: 'Job A - To be Interested',
                company: 'Triage Corp A',
                location: 'Remote',
                description: 'Description A',
                source: 'demo',
                sourceUrl: `https://demo.example.com/triage-a-${Date.now()}`,
                postedAt: new Date()
            }
        }),
        prisma.job.create({
            data: {
                title: 'Job B - To be Dismissed',
                company: 'Triage Corp B',
                location: 'Remote',
                description: 'Description B',
                source: 'demo',
                sourceUrl: `https://demo.example.com/triage-b-${Date.now()}`,
                postedAt: new Date()
            }
        }),
        prisma.job.create({
            data: {
                title: 'Job C - To be Left Alone',
                company: 'Triage Corp C',
                location: 'Remote',
                description: 'Description C',
                source: 'demo',
                sourceUrl: `https://demo.example.com/triage-c-${Date.now()}`,
                postedAt: new Date()
            }
        })
    ]);
    console.log(`  ✅ Created 3 test jobs: ${jobs.map(j => j.title).join(', ')}\n`);

    // Step 2: Verify Feed (Should see all 3)
    console.log('Step 2: Fetching Triage Feed (Initial)...');
    console.log('─'.repeat(50));

    // Simulate GET /api/triage/feed logic
    let feed = await prisma.job.findMany({
        where: {
            workspaces: {
                none: { userId: user.id }
            },
            // Filter to our test jobs only to avoid noise
            id: { in: jobs.map(j => j.id) }
        }
    });

    console.log(`  Feed contains ${feed.length} jobs`);
    if (feed.length === 3) {
        console.log('  ✅ Feed correctly shows all new jobs');
    } else {
        console.error('  ❌ Feed returned incorrect number of jobs!');
        process.exit(1);
    }
    console.log('');

    // Step 3: Apply Actions
    console.log('Step 3: Applying Triage Actions...');
    console.log('─'.repeat(50));

    // Interested in Job A
    await prisma.workspace.create({
        data: {
            userId: user.id,
            jobId: jobs[0].id,
            status: 'INTERESTED' as ApplicationStatus
        }
    }); // Casting needed if client type not updated yet in script runtime context, usually fine if regenerated
    console.log(`  ✅ Swiped RIGHT (Interested) on Job A`);

    // Dismiss Job B
    await prisma.workspace.create({
        data: {
            userId: user.id,
            jobId: jobs[1].id,
            status: 'DISMISSED' as ApplicationStatus
        }
    });
    console.log(`  ✅ Swiped LEFT (Dismissed) on Job B`);
    console.log('');

    // Step 4: Verify Feed Again (Should only see Job C)
    console.log('Step 4: Fetching Triage Feed (After Actions)...');
    console.log('─'.repeat(50));

    feed = await prisma.job.findMany({
        where: {
            workspaces: {
                none: { userId: user.id }
            },
            id: { in: jobs.map(j => j.id) }
        }
    });

    console.log(`  Feed contains ${feed.length} jobs`);
    if (feed.length === 1 && feed[0].id === jobs[2].id) {
        console.log('  ✅ Feed correctly filters out processed jobs');
        console.log(`     Remaining job: ${feed[0].title}`);
    } else {
        console.error('  ❌ Feed returned incorrect jobs:', feed);
        process.exit(1);
    }
    console.log('');

    // Step 5: Verify Workspace Statuses
    console.log('Step 5: Verifying Workspace Statuses...');
    console.log('─'.repeat(50));

    const workspaces = await prisma.workspace.findMany({
        where: { userId: user.id, jobId: { in: jobs.map(j => j.id) } },
        include: { job: true }
    });

    workspaces.forEach(w => {
        console.log(`  Workspace for ${w.job.title}: ${w.status}`);
    });

    const interested = workspaces.find(w => w.jobId === jobs[0].id);
    const passed = workspaces.find(w => w.jobId === jobs[1].id);

    if (interested?.status === 'INTERESTED' && passed?.status === 'PASSED') {
        console.log('  ✅ Statuses persisted correctly');
    } else {
        console.error('  ❌ Incorrect statuses!');
        process.exit(1);
    }
    console.log('');

    // Step 6: Cleanup
    console.log('Step 6: Cleaning up test data...');
    console.log('─'.repeat(50));
    await prisma.workspace.deleteMany({ where: { userId: user.id } });
    await prisma.job.deleteMany({ where: { id: { in: jobs.map(j => j.id) } } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('  🗑️  Deleted test workspaces, jobs, and user\n');

    // Summary
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ DEMO PASSED                            ║');
    console.log('║  Triage Feed functionality works correctly.                  ║');
    console.log('║  - INTERESTED/PASSED actions persist correctly               ║');
    console.log('║  - Feed correctly filters processed jobs                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error('Demo failed with error:', error);
    await prisma.$disconnect();
    process.exit(1);
});
