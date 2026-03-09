'use client';

import React from 'react';
import { RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  clampVoiceProfile,
  getVoiceDimensionDescriptor,
  RESUME_WRITER_ZERO_PROFILE,
  STRATEGY_OPTIONS,
  VOICE_DIMENSIONS,
  type ResumeVoiceDimensionKey,
  type ResumeVoiceProfile,
  type ResumeWritingStrategy,
} from '@/lib/resume/voice-profile';

interface AISettingsRailProps {
  profile: ResumeVoiceProfile;
  onProfileChange: (profile: ResumeVoiceProfile) => void;
  strategy: ResumeWritingStrategy;
  onStrategyChange: (strategy: ResumeWritingStrategy) => void;
  className?: string;
}

interface DimensionControlProps {
  dimension: (typeof VOICE_DIMENSIONS)[number];
  value: number;
  onChange: (value: number) => void;
}

function cloneProfile(profile: ResumeVoiceProfile): ResumeVoiceProfile {
  return { ...profile };
}

function DimensionControl({ dimension, value, onChange }: DimensionControlProps) {
  const descriptor = getVoiceDimensionDescriptor(dimension.key, value);

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{dimension.label}</div>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            {dimension.description}
          </p>
        </div>
        <div className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
          {descriptor} · {value}
        </div>
      </div>

      <Slider
        value={[value]}
        min={0}
        max={100}
        step={5}
        onValueChange={(next) => onChange(next[0] ?? value)}
        className="py-2"
        aria-label={dimension.label}
      />

      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        <span>{dimension.lowLabel}</span>
        <span>{dimension.highLabel}</span>
      </div>
    </div>
  );
}

const DIMENSION_GROUPS: Array<{
  title: string;
  description: string;
  keys: ResumeVoiceDimensionKey[];
}> = [
  {
    title: 'Tone & Clarity',
    description: 'Control how polished, human, and concise the wording feels.',
    keys: ['formality', 'warmth', 'brevity'],
  },
  {
    title: 'Technical Signal',
    description: 'Control how technical and proof-heavy the draft becomes.',
    keys: ['technicalDepth', 'evidence'],
  },
  {
    title: 'Positioning',
    description: 'Control how direct and role-focused the draft feels.',
    keys: ['confidence', 'persuasion'],
  },
];

export function AISettingsRail({
  profile,
  onProfileChange,
  strategy,
  onStrategyChange,
  className,
}: AISettingsRailProps) {
  const safeProfile = clampVoiceProfile(profile);

  const handleDimensionChange = (key: ResumeVoiceDimensionKey, value: number) => {
    onProfileChange(
      clampVoiceProfile({
        ...safeProfile,
        [key]: value,
      }),
    );
  };

  const handleReset = () => {
    onStrategyChange('balanced');
    onProfileChange(cloneProfile(RESUME_WRITER_ZERO_PROFILE));
  };

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <div className="text-sm font-semibold text-foreground">Rewrite This Draft</div>
            <div className="text-[11px] text-muted-foreground">Career Data stays separate.</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleReset}
          aria-label="Reset rewrite settings"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
              <Wand2 className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground">What this changes</div>
              <p className="text-[11px] leading-5 text-muted-foreground">
                This adjusts wording, emphasis, and fit for the current resume draft. It does not
                rewrite your Career Data.
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              How hard should JobScout rewrite this?
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              Choose how much the draft should polish and position your experience.
            </p>
          </div>
          <div className="grid gap-2">
            {STRATEGY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onStrategyChange(option.id)}
                aria-pressed={strategy === option.id}
                className={cn(
                  'rounded-2xl border px-3 py-3 text-left transition-colors',
                  strategy === option.id
                    ? 'border-primary/50 bg-primary/10 shadow-[0_0_0_1px_rgba(53,227,117,0.15)]'
                    : 'border-border/80 bg-card/60 hover:border-primary/25 hover:bg-card',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-foreground">{option.label}</div>
                  {strategy === option.id ? (
                    <div className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                      Live
                    </div>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Tune The Voice
            </div>
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Manual for now
            </span>
          </div>
          <div className="space-y-3">
            {DIMENSION_GROUPS.map((group) => (
              <div key={group.title} className="rounded-2xl border border-border/80 bg-card/60 p-3 shadow-sm">
                <div className="mb-3">
                  <div className="text-sm font-semibold text-foreground">{group.title}</div>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {group.description}
                  </p>
                </div>
                <div className="space-y-3">
                  {group.keys.map((key) => {
                    const dimension = VOICE_DIMENSIONS.find((item) => item.key === key);
                    if (!dimension) return null;
                    return (
                      <DimensionControl
                        key={dimension.key}
                        dimension={dimension}
                        value={safeProfile[dimension.key]}
                        onChange={(value) => handleDimensionChange(dimension.key, value)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-border/80 bg-card/40 px-4 py-3">
        <p className="text-[11px] leading-5 text-muted-foreground">
          Voice learning from uploaded resumes is not live yet. For now, adjust the draft here and
          JobScout will use these settings only for this resume.
        </p>
      </div>
    </div>
  );
}

export default AISettingsRail;
