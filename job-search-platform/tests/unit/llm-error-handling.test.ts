import { getLLMClient, LLMConfig } from '@/lib/llm';
import { ChatOpenAI } from '@langchain/openai';

// Mock the ChatOpenAI class
jest.mock('@langchain/openai', () => {
    return {
        ChatOpenAI: jest.fn().mockImplementation(() => ({
            invoke: jest.fn(),
            stream: jest.fn(),
        })),
    };
});

describe('LLM Error Handling & Retry Logic', () => {
    const mockInvoke = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (ChatOpenAI as unknown as jest.Mock).mockImplementation(() => ({
            invoke: mockInvoke,
        }));
    });

    it('should retry on 429 Rate Limit error', async () => {
        const config: LLMConfig = {
            provider: 'openai',
            model: 'gpt-4',
            apiKey: 'test-key',
            maxRetries: 3, // We want to verify this config is respected
        };

        const client = getLLMClient(config);

        // Mock first 2 calls to fail with 429, 3rd to succeed
        const error429 = new Error('429 Rate Limit Exceeded');
        mockInvoke
            .mockRejectedValueOnce(error429)
            .mockRejectedValueOnce(error429)
            .mockResolvedValueOnce({ content: 'Success after retry', usage_metadata: {} });

        const response = await client.generateResponse([{ role: 'user', content: 'test' }]);

        expect(mockInvoke).toHaveBeenCalledTimes(3);
        expect(response.content).toBe('Success after retry');
    });

    it('should throw standardized error after max retries exhausted', async () => {
        const config: LLMConfig = {
            provider: 'openai',
            model: 'gpt-4',
            apiKey: 'test-key',
            maxRetries: 2,
        };

        const client = getLLMClient(config);
        const error500 = new Error('500 Internal Server Error');

        mockInvoke.mockRejectedValue(error500);

        await expect(client.generateResponse([{ role: 'user', content: 'test' }]))
            .rejects.toThrow('OpenAI API error: 500 Internal Server Error');

        // Initial call + 2 retries = 3 calls total
        expect(mockInvoke).toHaveBeenCalledTimes(3);
    });
});
