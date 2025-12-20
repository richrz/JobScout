"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Gauge,
    MessageSquare,
    RotateCcw,
    Settings2,
    Shield,
    Sparkles,
    Target,
    Wand2,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
    description: string;
}

// ============================================================================
// Data
// ============================================================================

const INDUSTRY_PRESETS: IndustryPreset[] = [
    {
        id: 'attorney',
        name: 'Attorney',
        settings: { voice: 'buttoned-up', density: 'balanced', license: 'just-facts', insider: 'industry-aware' },
        description: 'Formal, factual, precise legal terminology'
    },
    {
        id: 'tech',
        name: 'IT / Tech',
        settings: { voice: 'professional', density: 'comprehensive', license: 'polish-up', insider: 'deep-insider' },
        description: 'Technical depth with full stack vocabulary'
    },
    {
        id: 'teacher',
        name: 'Educator',
        settings: { voice: 'professional', density: 'balanced', license: 'polish-up', insider: 'plain-english' },
        description: 'Approachable, outcome-focused, clear'
    },
    {
        id: 'service',
        name: 'Service',
        settings: { voice: 'casual', density: 'punchy', license: 'polish-up', insider: 'plain-english' },
        description: 'Friendly, concise, customer-focused'
    },
    {
        id: 'realestate',
        name: 'Real Estate',
        settings: { voice: 'professional', density: 'balanced', license: 'sell-hard', insider: 'industry-aware' },
        description: 'Persuasive, results-driven, confident'
    },
    {
        id: 'startup',
        name: 'Startup',
        settings: { voice: 'casual', density: 'punchy', license: 'sell-hard', insider: 'deep-insider' },
        description: 'Energetic, bold, impact-focused'
    },
    {
        id: 'executive',
        name: 'Executive',
        settings: { voice: 'buttoned-up', density: 'comprehensive', license: 'polish-up', insider: 'industry-aware' },
        description: 'Strategic, comprehensive, authoritative'
    },
    {
        id: 'marketing',
        name: 'Marketing',
        settings: { voice: 'professional', density: 'balanced', license: 'sell-hard', insider: 'industry-aware' },
        description: 'Creative, persuasive, metrics-driven'
    },
];

const QUICK_MODES = [
    {
        id: 'safe',
        name: 'Safe',
        settings: { voice: 'professional', density: 'balanced', license: 'just-facts', insider: 'plain-english' } as PersonalitySettings,
        description: 'Conservative and risk-free'
    },
    {
        id: 'standout',
        name: 'Standout',
        settings: { voice: 'professional', density: 'comprehensive', license: 'sell-hard', insider: 'industry-aware' } as PersonalitySettings,
        description: 'Maximum impact for competitive markets'
    },
];

// ============================================================================
// Main Component
// ============================================================================

interface ResumeAIControlCenterProps {
    settings: PersonalitySettings;
    onSettingsChange: (settings: PersonalitySettings) => void;
    advancedSettings?: AdvancedSettings;
    onAdvancedSettingsChange?: (settings: AdvancedSettings) => void;
    className?: string;
}

export function ResumeAIControlCenter({
    settings,
    onSettingsChange,
    advancedSettings = { requireEvidence: false, atsHeavy: false, prioritizeAchievements: true },
    onAdvancedSettingsChange,
    className,
}: ResumeAIControlCenterProps) {
    const DEFAULT_PRESET = 'tech';
    const [selectedPreset, setSelectedPreset] = useState<string | null>(DEFAULT_PRESET);
    const [showLivePreview, setShowLivePreview] = useState(true);
    const [localAdvanced, setLocalAdvanced] = useState(advancedSettings);

    const voiceOptions = [
        { value: 'casual', label: 'Casual', description: 'Conversational and energetic. Good for startups and creative roles.' },
        { value: 'professional', label: 'Professional', description: 'Neutral business tone. Fits most corporate roles.' },
        { value: 'buttoned-up', label: 'Formal', description: 'Conservative and polished. Suited to law, finance, executive.' },
    ];

    const densityOptions = [
        { value: 'punchy', label: 'Punchy', description: '10-14 words per bullet. One clear impact per line.' },
        { value: 'balanced', label: 'Balanced', description: '15-20 words per bullet with context and results.' },
        { value: 'comprehensive', label: 'Comprehensive', description: '20-30 words per bullet with scope and methodology.' },
    ];

    const licenseOptions = [
        { value: 'just-facts', label: 'Just Facts', description: 'Only what was stated. No inference or embellishment.' },
        { value: 'polish-up', label: 'Polish Up', description: 'Professional smoothing with reasonable inference.' },
        { value: 'sell-hard', label: 'Sell Hard', description: 'Assertive framing and skill-bridging within truth.' },
    ];

    const insiderOptions = [
        { value: 'plain-english', label: 'Plain English', description: 'Minimal jargon. Explain terms for any reader.' },
        { value: 'industry-aware', label: 'Industry-Aware', description: 'Standard terminology and ATS-friendly keywords.' },
        { value: 'deep-insider', label: 'Deep Insider', description: 'Full technical vocabulary for domain experts.' },
    ];

    const handleAxisChange = (key: keyof PersonalitySettings, index: number) => {
        const maps: Record<keyof PersonalitySettings, string[]> = {
            voice: voiceOptions.map((opt) => opt.value),
            density: densityOptions.map((opt) => opt.value),
            license: licenseOptions.map((opt) => opt.value),
            insider: insiderOptions.map((opt) => opt.value),
        };

        onSettingsChange({
            ...settings,
            [key]: maps[key][index] as PersonalitySettings[keyof PersonalitySettings],
        });
        setSelectedPreset(null);
    };

    const handleValueChange = (key: keyof PersonalitySettings, value: PersonalitySettings[keyof PersonalitySettings]) => {
        onSettingsChange({
            ...settings,
            [key]: value,
        });
        setSelectedPreset(null);
    };

    const handlePresetSelect = (preset: IndustryPreset | typeof QUICK_MODES[0]) => {
        onSettingsChange(preset.settings);
        setSelectedPreset(preset.id);
    };

    const handleAdvancedChange = <K extends keyof AdvancedSettings>(key: K, value: AdvancedSettings[K]) => {
        const newSettings = { ...localAdvanced, [key]: value };
        setLocalAdvanced(newSettings);
        onAdvancedSettingsChange?.(newSettings);
    };

    const densityIndex = densityOptions.findIndex((opt) => opt.value === settings.density);
    const voice = voiceOptions.find((opt) => opt.value === settings.voice) || voiceOptions[1];
    const density = densityOptions[densityIndex] || densityOptions[1];
    const license = licenseOptions.find((opt) => opt.value === settings.license) || licenseOptions[1];
    const insider = insiderOptions.find((opt) => opt.value === settings.insider) || insiderOptions[1];

    // Generate sample based on current settings
    const getSampleOutput = () => {
        const samples: Record<string, string> = {
            'just-facts': "Responded to customer email inquiries",
            'polish-up': "Managed customer communications, resolving inquiries and maintaining satisfaction",
            'sell-hard': "Spearheaded customer success initiatives, transforming routine communications into relationship-building opportunities that drove retention"
        };

        return samples[settings.license];
    };

    return (
        <TooltipProvider>
            <div className={cn("space-y-6", className)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted border border-border/80">
                            <Wand2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">AI Resume Personality</h3>
                            <p className="text-sm text-muted-foreground">Control tone, detail, honesty, and terminology.</p>
                        </div>
                    </div>
                </div>

                <GlassCard className="p-4" hoverEffect={false}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">Industry preset</Label>
                            <p className="text-xs text-muted-foreground">Start with a preset, then tweak.</p>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handlePresetSelect(INDUSTRY_PRESETS.find((p) => p.id === DEFAULT_PRESET) ?? INDUSTRY_PRESETS[0])}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reset to defaults</TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="mt-3 flex flex-col gap-3">
                        <Select
                            value={selectedPreset ?? 'custom'}
                            onValueChange={(value) => {
                                if (value === 'custom') {
                                    setSelectedPreset(null);
                                    return;
                                }
                                const preset = INDUSTRY_PRESETS.find((p) => p.id === value);
                                if (preset) handlePresetSelect(preset);
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose an industry preset" />
                            </SelectTrigger>
                            <SelectContent>
                                {INDUSTRY_PRESETS.map((preset) => (
                                    <SelectItem key={preset.id} value={preset.id}>
                                        {preset.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value="custom">
                                    Custom mix (manual)
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="grid grid-cols-2 gap-2">
                            {QUICK_MODES.map((mode) => (
                                <Button
                                    key={mode.id}
                                    variant={selectedPreset === mode.id ? "secondary" : "outline"}
                                    className="justify-start gap-2"
                                    onClick={() => handlePresetSelect(mode)}
                                >
                                    {mode.id === 'safe' ? <Shield className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">{mode.name}</span>
                                        <span className="text-xs text-muted-foreground">{mode.description}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4" hoverEffect={false}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-medium">Fine-tune</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">81 combinations</span>
                    </div>

                    <Accordion type="single" defaultValue="axes" collapsible>
                        <AccordionItem value="axes" className="border-none">
                            <AccordionTrigger className="py-2 px-0 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Adjust the four axes</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-0">
                                <div className="space-y-5 pt-1">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                <Label className="text-sm font-medium">Tone</Label>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{voice.label}</span>
                                        </div>
                                        <ToggleGroup
                                            type="single"
                                            value={settings.voice}
                                            onValueChange={(val) => val && handleValueChange('voice', val as PersonalitySettings['voice'])}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            {voiceOptions.map((opt) => (
                                                <ToggleGroupItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    className={cn(
                                                        "justify-center text-sm",
                                                        "data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/50"
                                                    )}
                                                >
                                                    {opt.label}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                        <p className="text-xs text-muted-foreground">{voice.description}</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                <Label className="text-sm font-medium">Detail level</Label>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{density.label}</span>
                                        </div>
                                        <Slider
                                            value={[densityIndex >= 0 ? densityIndex : 1]}
                                            min={0}
                                            max={densityOptions.length - 1}
                                            step={1}
                                            onValueChange={(val) => handleAxisChange('density', val[0] ?? 1)}
                                        />
                                        <div className="flex justify-between text-[11px] text-muted-foreground">
                                            {densityOptions.map((opt) => (
                                                <span key={opt.value}>{opt.label}</span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{density.description}</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Wand2 className="h-4 w-4 text-muted-foreground" />
                                                <Label className="text-sm font-medium">Enhancement</Label>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{license.label}</span>
                                        </div>
                                        <ToggleGroup
                                            type="single"
                                            value={settings.license}
                                            onValueChange={(val) => val && handleValueChange('license', val as PersonalitySettings['license'])}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            {licenseOptions.map((opt) => (
                                                <ToggleGroupItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    className="justify-center text-sm data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/50"
                                                >
                                                    {opt.label}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                        <p className="text-xs text-muted-foreground">{license.description}</p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-muted-foreground" />
                                                <Label className="text-sm font-medium">Terminology</Label>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{insider.label}</span>
                                        </div>
                                        <ToggleGroup
                                            type="single"
                                            value={settings.insider}
                                            onValueChange={(val) => val && handleValueChange('insider', val as PersonalitySettings['insider'])}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            {insiderOptions.map((opt) => (
                                                <ToggleGroupItem
                                                    key={opt.value}
                                                    value={opt.value}
                                                    className="justify-center text-sm data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/50"
                                                >
                                                    {opt.label}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                        <p className="text-xs text-muted-foreground">{insider.description}</p>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">Tone: {voice.label}</Badge>
                        <Badge variant="secondary">Detail: {density.label}</Badge>
                        <Badge variant="secondary">Enhancement: {license.label}</Badge>
                        <Badge variant="secondary">Terminology: {insider.label}</Badge>
                    </div>
                </GlassCard>

                {settings.license === 'sell-hard' && (
                    <Alert className="border-amber-500/40 bg-amber-500/5">
                        <AlertDescription className="text-sm">
                            Use assertive framing, but keep claims truthful and grounded in what was provided.
                        </AlertDescription>
                    </Alert>
                )}

                <AnimatePresence>
                    {showLivePreview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <GlassCard className="p-4" hoverEffect={false} variant="highlight">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="h-4 w-4 text-primary" />
                                        <Label className="font-medium text-sm">Live Preview</Label>
                                    </div>
                                    <Switch
                                        checked={showLivePreview}
                                        onCheckedChange={setShowLivePreview}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                        Input: <span className="italic">"helped with customer emails"</span>
                                    </div>
                                    <motion.div
                                        key={settings.license}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-background/50 rounded-lg border"
                                    >
                                        <p className="text-sm font-medium text-foreground">
                                            {getSampleOutput()}
                                        </p>
                                    </motion.div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Accordion type="single" collapsible className="border rounded-xl">
                    <AccordionItem value="advanced" className="border-0">
                        <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Safety & Advanced</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Require evidence</Label>
                                        <p className="text-xs text-muted-foreground">Only include claims with metrics or tools provided.</p>
                                    </div>
                                    <Switch
                                        checked={localAdvanced.requireEvidence}
                                        onCheckedChange={(v) => handleAdvancedChange('requireEvidence', v)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">ATS-heavy keywords</Label>
                                        <p className="text-xs text-muted-foreground">Bias phrasing toward applicant tracking systems.</p>
                                    </div>
                                    <Switch
                                        checked={localAdvanced.atsHeavy}
                                        onCheckedChange={(v) => handleAdvancedChange('atsHeavy', v)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm">Prioritize achievements</Label>
                                        <p className="text-xs text-muted-foreground">Focus on results over responsibilities.</p>
                                    </div>
                                    <Switch
                                        checked={localAdvanced.prioritizeAchievements}
                                        onCheckedChange={(v) => handleAdvancedChange('prioritizeAchievements', v)}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </TooltipProvider>
    );
}

export default ResumeAIControlCenter;
