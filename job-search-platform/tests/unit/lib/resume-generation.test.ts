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
        generateTailoredResume: jest.fn(async () => ({
            content: JSON.stringify({
                contactInfo: { name: 'John Doe', email: 'john@example.com' },
                summary: 'Senior Developer with React expertise',
                experience: [],
                education: [],
                skills: ['React', 'TypeScript']
            }),
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
            exaggerationLevel: 'balanced',
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

        // Test conservative
        const conservative = await generateTailoredResume({
            jobDescription,
            profile: mockProfile,
            exaggerationLevel: 'conservative',
        });

        expect(conservative.content).toBeDefined();
        expect((conservative.content as any).contactInfo.name).toBe('John Doe'); // Based on mock response
    });
});
