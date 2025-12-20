export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'openrouter' | 'azure' | 'custom';

export type ExaggerationLevel = 'authentic' | 'professional' | 'persuasive';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  apiEndpoint?: string;
  // Azure OpenAI specific
  azureVersion?: string;
  azureDeployment?: string;
  // Custom headers for advanced configurations
  headers?: Record<string, string>;
  // Retry configuration
  maxRetries?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: LLMProvider;
  responseTime?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ResumeGenerationRequest {
  jobDescription: string;
  userProfile: any; // Profile type from schema
  exaggerationLevel: ExaggerationLevel;
  customInstructions?: string;
}

export type LLMTestError =
  | string
  | {
    category: 'authentication' | 'network' | 'configuration' | 'model_unavailable' | 'timeout' | 'unknown';
    message: string;
    code?: string;
  };

export interface LLMConnectionTest {
  provider: LLMProvider;
  model: string;
  status: 'success' | 'failed' | 'error';
  responseTime?: number;
  error?: LLMTestError;
  errorCategory?: 'authentication' | 'network' | 'configuration' | 'model_unavailable' | 'timeout' | 'unknown';
}

export interface ConnectionTestError {
  category: 'authentication' | 'network' | 'configuration' | 'model_unavailable' | 'timeout' | 'unknown';
  message: string;
  code: string;
}

export interface DetailedConnectionTest extends LLMConnectionTest {
  diagnostics: {
    apiEndpoint: string;
    modelAvailability: boolean;
    responseFormat: 'json' | 'text' | 'unknown';
    connectionLatency: number;
  };
  performance: {
    throughput?: number;
    latency: number;
    reliability: number;
  };
  healthCheck: {
    isHealthy: boolean;
    issues?: string[];
    recommendations?: string[];
  };
}

export interface BatchConnectionTest {
  results: LLMConnectionTest[];
  summary: {
    total: number;
    success: number;
    failed: number;
    errors: string[];
  };
  statistics: {
    averageResponseTime: number;
    successRate: number;
    errorBreakdown: Record<string, number>;
  };
  successCount: number;
  failureCount: number;
  responseTime: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
}

// Temperature mapping for exaggeration levels
export const EXAGGERATION_TEMPERATURE_MAP: Record<ExaggerationLevel, number> = {
  authentic: 0.3,    // Low creativity for literal facts
  professional: 0.7, // Balanced for standard polish
  persuasive: 0.9,   // High creativity for aggressive reframing
};

// Default models for each provider
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4',
  anthropic: 'claude-3-sonnet-20240229',
  gemini: 'gemini-3-pro-preview',
  ollama: 'llama2',
  openrouter: 'meta-llama/llama-3-8b-instruct',
  azure: 'gpt-4',
  custom: 'custom-model',
};

// Provider-specific configurations
export interface ProviderConfig {
  requiresApiKey: boolean;
  requiresEndpoint: boolean;
  supportedModels: string[];
  defaultTemperature: number;
  maxTokens: number;
}

export const PROVIDER_CONFIGS: Record<LLMProvider, ProviderConfig> = {
  openai: {
    requiresApiKey: true,
    requiresEndpoint: false,
    supportedModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultTemperature: 0.7,
    maxTokens: 4096,
  },
  anthropic: {
    requiresApiKey: true,
    requiresEndpoint: false,
    supportedModels: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    defaultTemperature: 0.7,
    maxTokens: 4096,
  },
  ollama: {
    requiresApiKey: false,
    requiresEndpoint: true,
    supportedModels: ['llama2', 'llama3', 'mistral', 'codellama'],
    defaultTemperature: 0.7,
    maxTokens: 4096,
  },
  openrouter: {
    requiresApiKey: true,
    requiresEndpoint: false,
    supportedModels: [
      'meta-llama/llama-3-8b-instruct',
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo',
    ],
    defaultTemperature: 0.7,
    maxTokens: 4096,
  },
  azure: {
    requiresApiKey: true,
    requiresEndpoint: true,
    supportedModels: ['gpt-4', 'gpt-35-turbo'],
    defaultTemperature: 0.7,
    maxTokens: 4096,
  },
  custom: {
    requiresApiKey: true,
    requiresEndpoint: true,
    supportedModels: ['custom-model'],
    defaultTemperature: 0.7,
    maxTokens: 4096,
  },
  gemini: {
    requiresApiKey: true,
    requiresEndpoint: false,
    supportedModels: ['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'],
    defaultTemperature: 0.7,
    maxTokens: 8192,
  },
};
