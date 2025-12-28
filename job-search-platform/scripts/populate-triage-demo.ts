#!/usr/bin/env npx tsx
import { prisma } from '../src/lib/prisma';

const TEST_USER_EMAIL = 'rruiz@deskwise.io'; // Using the user's email from information

async function main() {
    console.log('Populating triage jobs for demo...');

    let user = await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
    if (!user) {
        console.error('User not found. Please log in first.');
        process.exit(1);
    }

    const jobs = await Promise.all([
        prisma.job.create({
            data: {
                title: 'Senior Frontend Engineer',
                company: 'VibeTech',
                location: 'Austin, TX',
                description: 'Build amazing glassmorphic interfaces with Tailwind and Framer Motion.',
                source: 'demo',
                sourceUrl: `https://demo.example.com/triage-1-${Date.now()}`,
                postedAt: new Date()
            }
        }),
        prisma.job.create({
            data: {
                title: 'Staff Product Designer',
                company: 'Prism Designs',
                location: 'Remote',
                description: 'Design the future of AI-powered job searching.',
                source: 'demo',
                sourceUrl: `https://demo.example.com/triage-2-${Date.now()}`,
                postedAt: new Date()
            }
        })
    ]);

    console.log(`Created ${jobs.length} jobs for triage.`);
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
