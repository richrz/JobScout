// Mock LLM dependencies to avoid import errors in tests
jest.mock('@/lib/llm', () => ({
    getLLMClient: jest.fn(() => ({
        generateResponse: jest.fn(async () => ({
            content: '## John Doe\n\nSenior Developer with React expertise\n\n### Experience\n- Tech Corp (2020-Present)\n  - Built amazing things with React and TypeScript',
            usage: {
                promptTokens: 100,
                completionTokens: 50,
                totalTokens: 150,
            },
        })),
    })),
    ResumeGenerator: jest.fn().mockImplementation(() => ({
        generateTailoredResume: jest.fn(async () => ({
            content: '## John Doe\n\nSenior Developer with React expertise',
            usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
        })),
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

import { generateTailoredResume } from '@/lib/resume-generator';

describe('generateTailoredResume', () => {
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
            }],
            skills: ['React', 'TypeScript', 'Node.js'],
            projects: [],
            certifications: [],
        };

        const jobDescription = 'We are looking for a Senior React Developer with TypeScript experience';

        const result = await generateTailoredResume({
            jobDescription,
            profile: mockProfile,
            exaggerationLevel: 'balanced',
        });

        expect(result).toBeDefined();
        expect(result.content).toContain('John Doe');
        expect(result.content).toContain('React');
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

        // Test conservative
        const conservative = await generateTailoredResume({
            jobDescription,
            profile: mockProfile,
            exaggerationLevel: 'conservative',
        });

        expect(conservative.content).toBeDefined();
    });
});
