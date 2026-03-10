'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import type {
  CockpitCard,
  CockpitPhaseOneViewModel,
  CockpitRiverColumn,
  CockpitStage,
} from '@/lib/cockpit-phase1';

export type CockpitPanelRecord = {
  id: string;
  kind: 'discovery' | 'managed';
  title: string;
  company: string;
  location: string | null;
  description: string;
  stage: CockpitStage;
  updatedAt: string;
  workspaceId: string | null;
  workspaceStatus: string | null;
  legacyStatus: string | null;
  resumes: Array<{
    id: string;
    title: string;
    documentState: string;
    updatedAt: string;
  }>;
  compositeScore: number | null;
};

type StageVisual = {
  title: string;
  accent: string;
  tint: string;
  wash: string;
  hint: string;
};

type UrgencySignal = {
  label: string;
  tone: 'quiet' | 'active' | 'watch' | 'urgent';
};

const STAGE_VISUALS: Record<CockpitStage, StageVisual> = {
  NEW: {
    title: 'New',
    accent: '#f5b64b',
    tint: 'rgba(245, 182, 75, 0.16)',
    wash: 'linear-gradient(180deg, rgba(245, 182, 75, 0.14), rgba(245, 182, 75, 0.02))',
    hint: 'Fresh discovery worth triage.',
  },
  INTERESTED: {
    title: 'Interested',
    accent: '#53a6ff',
    tint: 'rgba(83, 166, 255, 0.16)',
    wash: 'linear-gradient(180deg, rgba(83, 166, 255, 0.14), rgba(83, 166, 255, 0.02))',
    hint: 'Saved, but not yet being worked.',
  },
  CRAFTING: {
    title: 'Crafting',
    accent: '#ffb84d',
    tint: 'rgba(255, 184, 77, 0.16)',
    wash: 'linear-gradient(180deg, rgba(255, 184, 77, 0.18), rgba(255, 184, 77, 0.03))',
    hint: 'Active application work in flight.',
  },
  APPLIED: {
    title: 'Applied',
    accent: '#7c7cff',
    tint: 'rgba(124, 124, 255, 0.16)',
    wash: 'linear-gradient(180deg, rgba(124, 124, 255, 0.14), rgba(124, 124, 255, 0.02))',
    hint: 'Submission sent. Watch for motion.',
  },
  SCREENING: {
    title: 'Screening',
    accent: '#52d6ff',
    tint: 'rgba(82, 214, 255, 0.16)',
    wash: 'linear-gradient(180deg, rgba(82, 214, 255, 0.16), rgba(82, 214, 255, 0.02))',
    hint: 'Conversation has started.',
  },
  INTERVIEW: {
    title: 'Interview',
    accent: '#c580ff',
    tint: 'rgba(197, 128, 255, 0.16)',
    wash: 'linear-gradient(180deg, rgba(197, 128, 255, 0.16), rgba(197, 128, 255, 0.02))',
    hint: 'Prep and evidence matter here.',
  },
  OFFER: {
    title: 'Offer',
    accent: '#35e375',
    tint: 'rgba(53, 227, 117, 0.16)',
    wash: 'linear-gradient(180deg, rgba(53, 227, 117, 0.16), rgba(53, 227, 117, 0.02))',
    hint: 'Decision stage, high leverage.',
  },
};

const STAGE_ORDER: CockpitStage[] = [
  'NEW',
  'INTERESTED',
  'CRAFTING',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
];

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function scoreLabel(score: number | null) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return null;
  }

  return `${Math.round(score * 100)}%`;
}

function daysSince(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function recencyLabel(value: string) {
  const age = daysSince(value);
  if (age <= 0) {
    return 'touched today';
  }
  if (age === 1) {
    return '1d idle';
  }
  return `${age}d idle`;
}

function urgencyForStage(stage: CockpitStage, updatedAt: string): UrgencySignal {
  const age = daysSince(updatedAt);

  switch (stage) {
    case 'NEW':
      if (age >= 4) return { label: 'cooling off', tone: 'urgent' };
      if (age >= 2) return { label: 'review soon', tone: 'watch' };
      return { label: 'fresh', tone: 'active' };
    case 'INTERESTED':
      if (age >= 5) return { label: 'needs decision', tone: 'urgent' };
      if (age >= 3) return { label: 'worth revisiting', tone: 'watch' };
      return { label: 'saved', tone: 'quiet' };
    case 'CRAFTING':
      if (age >= 3) return { label: 'draft waiting', tone: 'urgent' };
      return { label: 'active draft', tone: 'active' };
    case 'APPLIED':
      if (age >= 7) return { label: 'follow up', tone: 'urgent' };
      return { label: 'submitted', tone: 'quiet' };
    case 'SCREENING':
      if (age >= 5) return { label: 'check in', tone: 'urgent' };
      return { label: 'moving', tone: 'active' };
    case 'INTERVIEW':
      return { label: 'prep now', tone: 'active' };
    case 'OFFER':
      return { label: 'decision window', tone: 'active' };
    default:
      return { label: 'tracked', tone: 'quiet' };
  }
}

function urgencyClasses(tone: UrgencySignal['tone']) {
  switch (tone) {
    case 'urgent':
      return 'border-rose-500/35 bg-rose-500/10 text-rose-200';
    case 'watch':
      return 'border-amber-400/35 bg-amber-400/10 text-amber-100';
    case 'active':
      return 'border-emerald-400/35 bg-emerald-400/10 text-emerald-100';
    default:
      return 'border-white/10 bg-white/[0.03] text-white/55';
  }
}

function companyIdentity(company: string) {
  const initials = company
    .split(/[\s&,-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

  const hue =
    company.split('').reduce((total, char) => total + char.charCodeAt(0), 0) % 360;

  return {
    initials,
    background: `linear-gradient(135deg, hsla(${hue}, 78%, 60%, 0.28), hsla(${(hue + 36) % 360}, 78%, 52%, 0.1))`,
    border: `1px solid hsla(${hue}, 78%, 62%, 0.35)`,
    text: `hsl(${hue} 88% 84%)`,
    glow: `0 0 0 1px hsla(${hue}, 80%, 60%, 0.1), 0 18px 35px hsla(${hue}, 70%, 20%, 0.22)`,
  };
}

function sectionIntro(stage: CockpitStage) {
  switch (stage) {
    case 'NEW':
      return 'Fresh discovery. Decide whether this becomes managed work.';
    case 'INTERESTED':
      return 'Saved, but not yet turned into draft work.';
    case 'CRAFTING':
      return 'Resume or support material is actively being shaped.';
    case 'APPLIED':
      return 'Submission is done. Momentum depends on follow-through.';
    case 'SCREENING':
      return 'Early contact is happening. Keep proof close.';
    case 'INTERVIEW':
      return 'The story must hold up under conversation.';
    case 'OFFER':
      return 'Decision stage. Every detail matters.';
    default:
      return 'Tracked inside the cockpit.';
  }
}

function nextMove(stage: CockpitStage, resumeCount: number) {
  switch (stage) {
    case 'NEW':
      return 'Triage it fast. Save only if the angle is real.';
    case 'INTERESTED':
      return resumeCount > 0
        ? 'A draft already exists. Decide whether to push this into crafting.'
        : 'Decide whether this role deserves a tailored draft.';
    case 'CRAFTING':
      return 'Tighten the draft and move this toward a submission decision.';
    case 'APPLIED':
      return 'Track response timing and prepare the first follow-up.';
    case 'SCREENING':
      return 'Collect the proof and notes you need for the next conversation.';
    case 'INTERVIEW':
      return 'Turn the workspace into an interview prep desk, not a static record.';
    case 'OFFER':
      return 'Centralize compensation, tradeoffs, and close decision support.';
    default:
      return 'Keep the next move visible.';
  }
}

function compactMetric(label: string, value: string, accent?: string) {
  return (
    <div className="min-w-[128px] rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</div>
      <div className="mt-1 text-lg font-semibold" style={{ color: accent || '#ffffff' }}>
        {value}
      </div>
    </div>
  );
}

function RecentActivityRail({
  activeCardId,
  items,
  onSelect,
}: {
  activeCardId: string | null;
  items: CockpitPhaseOneViewModel['recentActivity'];
  onSelect: (id: string) => void;
}) {
  return (
    <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.32)]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/34">Jump Back In</div>
          <p className="mt-1 text-sm text-white/56">The last real work you touched, ordered for re-entry.</p>
        </div>
        <Link href="/pipeline" className="inline-flex items-center gap-1 text-xs text-white/42 transition hover:text-primary">
          Pipeline <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-8 text-sm text-white/40">
            No active work yet. Save a role and this becomes your re-entry lane.
          </div>
        ) : (
          items.map((item) => {
            const visual = STAGE_VISUALS[item.stage];
            const identity = companyIdentity(item.company);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  'group relative w-full overflow-hidden rounded-[24px] border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5',
                  activeCardId === item.id
                    ? 'border-white/18 bg-white/[0.05] shadow-[0_18px_36px_rgba(0,0,0,0.3)]'
                    : 'border-white/8 bg-black/20 hover:border-white/14 hover:bg-white/[0.04]',
                )}
              >
                <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: visual.accent }} />
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold"
                    style={{
                      background: identity.background,
                      border: identity.border,
                      color: identity.text,
                      boxShadow: identity.glow,
                    }}
                  >
                    {identity.initials}
                    <span
                      className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-black/60 animate-pulse"
                      style={{ backgroundColor: visual.accent }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{item.company}</div>
                        <div className="mt-0.5 truncate text-xs text-white/58">{item.title}</div>
                      </div>
                      <span
                        className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em]"
                        style={{
                          borderColor: visual.tint,
                          backgroundColor: visual.tint,
                          color: visual.accent,
                        }}
                      >
                        {visual.title}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-white/38">
                      <span>{formatShortDate(item.updatedAt)}</span>
                      <span>{recencyLabel(item.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

function WhileYouWereOutPanel({
  stats,
}: {
  stats: CockpitPhaseOneViewModel['whileYouWereOut'];
}) {
  const maxValue = Math.max(stats.newJobsCount, stats.matchedJobsCount, stats.highFitCount, 1);

  const rows = [
    {
      label: 'Fresh discovery',
      value: stats.newJobsCount,
      accent: '#f5b64b',
      description: 'New jobs arrived while you were away.',
    },
    {
      label: 'Worth a closer look',
      value: stats.matchedJobsCount,
      accent: '#53a6ff',
      description: 'Jobs already clearing the first relevance bar.',
    },
    {
      label: 'High fit right now',
      value: stats.highFitCount,
      accent: '#35e375',
      description: 'The small set that could deserve immediate attention.',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-primary/15 bg-[linear-gradient(145deg,rgba(53,227,117,0.15),rgba(8,8,8,0.95)_35%,rgba(82,214,255,0.08))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-primary/78">
              <Sparkles className="h-3.5 w-3.5" />
              While You Were Out
            </div>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/66">
              The market moved. This is the small slice that matters, not the whole firehose.
            </p>
          </div>
          <Link href="/triage" className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-black/25 px-3 py-2 text-xs font-medium text-primary transition hover:border-primary/50 hover:bg-black/40">
            Swipe fallback <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Discovery pulse</div>
            <div className="mt-1 text-5xl font-semibold text-white">
              {stats.newJobsCount.toLocaleString()}
            </div>
          </div>
          <div className="max-w-[240px] text-sm leading-relaxed text-white/54">
            Fewer numbers. More signal. Use this block to decide where attention actually goes next.
          </div>
        </div>

        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">{row.label}</div>
                  <div className="text-xs text-white/45">{row.description}</div>
                </div>
                <div className="text-2xl font-semibold" style={{ color: row.accent }}>
                  {row.value.toLocaleString()}
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(10, (row.value / maxValue) * 100)}%`,
                    background: `linear-gradient(90deg, ${row.accent}, rgba(255,255,255,0.55))`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RiverCard({
  card,
  active,
  onClick,
}: {
  card: CockpitCard;
  active: boolean;
  onClick: () => void;
}) {
  const visual = STAGE_VISUALS[card.stage];
  const identity = companyIdentity(card.company);
  const urgency = urgencyForStage(card.stage, card.updatedAt);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-[22px] border bg-[#0b0b0c] px-3.5 py-3 text-left transition-all duration-200 hover:-translate-y-0.5',
        active
          ? 'border-white/18 shadow-[0_18px_40px_rgba(0,0,0,0.38)]'
          : 'border-white/8 hover:border-white/16',
      )}
      style={{
        boxShadow: active ? `0 0 0 1px ${visual.tint}, 0 22px 45px rgba(0,0,0,0.32)` : undefined,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: visual.accent }} />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at top right, ${visual.tint}, transparent 55%)` }}
      />
      <div className="relative">
        <div className="flex items-start gap-3">
          <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold"
            style={{
              background: identity.background,
              border: identity.border,
              color: identity.text,
              boxShadow: identity.glow,
            }}
          >
            {identity.initials}
            {urgency.tone !== 'quiet' ? (
              <span
                className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-black/70 animate-pulse"
                style={{ backgroundColor: visual.accent }}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{card.company}</div>
                <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/60">
                  {card.title}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {card.scoreLabel ? (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      borderColor: visual.tint,
                      backgroundColor: visual.tint,
                      color: visual.accent,
                    }}
                  >
                    {card.scoreLabel}
                  </span>
                ) : null}
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', urgencyClasses(urgency.tone))}>
                  {urgency.label}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-white/42">
              <span className="truncate">{card.location || 'Location pending'}</span>
              <span className="shrink-0">{recencyLabel(card.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function RiverColumn({
  column,
  activeCardId,
  onOpenCard,
}: {
  column: CockpitRiverColumn;
  activeCardId: string | null;
  onOpenCard: (id: string) => void;
}) {
  const visual = STAGE_VISUALS[column.stage];

  return (
    <div
      className="min-w-[248px] max-w-[248px] overflow-hidden rounded-[28px] border bg-[#080809]"
      style={{
        borderColor: visual.tint,
        backgroundImage: `${visual.wash}, linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01))`,
      }}
    >
      <div className="border-b border-white/8 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                style={{ backgroundColor: visual.accent, color: visual.accent }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: visual.accent }}>
                {visual.title}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/45">{visual.hint}</p>
          </div>
          <div
            className="rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: visual.tint, backgroundColor: visual.tint, color: visual.accent }}
          >
            {column.total}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 p-3">
        {column.cards.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-7 text-center text-xs text-white/28">
            Quiet for now
          </div>
        ) : (
          column.cards.map((card) => (
            <RiverCard
              key={card.id}
              card={card}
              active={activeCardId === card.id}
              onClick={() => onOpenCard(card.id)}
            />
          ))
        )}
      </div>

      {column.total > column.cards.length ? (
        <div className="px-3 pb-3">
          <div className="rounded-[18px] border border-dashed border-white/10 px-3 py-2 text-center text-[11px] text-white/32">
            +{column.total - column.cards.length} more in {visual.title.toLowerCase()}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function stageTrack(stage: CockpitStage) {
  const activeIndex = STAGE_ORDER.indexOf(stage);
  return STAGE_ORDER.filter((_, index) => index <= activeIndex);
}

function WorkspacePanel({ panel, onClose }: { panel: CockpitPanelRecord; onClose: () => void }) {
  const visual = STAGE_VISUALS[panel.stage];
  const identity = companyIdentity(panel.company);
  const urgency = urgencyForStage(panel.stage, panel.updatedAt);
  const resumes = panel.resumes.slice(0, 4);

  return (
    <aside className="hidden lg:flex lg:w-[42%] lg:min-w-[430px] lg:flex-col">
      <div
        className="sticky top-4 overflow-hidden rounded-[32px] border bg-[#09090a] shadow-[0_26px_90px_rgba(0,0,0,0.44)]"
        style={{ borderColor: visual.tint }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: `radial-gradient(circle at top right, ${visual.tint}, transparent 55%)` }}
        />

        <div className="relative p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-base font-semibold"
                style={{
                  background: identity.background,
                  border: identity.border,
                  color: identity.text,
                  boxShadow: identity.glow,
                }}
              >
                {identity.initials}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: visual.accent }}>
                  {visual.title} workspace
                </div>
                <h2 className="mt-2 text-[28px] font-semibold leading-tight text-white">{panel.title}</h2>
                <p className="mt-1 text-sm text-white/56">
                  {panel.company}
                  {panel.location ? ` · ${panel.location}` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 p-2 text-white/45 transition hover:border-white/18 hover:text-white"
              aria-label="Close workspace panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <span
              className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
              style={{ borderColor: visual.tint, backgroundColor: visual.tint, color: visual.accent }}
            >
              {visual.title}
            </span>
            <span className={cn('rounded-full border px-3 py-1 text-xs font-medium', urgencyClasses(urgency.tone))}>
              {urgency.label}
            </span>
            {scoreLabel(panel.compositeScore) ? (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">
                {scoreLabel(panel.compositeScore)} fit
              </span>
            ) : null}
          </div>

          <div className="mb-5 rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/34">
              <Target className="h-3.5 w-3.5" />
              What this needs now
            </div>
            <p className="mt-3 text-base leading-relaxed text-white/82">{nextMove(panel.stage, panel.resumes.length)}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/54">{sectionIntro(panel.stage)}</p>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/34">
                <Eye className="h-3.5 w-3.5" />
                Story snapshot
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {panel.description.slice(0, 520) || 'No description loaded yet.'}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/34">
                <Clock3 className="h-3.5 w-3.5" />
                Stage track
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {stageTrack(panel.stage).map((stage) => {
                  const trackVisual = STAGE_VISUALS[stage];
                  return (
                    <span
                      key={stage}
                      className="rounded-full border px-3 py-1 text-[11px] font-medium"
                      style={{
                        borderColor: trackVisual.tint,
                        backgroundColor: stage === panel.stage ? trackVisual.tint : 'rgba(255,255,255,0.02)',
                        color: stage === panel.stage ? trackVisual.accent : '#d4d4d8',
                      }}
                    >
                      {trackVisual.title}
                    </span>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-white/48">
                Last touched {formatLongDate(panel.updatedAt)}. {panel.resumes.length} stored resume artifact{panel.resumes.length === 1 ? '' : 's'}.
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/34">
              <FileText className="h-3.5 w-3.5" />
              Documents and fallback
            </div>
            {resumes.length === 0 ? (
              <p className="mt-3 text-sm text-white/48">
                No stored resume artifacts yet. This shell is still read-only, so deeper editing stays in the fallback surfaces for now.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{resume.title}</div>
                      <div className="mt-1 text-xs text-white/42">
                        {resume.documentState} · {formatLongDate(resume.updatedAt)}
                      </div>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/44">
                      stored
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/8 pt-4 text-sm">
              {panel.workspaceId ? (
                <Link href={`/workspace/${panel.workspaceId}`} className="inline-flex items-center gap-1 text-primary transition hover:text-primary/80">
                  Open legacy workspace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Link href="/jobs" className="inline-flex items-center gap-1 text-primary transition hover:text-primary/80">
                  Open inbox fallback <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <span className="text-white/34">Fallback only until cockpit parity is real.</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function CockpitWireframeClient({
  userName,
  viewModel,
  panelRecords,
}: {
  userName: string;
  viewModel: CockpitPhaseOneViewModel;
  panelRecords: CockpitPanelRecord[];
}) {
  const [activeCardId, setActiveCardId] = useState<string | null>(viewModel.recentActivity[0]?.id ?? null);

  const panelLookup = new Map(panelRecords.map((record) => [record.id, record]));
  const activePanel = activeCardId ? panelLookup.get(activeCardId) ?? null : null;

  const craftingCount = viewModel.riverColumns.find((column) => column.stage === 'CRAFTING')?.total ?? 0;
  const lateStageCount =
    (viewModel.riverColumns.find((column) => column.stage === 'SCREENING')?.total ?? 0) +
    (viewModel.riverColumns.find((column) => column.stage === 'INTERVIEW')?.total ?? 0) +
    (viewModel.riverColumns.find((column) => column.stage === 'OFFER')?.total ?? 0);
  const activeManagedCount = viewModel.riverColumns
    .filter((column) => column.stage !== 'NEW')
    .reduce((total, column) => total + column.total, 0);

  return (
    <div className="min-h-screen bg-[#050506] text-white [background-image:radial-gradient(circle_at_top_left,rgba(53,227,117,0.09),transparent_28%),radial-gradient(circle_at_top_right,rgba(124,124,255,0.08),transparent_24%)]">
      <div className="mx-auto flex min-h-screen max-w-[1720px] flex-col px-5 pb-8 pt-5 lg:px-8">
        <header className="mb-5 border-b border-white/8 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.26em] text-primary/78">JobScout cockpit</div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
                Good morning, {userName.split(' ')[0] || userName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/54">
                The market moved. The river tells you what matters now.
              </p>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/28">Legacy fallbacks</div>
              <div className="mt-2 flex flex-wrap justify-end gap-2 text-xs text-white/42">
                <Link href="/jobs" className="transition hover:text-white">Inbox</Link>
                <span className="text-white/18">•</span>
                <Link href="/pipeline" className="transition hover:text-white">Pipeline</Link>
                <span className="text-white/18">•</span>
                <Link href="/resume" className="transition hover:text-white">Resume</Link>
                <span className="text-white/18">•</span>
                <Link href="/triage" className="text-primary transition hover:text-primary/80">Swipe</Link>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {compactMetric('Fresh matches', viewModel.whileYouWereOut.newJobsCount.toLocaleString(), STAGE_VISUALS.NEW.accent)}
            {compactMetric('Worth a look', viewModel.whileYouWereOut.matchedJobsCount.toLocaleString(), STAGE_VISUALS.INTERESTED.accent)}
            {compactMetric('Drafting now', craftingCount.toLocaleString(), STAGE_VISUALS.CRAFTING.accent)}
            {compactMetric('Managed work', activeManagedCount.toLocaleString(), '#ffffff')}
            {compactMetric('Beyond submit', lateStageCount.toLocaleString(), STAGE_VISUALS.APPLIED.accent)}
          </div>
        </header>

        <div className="flex flex-1 gap-5">
          <div className={cn('min-w-0 flex-1', activePanel ? 'lg:max-w-[calc(100%-450px)]' : '')}>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
              <RecentActivityRail
                activeCardId={activeCardId}
                items={viewModel.recentActivity}
                onSelect={setActiveCardId}
              />
              <WhileYouWereOutPanel stats={viewModel.whileYouWereOut} />
            </div>

            <section className="mt-4 overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
              <div className="flex flex-col gap-2 border-b border-white/8 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">The River</div>
                  <p className="mt-1 text-sm text-white/56">
                    Real state. Visible stage identity. Cards that signal what actually needs attention.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/42">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    live state
                  </span>
                  <span className="text-white/18">•</span>
                  <span>read-only for now</span>
                </div>
              </div>

              <div className="overflow-x-auto px-4 py-4">
                <div className="flex gap-4 pb-2">
                  {viewModel.riverColumns.map((column) => (
                    <RiverColumn
                      key={column.stage}
                      column={column}
                      activeCardId={activeCardId}
                      onOpenCard={setActiveCardId}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          {activePanel ? <WorkspacePanel panel={activePanel} onClose={() => setActiveCardId(null)} /> : null}
        </div>
      </div>
    </div>
  );
}
