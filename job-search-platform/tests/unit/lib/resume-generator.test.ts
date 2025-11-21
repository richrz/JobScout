import { ResumeGenerator, LLMClient } from '@/lib/llm';
import { LLMResponse, ResumeGenerationRequest } from '@/types/llm';

// Mock LLM Client
const mockGenerateResponse = jest.fn();
const mockGenerateStreamResponse = jest.fn();

const mockLLMClient: LLMClient = {
    generateResponse: mockGenerateResponse,
    generateStreamResponse: mockGenerateStreamResponse,
    testConnection: jest.fn(),
    getProvider: jest.fn().mockReturnValue('openai'),
    getModel: jest.fn().mockReturnValue('gpt-4'),
};

describe('ResumeGenerator', () => {
    let resumeGenerator: ResumeGenerator;

    beforeEach(() => {
        jest.clearAllMocks();
        resumeGenerator = new ResumeGenerator(mockLLMClient);
    });

    const mockRequest: ResumeGenerationRequest = {
        jobDescription: 'Software Engineer role requiring React and Node.js',
        userProfile: {
            contactInfo: { email: 'test@test.com' },
            workHistory: [
                {
                    id: '1',
                    company: 'Tech Corp',
                    role: 'Developer',
                    startDate: '2020',
                    description: 'Built web apps',
                    technologies: ['React', 'TypeScript']
                }
            ],
            education: [],
            projects: [],
            skills: ['JavaScript', 'React'],
            certifications: []
        },
        exaggerationLevel: 'balanced'
    };

    it('should generate tailored resume with correct prompts', async () => {
        const mockResponse: LLMResponse = {
            content: 'Generated Resume',
            model: 'gpt-4',
            provider: 'openai'
        };

        mockGenerateResponse.mockResolvedValue(mockResponse);

        const result = await resumeGenerator.generateTailoredResume(mockRequest);

        expect(result).toEqual(mockResponse);
        expect(mockGenerateResponse).toHaveBeenCalledTimes(1);

        const callArgs = mockGenerateResponse.mock.calls[0][0];
        expect(callArgs).toHaveLength(2);
        expect(callArgs[0].role).toBe('system');
        expect(callArgs[1].role).toBe('user');

        // Verify system prompt contains exaggeration level instructions
        expect(callArgs[0].content).toContain('TONE GUIDELINES - Balanced Approach');

        // Verify user prompt contains job description and resume data
        expect(callArgs[1].content).toContain('Software Engineer role requiring React and Node.js');
        expect(callArgs[1].content).toContain('Tech Corp');
    });

    it('should handle different exaggeration levels', async () => {
        mockGenerateResponse.mockResolvedValue({ content: 'Res', model: 'm', provider: 'p' });

        await resumeGenerator.generateTailoredResume({
            ...mockRequest,
            exaggerationLevel: 'strategic'
        });

        const callArgs = mockGenerateResponse.mock.calls[0][0];
        expect(callArgs[0].content).toContain('TONE GUIDELINES - Strategic Approach');
    });

    it('should support streaming generation', async () => {
        const mockStream = (async function* () {
            yield { content: 'Chunk 1', model: 'gpt-4', provider: 'openai' };
            yield { content: 'Chunk 2', model: 'gpt-4', provider: 'openai' };
        })();

        mockGenerateStreamResponse.mockResolvedValue(mockStream);

        const stream = await resumeGenerator.generateTailoredResumeStream(mockRequest);

        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        expect(chunks).toHaveLength(2);
        expect(mockGenerateStreamResponse).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from LLM client', async () => {
        const error = new Error('API Error');
        mockGenerateResponse.mockRejectedValue(error);

        await expect(resumeGenerator.generateTailoredResume(mockRequest))
            .rejects.toThrow('Resume generation failed: API Error');
    });
});
