import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Create user
    const user = await prisma.user.upsert({
        where: { email: 'richard@example.com' },
        update: {},
        create: { email: 'richard@example.com', name: 'Richard' }
    });
    console.log('User created/found:', user.id);

    // Create applications for all jobs
    const jobs = await prisma.job.findMany();
    console.log('Jobs found:', jobs.length);

    for (const job of jobs) {
        const existing = await prisma.application.findFirst({
            where: { userId: user.id, jobId: job.id }
        });
        if (!existing) {
            await prisma.application.create({
                data: { userId: user.id, jobId: job.id, status: 'discovered', statusHistory: [] }
            });
            console.log('Created application for:', job.company, '-', job.title);
        } else {
            console.log('Application exists for:', job.company, '-', job.title);
        }
    }

    const appCount = await prisma.application.count();
    console.log('Total applications:', appCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
