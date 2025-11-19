import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Integration Tests (Task 12)', () => {
  beforeAll(async () => {
    // Cleanup database before tests
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.config.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create a user with profile and config', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        profile: {
          create: {
            contactInfo: { phone: '123-456-7890' },
            workHistory: [],
            education: [],
            skills: ['React', 'Node.js'],
            projects: [],
            certifications: [],
            preferences: {}
          }
        },
        config: {
          create: {
            searchParams: { cities: [] },
            llmConfig: { provider: 'openai' },
            dailyCaps: { applications: 5 }
          }
        }
      },
      include: {
        profile: true,
        config: true
      }
    });

    expect(user.email).toBe('test@example.com');
    expect(user.profile).toBeDefined();
    expect(user.config).toBeDefined();
    expect(user.profile?.skills).toContain('React');
  });

  test('should create a job and application linked to user', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    expect(user).toBeDefined();

    const job = await prisma.job.create({
      data: {
        title: 'Software Engineer',
        company: 'Test Corp',
        location: 'Remote',
        description: 'Test description',
        postedAt: new Date(),
        source: 'Test',
        sourceUrl: 'https://example.com'
      }
    });

    const application = await prisma.application.create({
      data: {
        userId: user!.id,
        jobId: job.id,
        status: 'applied'
      }
    });

    expect(application.status).toBe('applied');
    expect(application.userId).toBe(user!.id);
    expect(application.jobId).toBe(job.id);
  });

  test('should support cascade delete (deleting user removes profile)', async () => {
    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    expect(user).toBeDefined();

    await prisma.user.delete({ where: { id: user!.id } });

    const profile = await prisma.profile.findUnique({ where: { userId: user!.id } });
    expect(profile).toBeNull();

    const config = await prisma.config.findUnique({ where: { userId: user!.id } });
    expect(config).toBeNull();
  });
});
