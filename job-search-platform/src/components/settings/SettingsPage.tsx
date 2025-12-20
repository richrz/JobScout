
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchSettings } from './SearchSettings';
import { LLMSettings } from './LLMSettings';
import { AutomationSettings } from './AutomationSettings';
import { AdvancedSettings } from './AdvancedSettings';
import { Button } from '@/components/ui/button';
import { Brain, Search, Zap, Wrench } from 'lucide-react';
import Link from 'next/link';

export function SettingsPage() {
    return (
        <div className="min-h-screen">
            {/* Top Bar / Breadcrumbs */}
            <header className="sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8 py-6 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="text-primary font-medium">AI Configuration</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
                </div>
                <div className="hidden md:flex gap-3">
                    <Button variant="outline" className="rounded-full border-border text-foreground hover:bg-secondary">
                        Discard
                    </Button>
                    <Button className="rounded-full bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(57,224,121,0.3)] hover:shadow-[0_0_25px_rgba(57,224,121,0.5)]">
                        Save Changes
                    </Button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
                {/* Description */}
                <p className="text-muted-foreground text-lg mb-10 max-w-3xl">
                    Manage your Large Language Model (LLM) API keys, adjust search parameters, and configure automation settings.
                </p>

                <Tabs defaultValue="llm" className="w-full space-y-8">
                    <TabsList className="inline-flex h-auto p-1 bg-card border border-border rounded-full gap-1">
                        <TabsTrigger
                            value="search"
                            className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </TabsTrigger>
                        <TabsTrigger
                            value="llm"
                            className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                        >
                            <Brain className="w-4 h-4 mr-2" />
                            AI Models
                        </TabsTrigger>
                        <TabsTrigger
                            value="automation"
                            className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Automation
                        </TabsTrigger>
                        <TabsTrigger
                            value="advanced"
                            className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20"
                        >
                            <Wrench className="w-4 h-4 mr-2" />
                            Advanced
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                                    <Search className="w-5 h-5 text-primary" />
                                    Search Parameters
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Define what jobs you are looking for.</p>
                            </div>
                            <SearchSettings />
                        </div>
                    </TabsContent>

                    <TabsContent value="llm" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                                    <Brain className="w-5 h-5 text-primary" />
                                    AI Model Configuration
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Connect your AI provider for resume generation and analysis.</p>
                            </div>
                            <LLMSettings />
                        </div>
                    </TabsContent>

                    <TabsContent value="automation" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Automation Settings
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Manage automated background tasks and alerts.</p>
                            </div>
                            <AutomationSettings />
                        </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                            <div className="mb-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                                    <Wrench className="w-5 h-5 text-primary" />
                                    Advanced Settings
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">System level configurations and debugging.</p>
                            </div>
                            <AdvancedSettings />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
