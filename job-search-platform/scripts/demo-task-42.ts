#!/usr/bin/env npx tsx
/**
 * Demo Script: Lifecycle Automation Service (Task 42)
 * 
 * This script demonstrates the lifecycle automation flow:
 * 1. Creates test workspaces with varying ages
 * 2. Runs the lifecycle automation
 * 3. Verifies status transitions occurred correctly
 * 4. Cleans up test data
 * 
 * Run with: npx tsx scripts/demo-task-42.ts
 */

import { prisma } from '../src/lib/prisma';
import { runLifecycleAutomation, getLifecycleStats } from '../src/lib/workspace/lifecycle-service';

const TEST_USER_EMAIL = 'demo-task-42@test.local';

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║       TASK 42 DEMO: Lifecycle Automation Service             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`🕐 Timestamp: ${new Date().toISOString()}\n`);

    // Step 1: Create test user
    console.log('Step 1: Setting up test user and jobs...');
    console.log('─'.repeat(50));

    let user = await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: TEST_USER_EMAIL,
                name: 'Lifecycle Demo User'
            }
        });
        console.log(`  ✅ Created test user: ${user.id}`);
    } else {
        console.log(`  ℹ️  Using existing user: ${user.id}`);
    }

    // Create test jobs
    const jobs = await Promise.all([
        prisma.job.create({
            data: {
                title: 'Fresh Application (Today)',
                company: 'Fresh Co',
                location: 'Remote',
                description: 'Test job',
                source: 'indeed',
                sourceUrl: `https://demo.example.com/lifecycle-test-fresh-${Date.now()}`,
                postedAt: new Date()
            }
        }),
        prisma.job.create({
            data: {
                title: 'Old Application (8 days)',
                company: 'Old Co',
                location: 'Remote',
                description: 'Test job',
                source: 'indeed',
                sourceUrl: `https://demo.example.com/lifecycle-test-old-${Date.now()}`,
                postedAt: new Date()
            }
        }),
        prisma.job.create({
            data: {
                title: 'Very Old Application (35 days)',
                company: 'Very Old Co',
                location: 'Remote',
                description: 'Test job',
                source: 'indeed',
                sourceUrl: `https://demo.example.com/lifecycle-test-very-old-${Date.now()}`,
                postedAt: new Date()
            }
        }),
        prisma.job.create({
            data: {
                title: 'Ancient Application (65 days)',
                company: 'Ancient Co',
                location: 'Remote',
                description: 'Test job',
                source: 'indeed',
                sourceUrl: `https://demo.example.com/lifecycle-test-ancient-${Date.now()}`,
                postedAt: new Date()
            }
        })
    ]);
    console.log(`  ✅ Created ${jobs.length} test jobs\n`);

    // Step 2: Create workspaces with different ages
    console.log('Step 2: Creating workspaces with varying ages...');
    console.log('─'.repeat(50));

    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const workspaces = await Promise.all([
        // Fresh (today) - should stay APPLIED
        prisma.workspace.create({
            data: {
                userId: user.id,
                jobId: jobs[0].id,
                status: 'APPLIED',
                updatedAt: now
            }
        }),
        // 8 days old - should transition APPLIED → FOLLOW_UP
        prisma.workspace.create({
            data: {
                userId: user.id,
                jobId: jobs[1].id,
                status: 'APPLIED',
                updatedAt: daysAgo(8)
            }
        }),
        // 35 days old - set as FOLLOW_UP, should transition → DORMANT
        prisma.workspace.create({
            data: {
                userId: user.id,
                jobId: jobs[2].id,
                status: 'FOLLOW_UP',
                updatedAt: daysAgo(35)
            }
        }),
        // 65 days old - set as DORMANT, should transition → ARCHIVED
        prisma.workspace.create({
            data: {
                userId: user.id,
                jobId: jobs[3].id,
                status: 'DORMANT',
                updatedAt: daysAgo(65)
            }
        })
    ]);

    console.log('  Created workspaces:');
    console.log('    [1] Fresh (today) - status: APPLIED');
    console.log('    [2] 8 days old - status: APPLIED (should → FOLLOW_UP)');
    console.log('    [3] 35 days old - status: FOLLOW_UP (should → DORMANT)');
    console.log('    [4] 65 days old - status: DORMANT (should → ARCHIVED)\n');

    // Step 3: Get stats before
    console.log('Step 3: Pre-automation stats...');
    console.log('─'.repeat(50));
    const statsBefore = await getLifecycleStats();
    console.log('  Pending transitions:', statsBefore.pendingTransitions);
    console.log('');

    // Step 4: Run lifecycle automation
    console.log('Step 4: Running lifecycle automation...');
    console.log('─'.repeat(50));
    const result = await runLifecycleAutomation();
    console.log('  Result:', result.transitioned);
    console.log('');

    // Step 5: Verify transitions
    console.log('Step 5: Verifying status transitions...');
    console.log('─'.repeat(50));

    const updatedWorkspaces = await prisma.workspace.findMany({
        where: { id: { in: workspaces.map(w => w.id) } },
        select: { id: true, status: true, job: { select: { title: true } } },
        orderBy: { createdAt: 'asc' }
    });

    let allCorrect = true;
    const expected = ['APPLIED', 'FOLLOW_UP', 'DORMANT', 'ARCHIVED'];

    updatedWorkspaces.forEach((w, i) => {
        const correct = w.status === expected[i];
        const symbol = correct ? '✅' : '❌';
        console.log(`  ${symbol} ${w.job.title}: ${w.status} (expected: ${expected[i]})`);
        if (!correct) allCorrect = false;
    });
    console.log('');

    if (!allCorrect) {
        console.error('  ❌ FAIL: Some transitions did not occur correctly!');
        process.exit(1);
    }

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
    console.log('║  Lifecycle automation service works correctly.               ║');
    console.log('║  - APPLIED → FOLLOW_UP (>7 days)                             ║');
    console.log('║  - FOLLOW_UP → DORMANT (>30 days)                            ║');
    console.log('║  - DORMANT → ARCHIVED (>60 days)                             ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error('Demo failed with error:', error);
    await prisma.$disconnect();
    process.exit(1);
});
