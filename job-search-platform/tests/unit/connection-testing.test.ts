import {
  LLMConfig,
} from '@/types/llm';
import {
  LLMConnectionTester,
  ConnectionTestError,
  quickConnectionTest,
  comprehensiveConnectionTest,
  testAllProviders,
} from '@/lib/llm-testing';

// Mock LLM Client factory
jest.mock('@/lib/llm', () => {
  const originalModule = jest.requireActual('@/lib/llm');
  return {
    ...originalModule,
    getLLMClient: jest.fn().mockImplementation((config) => ({
      testConnection: jest.fn().mockResolvedValue({
        provider: config.provider,
        model: config.model,
        status: 'success',
        responseTime: 100,
      }),
      generateResponse: jest.fn().mockResolvedValue({
        content: 'Test response',
        model: config.model,
        provider: config.provider,
      }),
    })),
    validateLLMConfig: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
  };
});

describe('LLM Connection Testing Framework', () => {
  describe('LLMConnectionTester', () => {
    it('should test single provider connection', async () => {
      const config: LLMConfig = {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: 'test-key'
      };

      const result = await LLMConnectionTester.testSingleProvider(config);

      expect(result.status).toBe('success');
      expect(result.provider).toBe('openai');
      expect(result.diagnostic).toBeDefined();
    });

    it('should handle connection errors', async () => {
      const { getLLMClient } = require('@/lib/llm');
      getLLMClient.mockImplementationOnce(() => ({
        testConnection: jest.fn().mockRejectedValue(new Error('Connection failed')),
      }));

      const config: LLMConfig = {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: 'test-key'
      };

      const result = await LLMConnectionTester.testSingleProvider(config, { retryAttempts: 0 });

      expect(result.status).toBe('error');
      expect(result.error).toContain('Connection failed');
    });
  });

  describe('Batch Testing', () => {
    it('should test multiple providers', async () => {
      const configs: LLMConfig[] = [
        { provider: 'openai', model: 'gpt-4', temperature: 0.7, maxTokens: 1000, apiKey: 'k1' },
        { provider: 'anthropic', model: 'claude-3', temperature: 0.7, maxTokens: 1000, apiKey: 'k2' }
      ];

      const result = await testAllProviders(configs);

      expect(result.totalTests).toBe(2);
      expect(result.successfulTests).toBe(2);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('Utility Functions', () => {
    it('should perform quick connection test', async () => {
      const config: LLMConfig = {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: 'test-key'
      };

      const result = await quickConnectionTest(config);
      expect(result.metadata?.testType).toBe('basic');
    });

    it('should perform comprehensive connection test', async () => {
      const config: LLMConfig = {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: 'test-key'
      };

      const result = await comprehensiveConnectionTest(config);
      expect(result.metadata?.testType).toBe('comprehensive');
    });
  });

  describe('Error Categorization', () => {
    it('should categorize authentication errors', () => {
      // Access private method via prototype or casting if necessary, 
      // but better to test via public API behavior or just instantiate the error class if exported
      const error = new ConnectionTestError(
        'Invalid API key',
        'authentication',
        new Error('401 Unauthorized'),
        'openai'
      );

      expect(error.type).toBe('authentication');
      expect(error.provider).toBe('openai');
    });
  });
});