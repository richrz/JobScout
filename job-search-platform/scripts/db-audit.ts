import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Audit ---');

    const userCount = await prisma.user.count();
    console.log(`Total Users: ${userCount}`);

    const jobCount = await prisma.job.count();
    console.log(`Total Jobs: ${jobCount}`);

    const jobsBySource = await prisma.job.groupBy({
        by: ['source'],
        _count: true
    });

    console.log('\nJobs by Source:');
    jobsBySource.forEach(group => {
        console.log(`- ${group.source}: ${group._count}`);
    });

    const workspaceCount = await prisma.workspace.count();
    console.log(`\nTotal Workspaces: ${workspaceCount}`);

    const applicationCount = await prisma.application.count();
    console.log(`Total Applications (Legacy): ${applicationCount}`);

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
