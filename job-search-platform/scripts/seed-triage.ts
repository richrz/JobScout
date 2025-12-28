#!/usr/bin/env npx tsx
/**
 * Seed Script: Triage Visual Demo
 * 
 * Creates data for visual verification:
 * 1. User: visual-demo@test.local / password123
 * 2. 5 Triage Jobs
 * 
 * Run with: npx tsx scripts/seed-triage.ts
 */

import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

const DEMO_USER = process.argv[2] || 'rruiz@deskwise.io';

async function main() {
    console.log(`🌱 Seeding Triage Data for: ${DEMO_USER}`);

    // 1. Create User
    const hashedPassword = await hash('password123', 10);
    const user = await prisma.user.upsert({
        where: { email: DEMO_USER },
        update: {},
        create: {
            email: DEMO_USER,
            name: 'Visual Demo User',
            password: hashedPassword
        }
    });

    console.log(`✅ User updated/created: ${user.email}`);

    // 2. Clear existing workspaces for this user to reset the demo
    await prisma.workspace.deleteMany({
        where: { userId: user.id }
    });
    console.log('🧹 Cleared existing workspaces for fresh start');

    // 3. Create Jobs
    const jobsData = [
        {
            title: 'Frontend Developer - React',
            company: 'TechFlow',
            location: 'San Francisco, CA (Remote)',
            description: 'We are looking for a React expert to build beautiful UIs.',
            salary: '$140k - $180k',
        },
        {
            title: 'Backend Engineer - Node.js',
            company: 'ServerLess Co',
            location: 'New York, NY',
            description: 'Scale our high-throughput APIs using Node.js and PostgreSQL.',
            salary: '$150k - $190k',
        },
        {
            title: 'Product Designer',
            company: 'Creative Studio',
            location: 'Remote',
            description: 'Design the future of job search.',
            salary: '$120k - $160k',
        },
        {
            title: 'DevOps Specialist',
            company: 'CloudScale',
            location: 'Austin, TX',
            description: 'Manage our Kubernetes clusters and CI/CD pipelines.',
            salary: '$130k - $170k',
        },
        {
            title: 'Engineering Manager',
            company: 'Growth Startup',
            location: 'Seattle, WA',
            description: 'Lead a team of 5-8 engineers.',
            salary: '$180k - $240k',
        }
    ];

    for (const job of jobsData) {
        await prisma.job.upsert({
            where: { sourceUrl: `https://demo.local/job/${job.title.replace(/\s+/g, '-').toLowerCase()}` },
            update: {},
            create: {
                ...job,
                source: 'demo',
                sourceUrl: `https://demo.local/job/${job.title.replace(/\s+/g, '-').toLowerCase()}`,
                postedAt: new Date()
            }
        });
    }

    console.log(`✅ Seeded ${jobsData.length} jobs`);
    console.log('\nReady for visual verification!');
    console.log(`User: ${DEMO_USER}`);
    console.log('Pass: password123');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
