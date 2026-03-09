'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react';
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

type DimensionGroupId = 'tone' | 'technical' | 'positioning';

const DIMENSION_SUMMARY_LABELS: Record<ResumeVoiceDimensionKey, string> = {
  formality: 'Tone',
  brevity: 'Length',
  technicalDepth: 'Audience',
  evidence: 'Proof',
  confidence: 'Directness',
  warmth: 'Warmth',
  persuasion: 'Fit',
};

const DIMENSION_GROUPS: Array<{
  id: DimensionGroupId;
  title: string;
  description: string;
  keys: ResumeVoiceDimensionKey[];
}> = [
  {
    id: 'tone',
    title: 'Tone & Clarity',
    description: 'Shape how polished, human, and concise the writing feels.',
    keys: ['formality', 'warmth', 'brevity'],
  },
  {
    id: 'technical',
    title: 'Technical Signal',
    description: 'Control how technical and proof-heavy the draft becomes.',
    keys: ['technicalDepth', 'evidence'],
  },
  {
    id: 'positioning',
    title: 'Positioning',
    description: 'Control how directly the draft sells fit for the role.',
    keys: ['confidence', 'persuasion'],
  },
];

function cloneProfile(profile: ResumeVoiceProfile): ResumeVoiceProfile {
  return { ...profile };
}

function DimensionControl({ dimension, value, onChange }: DimensionControlProps) {
  const descriptor = getVoiceDimensionDescriptor(dimension.key, value);

  return (
    <div className="space-y-2 border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">{dimension.label}</div>
          <p className="text-[11px] leading-5 text-muted-foreground">{dimension.description}</p>
        </div>
        <div className="shrink-0 text-[11px] font-medium text-primary">{descriptor}</div>
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

      <div className="flex justify-between text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        <span>{dimension.lowLabel}</span>
        <span>{dimension.highLabel}</span>
      </div>
    </div>
  );
}

export function AISettingsRail({
  profile,
  onProfileChange,
  strategy,
  onStrategyChange,
  className,
}: AISettingsRailProps) {
  const safeProfile = clampVoiceProfile(profile);
  const [openGroup, setOpenGroup] = useState<DimensionGroupId>('tone');
  const [showScrollCue, setShowScrollCue] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedStrategy =
    STRATEGY_OPTIONS.find((option) => option.id === strategy) ?? STRATEGY_OPTIONS[1];

  const groupSummaries = useMemo(() => {
    return DIMENSION_GROUPS.reduce<Record<DimensionGroupId, string>>((acc, group) => {
      acc[group.id] = group.keys
        .map((key) => {
          const descriptor = getVoiceDimensionDescriptor(key, safeProfile[key]);
          return `${DIMENSION_SUMMARY_LABELS[key]}: ${descriptor}`;
        })
        .join(' · ');
      return acc;
    }, { tone: '', technical: '', positioning: '' });
  }, [safeProfile]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const updateCue = () => {
      const canScroll = node.scrollHeight > node.clientHeight + 8;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 12;
      setShowScrollCue(canScroll && !atBottom);
    };

    updateCue();
    node.addEventListener('scroll', updateCue, { passive: true });
    window.addEventListener('resize', updateCue);

    return () => {
      node.removeEventListener('scroll', updateCue);
      window.removeEventListener('resize', updateCue);
    };
  }, [openGroup, strategy, safeProfile]);

  const handleDimensionChange = (key: ResumeVoiceDimensionKey, value: number) => {
    onProfileChange(
      clampVoiceProfile({
        ...safeProfile,
        [key]: value,
      }),
    );
  };

  const handleReset = () => {
    setOpenGroup('tone');
    onStrategyChange('balanced');
    onProfileChange(cloneProfile(RESUME_WRITER_ZERO_PROFILE));
  };

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      <div className="border-b border-border/80 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Writing Profile</span>
            </div>
            <p className="text-[11px] leading-5 text-muted-foreground">
              Shape this draft without changing your Career Data.
            </p>
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

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
            {selectedStrategy.label}
          </span>
          <span>{selectedStrategy.description}</span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto px-5 py-5">
          <section className="space-y-4 pb-6">
            <div className="space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Rewrite Strength
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Choose how hard JobScout should polish and position this draft.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-card/40 p-1">
              {STRATEGY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onStrategyChange(option.id)}
                  aria-pressed={strategy === option.id}
                  className={cn(
                    'rounded-xl px-3 py-2 text-center text-sm font-medium transition-colors',
                    strategy === option.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-background/80 hover:text-foreground',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="text-[11px] leading-5 text-muted-foreground">
              {selectedStrategy.description}
            </p>
          </section>

          <section className="space-y-4 border-t border-border/80 pt-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Voice Controls
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Manual for now. Upload-based voice learning comes later.
                </p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                7 sliders
              </div>
            </div>

            <div className="divide-y divide-border/70 rounded-[24px] border border-border/70 bg-background/20">
              {DIMENSION_GROUPS.map((group) => {
                const isOpen = openGroup === group.id;

                return (
                  <div key={group.id}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                      onClick={() => setOpenGroup((current) => (current === group.id ? current : group.id))}
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="text-sm font-semibold text-foreground">{group.title}</div>
                        <p className="text-[11px] leading-5 text-muted-foreground">
                          {group.description}
                        </p>
                        <div className="text-[11px] leading-5 text-primary/80">
                          {groupSummaries[group.id]}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 pt-0.5">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {isOpen ? 'Open' : 'Expand'}
                        </span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="overflow-hidden">
                        <div className="space-y-5 px-4 pb-5">
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
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {showScrollCue ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-3">
            <div className="h-14 bg-gradient-to-t from-background via-background/92 to-transparent" />
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <div className="rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground shadow-sm">
                Scroll for more controls
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border/80 px-5 py-4">
        <p className="text-[11px] leading-5 text-muted-foreground">
          These controls shape only this draft. Voice learning from uploaded resumes is not live
          yet.
        </p>
      </div>
    </div>
  );
}

export default AISettingsRail;
