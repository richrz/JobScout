
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchSettings } from './SearchSettings';
import { LLMSettings } from './LLMSettings';
import { AutomationSettings } from './AutomationSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { ShellCard } from '@/components/layout/ShellCard';

export function SettingsPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-gradient-primary">Settings</h1>
                <p className="text-muted-foreground text-lg">Configure your search preferences, AI models, and automation rules.</p>
            </div>

            <Tabs defaultValue="search" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                    <TabsTrigger value="search" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Search Parameters</TabsTrigger>
                    <TabsTrigger value="llm" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">LLM Configuration</TabsTrigger>
                    <TabsTrigger value="automation" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Automation</TabsTrigger>
                    <TabsTrigger value="advanced" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ShellCard className="p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight">Search Parameters</h2>
                            <p className="text-sm text-muted-foreground">Define what jobs you are looking for.</p>
                        </div>
                        <SearchSettings />
                    </ShellCard>
                </TabsContent>

                <TabsContent value="llm" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ShellCard className="p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight">LLM Configuration</h2>
                            <p className="text-sm text-muted-foreground">Connect your AI provider for resume generation and analysis.</p>
                        </div>
                        <LLMSettings />
                    </ShellCard>
                </TabsContent>

                <TabsContent value="automation" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ShellCard className="p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight">Automation Settings</h2>
                            <p className="text-sm text-muted-foreground">Manage automated background tasks and alerts.</p>
                        </div>
                        <AutomationSettings />
                    </ShellCard>
                </TabsContent>

                <TabsContent value="advanced" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <ShellCard className="p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold tracking-tight">Advanced Settings</h2>
                            <p className="text-sm text-muted-foreground">System level configurations and debugging.</p>
                        </div>
                        <AdvancedSettings />
                    </ShellCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
