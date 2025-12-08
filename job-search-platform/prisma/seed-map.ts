
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding map jobs...')

    const jobs = [
        {
            title: 'Senior React Developer',
            company: 'Austin Tech Dynamics',
            location: 'Austin, TX',
            latitude: 30.2672,
            longitude: -97.7431,
            description: 'Building next-gen UI in the heart of Texas.',
            salary: '$130k - $160k',
            postedAt: new Date(),
            source: 'manual_seed',
            sourceUrl: 'https://example.com/austin-job',
            compositeScore: 0.88,
        },
        {
            title: 'Cloud Infrastructure Engineer',
            company: 'Rainier Cloud Corp',
            location: 'Seattle, WA',
            latitude: 47.6062,
            longitude: -122.3321,
            description: 'Scalable infrastructure for enterprise clients.',
            salary: '$150k - $190k',
            postedAt: new Date(),
            source: 'manual_seed',
            sourceUrl: 'https://example.com/seattle-job',
            compositeScore: 0.75,
        }
    ]

    for (const job of jobs) {
        const created = await prisma.job.create({
            data: job
        })
        console.log(`Created job: ${created.title} (${created.id})`)
    }

    console.log('Seeding complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
