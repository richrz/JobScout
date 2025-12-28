import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Cleaning Up Mock/Demo Data ---');

    // 1. Delete all jobs with 'demo' or 'test' sources
    const jobs = await prisma.job.deleteMany({
        where: {
            OR: [
                { source: 'demo' },
                { source: { contains: 'test', mode: 'insensitive' } }
            ]
        }
    });
    console.log(`✅ Deleted ${jobs.count} mock/demo jobs.`);

    // 2. Delete test users (excluding real users)
    const users = await prisma.user.deleteMany({
        where: {
            OR: [
                { email: { endsWith: '@test.local' } },
                { email: 'demo@example.com' }
            ]
        }
    });
    console.log(`✅ Deleted ${users.count} test users.`);

    // 3. Clean up orphaned workspaces (though Prisma cascade usually handles this)
    // No specific orphan check needed if referential integrity is set to Cascade.

    console.log('\n--- Database Purged ---');
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
