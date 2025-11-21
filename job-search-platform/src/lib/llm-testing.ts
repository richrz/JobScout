import {
  LLMProvider,
  LLMConfig,
  LLMConnectionTest,
  LLMClient,
  getLLMClient,
  validateLLMConfig,
} from '@/lib/llm';
import type { LLMConfig as LLMConfigType } from '@/types/llm';

// Enhanced connection test result with detailed diagnostics
export interface DetailedConnectionTest extends LLMConnectionTest {
  timestamp: string;
  provider: LLMProvider;
  model: string;
  status: 'success' | 'error';
  responseTime?: number;
  error?: string;
  errorType?: 'authentication' | 'network' | 'configuration' | 'model_unavailable' | 'timeout' | 'unknown';
  diagnostic?: {
    endpoint?: string;
    timeout?: number;
    modelAvailable?: boolean;
    apiKeyPresent?: boolean;
    additionalInfo?: Record<string, any>;
  };
  metadata?: {
    testType: 'basic' | 'comprehensive' | 'batch';
    retryAttempts?: number;
  };
}

// Batch connection test result
export interface BatchConnectionTest {
  timestamp: string;
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  results: DetailedConnectionTest[];
  summary: {
    overallStatus: 'success' | 'partial' | 'failed';
    averageResponseTime?: number;
    mostCommonError?: string;
  };
}

// Connection test options
export interface ConnectionTestOptions {
  timeout?: number;
  retryAttempts?: number;
  includeDiagnostic?: boolean;
  testModelAvailability?: boolean;
  customTestMessage?: string;
}

// Error categorization utilities
export class ConnectionTestError extends Error {
  public readonly type: 'authentication' | 'network' | 'configuration' | 'model_unavailable' | 'timeout' | 'unknown';
  public readonly originalError: Error;
  public readonly provider: LLMProvider;

  constructor(
    message: string,
    type: 'authentication' | 'network' | 'configuration' | 'model_unavailable' | 'timeout' | 'unknown',
    originalError: Error,
    provider: LLMProvider
  ) {
    super(message);
    this.name = 'ConnectionTestError';
    this.type = type;
    this.originalError = originalError;
    this.provider = provider;
  }
}

// Enhanced connection testing utilities
export class LLMConnectionTester {
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRIES = 2;
  private static readonly DEFAULT_TEST_MESSAGE = 'Hello, this is a connection test.';

  static async testSingleProvider(
    config: LLMConfigType,
    options: ConnectionTestOptions = {}
  ): Promise<DetailedConnectionTest> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Validate configuration first
    const validation = validateLLMConfig(config);
    if (!validation.isValid) {
      return {
        timestamp,
        provider: config.provider,
        model: config.model,
        status: 'error',
        error: `Configuration error: ${validation.errors.join(', ')}`,
        errorType: 'configuration',
        diagnostic: {
          endpoint: config.apiEndpoint,
          apiKeyPresent: !!config.apiKey || !!process.env[this.getEnvKeyForProvider(config.provider)],
          additionalInfo: { validationErrors: validation.errors },
        },
        metadata: { testType: 'basic' },
      };
    }

    const timeout = options.timeout || this.DEFAULT_TIMEOUT;
    const retryAttempts = options.retryAttempts || this.DEFAULT_RETRIES;
    const testMessage = options.customTestMessage || this.DEFAULT_TEST_MESSAGE;

    let lastError: Error | null = null;

    const client = getLLMClient(config);

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {

        // Test basic connection
        const connectionTest = await Promise.race([
          client.testConnection(),
          this.createTimeoutPromise(timeout),
        ]);

        // Prefer provider-reported response time, fallback to measured
        const responseTime = connectionTest && typeof connectionTest === 'object' && 'responseTime' in connectionTest
          ? (connectionTest as any).responseTime ?? (Date.now() - startTime)
          : (Date.now() - startTime);

        // If model availability testing is requested, perform additional test
        let modelAvailable = options.testModelAvailability ? true : undefined;
        if (options.testModelAvailability && typeof (client as any).generateResponse === 'function') {
          try {
            await (client as any).generateResponse([
              { role: 'user', content: testMessage }
            ]);
          } catch (error) {
            modelAvailable = false;
            throw error;
          }
        }

        return {
          timestamp,
          provider: config.provider,
          model: config.model,
          status: 'success',
          responseTime,
          diagnostic: {
            endpoint: config.apiEndpoint,
            timeout,
            modelAvailable,
            apiKeyPresent: !!config.apiKey || !!process.env[this.getEnvKeyForProvider(config.provider)],
            additionalInfo: {
              attempt: attempt + 1,
              modelAvailabilityTested: options.testModelAvailability,
            },
          },
          metadata: {
            testType: options.testModelAvailability ? 'comprehensive' : 'basic',
            retryAttempts: attempt,
          },
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // If this is the last attempt, categorize and return the error
        if (attempt === retryAttempts) {
          const categorizedError = this.categorizeError(lastError, config.provider, config);

          return {
            timestamp,
            provider: config.provider,
            model: config.model,
            status: 'error',
            error: categorizedError.message,
            errorType: categorizedError.type,
            diagnostic: {
              endpoint: config.apiEndpoint,
              timeout,
              modelAvailable: false,
              apiKeyPresent: !!config.apiKey || !!process.env[this.getEnvKeyForProvider(config.provider)],
              additionalInfo: {
                attempt: attempt + 1,
                originalError: lastError.message,
                errorCode: this.extractErrorCode(lastError),
              },
            },
            metadata: {
              testType: 'basic',
              retryAttempts: attempt,
            },
          };
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    // This should never be reached, but TypeScript safety
    throw lastError || new Error('Connection test failed unexpectedly');
  }

  static async testMultipleProviders(
    configs: LLMConfigType[],
    options: ConnectionTestOptions = {}
  ): Promise<BatchConnectionTest> {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    const testPromises = configs.map(async (config) => {
      try {
        return await this.testSingleProvider(config, options);
      } catch (error) {
        return {
          timestamp,
          provider: config.provider,
          model: config.model,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: 'unknown' as const,
          metadata: { testType: 'batch' as const },
        };
      }
    });

    const results = await Promise.all(testPromises);

    const successfulTests = results.filter(r => r.status === 'success').length;
    const failedTests = results.length - successfulTests;
    const totalTime = Date.now() - startTime;

    // Calculate statistics
    const successfulResults = results.filter(r => r.status === 'success') as DetailedConnectionTest[];
    const averageResponseTime = successfulResults.length > 0
      ? successfulResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successfulResults.length
      : undefined;

    // Find most common error
    const errorCounts = results
      .filter(r => r.status === 'error' && r.error)
      .reduce((counts, r) => {
        const rawError = r.error || 'Unknown error';
        const normalizedError = typeof rawError === 'string'
          ? (rawError.includes(':') ? rawError.split(':')[0].trim() : rawError)
          : 'Unknown error';
        counts[normalizedError] = (counts[normalizedError] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

    const mostCommonError = Object.keys(errorCounts).length > 0
      ? Object.keys(errorCounts).reduce((a, b) => errorCounts[a] > errorCounts[b] ? a : b)
      : undefined;

    return {
      timestamp,
      totalTests: results.length,
      successfulTests,
      failedTests,
      results,
      summary: {
        overallStatus: failedTests === 0 ? 'success' : successfulTests > 0 ? 'partial' : 'failed',
        averageResponseTime,
        mostCommonError,
      },
    };
  }

  static async testProviderConfiguration(config: LLMConfigType): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Basic validation
    const basicValidation = validateLLMConfig(config);
    errors.push(...basicValidation.errors);

    // Provider-specific checks
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey && !process.env.OPENAI_API_KEY) {
          errors.push('OpenAI API key is required');
        }
        if (!config.model || !this.isValidOpenAIModel(config.model)) {
          warnings.push(`Model "${config.model}" may not be available. Valid models include: gpt-4, gpt-4-turbo, gpt-3.5-turbo`);
        }
        break;

      case 'anthropic':
        if (!config.apiKey && !process.env.ANTHROPIC_API_KEY) {
          errors.push('Anthropic API key is required');
        }
        if (!config.model || !this.isValidAnthropicModel(config.model)) {
          warnings.push(`Model "${config.model}" may not be available. Valid models include: claude-3-sonnet-20240229, claude-3-haiku-20240307`);
        }
        break;

      case 'ollama':
        if (!config.apiEndpoint && !process.env.OLLAMA_BASE_URL) {
          warnings.push('Ollama endpoint not specified, using default localhost:11434');
          recommendations.push('Consider setting a custom Ollama endpoint if not running locally');
        }
        break;

      case 'openrouter':
        if (!config.apiKey && !process.env.OPENROUTER_API_KEY) {
          errors.push('OpenRouter API key is required');
        }
        recommendations.push('Consider setting app URL in environment for better OpenRouter integration');
        break;

      case 'azure':
        if (!config.apiKey && !process.env.AZURE_OPENAI_API_KEY) {
          errors.push('Azure OpenAI API key is required');
        }
        if (!config.apiEndpoint && !process.env.AZURE_OPENAI_ENDPOINT) {
          errors.push('Azure OpenAI endpoint is required');
        }
        if (!config.azureVersion) {
          errors.push('Azure API version is required');
        }
        if (!config.azureDeployment) {
          errors.push('Azure deployment name is required');
        }
        break;

      case 'custom':
        if (!config.apiEndpoint) {
          errors.push('Custom provider endpoint is required');
        }
        if (!config.apiKey) {
          warnings.push('Custom provider API key not specified');
        }
        recommendations.push('Ensure your custom provider is OpenAI-compatible');
        break;
    }

    // General recommendations
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      warnings.push('Temperature should be between 0 and 2');
    }

    if (config.maxTokens && config.maxTokens > 4000) {
      warnings.push('Large maxTokens values may result in slower responses');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  private static categorizeError(
    error: Error,
    provider: LLMProvider,
    config: LLMConfigType
  ): ConnectionTestError {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('invalid api key') ||
      message.includes('authentication') ||
      message.includes('forbidden') ||
      message.includes('403')
    ) {
      return new ConnectionTestError(
        `Authentication failed: ${error.message}`,
        'authentication',
        error,
        provider
      );
    }

    // Timeout errors (checked before generic network)
    if (message.includes('timeout') || message.includes('timed out') || message.includes('aborted')) {
      return new ConnectionTestError(
        `Request timeout: ${error.message}`,
        'timeout',
        error,
        provider
      );
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('fetch') ||
      message.includes('cors')
    ) {
      return new ConnectionTestError(
        `Network error: ${error.message}`,
        'network',
        error,
        provider
      );
    }

    // Model availability errors
    if (
      message.includes('model') ||
      message.includes('not found') ||
      message.includes('invalid') ||
      message.includes('deprecated') ||
      message.includes('404')
    ) {
      return new ConnectionTestError(
        `Model unavailable: ${error.message}`,
        'model_unavailable',
        error,
        provider
      );
    }

    // Configuration errors
    if (
      message.includes('configuration') ||
      message.includes('parameter') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return new ConnectionTestError(
        `Configuration error: ${error.message}`,
        'configuration',
        error,
        provider
      );
    }

    // Unknown errors
    return new ConnectionTestError(
      `Unknown error: ${error.message}`,
      'unknown',
      error,
      provider
    );
  }

  private static createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection test timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static getEnvKeyForProvider(provider: LLMProvider): string {
    switch (provider) {
      case 'openai': return 'OPENAI_API_KEY';
      case 'anthropic': return 'ANTHROPIC_API_KEY';
      case 'openrouter': return 'OPENROUTER_API_KEY';
      case 'azure': return 'AZURE_OPENAI_API_KEY';
      case 'ollama': return 'OLLAMA_BASE_URL';
      case 'custom': return 'CUSTOM_API_KEY';
      default: return 'API_KEY';
    }
  }

  private static extractErrorCode(error: Error): string | undefined {
    // Try to extract common error codes from error messages
    const message = error.message;
    const match = message.match(/\b(\d{3})\b/);
    return match ? match[1] : undefined;
  }

  private static isValidOpenAIModel(model: string): boolean {
    const validModels = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
    return validModels.some(valid => model.includes(valid));
  }

  private static isValidAnthropicModel(model: string): boolean {
    const validModels = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2',
    ];
    return validModels.some(valid => model.includes(valid));
  }
}

// Utility functions for common connection testing scenarios
export async function testAllProviders(
  configs: LLMConfigType[],
  options: ConnectionTestOptions = {}
): Promise<BatchConnectionTest> {
  return LLMConnectionTester.testMultipleProviders(configs, {
    ...options,
    includeDiagnostic: true,
    testModelAvailability: true,
  });
}

export async function quickConnectionTest(config: LLMConfigType): Promise<DetailedConnectionTest> {
  return LLMConnectionTester.testSingleProvider(config, {
    timeout: 15000, // 15 seconds for quick test
    retryAttempts: 1,
    includeDiagnostic: true,
    testModelAvailability: false,
  });
}

export async function comprehensiveConnectionTest(config: LLMConfigType): Promise<DetailedConnectionTest> {
  return LLMConnectionTester.testSingleProvider(config, {
    timeout: 45000, // 45 seconds for comprehensive test
    retryAttempts: 3,
    includeDiagnostic: true,
    testModelAvailability: true,
  });
}
