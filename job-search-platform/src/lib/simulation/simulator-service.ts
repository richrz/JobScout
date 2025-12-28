import { prisma } from '../prisma';
import templates from './templates.json';

export type JobCategory = 'ELITE' | 'MEDIOCRE' | 'GARBAGE' | 'NOISE';

export interface JobTemplate {
    category: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary: string;
    source: string;
}

export async function injectSimulatedJobs(count: number = 10, junkRatio: number = 0.5) {
    console.log(`[Chronos] Injecting ${count} jobs (Junk Ratio: ${junkRatio})...`);

    const injected = [];

    for (let i = 0; i < count; i++) {
        // Decide category based on junkRatio
        const isJunk = Math.random() < junkRatio;
        const availableTemplates = templates.filter(t =>
            isJunk ? t.category !== 'ELITE' : t.category === 'ELITE'
        );

        const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

        // Add random variations to avoid unique constraint on sourceUrl
        const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 10000);
        const sourceUrl = `https://sim.example.com/${template.title.toLowerCase().replace(/ /g, '-')}-${uniqueSuffix}`;

        try {
            const job = await prisma.job.create({
                data: {
                    title: template.title,
                    company: template.company,
                    location: template.location,
                    description: template.description,
                    salary: template.salary,
                    source: template.source,
                    sourceUrl: sourceUrl,
                    postedAt: new Date(),
                }
            });
            injected.push(job);
        } catch (error) {
            console.error(`[Chronos] Failed to inject job:`, error);
        }
    }

    console.log(`[Chronos] Successfully injected ${injected.length} jobs.`);
    return injected;
}
