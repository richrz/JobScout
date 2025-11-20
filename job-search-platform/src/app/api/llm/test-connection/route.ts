import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-utils';
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

// POST /api/llm/test-connection - Test LLM provider connections
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { config, options, testType = 'single' } = body;

    // Validate request body
    if (!config) {
      return NextResponse.json(
        { error: 'LLM configuration is required' },
        { status: 400 }
      );
    }

    let result: DetailedConnectionTest | BatchConnectionTest;

    switch (testType) {
      case 'quick':
        result = await quickConnectionTest(config);
        break;

      case 'comprehensive':
        result = await comprehensiveConnectionTest(config);
        break;

      case 'batch':
        if (!Array.isArray(config) || config.length === 0) {
          return NextResponse.json(
            { error: 'Batch testing requires an array of configurations' },
            { status: 400 }
          );
        }
        result = await testAllProviders(config, options);
        break;

      case 'single':
      default:
        result = await LLMConnectionTester.testSingleProvider(config, options);
        break;
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error testing LLM connection:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/llm/test-connection - Get connection testing status and available options
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'validate-config':
        const configParam = searchParams.get('config');
        if (!configParam) {
          return NextResponse.json(
            { error: 'Configuration parameter is required for validation' },
            { status: 400 }
          );
        }

        try {
          const config: LLMConfig = JSON.parse(decodeURIComponent(configParam));
          const validation = await LLMConnectionTester.testProviderConfiguration(config);

          return NextResponse.json({
            success: true,
            validation,
            timestamp: new Date().toISOString(),
          });
        } catch (parseError) {
          return NextResponse.json(
            {
              error: 'Invalid configuration format',
              details: parseError instanceof Error ? parseError.message : 'Parse error'
            },
            { status: 400 }
          );
        }

      default:
        // Return connection testing information and available options
        return NextResponse.json({
          success: true,
          info: {
            availableTestTypes: [
              {
                type: 'single',
                description: 'Test a single LLM provider configuration',
                options: ['timeout', 'retryAttempts', 'includeDiagnostic', 'testModelAvailability']
              },
              {
                type: 'quick',
                description: 'Fast connection test (15s timeout, 1 retry)',
                purpose: 'Quick connectivity check'
              },
              {
                type: 'comprehensive',
                description: 'Thorough test with model availability check (45s timeout, 3 retries)',
                purpose: 'Complete validation including response generation'
              },
              {
                type: 'batch',
                description: 'Test multiple provider configurations simultaneously',
                options: ['timeout', 'retryAttempts', 'includeDiagnostic', 'testModelAvailability']
              }
            ],
            supportedProviders: [
              'openai',
              'anthropic',
              'ollama',
              'openrouter',
              'azure',
              'custom'
            ],
            defaultOptions: {
              timeout: 30000,
              retryAttempts: 2,
              includeDiagnostic: true,
              testModelAvailability: false
            },
            errorTypes: [
              'authentication',
              'network',
              'configuration',
              'model_unavailable',
              'timeout',
              'unknown'
            ],
            usage: {
              single: 'POST with { config: LLMConfig, options?: ConnectionTestOptions }',
              batch: 'POST with { config: LLMConfig[], options?: ConnectionTestOptions, testType: "batch" }',
              validation: 'GET ?action=validate-config&config=<encoded_config>'
            }
          },
          timestamp: new Date().toISOString(),
        });
    }

  } catch (error) {
    console.error('Error getting connection test info:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}