'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Settings2, Info } from 'lucide-react';

export interface PersonalitySettings {
    voice: 'casual' | 'professional' | 'buttoned-up';
    density: 'punchy' | 'balanced' | 'comprehensive';
    style: 'factual' | 'standard' | 'persuasive';
    jargon: 'plain-english' | 'industry-aware' | 'deep-insider';
}

const INDUSTRY_PRESETS: Record<string, PersonalitySettings> = {
    attorney: { voice: 'buttoned-up', density: 'balanced', style: 'factual', jargon: 'industry-aware' },
    it_consultant: { voice: 'professional', density: 'comprehensive', style: 'standard', jargon: 'deep-insider' },
    teacher: { voice: 'professional', density: 'balanced', style: 'standard', jargon: 'plain-english' },
    service: { voice: 'casual', density: 'punchy', style: 'standard', jargon: 'plain-english' },
    real_estate: { voice: 'professional', density: 'balanced', style: 'persuasive', jargon: 'industry-aware' },
    startup: { voice: 'casual', density: 'punchy', style: 'persuasive', jargon: 'deep-insider' },
    executive: { voice: 'buttoned-up', density: 'comprehensive', style: 'standard', jargon: 'industry-aware' },
    marketing: { voice: 'professional', density: 'balanced', style: 'persuasive', jargon: 'industry-aware' },
};

interface ResumePersonalityFiltersProps {
    value: string; // for backward compat with old "strategy" prop
    onChange: (value: string) => void;
    settings?: PersonalitySettings;
    onSettingsChange?: (settings: PersonalitySettings) => void;
}

export function ResumePersonalityFilters({
    value,
    onChange,
    settings = INDUSTRY_PRESETS.it_consultant,
    onSettingsChange
}: ResumePersonalityFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState('it_consultant');
    const [localSettings, setLocalSettings] = useState<PersonalitySettings>(settings);

    const handlePresetChange = (preset: string) => {
        setSelectedPreset(preset);
        const newSettings = INDUSTRY_PRESETS[preset];
        setLocalSettings(newSettings);
        onSettingsChange?.(newSettings);
        // Map to old strategy values for backward compat
        onChange(newSettings.style);
    };

    const handleSettingChange = (axis: keyof PersonalitySettings, value: string) => {
        const newSettings = { ...localSettings, [axis]: value };
        setLocalSettings(newSettings);
        onSettingsChange?.(newSettings);
    };

    const getPresetLabel = (key: string) => {
        const labels: Record<string, string> = {
            attorney: 'Attorney',
            it_consultant: 'IT Consultant',
            teacher: 'Teacher',
            service: 'Service Industry',
            real_estate: 'Real Estate',
            startup: 'Startup',
            executive: 'Executive',
            marketing: 'Marketing',
        };
        return labels[key] || key;
    };

    return (
        <div className="flex items-center gap-2">
            {/* Compact Mode: Industry Preset Dropdown */}
            <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap text-sm">Resume Style:</Label>
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(INDUSTRY_PRESETS).map((key) => (
                            <SelectItem key={key} value={key}>
                                {getPresetLabel(key)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Advanced Options Popover */}
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Settings2 className="h-4 w-4" />
                        Advanced
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-4" align="start">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <h4 className="font-semibold leading-none">Customize Resume Voice</h4>
                            <p className="text-sm text-muted-foreground">
                                Fine-tune how your resume is written across 4 dimensions
                            </p>
                        </div>

                        {/* Current Settings Summary */}
                        <div className="p-3 bg-muted/50 rounded-md space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Current Profile</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>{localSettings.voice === 'casual' ? 'Casual' : localSettings.voice === 'professional' ? 'Professional' : 'Formal'} tone</div>
                                <div>{localSettings.density === 'punchy' ? 'Punchy' : localSettings.density === 'balanced' ? 'Balanced' : 'Detailed'} detail</div>
                                <div>{localSettings.style === 'factual' ? 'Factual' : localSettings.style === 'standard' ? 'Standard' : 'Persuasive'} style</div>
                                <div>{localSettings.jargon === 'plain-english' ? 'Plain' : localSettings.jargon === 'industry-aware' ? 'Technical' : 'Expert'} language</div>
                            </div>
                        </div>

                        {/* Axis 1: Voice (Tone) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Tone</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 text-sm" side="right">
                                        <div className="space-y-2">
                                            <p className="font-medium">How should you sound?</p>
                                            <ul className="space-y-1 text-xs">
                                                <li><strong>Casual:</strong> Conversational, energetic (startups, creative)</li>
                                                <li><strong>Professional:</strong> Standard business tone (most roles)</li>
                                                <li><strong>Buttoned-Up:</strong> Formal, conservative (law, finance, executive)</li>
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Select value={localSettings.voice} onValueChange={(v) => handleSettingChange('voice', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="casual">Casual - Conversational & energetic</SelectItem>
                                    <SelectItem value="professional">Professional - Standard business tone</SelectItem>
                                    <SelectItem value="buttoned-up">Formal - Conservative & polished</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Axis 2: Density (Detail Level) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Detail Level</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 text-sm" side="right">
                                        <div className="space-y-2">
                                            <p className="font-medium">How much detail?</p>
                                            <ul className="space-y-1 text-xs">
                                                <li><strong>Punchy:</strong> 10-14 words/bullet (~300 words total)</li>
                                                <li><strong>Balanced:</strong> 15-20 words/bullet (~450 words total)</li>
                                                <li><strong>Comprehensive:</strong> 20-30 words/bullet (~600+ words)</li>
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Select value={localSettings.density} onValueChange={(v) => handleSettingChange('density', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="punchy">Punchy - Brief & impactful</SelectItem>
                                    <SelectItem value="balanced">Balanced - Standard detail</SelectItem>
                                    <SelectItem value="comprehensive">Comprehensive - Full context</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Axis 3: Style (Enhancement) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Enhancement Level</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 text-sm" side="right">
                                        <div className="space-y-2">
                                            <p className="font-medium">How much can we enhance?</p>
                                            <ul className="space-y-1 text-xs">
                                                <li><strong>Factual:</strong> Only stated information (compliance, gov)</li>
                                                <li><strong>Standard:</strong> Professional enhancement (most roles)</li>
                                                <li><strong>Persuasive:</strong> Aggressive reframing (competitive markets)</li>
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Select value={localSettings.style} onValueChange={(v) => handleSettingChange('style', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="factual">Factual - Literal information only</SelectItem>
                                    <SelectItem value="standard">Standard - Professional polish</SelectItem>
                                    <SelectItem value="persuasive">Persuasive - Maximum impact</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Axis 4: Jargon (Technical Language) */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">Technical Language</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                            <Info className="h-3 w-3 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 text-sm" side="right">
                                        <div className="space-y-2">
                                            <p className="font-medium">How technical should you sound?</p>
                                            <ul className="space-y-1 text-xs">
                                                <li><strong>Plain English:</strong> Minimal jargon (career changers)</li>
                                                <li><strong>Industry-Aware:</strong> Standard terminology (most roles)</li>
                                                <li><strong>Deep Insider:</strong> Full technical vocab (specialists)</li>
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Select value={localSettings.jargon} onValueChange={(v) => handleSettingChange('jargon', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="plain-english">Plain English - Minimal jargon</SelectItem>
                                    <SelectItem value="industry-aware">Industry-Aware - Standard terms</SelectItem>
                                    <SelectItem value="deep-insider">Deep Insider - Expert vocabulary</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Example Preview */}
                        <div className="p-3 bg-muted/30 rounded-md border">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Example Output</div>
                            <div className="text-sm space-y-2">
                                <div className="text-xs text-muted-foreground">Input: "Helped with customer emails"</div>
                                <div className="font-medium">
                                    {localSettings.style === 'factual' && "Responded to customer email inquiries"}
                                    {localSettings.style === 'standard' && "Managed customer communications, resolving inquiries and maintaining satisfaction"}
                                    {localSettings.style === 'persuasive' && "Spearheaded customer success initiatives, transforming routine communications into relationship-building opportunities"}
                                </div>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const preset = INDUSTRY_PRESETS[selectedPreset];
                                    setLocalSettings(preset);
                                    onSettingsChange?.(preset);
                                }}
                            >
                                Reset to Preset
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setShowAdvanced(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
