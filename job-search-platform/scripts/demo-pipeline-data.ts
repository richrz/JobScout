
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- REPAIR SCRIPT ---');

    // The App sees this user ID from the session cookie, but they are missing in DB.
    // We must restore them to make the session valid and data visible.
    const ghostUserId = 'cmjeyp37q0000drno2dzkn6vu'; // From Logs
    const ghostEmail = 'visual-demo@test.local';

    let user = await prisma.user.findUnique({ where: { id: ghostUserId } });
    if (!user) {
        console.log(`Restoring Ghost User ${ghostUserId} (${ghostEmail})...`);
        const hashedPassword = await hash('password123', 10);
        user = await prisma.user.create({
            data: {
                id: ghostUserId,
                email: ghostEmail,
                name: 'Restored Visual Demo',
                password: hashedPassword
            }
        });
        console.log('User restored.');
    } else {
        console.log('User already exists (unexpected based on previous checks).');
    }

    const emails = ['rruiz@deskwise.io', ghostEmail];

    let jobs = await prisma.job.findMany({
        where: { source: 'demo' },
        take: 5
    });

    if (jobs.length === 0) {
        jobs = await prisma.job.findMany({ take: 5 });
    }

    for (const email of emails) {
        const u = await prisma.user.findUnique({ where: { email } });
        if (!u) continue;

        console.log(`Populating pipeline for ${email}...`);

        for (let i = 0; i < Math.min(jobs.length, 3); i++) {
            const job = jobs[i];
            const statuses = ['interested', 'applied', 'interview'];
            const v1Status = statuses[i % statuses.length];
            // V2 Enum Mapping
            let v2Status = 'INTERESTED';
            if (v1Status === 'applied') v2Status = 'APPLIED';
            if (v1Status === 'interview') v2Status = 'APPLIED';

            // V1 Application
            const existing = await prisma.application.findFirst({
                where: { userId: u.id, jobId: job.id }
            });

            if (!existing) {
                await prisma.application.create({
                    data: {
                        userId: u.id,
                        jobId: job.id,
                        status: v1Status
                    }
                });
                console.log(`[V1] Added ${job.title} to Interested/Etc`);
            } else {
                await prisma.application.update({
                    where: { id: existing.id },
                    data: { status: v1Status }
                });
                console.log(`[V1] Updated ${job.title}`);
            }

            // V2 Workspace
            try {
                await prisma.workspace.upsert({
                    where: { userId_jobId: { userId: u.id, jobId: job.id } },
                    update: { status: v2Status as any },
                    create: {
                        userId: u.id,
                        jobId: job.id,
                        status: v2Status as any
                    }
                });
                console.log(`[V2] Synced ${job.title}`);
            } catch (e) {
                console.error(e);
            }
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
