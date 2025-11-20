import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password,
      config: {
        create: {
          searchParams: {
            cities: [{ name: 'San Francisco', radius_miles: 25, weight: 100 }],
            categories: ['Software Engineer'],
            include_keywords: ['React', 'Node.js'],
            exclude_keywords: ['Java', 'C++'],
            salary_usd: { min: 120000 },
            posted_within_hours: 24
          },
          llmConfig: {
            provider: 'openai',
            model: 'gpt-5',
            temperature: 0.7
          },
          dailyCaps: {
            applications: 10
          }
        }
      }
    }
  });

  console.log({ user });

  const job = await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      description: 'We are looking for a Senior Frontend Engineer with React experience.',
      postedAt: new Date(),
      source: 'LinkedIn',
      sourceUrl: 'https://linkedin.com/jobs/123',
      cityMatch: 'San Francisco',
      distanceMiles: 5,
      compositeScore: 85,
      applications: {
        create: {
          userId: user.id,
          status: 'discovered'
        }
      }
    }
  });

  console.log({ job });
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
