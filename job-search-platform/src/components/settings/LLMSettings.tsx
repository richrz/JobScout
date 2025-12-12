'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, LLMConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Default model options per provider - Verified December 2025
const DEFAULT_MODELS: Record<string, { value: string; label: string }[]> = {
    openai: [
        { value: 'gpt-5.2', label: 'GPT-5.2 (Latest)' },
        { value: 'gpt-5.2-thinking', label: 'GPT-5.2 Thinking' },
        { value: 'gpt-5.1', label: 'GPT-5.1' },
        { value: 'gpt-5', label: 'GPT-5' },
        { value: 'gpt-5-mini', label: 'GPT-5 Mini (Fast)' },
        { value: 'gpt-5-nano', label: 'GPT-5 Nano (Fastest)' },
        { value: 'o3-mini', label: 'o3-mini (Reasoning)' },
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4o', label: 'GPT-4o' },
    ],
    anthropic: [
        { value: 'claude-opus-4.5-20251124', label: 'Claude Opus 4.5 (Latest)' },
        { value: 'claude-sonnet-4.5-20250929', label: 'Claude Sonnet 4.5' },
        { value: 'claude-haiku-4.5-20251015', label: 'Claude Haiku 4.5 (Fast)' },
        { value: 'claude-opus-4.1-20250805', label: 'Claude Opus 4.1' },
        { value: 'claude-opus-4-20250522', label: 'Claude Opus 4' },
        { value: 'claude-sonnet-4-20250522', label: 'Claude Sonnet 4' },
    ],
    gemini: [
        { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview (Latest)' },
        { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image' },
        { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
        { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    ],
    ollama: [
        { value: 'llama4', label: 'Llama 4 (Latest)' },
        { value: 'llama4:scout', label: 'Llama 4 Scout (17B)' },
        { value: 'llama4:maverick', label: 'Llama 4 Maverick' },
        { value: 'llama3.2', label: 'Llama 3.2' },
        { value: 'deepseek-r1', label: 'DeepSeek R1' },
        { value: 'qwen3', label: 'Qwen 3' },
        { value: 'mistral-large-3', label: 'Mistral Large 3' },
        { value: 'glm-4.6', label: 'GLM-4.6' },
    ],
    openrouter: [
        { value: 'openai/gpt-5.2', label: 'GPT-5.2' },
        { value: 'anthropic/claude-opus-4.5', label: 'Claude Opus 4.5' },
        { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
        { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { value: 'meta-llama/llama-4-maverick', label: 'Llama 4 Maverick' },
        { value: 'deepseek/deepseek-v3', label: 'DeepSeek V3' },
        { value: 'qwen/qwen3-235b', label: 'Qwen3 235B' },
    ],
    azure: [
        { value: 'gpt-5', label: 'GPT-5' },
        { value: 'gpt-4.1', label: 'GPT-4.1' },
        { value: 'gpt-4o', label: 'GPT-4o' },
    ],
    custom: [],
};

interface ModelOption {
    value: string;
    label: string;
}

export function LLMSettings() {
    const { config, updateConfig, isLoading } = useConfig();
    const [testResult, setTestResult] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [dynamicModels, setDynamicModels] = useState<ModelOption[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [modelFetchError, setModelFetchError] = useState<string | null>(null);
    const [useManualModel, setUseManualModel] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LLMConfig>({
        defaultValues: config?.llm,
    });

    const provider = watch('provider') || 'openai';
    const currentModel = watch('model');
    const apiEndpoint = watch('apiEndpoint');
    const apiKey = watch('apiKey');

    // Fetch models from endpoint (OpenAI-compatible /v1/models or /models)
    const fetchModels = useCallback(async (endpoint: string, key?: string) => {
        setIsLoadingModels(true);
        setModelFetchError(null);

        try {
            // Try /v1/models first, then /models
            const baseUrl = endpoint.replace(/\/+$/, ''); // Remove trailing slashes
            const endpoints = [
                `${baseUrl}/v1/models`,
                `${baseUrl}/models`,
            ];

            for (const url of endpoints) {
                try {
                    const headers: Record<string, string> = {
                        'Content-Type': 'application/json',
                    };

                    if (key) {
                        headers['Authorization'] = `Bearer ${key}`;
                    }

                    const response = await fetch(url, {
                        method: 'GET',
                        headers,
                    });

                    if (response.ok) {
                        const data = await response.json();

                        // Handle OpenAI-compatible response format
                        if (data.data && Array.isArray(data.data)) {
                            const models = data.data.map((m: any) => ({
                                value: m.id,
                                label: m.id,
                            }));
                            setDynamicModels(models);
                            setIsLoadingModels(false);
                            return models;
                        }

                        // Handle Ollama format
                        if (data.models && Array.isArray(data.models)) {
                            const models = data.models.map((m: any) => ({
                                value: m.name || m.model,
                                label: m.name || m.model,
                            }));
                            setDynamicModels(models);
                            setIsLoadingModels(false);
                            return models;
                        }
                    }
                } catch (e) {
                    // Try next endpoint
                    continue;
                }
            }

            // If all endpoints fail, show error
            setModelFetchError('Could not fetch models from endpoint');
            setDynamicModels([]);
        } catch (error) {
            setModelFetchError('Failed to fetch models');
            setDynamicModels([]);
        } finally {
            setIsLoadingModels(false);
        }

        return [];
    }, []);

    // Fetch models when endpoint changes
    useEffect(() => {
        if (apiEndpoint && (provider === 'anthropic' || provider === 'custom' || provider === 'ollama')) {
            // Debounce the fetch
            const timer = setTimeout(() => {
                fetchModels(apiEndpoint, apiKey);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            // Clear dynamic models when no endpoint
            setDynamicModels([]);
            setModelFetchError(null);
        }
    }, [apiEndpoint, apiKey, provider, fetchModels]);

    // Determine which models to show
    const availableModels = dynamicModels.length > 0
        ? dynamicModels
        : (DEFAULT_MODELS[provider] || []);

    // Update model when provider changes (only if not using dynamic models)
    useEffect(() => {
        if (dynamicModels.length === 0) {
            const models = DEFAULT_MODELS[provider] || [];
            const isValidModel = models.some(m => m.value === currentModel);
            if (!isValidModel && models.length > 0) {
                setValue('model', models[0].value);
            }
        }
    }, [provider, currentModel, setValue, dynamicModels.length]);

    const testConnection = async () => {
        setTestResult('Testing...');
        try {
            const response = await fetch('/api/llm/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(watch()),
            });

            const result = await response.json();
            setTestResult(result.success ? '✅ Connection successful!' : `❌ ${result.error}`);
        } catch (error) {
            setTestResult('❌ Connection failed');
        }
    };

    const onSubmit = async (data: LLMConfig) => {
        setIsSaving(true);
        setTestResult(null);
        try {
            await updateConfig({ llm: data });
            setTestResult('✅ Settings saved successfully!');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setTestResult(`❌ ${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFetchModels = () => {
        if (apiEndpoint) {
            fetchModels(apiEndpoint, apiKey);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="provider">Provider</Label>
                    <select
                        id="provider"
                        {...register('provider')}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic / Compatible</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="ollama">Ollama</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="azure">Azure OpenAI</option>
                        <option value="custom">Custom (OpenAI-Compatible)</option>
                    </select>
                </div>

                {/* API Endpoint - shown for providers that support custom endpoints */}
                {(provider === 'custom' || provider === 'azure' || provider === 'ollama' || provider === 'anthropic') && (
                    <div>
                        <Label htmlFor="apiEndpoint">API Endpoint</Label>
                        <div className="flex gap-2">
                            <Input
                                id="apiEndpoint"
                                {...register('apiEndpoint')}
                                placeholder={
                                    provider === 'anthropic' ? 'https://api.anthropic.com' :
                                        provider === 'ollama' ? 'http://localhost:11434' :
                                            'https://api.example.com/v1'
                                }
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleFetchModels}
                                disabled={!apiEndpoint || isLoadingModels}
                            >
                                {isLoadingModels ? '⏳' : '🔄'} Fetch Models
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Enter endpoint URL and click "Fetch Models" to load available models
                        </p>
                    </div>
                )}

                {/* API Key */}
                <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                        id="apiKey"
                        type="password"
                        {...register('apiKey')}
                        placeholder="sk-... or your API key"
                    />
                </div>

                {/* Model Selection */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <Label htmlFor="model">Model</Label>
                        <label className="text-xs flex items-center gap-1">
                            <input
                                type="checkbox"
                                checked={useManualModel}
                                onChange={(e) => setUseManualModel(e.target.checked)}
                            />
                            Enter manually
                        </label>
                    </div>

                    {useManualModel ? (
                        <Input
                            id="model"
                            {...register('model', { required: 'Model is required' })}
                            placeholder="Enter model name (e.g., gpt-4, glm-4)"
                        />
                    ) : (
                        <>
                            <select
                                id="model"
                                {...register('model', { required: 'Model is required' })}
                                className="w-full border rounded px-3 py-2"
                                disabled={isLoadingModels}
                            >
                                {isLoadingModels ? (
                                    <option>Loading models...</option>
                                ) : availableModels.length > 0 ? (
                                    availableModels.map(model => (
                                        <option key={model.value} value={model.value}>
                                            {model.label}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No models available</option>
                                )}
                            </select>
                            {dynamicModels.length > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                    ✓ {dynamicModels.length} models loaded from endpoint
                                </p>
                            )}
                        </>
                    )}

                    {modelFetchError && (
                        <p className="text-xs text-amber-600 mt-1">
                            ⚠️ {modelFetchError} - Using default models or enter manually
                        </p>
                    )}
                    {errors.model && (
                        <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
                    )}
                </div>

                {/* Advanced Settings */}
                <details className="border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-sm">⚙️ Advanced Settings</summary>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="temperature">Creativity (Temperature)</Label>
                            <Input
                                id="temperature"
                                type="number"
                                step="0.1"
                                {...register('temperature', { valueAsNumber: true, min: 0, max: 2 })}
                                placeholder="0.7"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                0 = focused, 1 = balanced, 2 = creative
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="maxTokens">Max Response Length</Label>
                            <Input
                                id="maxTokens"
                                type="number"
                                {...register('maxTokens', { valueAsNumber: true })}
                                placeholder="2000"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Tokens in generated output (not context window)
                            </p>
                        </div>
                    </div>
                </details>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <Button type="button" variant="outline" onClick={testConnection}>
                        🔌 Test Connection
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? '⏳ Saving...' : '💾 Save Settings'}
                    </Button>
                </div>

                {/* Status Messages */}
                {testResult && (
                    <div className={`p-3 rounded text-sm ${testResult.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                        testResult.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        {testResult}
                    </div>
                )}
            </div>
        </form>
    );
}
