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
      maxRetries: config.maxRetries ?? 3,
    };
  }

  protected async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = this.config.maxRetries ?? 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry (429, 5xx)
        const isRetryable =
          lastError.message.includes('429') ||
          lastError.message.includes('500') ||
          lastError.message.includes('502') ||
          lastError.message.includes('503') ||
          lastError.message.includes('504');

        if (attempt === maxRetries || !isRetryable) {
          throw lastError;
        }

        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Unknown error after retries');
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
    return this.withRetry(async () => {
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
    });
  }

  async generateStreamResponse(messages: LLMMessage[]): Promise<AsyncIterable<LLMResponse>> {
    try {
      const langchainMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.stream(langchainMessages);

      return (async function* () {
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

      return (async function* () {
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

      return (async function* () {
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

      return (async function* () {
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

      return (async function* () {
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

      return (async function* () {
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

// Types for better profile structure handling
interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  portfolio?: string;
}

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies?: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

// Resume generation service with comprehensive prompt engineering
export class ResumeGenerator {
  private llmClient: LLMClient;

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient;
  }

  async generateTailoredResume(request: ResumeGenerationRequest): Promise<LLMResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.exaggerationLevel);
      const userPrompt = this.buildUserPrompt(request);

      const messages: LLMMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      return await this.llmClient.generateResponse(messages);
    } catch (error) {
      throw new Error(`Resume generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTailoredResumeStream(request: ResumeGenerationRequest): Promise<AsyncIterable<LLMResponse>> {
    try {
      const systemPrompt = this.buildSystemPrompt(request.exaggerationLevel);
      const userPrompt = this.buildUserPrompt(request);

      const messages: LLMMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      return await this.llmClient.generateStreamResponse(messages);
    } catch (error) {
      throw new Error(`Resume generation stream failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildSystemPrompt(exaggerationLevel: keyof typeof EXAGGERATION_TEMPERATURE_MAP): string {
    const basePrompt = `You are an expert resume writer and career coach with deep experience in crafting ATS-optimized resumes that land interviews. You specialize in tailoring resumes to specific job descriptions while maintaining authenticity and professionalism.

Your task is to create a tailored resume that:
1. Highlights the candidate's most relevant experience for this specific role
2. Uses keywords naturally from the job description to pass ATS screening
3. Reorders work history to prioritize the most relevant positions
4. Adapts the tone and emphasis based on the desired exaggeration level
5. Maintains factual accuracy while positioning the candidate optimally

Format Requirements:
- Use clean, ATS-friendly markdown format
- Include clear section headers (##)
- Use bullet points with strong action verbs
- Keep dates and formatting consistent
- Ensure professional formatting that reads well in both human and machine review

Content Guidelines:
- Focus on achievements and quantifiable results
- Incorporate relevant keywords from the job description
- Highlight transferable skills and experiences
- Maintain truthful representation of the candidate's background`;

    const levelSpecificPrompt = this.getExaggerationLevelPrompt(exaggerationLevel);
    return `${basePrompt}\n\n${levelSpecificPrompt}`;
  }

  private getExaggerationLevelPrompt(exaggerationLevel: keyof typeof EXAGGERATION_TEMPERATURE_MAP): string {
    switch (exaggerationLevel) {
      case 'conservative':
        return `TONE GUIDELINES - Conservative Approach:
- Maintain strictly factual, understated language
- Use modest descriptors (e.g., "contributed to," "assisted with")
- Focus on verifiable achievements without embellishment
- Present skills and experience honestly and directly
- Avoid superlatives or exaggerated claims
- Use professional, measured language throughout
- Prioritize accuracy and credibility over aggressive positioning`;

      case 'balanced':
        return `TONE GUIDELINES - Balanced Approach:
- Use confident but realistic language
- Employ strong action verbs (e.g., "managed," "developed," "implemented")
- Highlight achievements with appropriate emphasis
- Present skills competently without overstating
- Include quantifiable results where available
- Use professional language with moderate confidence
- Balance authenticity with effective self-promotion`;

      case 'strategic':
        return `TONE GUIDELINES - Strategic Approach:
- Use confident, persuasive language that emphasizes impact
- Employ powerful action verbs (e.g., "led," "drove," "transformed," "pioneered")
- Highlight achievements with maximum appropriate emphasis
- Position skills and experience optimally for the target role
- Focus on quantifiable business impact and results
- Use strategic language that demonstrates leadership and value
- Emphasize growth, innovation, and business outcomes`;

      default:
        return `TONE GUIDELINES - Professional Approach:
- Use professional, clear language
- Focus on achievements and results
- Maintain authenticity while positioning effectively`;
    }
  }

  private buildUserPrompt(request: ResumeGenerationRequest): string {
    const { jobDescription, userProfile, customInstructions } = request;

    // Extract profile data with proper typing
    const contactInfo = userProfile.contactInfo as ContactInfo || {};
    const workHistory = userProfile.workHistory as WorkExperience[] || [];
    const education = userProfile.education as Education[] || [];
    const skills = userProfile.skills || [];
    const projects = userProfile.projects as Project[] || [];
    const certifications = userProfile.certifications as Certification[] || [];

    // Extract keywords from job description
    const keywords = this.extractKeywords(jobDescription);

    // Analyze job requirements
    const jobAnalysis = this.analyzeJobRequirements(jobDescription);

    let prompt = `## Job Description

${jobDescription}

## Candidate Profile

### Contact Information
${this.formatContactInfo(contactInfo)}

### Professional Summary
[Generate a compelling 3-4 line summary based on the candidate's experience and the job requirements]

### Skills
${skills.join(', ')}

### Work Experience
${this.formatWorkHistory(workHistory, jobAnalysis)}

### Education
${this.formatEducation(education)}

### Projects
${this.formatProjects(projects)}

### Certifications
${this.formatCertifications(certifications)}

## Resume Generation Instructions

**Target Keywords to Include:** ${keywords.join(', ')}

**Key Job Requirements:**
- ${jobAnalysis.requiredSkills.join('\n- ')}
- ${jobAnalysis.experienceLevel}
- Focus on: ${jobAnalysis.focusAreas.join(', ')}

**Formatting Instructions:**
1. Create a professional, ATS-friendly resume in markdown format
2. Start with contact information at the top
3. Include a compelling professional summary
4. List skills prominently
5. Present work experience in reverse chronological order
6. Include relevant projects and certifications
7. Ensure consistent formatting and professional presentation

**Content Strategy:**
- Emphasize experience and skills most relevant to this job
- Use industry-standard terminology and keywords
- Quantify achievements where possible (metrics, results, impact)
- Ensure all information is truthful and verifiable
- Adapt tone to match the specified exaggeration level`;

    if (customInstructions) {
      prompt += `\n\n## Custom Instructions\n\n${customInstructions}`;
    }

    return prompt;
  }

  private extractKeywords(jobDescription: string): string[] {
    // Extract common technical and professional keywords
    const keywordPatterns = [
      /\b(javascript|typescript|react|vue|angular|node\.js|python|java|c\+\+|c\#|golang|rust|sql|mongodb|postgresql|mysql|redis|docker|kubernetes|aws|azure|gcp|git|agile|scrum|devops|ci\/cd|microservices|apis|rest|graphql|machine learning|ai|data science|blockchain|web3|cloud|frontend|backend|fullstack|mobile|ios|android|testing|unittests|integration|performance|scalability|security)\b/gi,
      /\b(project manager|product manager|software engineer|senior developer|lead developer|architect|cto|vp of engineering|director|manager|consultant|analyst|designer|ux|ui)\b/gi,
      /\b(5\+ years|3\+ years|bachelor|master|phd|certification|aws certified|google certified|microsoft certified)\b/gi
    ];

    const extractedKeywords: string[] = [];
    keywordPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern);
      if (matches) {
        extractedKeywords.push(...matches.map(m => m.toLowerCase()));
      }
    });

    // Return unique keywords
    return Array.from(new Set(extractedKeywords));
  }

  private analyzeJobRequirements(jobDescription: string): {
    requiredSkills: string[];
    experienceLevel: string;
    focusAreas: string[];
  } {
    const lowerDescription = jobDescription.toLowerCase();

    // Extract required skills
    const skillMatches = lowerDescription.match(/(?:skills?|requirements|qualifications)[:\s]*([^.]+)/gi);
    const requiredSkills = skillMatches ? skillMatches.map(m => m.replace(/(?:skills?|requirements|qualifications)[:\s]*/i, '')) : [];

    // Determine experience level
    let experienceLevel = 'Not specified';
    if (lowerDescription.includes('entry level') || lowerDescription.includes('junior')) {
      experienceLevel = 'Entry Level';
    } else if (lowerDescription.includes('mid level') || lowerDescription.includes('3-5 years')) {
      experienceLevel = 'Mid Level';
    } else if (lowerDescription.includes('senior') || lowerDescription.includes('5\+ years') || lowerDescription.includes('lead')) {
      experienceLevel = 'Senior Level';
    } else if (lowerDescription.includes('principal') || lowerDescription.includes('staff') || lowerDescription.includes('8\+ years')) {
      experienceLevel = 'Principal Level';
    }

    // Identify focus areas
    const focusAreas = [];
    if (lowerDescription.includes('leadership') || lowerDescription.includes('manage') || lowerDescription.includes('team')) {
      focusAreas.push('Leadership & Management');
    }
    if (lowerDescription.includes('architecture') || lowerDescription.includes('design') || lowerDescription.includes('system')) {
      focusAreas.push('System Architecture');
    }
    if (lowerDescription.includes('performance') || lowerDescription.includes('scale') || lowerDescription.includes('optimization')) {
      focusAreas.push('Performance & Scalability');
    }
    if (lowerDescription.includes('security') || lowerDescription.includes('compliance')) {
      focusAreas.push('Security');
    }
    if (lowerDescription.includes('cloud') || lowerDescription.includes('aws') || lowerDescription.includes('azure')) {
      focusAreas.push('Cloud Technologies');
    }
    if (lowerDescription.includes('frontend') || lowerDescription.includes('ui') || lowerDescription.includes('ux')) {
      focusAreas.push('Frontend Development');
    }
    if (lowerDescription.includes('backend') || lowerDescription.includes('api') || lowerDescription.includes('database')) {
      focusAreas.push('Backend Development');
    }

    return {
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Technical skills relevant to the role'],
      experienceLevel,
      focusAreas: focusAreas.length > 0 ? focusAreas : ['Relevant technical expertise']
    };
  }

  private formatContactInfo(contactInfo: ContactInfo): string {
    const parts = [];
    if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
    if (contactInfo.phone) parts.push(`Phone: ${contactInfo.phone}`);
    if (contactInfo.location) parts.push(`Location: ${contactInfo.location}`);
    if (contactInfo.linkedin) parts.push(`LinkedIn: ${contactInfo.linkedin}`);
    if (contactInfo.portfolio) parts.push(`Portfolio: ${contactInfo.portfolio}`);
    return parts.length > 0 ? parts.join('\n') : 'Contact information to be added';
  }

  private formatWorkHistory(workHistory: WorkExperience[], jobAnalysis: any): string {
    if (workHistory.length === 0) return 'Work experience to be added';

    // Sort work history by relevance to the job (most recent and most relevant first)
    const sortedHistory = [...workHistory].sort((a, b) => {
      // First by date (most recent first)
      const dateA = new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      return dateA;
    });

    return sortedHistory.map(exp => `
**${exp.role}** at ${exp.company}
*${exp.startDate} - ${exp.endDate || 'Present'}*

${exp.description}
${exp.technologies ? `**Technologies:** ${exp.technologies.join(', ')}` : ''}`).join('\n');
  }

  private formatEducation(education: Education[]): string {
    if (education.length === 0) return 'Education to be added';

    return education.map(edu => `
**${edu.degree}** in ${edu.field}
${edu.institution}
*${edu.startDate} - ${edu.endDate || 'Present'}*
${edu.gpa ? `*GPA: ${edu.gpa}*` : ''}`).join('\n');
  }

  private formatProjects(projects: Project[]): string {
    if (projects.length === 0) return '';

    return projects.map(project => `
**${project.name}**
${project.description}
**Technologies:** ${project.technologies.join(', ')}
${project.url ? `**URL:** ${project.url}` : ''}`).join('\n');
  }

  private formatCertifications(certifications: Certification[]): string {
    if (certifications.length === 0) return '';

    return certifications.map(cert => `
**${cert.name}**
${cert.issuer}
${cert.date}
${cert.url ? `**URL:** ${cert.url}` : ''}`).join('\n');
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