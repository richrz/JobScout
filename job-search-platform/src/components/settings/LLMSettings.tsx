'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, LLMConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LLMSettings() {
    const { config, updateConfig, isLoading } = useConfig();
    const [testResult, setTestResult] = useState<string | null>(null);
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LLMConfig>({
        defaultValues: config?.llm,
    });

    const provider = watch('provider');

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
        try {
            await updateConfig({ llm: data });
            alert('LLM settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
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
                        <option value="anthropic">Anthropic</option>
                        <option value="ollama">Ollama</option>
                        <option value="openrouter">OpenRouter</option>
                        <option value="azure">Azure OpenAI</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                        id="model"
                        {...register('model', { required: 'Model is required' })}
                        placeholder="gpt-4o-mini"
                    />
                    {errors.model && (
                        <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                        id="apiKey"
                        type="password"
                        {...register('apiKey')}
                        placeholder="sk-..."
                    />
                </div>

                {(provider === 'custom' || provider === 'azure' || provider === 'ollama') && (
                    <div>
                        <Label htmlFor="apiEndpoint">API Endpoint</Label>
                        <Input
                            id="apiEndpoint"
                            {...register('apiEndpoint')}
                            placeholder="https://api.example.com/v1"
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="temperature">Temperature</Label>
                        <Input
                            id="temperature"
                            type="number"
                            step="0.1"
                            {...register('temperature', { valueAsNumber: true, min: 0, max: 2 })}
                            placeholder="0.7"
                        />
                    </div>

                    <div>
                        <Label htmlFor="maxTokens">Max Tokens</Label>
                        <Input
                            id="maxTokens"
                            type="number"
                            {...register('maxTokens', { valueAsNumber: true })}
                            placeholder="2000"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={testConnection}>
                        Test Connection
                    </Button>
                    {testResult && <span className="flex items-center">{testResult}</span>}
                </div>
            </div>

            <Button type="submit">Save Settings</Button>
        </form>
    );
}
