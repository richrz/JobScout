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

// LangChain imports
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';

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

// OpenAI Provider Implementation
export class OpenAIClient extends BaseLLMClient {
  private client: ChatOpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new ChatOpenAI({
      modelName: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      openAIApiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.invoke(langchainMessages);
      const endTime = Date.now();

      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.prompt_tokens || 0,
          completionTokens: response.usage_metadata.completion_tokens || 0,
          totalTokens: response.usage_metadata.total_tokens || 0,
        } : undefined,
        model: this.config.model,
        provider: 'openai',
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function*() {
        for await (const chunk of stream) {
          yield {
            content: chunk.content as string,
            model: this.config.model,
            provider: 'openai',
          };
        }
      }).call(this);
    } catch (error) {
      throw new Error(`OpenAI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<LLMConnectionTest> {
    try {
      const startTime = Date.now();
      await this.client.invoke([{ role: 'user', content: 'test' }]);
      const responseTime = Date.now() - startTime;

      return {
        provider: 'openai',
        model: this.config.model,
        status: 'success',
        responseTime,
      };
    } catch (error) {
      return {
        provider: 'openai',
        model: this.config.model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Anthropic Provider Implementation
export class AnthropicClient extends BaseLLMClient {
  private client: ChatAnthropic;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new ChatAnthropic({
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      anthropicApiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const langchainMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' as const : msg.role === 'system' ? 'user' as const : msg.role as const,
        content: msg.content,
      }));

      const response = await this.client.invoke(langchainMessages);
      const endTime = Date.now();

      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.input_tokens || 0,
          completionTokens: response.usage_metadata.output_tokens || 0,
          totalTokens: (response.usage_metadata.input_tokens || 0) + (response.usage_metadata.output_tokens || 0),
        } : undefined,
        model: this.config.model,
        provider: 'anthropic',
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' as const : msg.role === 'system' ? 'user' as const : msg.role as const,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function*() {
        for await (const chunk of stream) {
          yield {
            content: chunk.content as string,
            model: this.config.model,
            provider: 'anthropic',
          };
        }
      }).call(this);
    } catch (error) {
      throw new Error(`Anthropic streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<LLMConnectionTest> {
    try {
      const startTime = Date.now();
      await this.client.invoke([{ role: 'user' as const, content: 'test' }]);
      const responseTime = Date.now() - startTime;

      return {
        provider: 'anthropic',
        model: this.config.model,
        status: 'success',
        responseTime,
      };
    } catch (error) {
      return {
        provider: 'anthropic',
        model: this.config.model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Ollama Provider Implementation
export class OllamaClient extends BaseLLMClient {
  private client: ChatOpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new ChatOpenAI({
      modelName: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      configuration: {
        baseURL: this.config.apiEndpoint || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      },
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.invoke(langchainMessages);
      const endTime = Date.now();

      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.prompt_tokens || 0,
          completionTokens: response.usage_metadata.completion_tokens || 0,
          totalTokens: response.usage_metadata.total_tokens || 0,
        } : undefined,
        model: this.config.model,
        provider: 'ollama',
      };
    } catch (error) {
      throw new Error(`Ollama API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function*() {
        for await (const chunk of stream) {
          yield {
            content: chunk.content as string,
            model: this.config.model,
            provider: 'ollama',
          };
        }
      }).call(this);
    } catch (error) {
      throw new Error(`Ollama streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<LLMConnectionTest> {
    try {
      const startTime = Date.now();
      await this.client.invoke([{ role: 'user', content: 'test' }]);
      const responseTime = Date.now() - startTime;

      return {
        provider: 'ollama',
        model: this.config.model,
        status: 'success',
        responseTime,
      };
    } catch (error) {
      return {
        provider: 'ollama',
        model: this.config.model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// OpenRouter Provider Implementation
export class OpenRouterClient extends BaseLLMClient {
  private client: ChatOpenAI;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new ChatOpenAI({
      modelName: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      openAIApiKey: this.config.apiKey || process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: this.config.apiEndpoint || 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Job Search Platform',
          ...this.config.headers,
        },
      },
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.invoke(langchainMessages);
      const endTime = Date.now();

      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.prompt_tokens || 0,
          completionTokens: response.usage_metadata.completion_tokens || 0,
          totalTokens: response.usage_metadata.total_tokens || 0,
        } : undefined,
        model: this.config.model,
        provider: 'openrouter',
      };
    } catch (error) {
      throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function*() {
        for await (const chunk of stream) {
          yield {
            content: chunk.content as string,
            model: this.config.model,
            provider: 'openrouter',
          };
        }
      }).call(this);
    } catch (error) {
      throw new Error(`OpenRouter streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<LLMConnectionTest> {
    try {
      const startTime = Date.now();
      await this.client.invoke([{ role: 'user', content: 'test' }]);
      const responseTime = Date.now() - startTime;

      return {
        provider: 'openrouter',
        model: this.config.model,
        status: 'success',
        responseTime,
      };
    } catch (error) {
      return {
        provider: 'openrouter',
        model: this.config.model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Azure OpenAI Provider Implementation
export class AzureOpenAIClient extends BaseLLMClient {
  private client: ChatOpenAI;

  constructor(config: LLMConfig) {
    super(config);

    if (!config.azureVersion || !config.azureDeployment) {
      throw new Error('Azure API version and deployment name are required');
    }

    this.client = new ChatOpenAI({
      modelName: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      openAIApiKey: this.config.apiKey || process.env.AZURE_OPENAI_API_KEY,
      configuration: {
        baseURL: `${this.config.apiEndpoint || process.env.AZURE_OPENAI_ENDPOINT}`,
        defaultQuery: {
          'api-version': this.config.azureVersion,
        },
        defaultHeaders: {
          'api-key': this.config.apiKey || process.env.AZURE_OPENAI_API_KEY,
        },
      },
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.invoke(langchainMessages);
      const endTime = Date.now();

      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.prompt_tokens || 0,
          completionTokens: response.usage_metadata.completion_tokens || 0,
          totalTokens: response.usage_metadata.total_tokens || 0,
        } : undefined,
        model: this.config.model,
        provider: 'azure',
      };
    } catch (error) {
      throw new Error(`Azure OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function*() {
        for await (const chunk of stream) {
          yield {
            content: chunk.content as string,
            model: this.config.model,
            provider: 'azure',
          };
        }
      }).call(this);
    } catch (error) {
      throw new Error(`Azure OpenAI streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<LLMConnectionTest> {
    try {
      const startTime = Date.now();
      await this.client.invoke([{ role: 'user', content: 'test' }]);
      const responseTime = Date.now() - startTime;

      return {
        provider: 'azure',
        model: this.config.model,
        status: 'success',
        responseTime,
      };
    } catch (error) {
      return {
        provider: 'azure',
        model: this.config.model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Custom Provider Implementation
export class CustomLLMClient extends BaseLLMClient {
  private client: ChatOpenAI;

  constructor(config: LLMConfig) {
    super(config);

    if (!config.apiEndpoint) {
      throw new Error('Custom endpoint URL is required for custom provider');
    }

    this.client = new ChatOpenAI({
      modelName: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
      openAIApiKey: this.config.apiKey || 'sk-custom-key',
      configuration: {
        baseURL: this.config.apiEndpoint,
        defaultHeaders: this.config.headers || {},
      },
    });
  }

  async generateResponse(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const startTime = Date.now();
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.invoke(langchainMessages);
      const endTime = Date.now();

      return {
        content: response.content as string,
        usage: response.usage_metadata ? {
          promptTokens: response.usage_metadata.prompt_tokens || 0,
          completionTokens: response.usage_metadata.completion_tokens || 0,
          totalTokens: response.usage_metadata.total_tokens || 0,
        } : undefined,
        model: this.config.model,
        provider: 'custom',
      };
    } catch (error) {
      throw new Error(`Custom LLM API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function*() {
        for await (const chunk of stream) {
          yield {
            content: chunk.content as string,
            model: this.config.model,
            provider: 'custom',
          };
        }
      }).call(this);
    } catch (error) {
      throw new Error(`Custom LLM streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<LLMConnectionTest> {
    try {
      const startTime = Date.now();
      await this.client.invoke([{ role: 'user', content: 'test' }]);
      const responseTime = Date.now() - startTime;

      return {
        provider: 'custom',
        model: this.config.model,
        status: 'success',
        responseTime,
      };
    } catch (error) {
      return {
        provider: 'custom',
        model: this.config.model,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Factory function for creating LLM clients
export function getLLMClient(config: LLMConfig): LLMClient {
  switch (config.provider) {
    case 'openai':
      return new OpenAIClient(config);

    case 'anthropic':
      return new AnthropicClient(config);

    case 'ollama':
      return new OllamaClient(config);

    case 'openrouter':
      return new OpenRouterClient(config);

    case 'azure':
      return new AzureOpenAIClient(config);

    case 'custom':
      return new CustomLLMClient(config);

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