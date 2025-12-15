import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles = [
    'AI Developer',
    'AI Product Sales',
    'Tech Sales',
    'Sales Engineering',
    'Machine Learning Engineer',
    'Solutions Architect',
    'AI Consultant',
    'SaaS Sales Account Executive',
    'AI Research Scientist',
    'Enterprise Account Director'
];

const companies = [
    'NeuralNet Corp', 'FutureAI Systems', 'CloudScale Inc', 'DataMinds', 'SalesForce AI',
    'TechGiant', 'InnovateX', 'DeepLearning Co', 'VisionaryTech', 'NextGen Solutions'
];

const locations = [
    { city: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    { city: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    { city: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
    { city: 'Remote', lat: null, lng: null },
    { city: 'Seattle, WA', lat: 47.6062, lng: -122.3321 }
];

const descriptions = [
    'We are looking for a passionate individual to join our team correctly applying AI to solve real world problems.',
    'Join our elite sales team driving adoption of cutting-edge AI products in the enterprise market.',
    'Bridge the gap between technical capability and business value as a key member of our engineering team.',
    'Lead the technical sale and design of complex AI solutions for Fortune 500 clients.',
    'Develop next-generation models and infrastructure to support our growing product suite.'
];

const sources = ['LinkedIn', 'Indeed', 'Company Site', 'Glassdoor'];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    console.log('Seeding 50 jobs...');

    // Clear existing jobs to avoid unique constraint collisions on re-runs of seed
    // but in production/dev we might want to keep them. For seeding test data, clearing is usually safer.
    // However, let's just attempt to create new unique URLs.

    // Add jitter to spread markers apart (±0.05 degrees = ~3 miles)
    const addJitter = (coord: number | null): number | null => {
        if (coord === null) return null;
        return coord + (Math.random() - 0.5) * 0.1;
    };

    const jobsData = Array.from({ length: 50 }).map((_, i) => {
        const role = getRandomElement(roles);
        const company = getRandomElement(companies);
        const loc = getRandomElement(locations);

        return {
            title: role,
            company: company,
            location: loc.city,
            latitude: addJitter(loc.lat),
            longitude: addJitter(loc.lng),
            description: getRandomElement(descriptions),
            salary: Math.random() > 0.3 ? `$${100 + Math.floor(Math.random() * 100)}k - $${200 + Math.floor(Math.random() * 100)}k` : null,
            postedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Last 7 days
            source: getRandomElement(sources),
            sourceUrl: `https://example.com/job/${i + 1000}-${Math.random().toString(36).substring(7)}`,
            compositeScore: Math.random(), // 0 to 1
        };
    });

    await prisma.job.createMany({
        data: jobsData,
        skipDuplicates: true,
    });

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
