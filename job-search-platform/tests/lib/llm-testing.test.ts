import {
  LLMConnectionTester,
  DetailedConnectionTest,
  BatchConnectionTest,
  ConnectionTestOptions,
  testAllProviders,
  quickConnectionTest,
  comprehensiveConnectionTest,
} from '@/lib/llm-testing';
import type { LLMConfig } from '@/types/llm';

// Mock the getLLMClient function to avoid actual API calls
jest.mock('@/lib/llm', () => ({
  getLLMClient: jest.fn(),
  validateLLMConfig: jest.fn(),
}));

describe('LLM Connection Testing Framework', () => {
  // Test configuration fixtures
  const validOpenAIConfig: LLMConfig = {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    apiKey: 'test-openai-key',
  };

  const validAnthropicConfig: LLMConfig = {
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    temperature: 0.5,
    maxTokens: 2000,
    apiKey: 'test-anthropic-key',
  };

  const invalidConfig: LLMConfig = {
    provider: 'openai',
    model: 'invalid-model',
    temperature: 0.7,
    maxTokens: 1000,
    // Missing API key
  };

  describe('Configuration Validation', () => {
    it('should validate correct OpenAI configuration', async () => {
      const { validateLLMConfig } = require('@/lib/llm');
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testProviderConfiguration(validOpenAIConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing API key in OpenAI configuration', async () => {
      const { validateLLMConfig } = require('@/lib/llm');
      validateLLMConfig.mockReturnValue({
        isValid: false,
        errors: ['OpenAI API key is required']
      });

      const configWithoutKey = { ...validOpenAIConfig, apiKey: undefined };
      const result = await LLMConnectionTester.testProviderConfiguration(configWithoutKey);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('OpenAI API key is required');
    });

    it('should provide warnings for invalid models', async () => {
      const { validateLLMConfig } = require('@/lib/llm');
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const configWithInvalidModel = { ...validOpenAIConfig, model: 'invalid-model-name' };
      const result = await LLMConnectionTester.testProviderConfiguration(configWithInvalidModel);

      expect(result.warnings).toContain(
        expect.stringContaining('may not be available')
      );
    });

    it('should validate Azure OpenAI specific requirements', async () => {
      const { validateLLMConfig } = require('@/lib/llm');
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const azureConfig: LLMConfig = {
        provider: 'azure',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: 'test-azure-key',
        apiEndpoint: 'https://test.openai.azure.com/',
        azureVersion: '2023-12-01-preview',
        azureDeployment: 'gpt-4-deployment',
      };

      const result = await LLMConnectionTester.testProviderConfiguration(azureConfig);

      expect(result.isValid).toBe(true);
    });

    it('should detect missing Azure OpenAI configuration', async () => {
      const { validateLLMConfig } = require('@/lib/llm');
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const incompleteAzureConfig: LLMConfig = {
        provider: 'azure',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        apiKey: 'test-azure-key',
        // Missing Azure-specific fields
      };

      const result = await LLMConnectionTester.testProviderConfiguration(incompleteAzureConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Azure OpenAI endpoint is required');
      expect(result.errors).toContain('Azure API version is required');
      expect(result.errors).toContain('Azure deployment name is required');
    });
  });

  describe('Single Provider Connection Testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should perform successful connection test', async () => {
      const mockClient = {
        testConnection: jest.fn().mockResolvedValue({
          provider: 'openai',
          model: 'gpt-4',
          status: 'success',
          responseTime: 500,
        }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

      expect(result.status).toBe('success');
      expect(result.provider).toBe('openai');
      expect(result.model).toBe('gpt-4');
      expect(result.responseTime).toBe(500);
      expect(result.diagnostic?.apiKeyPresent).toBe(true);
      expect(result.metadata?.testType).toBe('basic');
    });

    it('should handle authentication errors', async () => {
      const mockClient = {
        testConnection: jest.fn().mockRejectedValue(
          new Error('401 Unauthorized - Invalid API key')
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

      expect(result.status).toBe('error');
      expect(result.errorType).toBe('authentication');
      expect(result.error).toContain('Authentication failed');
    });

    it('should handle network errors', async () => {
      const mockClient = {
        testConnection: jest.fn().mockRejectedValue(
          new Error('ECONNREFUSED - Network connection failed')
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

      expect(result.status).toBe('error');
      expect(result.errorType).toBe('network');
      expect(result.error).toContain('Network error');
    });

    it('should handle model availability errors', async () => {
      const mockClient = {
        testConnection: jest.fn().mockRejectedValue(
          new Error('Model not found: invalid-model')
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

      expect(result.status).toBe('error');
      expect(result.errorType).toBe('model_unavailable');
      expect(result.error).toContain('Model unavailable');
    });

    it('should handle timeout errors', async () => {
      const mockClient = {
        testConnection: jest.fn().mockRejectedValue(
          new Error('Request timeout after 30000ms')
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

      expect(result.status).toBe('error');
      expect(result.errorType).toBe('timeout');
      expect(result.error).toContain('Request timeout');
    });

    it('should respect custom timeout options', async () => {
      const mockClient = {
        testConnection: jest.fn().mockImplementation(() =>
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100);
          })
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const options: ConnectionTestOptions = {
        timeout: 50, // Very short timeout
      };

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig, options);

      expect(result.status).toBe('error');
      expect(result.errorType).toBe('timeout');
    });

    it('should perform retries on failure', async () => {
      const mockClient = {
        testConnection: jest.fn()
          .mockRejectedValueOnce(new Error('Temporary failure'))
          .mockResolvedValueOnce({
            provider: 'openai',
            model: 'gpt-4',
            status: 'success',
            responseTime: 600,
          }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const options: ConnectionTestOptions = {
        retryAttempts: 1,
      };

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig, options);

      expect(result.status).toBe('success');
      expect(result.metadata?.retryAttempts).toBe(1);
      expect(mockClient.testConnection).toHaveBeenCalledTimes(2);
    });
  });

  describe('Batch Connection Testing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should test multiple providers successfully', async () => {
      const mockOpenAIClient = {
        testConnection: jest.fn().mockResolvedValue({
          provider: 'openai',
          model: 'gpt-4',
          status: 'success',
          responseTime: 400,
        }),
      };

      const mockAnthropicClient = {
        testConnection: jest.fn().mockResolvedValue({
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          status: 'success',
          responseTime: 600,
        }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient
        .mockReturnValueOnce(mockOpenAIClient)
        .mockReturnValueOnce(mockAnthropicClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const configs = [validOpenAIConfig, validAnthropicConfig];
      const result = await LLMConnectionTester.testMultipleProviders(configs);

      expect(result.totalTests).toBe(2);
      expect(result.successfulTests).toBe(2);
      expect(result.failedTests).toBe(0);
      expect(result.summary.overallStatus).toBe('success');
      expect(result.summary.averageResponseTime).toBe(500); // (400 + 600) / 2
    });

    it('should handle mixed success and failure results', async () => {
      const mockOpenAIClient = {
        testConnection: jest.fn().mockResolvedValue({
          provider: 'openai',
          model: 'gpt-4',
          status: 'success',
          responseTime: 400,
        }),
      };

      const mockAnthropicClient = {
        testConnection: jest.fn().mockRejectedValue(
          new Error('Authentication failed')
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient
        .mockReturnValueOnce(mockOpenAIClient)
        .mockReturnValueOnce(mockAnthropicClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const configs = [validOpenAIConfig, validAnthropicConfig];
      const result = await LLMConnectionTester.testMultipleProviders(configs);

      expect(result.totalTests).toBe(2);
      expect(result.successfulTests).toBe(1);
      expect(result.failedTests).toBe(1);
      expect(result.summary.overallStatus).toBe('partial');
      expect(result.summary.mostCommonError).toBe('Authentication failed');
    });

    it('should calculate correct statistics', async () => {
      const mockClients = [
        { testConnection: jest.fn().mockResolvedValue({ status: 'success', responseTime: 200 }) },
        { testConnection: jest.fn().mockResolvedValue({ status: 'success', responseTime: 400 }) },
        { testConnection: jest.fn().mockResolvedValue({ status: 'success', responseTime: 600 }) },
      ];

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockImplementation((config) => {
        if (config.model === 'fast') return mockClients[0];
        if (config.model === 'medium') return mockClients[1];
        return mockClients[2];
      });
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const configs = [
        { ...validOpenAIConfig, model: 'fast' },
        { ...validOpenAIConfig, model: 'medium' },
        { ...validOpenAIConfig, model: 'slow' },
      ];

      const result = await LLMConnectionTester.testMultipleProviders(configs);

      expect(result.summary.averageResponseTime).toBe(400); // (200 + 400 + 600) / 3
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('quickConnectionTest should use quick settings', async () => {
      const mockClient = {
        testConnection: jest.fn().mockResolvedValue({
          status: 'success',
          responseTime: 300,
        }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await quickConnectionTest(validOpenAIConfig);

      expect(result.metadata?.testType).toBe('basic');
      expect(result.diagnostic?.timeout).toBe(15000);
    });

    it('comprehensiveConnectionTest should use comprehensive settings', async () => {
      const mockClient = {
        testConnection: jest.fn().mockResolvedValue({
          status: 'success',
          responseTime: 500,
        }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await comprehensiveConnectionTest(validOpenAIConfig);

      expect(result.metadata?.testType).toBe('comprehensive');
      expect(result.diagnostic?.timeout).toBe(45000);
    });

    it('testAllProviders should test with comprehensive options', async () => {
      const mockClient = {
        testConnection: jest.fn().mockResolvedValue({
          status: 'success',
          responseTime: 400,
        }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await testAllProviders([validOpenAIConfig]);

      expect(result.summary.overallStatus).toBe('success');
    });
  });

  describe('Error Categorization', () => {
    const testErrorTypes = [
      { error: new Error('401 Unauthorized'), expectedType: 'authentication' },
      { error: new Error('Invalid API key'), expectedType: 'authentication' },
      { error: new Error('403 Forbidden'), expectedType: 'authentication' },
      { error: new Error('Network connection failed'), expectedType: 'network' },
      { error: new Error('ECONNREFUSED'), expectedType: 'network' },
      { error: new Error('CORS error'), expectedType: 'network' },
      { error: new Error('Model not found'), expectedType: 'model_unavailable' },
      { error: new Error('Invalid model name'), expectedType: 'model_unavailable' },
      { error: new Error('Request timeout'), expectedType: 'timeout' },
      { error: new Error('Configuration parameter missing'), expectedType: 'configuration' },
      { error: new Error('Some unknown error'), expectedType: 'unknown' },
    ];

    testErrorTypes.forEach(({ error, expectedType }) => {
      it(`should categorize "${error.message}" as ${expectedType}`, async () => {
        const mockClient = {
          testConnection: jest.fn().mockRejectedValue(error),
        };

        const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
        getLLMClient.mockReturnValue(mockClient);
        validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

        const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

        expect(result.status).toBe('error');
        expect(result.errorType).toBe(expectedType);
      });
    });
  });

  describe('Diagnostic Information', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should include detailed diagnostic information', async () => {
      const mockClient = {
        testConnection: jest.fn().mockResolvedValue({
          status: 'success',
          responseTime: 450,
        }),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const options: ConnectionTestOptions = {
        includeDiagnostic: true,
        testModelAvailability: true,
        timeout: 25000,
      };

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig, options);

      expect(result.diagnostic).toBeDefined();
      expect(result.diagnostic?.timeout).toBe(25000);
      expect(result.diagnostic?.modelAvailable).toBe(true);
      expect(result.diagnostic?.apiKeyPresent).toBe(true);
      expect(result.diagnostic?.additionalInfo).toBeDefined();
    });

    it('should include error details in diagnostics for failures', async () => {
      const mockClient = {
        testConnection: jest.fn().mockRejectedValue(
          new Error('401 Unauthorized')
        ),
      };

      const { getLLMClient, validateLLMConfig } = require('@/lib/llm');
      getLLMClient.mockReturnValue(mockClient);
      validateLLMConfig.mockReturnValue({ isValid: true, errors: [] });

      const result = await LLMConnectionTester.testSingleProvider(validOpenAIConfig);

      expect(result.diagnostic).toBeDefined();
      expect(result.diagnostic?.modelAvailable).toBe(false);
      expect(result.diagnostic?.additionalInfo?.originalError).toBe('401 Unauthorized');
      expect(result.diagnostic?.additionalInfo?.errorCode).toBe('401');
    });
  });
});