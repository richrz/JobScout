
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, LLMConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

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

    const form = useForm<LLMConfig>({
        defaultValues: config?.llm || {
            provider: 'openai',
            model: 'gpt-5.2',
            apiKey: '',
            apiEndpoint: '',
            temperature: 0.7,
            maxTokens: 2000,
        },
    });

    const { watch, setValue } = form;
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

    // Update model when provider changes
    useEffect(() => {
        if (dynamicModels.length === 0) {
            const models = DEFAULT_MODELS[provider] || [];
            const isValidModel = models.some(m => m.value === currentModel);
            if (!isValidModel && models.length > 0) {
                setValue('model', models[0].value);
            }
        }
    }, [provider, currentModel, setValue, dynamicModels.length]);

    // Reset when config loads
    useEffect(() => {
        if (config?.llm) {
            form.reset(config.llm);
        }
    }, [config, form]);

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="provider"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provider</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a provider" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="openai">OpenAI</SelectItem>
                                        <SelectItem value="anthropic">Anthropic / Compatible</SelectItem>
                                        <SelectItem value="gemini">Google Gemini</SelectItem>
                                        <SelectItem value="ollama">Ollama</SelectItem>
                                        <SelectItem value="openrouter">OpenRouter</SelectItem>
                                        <SelectItem value="azure">Azure OpenAI</SelectItem>
                                        <SelectItem value="custom">Custom (OpenAI-Compatible)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {(provider === 'custom' || provider === 'azure' || provider === 'ollama' || provider === 'anthropic') && (
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="apiEndpoint"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Endpoint</FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={
                                                        provider === 'anthropic' ? 'https://api.anthropic.com' :
                                                            provider === 'ollama' ? 'http://localhost:11434' :
                                                                'https://api.example.com/v1'
                                                    }
                                                    className="flex-1"
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleFetchModels}
                                                disabled={!apiEndpoint || isLoadingModels}
                                            >
                                                {isLoadingModels ? '⏳' : '🔄'} Fetch Models
                                            </Button>
                                        </div>
                                        <FormDescription>
                                            Enter endpoint URL and click "Fetch Models" to load available models
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>API Key</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" placeholder="sk-... or your API key" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <FormLabel>Model</FormLabel>
                            <label className="text-xs flex items-center gap-1">
                                <Checkbox
                                    checked={useManualModel}
                                    onCheckedChange={(c) => setUseManualModel(!!c)}
                                />
                                <span className="text-body-sm">Enter manually</span>
                            </label>
                        </div>

                        {useManualModel ? (
                            <FormField
                                control={form.control}
                                name="model"
                                rules={{ required: 'Model is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter model name (e.g., gpt-4, glm-4)" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="model"
                                rules={{ required: 'Model is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoadingModels}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a model"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingModels ? (
                                                    <SelectItem value="loading" disabled>Loading models...</SelectItem>
                                                ) : availableModels.length > 0 ? (
                                                    availableModels.map(model => (
                                                        <SelectItem key={model.value} value={model.value}>
                                                            {model.label}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>No models available</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {dynamicModels.length > 0 && (
                                            <FormDescription className="text-green-600">
                                                ✓ {dynamicModels.length} models loaded from endpoint
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {modelFetchError && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⚠️ {modelFetchError} - Using default models or enter manually
                            </p>
                        )}
                    </div>

                    <details className="border rounded-xl p-4 bg-background/50">
                        <summary className="cursor-pointer font-medium text-sm">⚙️ Advanced Settings</summary>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="temperature"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Creativity (Temperature)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.1"
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                placeholder="0.7"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            0 = focused, 1 = balanced, 2 = creative
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxTokens"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Response Length</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                onChange={e => field.onChange(parseInt(e.target.value))}
                                                placeholder="2000"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Tokens in output
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </details>

                    <div className="flex gap-2 flex-wrap">
                        <Button type="button" variant="outline" onClick={testConnection}>
                            🔌 Test Connection
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? '⏳ Saving...' : '💾 Save Settings'}
                        </Button>
                    </div>

                    {testResult && (
                        <div className={`p-3 rounded-lg text-sm ${testResult.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            testResult.includes('❌') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {testResult}
                        </div>
                    )}
                </div>
            </form>
        </Form>
    );
}
