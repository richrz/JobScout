import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const SAMPLE_JOBS = [
    { title: 'Senior Frontend Engineer', company: 'TechFlow Inc', location: 'San Francisco, CA' },
    { title: 'AI Product Manager', company: 'Neural Labs', location: 'Palo Alto, CA' },
    { title: 'Full Stack Developer', company: 'DataStream', location: 'Austin, TX' },
    { title: 'Machine Learning Engineer', company: 'DeepMind', location: 'Mountain View, CA' },
    { title: 'DevOps Engineer', company: 'CloudScale', location: 'Seattle, WA' },
    { title: 'UX Designer', company: 'DesignHub', location: 'New York, NY' },
    { title: 'Backend Engineer', company: 'APIForge', location: 'Denver, CO' },
    { title: 'Data Scientist', company: 'InsightAI', location: 'Boston, MA' },
    { title: 'Technical Lead', company: 'StartupX', location: 'Remote' },
    { title: 'Solutions Architect', company: 'Enterprise Corp', location: 'Chicago, IL' },
    { title: 'React Developer', company: 'WebFlow Labs', location: 'Portland, OR' },
    { title: 'Platform Engineer', company: 'ScaleUp', location: 'Miami, FL' },
    { title: 'Staff Engineer', company: 'BigTech', location: 'San Jose, CA' },
    { title: 'Engineering Manager', company: 'GrowthCo', location: 'Atlanta, GA' },
    { title: 'Principal Engineer', company: 'InnovateTech', location: 'Los Angeles, CA' },
];

async function main() {
    console.log('Seeding Pipeline with test applications...\n');

    // Find the richard@piedpiper.com user
    const user = await prisma.user.findUnique({
        where: { email: 'richard@piedpiper.com' },
    });

    if (!user) {
        console.error('❌ User richard@piedpiper.com not found!');
        process.exit(1);
    }

    console.log(`✅ User found: ${user.email} (${user.id})`);

    // Create jobs and applications
    let created = 0;
    for (const jobData of SAMPLE_JOBS) {
        const sourceUrl = `https://example.com/jobs/${jobData.company.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const job = await prisma.job.create({
            data: {
                title: jobData.title,
                company: jobData.company,
                location: jobData.location,
                description: `Exciting opportunity at ${jobData.company} for a ${jobData.title}. Join our team!`,
                postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
                source: 'LinkedIn',
                sourceUrl,
                cityMatch: jobData.location.split(',')[0],
                distanceMiles: Math.floor(Math.random() * 50),
                compositeScore: 60 + Math.floor(Math.random() * 40), // Score between 60-100
                applications: {
                    create: {
                        userId: user.id,
                        status: 'discovered',
                    },
                },
            },
        });

        created++;
        console.log(`Created: ${job.title} @ ${job.company}`);
    }

    console.log(`\nSuccessfully seeded ${created} applications in 'discovered' column`);
    console.log(`Login: demo@example.com / password123`);
    console.log(`Visit /pipeline on the dev server port printed by npm run dev`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
