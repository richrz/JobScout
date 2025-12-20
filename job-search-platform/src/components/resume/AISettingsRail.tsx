'use client';

import React, { useState } from 'react';
import {
    Sparkles,
    Shield,
    Zap,
    ChevronDown,
    RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface PersonalitySettings {
    voice: 'casual' | 'professional' | 'buttoned-up';
    density: 'punchy' | 'balanced' | 'comprehensive';
    license: 'just-facts' | 'polish-up' | 'sell-hard';
    insider: 'plain-english' | 'industry-aware' | 'deep-insider';
}

export interface AdvancedSettings {
    requireEvidence: boolean;
    atsHeavy: boolean;
    prioritizeAchievements: boolean;
}

interface IndustryPreset {
    id: string;
    name: string;
    settings: PersonalitySettings;
}

// ============================================================================
// Data
// ============================================================================

const INDUSTRY_PRESETS: IndustryPreset[] = [
    { id: 'attorney', name: 'Attorney / Legal', settings: { voice: 'buttoned-up', density: 'balanced', license: 'just-facts', insider: 'industry-aware' } },
    { id: 'tech', name: 'IT / Tech', settings: { voice: 'professional', density: 'comprehensive', license: 'polish-up', insider: 'deep-insider' } },
    { id: 'teacher', name: 'Education', settings: { voice: 'professional', density: 'balanced', license: 'polish-up', insider: 'plain-english' } },
    { id: 'service', name: 'Service / Retail', settings: { voice: 'casual', density: 'punchy', license: 'polish-up', insider: 'plain-english' } },
    { id: 'realestate', name: 'Real Estate / Sales', settings: { voice: 'professional', density: 'balanced', license: 'sell-hard', insider: 'industry-aware' } },
    { id: 'startup', name: 'Startup', settings: { voice: 'casual', density: 'punchy', license: 'sell-hard', insider: 'deep-insider' } },
    { id: 'executive', name: 'Executive', settings: { voice: 'buttoned-up', density: 'comprehensive', license: 'polish-up', insider: 'industry-aware' } },
    { id: 'marketing', name: 'Marketing', settings: { voice: 'professional', density: 'balanced', license: 'sell-hard', insider: 'industry-aware' } },
];

const QUICK_MODES = [
    { id: 'safe', name: 'Safe', icon: Shield, settings: { voice: 'professional', density: 'balanced', license: 'just-facts', insider: 'plain-english' } as PersonalitySettings },
    { id: 'standout', name: 'Standout', icon: Zap, settings: { voice: 'professional', density: 'comprehensive', license: 'sell-hard', insider: 'industry-aware' } as PersonalitySettings },
];

// ============================================================================
// Radio Option Component
// ============================================================================

interface RadioOptionProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}

function RadioOption({ options, value, onChange }: RadioOptionProps) {
    return (
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all",
                        value === opt.value
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

interface AISettingsRailProps {
    settings: PersonalitySettings;
    onSettingsChange: (settings: PersonalitySettings) => void;
    advancedSettings?: AdvancedSettings;
    onAdvancedSettingsChange?: (settings: AdvancedSettings) => void;
    className?: string;
}

export function AISettingsRail({
    settings,
    onSettingsChange,
    advancedSettings = { requireEvidence: false, atsHeavy: false, prioritizeAchievements: true },
    onAdvancedSettingsChange,
    className,
}: AISettingsRailProps) {
    const DEFAULT_PRESET = 'tech';
    const [selectedPreset, setSelectedPreset] = useState<string | null>(DEFAULT_PRESET);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [fineTuneOpen, setFineTuneOpen] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [localAdvanced, setLocalAdvanced] = useState(advancedSettings);

    const densityOptions = [
        { value: 'punchy', label: 'Punchy' },
        { value: 'balanced', label: 'Balanced' },
        { value: 'comprehensive', label: 'Detailed' },
    ];

    const handlePresetChange = (presetId: string) => {
        if (presetId === 'custom') {
            setSelectedPreset(null);
            setSelectedMode(null);
            return;
        }
        const preset = INDUSTRY_PRESETS.find((p) => p.id === presetId);
        if (preset) {
            onSettingsChange(preset.settings);
            setSelectedPreset(presetId);
            setSelectedMode(null);
        }
    };

    const handleModeClick = (mode: typeof QUICK_MODES[0]) => {
        onSettingsChange(mode.settings);
        setSelectedMode(mode.id);
        setSelectedPreset(null);
    };

    const handleSettingChange = <K extends keyof PersonalitySettings>(key: K, value: PersonalitySettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
        setSelectedPreset(null);
        setSelectedMode(null);
    };

    const handleAdvancedChange = <K extends keyof AdvancedSettings>(key: K, value: AdvancedSettings[K]) => {
        const newSettings = { ...localAdvanced, [key]: value };
        setLocalAdvanced(newSettings);
        onAdvancedSettingsChange?.(newSettings);
    };

    const handleReset = () => {
        const preset = INDUSTRY_PRESETS.find((p) => p.id === DEFAULT_PRESET);
        if (preset) {
            onSettingsChange(preset.settings);
            setSelectedPreset(DEFAULT_PRESET);
            setSelectedMode(null);
        }
    };

    const densityIndex = densityOptions.findIndex((opt) => opt.value === settings.density);

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">AI Settings</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                    <RotateCcw className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Industry Preset */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Industry Preset</Label>
                    <Select value={selectedPreset ?? 'custom'} onValueChange={handlePresetChange}>
                        <SelectTrigger className="w-full h-9">
                            <SelectValue placeholder="Select preset" />
                        </SelectTrigger>
                        <SelectContent>
                            {INDUSTRY_PRESETS.map((preset) => (
                                <SelectItem key={preset.id} value={preset.id}>
                                    {preset.name}
                                </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Quick Modes */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {QUICK_MODES.map((mode) => (
                            <Button
                                key={mode.id}
                                variant={selectedMode === mode.id ? "secondary" : "outline"}
                                size="sm"
                                className={cn(
                                    "h-9 gap-1.5",
                                    selectedMode === mode.id && "ring-1 ring-primary"
                                )}
                                onClick={() => handleModeClick(mode)}
                            >
                                <mode.icon className="h-3.5 w-3.5" />
                                {mode.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Fine-tune Collapsible */}
                <Collapsible open={fineTuneOpen} onOpenChange={setFineTuneOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs">
                            <span>Fine-tune settings</span>
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", fineTuneOpen && "rotate-180")} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 space-y-4">
                        {/* Tone */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Tone</Label>
                            <RadioOption
                                options={[
                                    { value: 'casual', label: 'Casual' },
                                    { value: 'professional', label: 'Pro' },
                                    { value: 'buttoned-up', label: 'Formal' },
                                ]}
                                value={settings.voice}
                                onChange={(v) => handleSettingChange('voice', v as PersonalitySettings['voice'])}
                            />
                        </div>

                        {/* Detail Level - Slider */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <Label className="text-xs">Detail Level</Label>
                                <span className="text-xs text-muted-foreground capitalize">{settings.density}</span>
                            </div>
                            <Slider
                                value={[densityIndex >= 0 ? densityIndex : 1]}
                                min={0}
                                max={2}
                                step={1}
                                onValueChange={(val) => handleSettingChange('density', densityOptions[val[0]].value as PersonalitySettings['density'])}
                                className="py-2"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Punchy</span>
                                <span>Balanced</span>
                                <span>Detailed</span>
                            </div>
                        </div>

                        {/* Enhancement */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Enhancement</Label>
                            <RadioOption
                                options={[
                                    { value: 'just-facts', label: 'Facts' },
                                    { value: 'polish-up', label: 'Polish' },
                                    { value: 'sell-hard', label: 'Sell' },
                                ]}
                                value={settings.license}
                                onChange={(v) => handleSettingChange('license', v as PersonalitySettings['license'])}
                            />
                        </div>

                        {/* Terminology */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Terminology</Label>
                            <RadioOption
                                options={[
                                    { value: 'plain-english', label: 'Plain' },
                                    { value: 'industry-aware', label: 'Industry' },
                                    { value: 'deep-insider', label: 'Expert' },
                                ]}
                                value={settings.insider}
                                onChange={(v) => handleSettingChange('insider', v as PersonalitySettings['insider'])}
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Advanced Settings Collapsible */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between h-8 px-2 text-xs">
                            <span>Advanced</span>
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", advancedOpen && "rotate-180")} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Require evidence</Label>
                            <Switch
                                checked={localAdvanced.requireEvidence}
                                onCheckedChange={(v) => handleAdvancedChange('requireEvidence', v)}
                                className="scale-75"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">ATS-heavy keywords</Label>
                            <Switch
                                checked={localAdvanced.atsHeavy}
                                onCheckedChange={(v) => handleAdvancedChange('atsHeavy', v)}
                                className="scale-75"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Prioritize achievements</Label>
                            <Switch
                                checked={localAdvanced.prioritizeAchievements}
                                onCheckedChange={(v) => handleAdvancedChange('prioritizeAchievements', v)}
                                className="scale-75"
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Current Config Summary */}
            <div className="px-4 py-3 border-t bg-muted/30">
                <div className="flex flex-wrap gap-1">
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">
                        {settings.voice}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">
                        {settings.density}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">
                        {settings.license}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">
                        {settings.insider}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AISettingsRail;
