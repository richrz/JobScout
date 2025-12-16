
import { prisma } from '../src/lib/prisma';
import { generateAndPreviewResume } from '../src/lib/resume-generator';

async function main() {
    console.log('Testing Resume Generation...');

    const job = await prisma.job.findFirst();
    if (!job) {
        console.error('No job found');
        return;
    }
    console.log('Found job:', job.title);

    const profile = await prisma.profile.findFirst({
        include: { experiences: true }
    });
    if (!profile) {
        console.error('No profile found');
        return;
    }
    console.log('Found profile for user:', profile.userId);
    console.log('Profile experiences:', profile.experiences.length);

    try {
        const result = await generateAndPreviewResume(job.id, 'strategic');
        console.log('Generation Result:', result.success ? 'Success' : 'Failed');
        if (result.success) {
            console.log('Content keys:', Object.keys(result.content));
            console.log('Sample Summary:', result.content.summary?.substring(0, 100));
            console.log('Sample Experience:', result.content.experience?.[0]?.role);
        } else {
            console.error('Error:', result.error);
        }
    } catch (e) {
        console.error('Exception during generation:', e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
