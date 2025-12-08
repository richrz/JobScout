# Task ID: 16

**Title:** Develop LLM Integration Layer with Multi-Provider Support

**Status:** pending

**Dependencies:** 15

**Priority:** high

**Description:** Build the provider-agnostic LLM client using LangChain that supports OpenAI, Anthropic, Ollama, OpenRouter, Azure OpenAI, and custom endpoints with configurable temperature/token settings and resume generation prompts.

**Details:**

1. Install LangChain dependencies:
   ```bash
   npm install @langchain/openai @langchain/anthropic @langchain/community
   npm install langchain
   ```

2. Create LLM client factory:
   ```typescript
   // src/lib/llm.ts
   import { ChatOpenAI } from '@langchain/openai';
   import { ChatAnthropic } from '@langchain/anthropic';

   export interface LLMConfig {
     provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'azure' | 'custom';
     model: string;
     temperature: number;
     maxTokens: number;
     apiKey?: string;
     apiEndpoint?: string;
   }

   export function getLLMClient(config: LLMConfig) {
     switch (config.provider) {
       case 'openai':
         return new ChatOpenAI({
           modelName: config.model,
           temperature: config.temperature,
           maxTokens: config.maxTokens,
           openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
         });
       case 'anthropic':
         return new ChatAnthropic({
           modelName: config.model,
           temperature: config.temperature,
           maxTokens: config.maxTokens,
           anthropicApiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
         });
       case 'ollama':
         return new ChatOpenAI({
           modelName: config.model,
           temperature: config.temperature,
           maxTokens: config.maxTokens,
           configuration: {
             baseURL: config.apiEndpoint || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
           },
         });
       case 'custom':
         return new ChatOpenAI({
           modelName: config.model,
           temperature: config.temperature,
           maxTokens: config.maxTokens,
           openAIApiKey: config.apiKey,
           configuration: {
             baseURL: config.apiEndpoint,
           },
         });
       default:
         throw new Error(`Unsupported provider: ${config.provider}`);
     }
   }
   ```

3. Create resume generation service:
   ```typescript
   // src/lib/resume-generator.ts
   export async function generateTailoredResume(
     jobDescription: string,
     userProfile: Profile,
     exaggerationLevel: 'conservative' | 'balanced' | 'strategic',
     llmConfig: LLMConfig
   ) {
     const llm = getLLMClient(llmConfig);
     
     const systemPrompt = `You are an expert resume writer. Given a job description and a candidate's master profile, generate a tailored resume that:
     1. Highlights relevant experience for this specific role
     2. Uses keywords from the job description naturally
     3. Reorders work history to prioritize relevant roles
     4. Adjusts tone based on exaggeration level: ${exaggerationLevel}
        - Conservative: Factual, no embellishment
        - Balanced: Professional emphasis
        - Strategic: Confident, persuasive
     
     Output should be ATS-friendly markdown format.`;

     const userPrompt = `Job Description:\n${jobDescription}\n\nCandidate Profile:\n${JSON.stringify(userProfile)}\n\nGenerate tailored resume sections: Summary, Experience, Skills, Education.`;

     const response = await llm.invoke([
       { role: 'system', content: systemPrompt },
       { role: 'user', content: userPrompt }
     ]);

     return response.content;
   }
   ```

4. Map exaggeration levels to temperature:
   - Conservative: 0.3
   - Balanced: 0.5
   - Strategic: 0.7

5. Create LLM connection test endpoint
6. Implement error handling and retry logic
7. Add streaming support for real-time generation
8. Perform end-to-end integration verification with Settings page

**Test Strategy:**

1. Test each provider (OpenAI, Anthropic, Ollama) with valid API keys
2. Verify temperature mapping affects output tone
3. Test resume generation with sample job description + profile
4. Validate markdown output is ATS-friendly
5. Test connection test endpoint for each provider
6. Verify error handling for invalid API keys
7. Test retry logic on API failures
8. Confirm streaming works for real-time updates
9. Test custom endpoint configuration
10. Validate token limits are respected
11. Verify end-to-end flow from Settings page (API key entry -> Connection Test -> Generation)

## Subtasks

### 16.6. Verify End-to-End Integration with Settings UI

**Status:** pending  
**Dependencies:** 16.5  

Validate full integration between LLM backend and Settings page, ensuring connection tests and resume generation work as expected

**Details:**

Conduct end-to-end testing to verify that the LLM integration layer functions correctly when interacted with via the Settings page. Ensure that: 1. API keys provided in the Settings UI are correctly used for authentication. 2. The Connection Test feature in Settings returns success for valid credentials. 3. The resume generation process can be initiated and produces non-empty, valid output. 4. Verify that the system handles configuration changes (hot reload) correctly without restart.

### 16.1. Design Provider-Agnostic LLM Client Interface

**Status:** done  
**Dependencies:** None  

Create the foundational interface and configuration structure for the multi-provider LLM client

**Details:**

Define LLMConfig interface with provider types, model parameters, and exaggeration level mapping. Establish TypeScript interfaces that abstract provider-specific implementations. Create the getLLMClient factory function skeleton with proper typing and dependency management.

### 16.2. Implement Individual Provider Adapters

**Status:** done  
**Dependencies:** 16.1  

Build concrete implementations for each LLM provider with proper configuration handling

**Details:**

Complete the getLLMClient factory with implementations for OpenAI, Anthropic, Ollama, OpenRouter, Azure OpenAI, and custom endpoints. Handle provider-specific configuration parameters, API key management, and endpoint URLs. Ensure proper error handling for missing credentials and invalid configurations.

### 16.3. Engineer Resume Generation Prompt System

**Status:** done  
**Dependencies:** 16.1, 16.2  

Develop the prompt engineering system for tailored resume generation with exaggeration levels

**Details:**

Implement generateTailoredResume function with dynamic system prompts based on exaggeration levels. Map exaggeration levels to temperature parameters (Conservative: 0.3, Balanced: 0.5, Strategic: 0.7). Structure prompts to highlight relevant experience, use job description keywords, and reorder work history while maintaining ATS-friendly format.
<info added on 2025-11-20T18:28:07.771Z>
Plan: Develop the prompt engineering system for tailored resume generation with exaggeration levels.

Implementation steps:
1. Analyze existing ResumeGenerator class structure and interfaces
2. Design prompt engineering system architecture with modular prompt components
3. Create dynamic system prompts based on exaggeration levels (conservative, balanced, strategic)
4. Map exaggeration levels to temperature parameters (Conservative: 0.3, Balanced: 0.5, Strategic: 0.7)
5. Implement generateTailoredResume function with comprehensive prompt engineering
6. Structure prompts to highlight relevant experience and use job description keywords
7. Create ATS-friendly markdown format templates and structures
8. Implement work history reordering logic based on job relevance
9. Add keyword extraction and integration from job descriptions
10. Test with sample job descriptions and profiles
11. Validate ATS-friendly markdown output format
12. Test exaggeration level effects on generated tone

Files to modify:
- src/lib/llm.ts (implement generateTailoredResume and generateTailoredResumeStream methods)

This will enable intelligent resume tailoring that adapts tone and content based on user-defined exaggeration levels while maintaining ATS compatibility.
</info added on 2025-11-20T18:28:07.771Z>

### 16.4. Build LLM Connection Testing Framework

**Status:** done  
**Dependencies:** 16.1, 16.2  

Create endpoint and utilities for testing LLM provider connections

**Details:**

Implement connection test endpoint that validates API connectivity for each provider. Include tests for authentication, model availability, and basic response generation. Provide clear error messages for different failure scenarios including network issues and invalid credentials.
<info added on 2025-11-20T18:36:08.196Z>
Plan: Build comprehensive LLM connection testing framework with endpoint and utilities.

Implementation steps:
1. Analyze existing LLMClient testConnection methods across all providers
2. Create connection testing utilities with enhanced error categorization
3. Build API endpoint /api/llm/test-connection for real-time connection testing
4. Implement batch connection testing for multiple providers
5. Add detailed error message categorization (auth errors, network errors, model availability)
6. Create configuration validation utilities for all provider types
7. Implement timeout handling and retry logic for connection tests
8. Build test scenarios including valid/invalid credentials and network failures
9. Create connection status reporting with detailed diagnostics
10. Add integration with existing LLM configuration system

Files to create/modify:
- src/app/api/llm/test-connection/route.ts (new API endpoint)
- src/lib/llm-testing.ts (new testing utilities)
- src/lib/llm.ts (enhance connection testing if needed)
- tests/lib/llm-testing.test.ts (comprehensive test suite)

This will provide robust connection testing capabilities with clear error reporting for all supported LLM providers, enabling users to validate their configuration and troubleshoot connectivity issues effectively.
</info added on 2025-11-20T18:36:08.196Z>
<info added on 2025-11-20T18:41:24.144Z>
Task completed successfully.

Implementation Summary:
Created comprehensive LLM connection testing framework with endpoint and utilities.

1. Enhanced Connection Testing Utilities (src/lib/llm-testing.ts):
- LLMConnectionTester class with advanced error categorization
- DetailedConnectionTest and BatchConnectionTest interfaces
- ConnectionTestError class with proper typing
- Utility functions: quickConnectionTest, comprehensiveConnectionTest, testAllProviders

2. API Endpoint (src/app/api/llm/test-connection/route.ts):
- POST endpoint for connection testing (single, batch, quick, and comprehensive modes)
- GET endpoint for configuration validation
- Authentication and comprehensive error handling implemented

3. Error Categorization System:
- Covers authentication, network, configuration, model_unavailable, timeout, and unknown errors

4. Advanced Features:
- Configurable timeouts and retry logic with exponential backoff
- Diagnostic information collection
- Provider-specific configuration validation
- Batch testing with statistics

5. Test Coverage (tests/lib/llm-testing.test.ts):
- Includes configuration validation, single/batch connection tests, error categorization, and mock implementations

The framework supports OpenAI, Anthropic, Ollama, OpenRouter, Azure, and Custom providers, enabling effective configuration validation and troubleshooting. All files follow existing project patterns and TypeScript best practices.
</info added on 2025-11-20T18:41:24.144Z>
<info added on 2025-11-21T17:51:40.881Z>
Completed LLM connection testing framework. Hardened llm-testing utilities including error categorization, diagnostics, batch statistics, and retry mechanisms. Aligned types for structured errors and minimal tester implementation. Added unit coverage for connection testing suites.
</info added on 2025-11-21T17:51:40.881Z>

### 16.5. Implement Error Handling and Streaming Support

**Status:** done  
**Dependencies:** 16.2, 16.3, 16.4  

Add robust error handling, retry logic, and real-time streaming capabilities

**Details:**

Implement retry logic with exponential backoff for API failures. Add comprehensive error handling for rate limits, authentication issues, and timeouts. Integrate streaming support for real-time resume generation updates using LangChain's streaming capabilities and proper chunk handling.
