#!/usr/bin/env npx tsx
/**
 * Test Azure Anthropic with Model ID Mapping
 * 
 * Usage: npx tsx scripts/test-azure-anthropic.ts
 * 
 * Required: ANTHROPIC_BASE_URL, ANTHROPIC_API_KEY
 * Optional: ANTHROPIC_MODEL_ID, AZURE_ANTHROPIC_DEPLOYMENT
 */

import { ChatAnthropic } from '@langchain/anthropic';

const AZURE_TO_ANTHROPIC_MODEL_MAP: Record<string, string> = {
  'claude-3-sonnet': 'claude-3-sonnet-20240229',
  'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-3-opus': 'claude-3-opus-20240229',
  'claude-3-haiku': 'claude-3-haiku-20240307',
  'claude-sonnet': 'claude-3-5-sonnet-20241022',
  'claude-opus': 'claude-3-opus-20240229',
  'claude-haiku': 'claude-3-haiku-20240307',
};

function resolveModelId(deploymentOrModel: string): string {
  if (/claude-\d+-\d{8}/.test(deploymentOrModel) || /claude-\d+-\d+-\w+-\d{8}/.test(deploymentOrModel)) {
    return deploymentOrModel;
  }
  
  const mapped = AZURE_TO_ANTHROPIC_MODEL_MAP[deploymentOrModel.toLowerCase()];
  if (mapped) {
    console.log(`📍 Mapped Azure deployment '${deploymentOrModel}' → '${mapped}'`);
    return mapped;
  }
  
  console.log(`⚠️  No mapping found for '${deploymentOrModel}', using as-is`);
  return deploymentOrModel;
}

async function testAzureAnthropic(): Promise<void> {
  console.log('🔬 Testing Azure Anthropic Integration\n');
  console.log('='.repeat(50));
  
  const baseURL = process.env.ANTHROPIC_BASE_URL;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const rawModel = process.env.ANTHROPIC_MODEL_ID || process.env.AZURE_ANTHROPIC_DEPLOYMENT || 'claude-3-5-sonnet-20241022';
  
  if (!baseURL) {
    console.error('❌ ANTHROPIC_BASE_URL environment variable is required');
    console.log('\nExample: export ANTHROPIC_BASE_URL="https://your-azure-endpoint/anthropic"');
    process.exit(1);
  }
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }
  
  const modelId = resolveModelId(rawModel);
  
  console.log('\n📋 Configuration:');
  console.log(`   Base URL: ${baseURL}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);
  console.log(`   Raw Model: ${rawModel}`);
  console.log(`   Resolved Model: ${modelId}`);
  console.log('');
  
  console.log('📡 Test 1: Basic Connectivity');
  console.log('-'.repeat(30));
  
  try {
    const client = new ChatAnthropic({
      model: modelId,
      temperature: 0,
      maxTokens: 100,
      anthropicApiKey: apiKey,
      clientOptions: { baseURL },
    });
    
    const startTime = Date.now();
    const response = await client.invoke([
      { role: 'user', content: 'Say "Azure Anthropic connection successful!" and nothing else.' }
    ]);
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Connected successfully in ${responseTime}ms`);
    console.log(`   Response: ${response.content}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Connection failed:', error instanceof Error ? error.message : error);
    console.log('');
    
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('authentication')) {
        console.log('💡 Hint: Check your API key is correct and has Anthropic access');
      } else if (msg.includes('404') || msg.includes('not found')) {
        console.log('💡 Hint: Check your base URL and deployment name are correct');
      } else if (msg.includes('model')) {
        console.log('💡 Hint: The model ID might need mapping. Try setting AZURE_ANTHROPIC_DEPLOYMENT');
      } else if (msg.includes('timeout') || msg.includes('econnrefused')) {
        console.log('💡 Hint: Check network connectivity to the Azure endpoint');
      }
    }
    process.exit(1);
  }
  
  console.log('🧠 Test 2: Model Capabilities');
  console.log('-'.repeat(30));
  
  try {
    const client = new ChatAnthropic({
      model: modelId,
      temperature: 0.7,
      maxTokens: 200,
      anthropicApiKey: apiKey,
      clientOptions: { baseURL },
    });
    
    const startTime = Date.now();
    const response = await client.invoke([
      { role: 'user', content: 'What is 2+2? Respond with just the number.' }
    ]);
    const responseTime = Date.now() - startTime;
    
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    const isCorrect = content.includes('4');
    
    console.log(`${isCorrect ? '✅' : '⚠️'} Response in ${responseTime}ms: "${content.trim()}"`);
    
    if (response.usage_metadata) {
      console.log(`   Tokens: ${JSON.stringify(response.usage_metadata)}`);
    }
    console.log('');
    
  } catch (error) {
    console.error('❌ Capability test failed:', error instanceof Error ? error.message : error);
    console.log('');
  }
  
  console.log('🌊 Test 3: Streaming Support');
  console.log('-'.repeat(30));
  
  try {
    const client = new ChatAnthropic({
      model: modelId,
      temperature: 0,
      maxTokens: 50,
      anthropicApiKey: apiKey,
      clientOptions: { baseURL },
    });
    
    const startTime = Date.now();
    const stream = await client.stream([
      { role: 'user', content: 'Count from 1 to 5, one number per line.' }
    ]);
    
    let fullResponse = '';
    let chunkCount = 0;
    
    for await (const chunk of stream) {
      const content = typeof chunk.content === 'string' ? chunk.content : '';
      fullResponse += content;
      chunkCount++;
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ Streaming works! ${chunkCount} chunks in ${responseTime}ms`);
    console.log(`   Response: "${fullResponse.trim().replace(/\n/g, ' ')}"`);
    console.log('');
    
  } catch (error) {
    console.error('⚠️ Streaming test failed (may not be supported):', error instanceof Error ? error.message : error);
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log('✅ Azure Anthropic integration test complete!');
  console.log('');
  console.log('📝 To use in your app:');
  console.log('   1. Set ANTHROPIC_BASE_URL in your .env');
  console.log('   2. Set ANTHROPIC_API_KEY in your .env');
  console.log('   3. Select "Anthropic" as provider in LLM Settings');
  console.log('   4. Enter the custom endpoint URL');
  console.log('');
}

testAzureAnthropic().catch(console.error);
