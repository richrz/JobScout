const mockResumeGeneratorGenerateTailoredResume = jest.fn(async () => ({
    content: JSON.stringify({
        contactInfo: { name: 'John Doe', email: 'john@example.com' },
        summary: 'Senior Developer with React expertise',
        experience: [],
        education: [],
        skills: ['React', 'TypeScript']
    }),
    usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
}));

// Mock LLM dependencies to avoid import errors in tests
jest.mock('@/lib/llm', () => ({
    getLLMClient: jest.fn(() => ({
        generateResponse: jest.fn(async () => ({
            content: JSON.stringify({
                contactInfo: { name: 'John Doe', email: 'john@example.com' },
                summary: 'Senior Developer with React expertise',
                experience: [{ title: 'Senior Developer', company: 'Tech Corp' }],
                education: [],
                skills: ['React', 'TypeScript']
            }),
            usage: {
                promptTokens: 100,
                completionTokens: 50,
                totalTokens: 150,
            },
        })),
    })),
    ResumeGenerator: jest.fn().mockImplementation(() => ({
        generateTailoredResume: mockResumeGeneratorGenerateTailoredResume,
    })),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        job: {
            findUnique: jest.fn(),
        },
        profile: {
            findFirst: jest.fn(),
        },
    },
}));

jest.mock('@/lib/env', () => ({
    isMockMode: jest.fn(() => false)
}));

import { generateTailoredResume } from '@/lib/resume-generator';

describe('generateTailoredResume', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv, ZAI_API_KEY: 'zai-dummy-key' };
        mockResumeGeneratorGenerateTailoredResume.mockReset();
        mockResumeGeneratorGenerateTailoredResume.mockResolvedValue({
            content: JSON.stringify({
                contactInfo: { name: 'John Doe', email: 'john@example.com' },
                summary: 'Senior Developer with React expertise',
                experience: [],
                education: [],
                skills: ['React', 'TypeScript']
            }),
            usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('generates resume content from job description', async () => {
        const mockProfile = {
            contactInfo: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '123-456-7890',
                location: 'New York, NY',
            },
            workHistory: [
                {
                    id: '1',
                    company: 'Tech Corp',
                    role: 'Senior Developer',
                    startDate: '2020-01',
                    endDate: 'Present',
                    description: 'Built amazing things',
                    technologies: ['React', 'TypeScript'],
                },
            ],
            education: [{
                id: '1',
                institution: 'University',
                degree: 'BS',
                field: 'Computer Science',
                startDate: '2016',
                endDate: '2020',
                grade: '4.0',
            }],
            skills: ['React', 'TypeScript', 'Node.js'],
            projects: [],
            certifications: [],
        };

        const jobDescription = 'We are looking for a Senior React Developer with TypeScript experience';

        const result = await generateTailoredResume({
            jobDescription,
            profile: mockProfile,
            exaggerationLevel: 'professional',
        });

        expect(result).toBeDefined();
        // Since we are mocking the ResumeGenerator class that returns the specific object above:
        // Note: The mocked implementation above is what gets returned by the mocked class instance.
        // However, generateTailoredResume parses it.

        // Wait, generateTailoredResume in real code parses the string.
        // In the test setup, we are mocking the *LLM Client* (getLLMClient) usually, 
        // BUT here we seem to be mocking ResumeGenerator class itself too.
        // If we mock ResumeGenerator, we are bypassing the parsing logic in generateTailoredResume IF generateTailoredResume calls ResumeGenerator.prototype.generateTailoredResume.

        // Let's check the imported function implementation.
        // 'generateTailoredResume' is a standalone function exported from 'src/lib/resume-generator.ts'.
        // It instantiates ResumeGenerator class.

        // If we mock ResumeGenerator class, the instance method returns the Mocked object.
        // The real 'generateTailoredResume' function calls this mocked method.
        // The real function expects { content, usage } from the class method (LLMResponse).
        // Then it parses 'content'.

        // So my mock above: 
        // generateTailoredResume: jest.fn(async () => ({ content: JSON.stringify(...) ... }))
        // matches what the class method should return (stringified JSON).

        // The real function will then parse this string.

        expect(result.content).toHaveProperty('contactInfo');
        expect((result.content as any).contactInfo.name).toBe('John Doe');
        expect((result.content as any).skills).toContain('React');
    });

    it('handles different exaggeration levels', async () => {
        const mockProfile = {
            contactInfo: { name: 'Jane Doe', email: 'jane@example.com' },
            workHistory: [],
            education: [],
            skills: ['Python'],
            projects: [],
            certifications: [],
        };

        const jobDescription = 'Python developer needed';

        // Test authentic (formerly conservative)
        const authentic = await generateTailoredResume({
            jobDescription,
            profile: mockProfile,
            exaggerationLevel: 'authentic',
        });

        expect(authentic.content).toBeDefined();
        expect((authentic.content as any).contactInfo.name).toBe('John Doe'); // Based on mock response
    });

    it('repairs malformed JSON into a structured resume draft instead of dumping raw content into summary', async () => {
        const mockProfile = {
            contactInfo: {
                name: 'Richard Ruiz',
                email: 'rruiz@deskwise.io',
                phone: '(949) 743-4975',
                location: 'Colorado Springs, CO',
            },
            workHistory: [],
            education: [],
            skills: ['AWS', 'AI'],
            projects: [],
            certifications: [],
        };

        mockResumeGeneratorGenerateTailoredResume.mockResolvedValue({
            content: `{
  "contactInfo": {
    "name": "Richard Ruiz",
    "email": "rruiz@deskwise.io",
    "phone": "(949) 743-4975",
    "location": "Colorado Springs, CO"
  },
  "summary": "Enterprise solutions consultant with cloud and AI experience.",
  "experience": [
    {
      "id": "exp1",
      "title": "Solutions Engineer",
      "company": "Adroit Worldwide Media (AWM Inc.)",
      "location": "Remote",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "description": "Led technical pre-sales and proof-of-concept work."
    }
  ],
  "education": [],
  "skills": ["AWS", "AI", "Solution Selling"]`,
            usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        });

        const result = await generateTailoredResume({
            jobDescription: 'Enterprise AI solutions role',
            profile: mockProfile,
            exaggerationLevel: 'professional',
        });

        expect((result.content as any).contactInfo.name).toBe('Richard Ruiz');
        expect((result.content as any).summary).toContain('Enterprise solutions consultant');
        expect((result.content as any).summary).not.toContain('"contactInfo"');
        expect((result.content as any).experience).toHaveLength(1);
        expect((result.content as any).experience[0].title).toBe('Solutions Engineer');
        expect((result.content as any).skills).toContain('Solution Selling');
    });
});
