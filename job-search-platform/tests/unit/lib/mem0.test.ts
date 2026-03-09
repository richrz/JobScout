import { buildProfileMemoryMessages, buildResumeMemoryQuery, formatMem0Context } from '@/lib/mem0';

describe('mem0 helpers', () => {
  test('buildProfileMemoryMessages extracts durable profile facts', () => {
    const messages = buildProfileMemoryMessages({
      contactInfo: {
        name: 'Richard',
        location: 'Denver, CO',
        summary: 'AI product builder focused on job search tooling.',
      },
      skills: ['React', 'TypeScript', 'Prisma'],
      experiences: [
        {
          position: 'Founder',
          company: 'JobScout',
          description: 'Built AI-assisted job search workflows.',
          technologies: ['Next.js', 'Postgres'],
        },
      ],
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain('My name is Richard.');
    expect(messages[0].content).toContain('I am based in Denver, CO.');
    expect(messages[0].content).toContain('My core skills are React, TypeScript, Prisma.');
    expect(messages[0].content).toContain('I worked as Founder at JobScout');
  });

  test('buildResumeMemoryQuery scopes retrieval to job context', () => {
    const query = buildResumeMemoryQuery({
      title: 'Solutions Architect',
      company: 'Acme',
      description: 'Lead customer-facing solution design for AI systems.',
    });

    expect(query).toContain('Solutions Architect');
    expect(query).toContain('Acme');
    expect(query).toContain('Lead customer-facing solution design');
  });

  test('formatMem0Context returns concise bullet context', () => {
    const context = formatMem0Context([
      { id: '1', memory: 'The user prefers direct, confident writing.' },
      { id: '2', memory: 'The user has led AI platform projects.' },
    ]);

    expect(context).toContain('Use these retrieved long-term candidate memories');
    expect(context).toContain('- The user prefers direct, confident writing.');
    expect(context).toContain('- The user has led AI platform projects.');
  });
});
