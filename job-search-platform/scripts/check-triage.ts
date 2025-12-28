import { prisma } from '../src/lib/prisma';

async function check() {
    const user = await prisma.user.findUnique({
        where: { email: 'rruiz@deskwise.io' }
    });

    if (!user) {
        console.log('❌ User not found: rruiz@deskwise.io');
        process.exit(1);
    }

    console.log('✅ User found:', user.id);

    const totalJobs = await prisma.job.count();
    console.log('📊 Total jobs in DB:', totalJobs);

    const untriaged = await prisma.job.findMany({
        where: {
            workspaces: { none: { userId: user.id } }
        },
        take: 10,
        select: { id: true, title: true, company: true }
    });

    console.log(`\n🎯 Jobs available for triage: ${untriaged.length}`);
    if (untriaged.length === 0) {
        console.log('❌ No jobs available! Need to seed data.');
    } else {
        untriaged.forEach((j, i) => console.log(`  ${i + 1}. ${j.title} at ${j.company}`));
    }

    await prisma.$disconnect();
}

check().catch(e => {
    console.error(e);
    process.exit(1);
});
