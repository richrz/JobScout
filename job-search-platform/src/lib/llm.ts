import {
  LLMProvider,
  LLMConfig,
  LLMResponse,
  LLMMessage,
  ResumeGenerationRequest,
  LLMConnectionTest,
  EXAGGERATION_TEMPERATURE_MAP,
  DEFAULT_MODELS,
  PROVIDER_CONFIGS,
} from '@/types/llm';

// Provider-agnostic interface for LLM implementations
export interface LLMClient {
  generateResponse(messages: LLMMessage[]): Promise<LLMResponse>;
  generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>>;
  testConnection(): Promise<LLMConnectionTest>;
  getProvider(): LLMProvider;
  getModel(): string;
}

// Abstract base class for LLM providers
export abstract class BaseLLMClient implements LLMClient {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = this.validateConfig(config);
  }

  abstract generateResponse(messages: LLMMessage[]): Promise<LLMResponse>;
  abstract generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>>;
  abstract testConnection(): Promise<LLMConnectionTest>;

  getProvider(): LLMProvider {
    return this.config.provider;
  }

  getModel(): string {
    return this.config.model;
  }

  protected validateConfig(config: LLMConfig): LLMConfig {
    const providerConfig = PROVIDER_CONFIGS[config.provider];

    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${config.provider}`);
    }

    // Validate required fields
    if (providerConfig.requiresApiKey && !config.apiKey) {
      throw new Error(`API key required for ${config.provider} provider`);
    }

    if (providerConfig.requiresEndpoint && !config.apiEndpoint) {
      throw new Error(`API endpoint required for ${config.provider} provider`);
    }

    // Set defaults
    return {
      ...config,
      model: config.model || DEFAULT_MODELS[config.provider],
      temperature: config.temperature ?? providerConfig.defaultTemperature,
      maxTokens: config.maxTokens ?? providerConfig.maxTokens,
    };
  }
}

// Factory function for creating LLM clients
export function getLLMClient(config: LLMConfig): LLMClient {
  switch (config.provider) {
    case 'openai':
      // Will be implemented in subtask 16.2
      throw new Error('OpenAI provider not yet implemented');

    case 'anthropic':
      // Will be implemented in subtask 16.2
      throw new Error('Anthropic provider not yet implemented');

    case 'ollama':
      // Will be implemented in subtask 16.2
      throw new Error('Ollama provider not yet implemented');

    case 'openrouter':
      // Will be implemented in subtask 16.2
      throw new Error('OpenRouter provider not yet implemented');

    case 'azure':
      // Will be implemented in subtask 16.2
      throw new Error('Azure provider not yet implemented');

    case 'custom':
      // Will be implemented in subtask 16.2
      throw new Error('Custom provider not yet implemented');

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Resume generation service (will be fully implemented in subtask 16.3)
export class ResumeGenerator {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async generateTailoredResume(request: ResumeGenerationRequest): Promise<LLMResponse> {
    // Will be implemented in subtask 16.3
    throw new Error('Resume generation not yet implemented');
  }

  async generateTailoredResumeStream(request: ResumeGenerationRequest): Promise<AsyncIterable<LLMResponse>> {
    // Will be implemented in subtask 16.3
    throw new Error('Resume generation stream not yet implemented');
  }
}

// Utility function to create resume generator with configuration
export function createResumeGenerator(config: LLMConfig): ResumeGenerator {
  const llmClient = getLLMClient(config);
  return new ResumeGenerator(llmClient);
}

// Utility function to map exaggeration level to temperature
export function getTemperatureForExaggerationLevel(exaggerationLevel: keyof typeof EXAGGERATION_TEMPERATURE_MAP): number {
  return EXAGGERATION_TEMPERATURE_MAP[exaggerationLevel];
}

// Validation utilities
export function validateLLMConfig(config: LLMConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const providerConfig = PROVIDER_CONFIGS[config.provider];

    if (!providerConfig) {
      errors.push(`Unsupported provider: ${config.provider}`);
      return { isValid: false, errors };
    }

    if (providerConfig.requiresApiKey && !config.apiKey) {
      errors.push(`API key required for ${config.provider} provider`);
    }

    if (providerConfig.requiresEndpoint && !config.apiEndpoint) {
      errors.push(`API endpoint required for ${config.provider} provider`);
    }

    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }

    if (config.maxTokens <= 0) {
      errors.push('Max tokens must be greater than 0');
    }

    if (config.provider === 'azure') {
      if (!config.azureVersion) {
        errors.push('Azure API version is required for Azure provider');
      }
      if (!config.azureDeployment) {
        errors.push('Azure deployment name is required for Azure provider');
      }
    }

  } catch (error) {
    errors.push(`Configuration validation failed: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Connection testing utility
export async function testLLMConnection(config: LLMConfig): Promise<LLMConnectionTest> {
  try {
    const llmClient = getLLMClient(config);
    return await llmClient.testConnection();
  } catch (error) {
    return {
      provider: config.provider,
      model: config.model,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}