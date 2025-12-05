'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CityConfig {
    name: string;
    radius_miles: number;
    weight: number;
}

export interface SearchConfig {
    cities: CityConfig[];
    keywords: string[]; // Generic keywords (include)
    categories: string[]; // Job Titles
    excludeKeywords: string[];
    minSalary?: number;
    maxSalary?: number;
    recencyDays: number;
}

export interface LLMConfig {
    provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'azure' | 'custom';
    model: string;
    apiKey: string;
    apiEndpoint?: string;
    temperature: number;
    maxTokens: number;
}

export interface AutomationConfig {
    dailyApplicationLimit: number;
    autoApply: boolean;
    requireManualReview: boolean;
}

export interface AppConfig {
    search: SearchConfig;
    llm: LLMConfig;
    automation: AutomationConfig;
    version: number;
    lastUpdated: Date;
}

interface ConfigContextType {
    config: AppConfig | null;
    updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
    reloadConfig: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const DEFAULT_CONFIG: AppConfig = {
    search: {
        cities: [],
        keywords: [],
        categories: [],
        excludeKeywords: [],
        recencyDays: 30,
    },
    llm: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: '',
        temperature: 0.7,
        maxTokens: 2000,
    },
    automation: {
        dailyApplicationLimit: 20,
        autoApply: false,
        requireManualReview: true,
    },
    version: 1,
    lastUpdated: new Date(),
};

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/config');
            if (response.ok) {
                const data = await response.json();
                // Merge fetched data with default config to ensure all fields are present
                // This handles cases where the API might return an older or partial config
                const mergedConfig = {
                    ...DEFAULT_CONFIG,
                    ...data,
                    search: { ...DEFAULT_CONFIG.search, ...data.search },
                    llm: { ...DEFAULT_CONFIG.llm, ...data.llm },
                    automation: { ...DEFAULT_CONFIG.automation, ...data.automation },
                    // Ensure lastUpdated is a Date object if it comes as a string from JSON
                    lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : DEFAULT_CONFIG.lastUpdated,
                };
                setConfig(mergedConfig);
            } else {
                setConfig(DEFAULT_CONFIG);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load config');
            setConfig(DEFAULT_CONFIG);
        } finally {
            setIsLoading(false);
        }
    };

    const updateConfig = async (updates: Partial<AppConfig>) => {
        try {
            const newConfig = { ...config!, ...updates, lastUpdated: new Date() };

            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig),
            });

            if (response.ok) {
                const savedConfig = await response.json();
                setConfig(savedConfig);
            } else {
                throw new Error('Failed to save config');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update config');
            throw err;
        }
    };

    const reloadConfig = async () => {
        await loadConfig();
    };

    useEffect(() => {
        loadConfig();

        // Hot reload: poll for config changes every 30 seconds
        const interval = setInterval(() => {
            fetch('/api/config')
                .then(res => res.json())
                .then(data => {
                    if (data.version > (config?.version || 0)) {
                        setConfig(data);
                    }
                })
                .catch(() => { });
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ConfigContext.Provider value={{ config, updateConfig, reloadConfig, isLoading, error }}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
