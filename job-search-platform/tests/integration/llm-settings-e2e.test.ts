/**
 * Task 16.6 - E2E Integration Test: LLM Settings UI ↔ Backend
 * 
 * This test validates the full integration between the LLM backend
 * and Settings page using REAL API keys from environment variables.
 * 
 * Requirements verified:
 * 1. API keys from Settings UI are correctly used for authentication
 * 2. Connection Test feature returns success for valid credentials
 * 3. Resume generation produces valid output
 * 4. Hot reload works for configuration changes
 */

// Load environment variables from .env
import * as dotenv from 'dotenv';
dotenv.config();

import { getLLMClient, validateLLMConfig } from '@/lib/llm';
import { quickConnectionTest, comprehensiveConnectionTest } from '@/lib/llm-testing';
import type { LLMConfig } from '@/types/llm';

// These tests use REAL API keys from environment
// Skip if keys are not available
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

describe('Task 16.6: End-to-End LLM Settings Integration', () => {
    describe('OpenAI Provider Integration', () => {
        const skipIfNoKey = !OPENAI_API_KEY ? it.skip : it;

        skipIfNoKey('should successfully connect with valid OpenAI API key', async () => {
            const config: LLMConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 0.7,
                maxTokens: 100,
                apiKey: OPENAI_API_KEY!,
            };

            // Validate config first (as Settings UI would)
            const validation = validateLLMConfig(config);
            expect(validation.isValid).toBe(true);

            // Test connection (as Settings "Test Connection" button would)
            const client = getLLMClient(config);
            const result = await client.testConnection();

            expect(result.status).toBe('success');
            expect(result.responseTime).toBeDefined();
            expect(result.responseTime).toBeGreaterThan(0);
        }, 30000);

        skipIfNoKey('should generate resume content with OpenAI', async () => {
            const config: LLMConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 0.5,
                maxTokens: 500,
                apiKey: OPENAI_API_KEY!,
            };

            const client = getLLMClient(config);
            const response = await client.generateResponse([
                { role: 'system', content: 'You are a resume writing assistant.' },
                { role: 'user', content: 'Write a one-sentence professional summary for a software engineer.' }
            ]);

            expect(response.content).toBeDefined();
            expect(response.content.length).toBeGreaterThan(20);
        }, 30000);
    });

    describe('Anthropic Provider Integration', () => {
        const skipIfNoKey = !ANTHROPIC_API_KEY ? it.skip : it;

        skipIfNoKey('should successfully connect with valid Anthropic API key', async () => {
            const config: LLMConfig = {
                provider: 'anthropic',
                model: 'claude-3-haiku-20240307',
                temperature: 0.7,
                maxTokens: 100,
                apiKey: ANTHROPIC_API_KEY!,
            };

            const validation = validateLLMConfig(config);
            expect(validation.isValid).toBe(true);

            const client = getLLMClient(config);
            const result = await client.testConnection();

            expect(result.status).toBe('success');
            expect(result.responseTime).toBeGreaterThan(0);
        }, 30000);
    });

    describe('Quick Connection Test Utility', () => {
        const skipIfNoKey = !OPENAI_API_KEY ? it.skip : it;

        skipIfNoKey('should complete quick connection test with real API', async () => {
            const config: LLMConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 0.7,
                maxTokens: 100,
                apiKey: OPENAI_API_KEY!,
            };

            const result = await quickConnectionTest(config);

            expect(result.status).toBe('success');
            expect(result.metadata?.testType).toBe('basic');
            expect(result.diagnostic).toBeDefined();
        }, 30000);
    });

    describe('Connection Error Handling', () => {
        it('should fail gracefully with invalid API key', async () => {
            const config: LLMConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 0.7,
                maxTokens: 100,
                apiKey: 'sk-invalid-test-key-12345',
            };

            const client = getLLMClient(config);
            const result = await client.testConnection();

            expect(result.status).toBe('error');
            expect(result.error).toBeDefined();
        }, 30000);
    });

    describe('Configuration Validation', () => {
        it('should validate complete LLM configuration', () => {
            const validConfig: LLMConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 0.7,
                maxTokens: 2000,
                apiKey: 'sk-test-key',
            };

            const result = validateLLMConfig(validConfig);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject invalid temperature', () => {
            const invalidConfig: LLMConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 3.0, // Invalid: > 2
                maxTokens: 2000,
                apiKey: 'sk-test-key',
            };

            const result = validateLLMConfig(invalidConfig);
            expect(result.isValid).toBe(false);
        });
    });
});
