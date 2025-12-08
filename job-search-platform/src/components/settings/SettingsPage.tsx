'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchSettings } from './SearchSettings';
import { LLMSettings } from './LLMSettings';
import { AutomationSettings } from './AutomationSettings';
import { AdvancedSettings } from './AdvancedSettings';

export function SettingsPage() {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="search">Search Parameters</TabsTrigger>
                    <TabsTrigger value="llm">LLM Configuration</TabsTrigger>
                    <TabsTrigger value="automation">Automation</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                    <div className="rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4">Search Parameters</h2>
                        <SearchSettings />
                    </div>
                </TabsContent>

                <TabsContent value="llm" className="space-y-4">
                    <div className="rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4">LLM Configuration</h2>
                        <LLMSettings />
                    </div>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4">
                    <div className="rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4">Automation Settings</h2>
                        <AutomationSettings />
                    </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <div className="rounded-lg border p-6">
                        <h2 className="text-xl font-semibold mb-4">Advanced Settings</h2>
                        <AdvancedSettings />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
