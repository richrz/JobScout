'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Component, useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { generateAndPreviewResume } from '@/lib/resume-generator';
import { saveResume } from '@/app/resume/actions';
import type { ResumeDocumentData } from '@/lib/resume-document';
import {
  STRATEGY_OPTIONS,
  mapStrategyToExaggerationLevel,
  type ResumeWritingStrategy,
} from '@/lib/resume/voice-profile';
import {
  applyFactLocks,
  applyDraftReviewSelection,
  buildDraftReviewSelection,
  buildExperienceReviewEntries,
  buildInlineLineDiff,
  buildInlineWordDiff,
  buildKeywordCoverage,
  summarizeDraftDiff,
  type DraftDiffSummary,
  type FactLockState,
  type DraftReviewSelection,
} from '@/lib/resume/cockpit-drafting';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Loader2,
  MessageSquareMore,
  NotebookPen,
  Save,
  Sparkles,
  Target,
  Wand2,
  X,
} from 'lucide-react';
import type {
  CockpitCard,
  CockpitPhaseOneViewModel,
  CockpitKanbanColumn,
  CockpitStage,
} from '@/lib/cockpit-phase1';

const CockpitBlockNoteEditor = dynamic(
  () =>
    import('@/components/resume/CockpitBlockNoteEditor').then(
      (module) => module.CockpitBlockNoteEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/48">
        Loading deep editor...
      </div>
    ),
  },
);

export type CockpitPanelRecord = {
  id: string;
  kind: 'discovery' | 'managed';
  jobId: string;
  title: string;
  company: string;
  location: string | null;
  description: string;
  sourceUrl: string | null;
  salary: string | null;
  stage: CockpitStage;
  createdAt: string | null;
  updatedAt: string;
  workspaceId: string | null;
  workspaceStatus: string | null;
  noteCount: number;
  resumes: Array<{
    id: string;
    title: string;
    documentState: string;
    updatedAt: string;
  }>;
  compositeScore: number | null;
  draftSeed: CockpitDraftSeed | null;
};

export type CockpitDraftSeed = {
  source: 'career-data' | 'working-draft';
  updatedAt: string | null;
  content: ResumeDocumentData;
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

const EMPTY_DRAFT: ResumeDocumentData = {
  contactInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

type DraftPreviewBoundaryProps = {
  draft: ResumeDocumentData;
  children: ReactNode;
};

type DraftPreviewBoundaryState = {
  hasError: boolean;
};

class DraftPreviewBoundary extends Component<
  DraftPreviewBoundaryProps,
  DraftPreviewBoundaryState
> {
  state: DraftPreviewBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: DraftPreviewBoundaryProps) {
    if (this.state.hasError && prevProps.draft !== this.props.draft) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <PlainResumePreview draft={this.props.draft} />;
    }

    return this.props.children;
  }
}

function PlainResumePreview({ draft }: { draft: ResumeDocumentData }) {
  return (
    <div className="h-full overflow-y-auto px-5 py-5 text-sm text-white/78">
      <div className="border-b border-white/10 pb-4">
        <div className="text-2xl font-semibold text-white">
          {draft.contactInfo.name || 'Candidate'}
        </div>
        <div className="mt-2 text-xs text-white/48">
          {[draft.contactInfo.email, draft.contactInfo.phone, draft.contactInfo.location]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>

      <section className="mt-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">
          Professional Summary
        </div>
        <p className="mt-3 whitespace-pre-wrap leading-6 text-white/72">
          {draft.summary || 'No summary in this draft yet.'}
        </p>
      </section>

      <section className="mt-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Experience</div>
        <div className="mt-3 space-y-4">
          {draft.experience.length > 0 ? (
            draft.experience.map((role) => (
              <div key={role.id} className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
                <div className="text-sm font-medium text-white">
                  {role.title || 'Untitled role'}
                </div>
                <div className="mt-1 text-xs text-white/45">
                  {[role.company, role.location, role.startDate, role.endDate]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/68">
                  {role.description || 'No role description yet.'}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 px-3 py-4 text-white/34">
              No experience blocks in this draft yet.
            </div>
          )}
        </div>
      </section>

      <section className="mt-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Skills</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {draft.skills.length > 0 ? (
            draft.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/34">
              No visible skills yet
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

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

function formatDraftSource(source: CockpitDraftSeed['source']) {
  return source === 'working-draft' ? 'Working draft' : 'Career Data seed';
}

function normalizeSkillInput(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function InlineWordDiff({
  current,
  suggested,
}: {
  current: string;
  suggested: string;
}) {
  const chunks = buildInlineWordDiff(current, suggested);

  if (chunks.length === 0) {
    return (
      <span className="text-sm text-white/58">No wording differences were detected.</span>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm leading-6 text-white/80">
      {chunks.map((chunk, index) => (
        <span
          key={`${chunk.type}-${index}`}
          className={cn(
            chunk.type === 'added' && 'rounded bg-emerald-400/18 px-0.5 text-emerald-100',
            chunk.type === 'removed' && 'rounded bg-rose-400/16 px-0.5 text-rose-100 line-through',
          )}
        >
          {chunk.value}
        </span>
      ))}
    </p>
  );
}

function InlineLineDiff({
  current,
  suggested,
}: {
  current: string;
  suggested: string;
}) {
  const lines = buildInlineLineDiff(current, suggested);

  if (lines.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-white/10 px-3 py-3 text-xs text-white/34">
        No line-level bullet changes detected.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <div
          key={`${line.type}-${index}-${line.line}`}
          className={cn(
            'rounded-[12px] border px-3 py-2 text-xs leading-5',
            line.type === 'added' && 'border-emerald-400/24 bg-emerald-400/10 text-emerald-100',
            line.type === 'removed' && 'border-rose-400/24 bg-rose-400/10 text-rose-100',
            line.type === 'same' && 'border-white/10 bg-white/[0.03] text-white/62',
          )}
        >
          <span className="mr-2 inline-block min-w-[10px] font-semibold">
            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : '•'}
          </span>
          <span>{line.line}</span>
        </div>
      ))}
    </div>
  );
}

function documentStateLabel(value: string) {
  switch (value) {
    case 'REFERENCE':
      return 'Reference';
    case 'WORKING_DRAFT':
      return 'Working draft';
    case 'SAVED_VARIANT':
      return 'Saved variant';
    case 'SUBMITTED_SNAPSHOT':
      return 'Submitted snapshot';
    default:
      return value.toLowerCase().replace(/_/g, ' ');
  }
}

function humanizeRewriteError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Rewrite failed';

  if (/429/.test(message) && /glm-5/i.test(message)) {
    return 'Rewrite unavailable: this Z.AI plan does not currently include GLM-5 access.';
  }

  if (/unauthorized/i.test(message)) {
    return 'Rewrite unavailable: sign in again before generating a new draft.';
  }

  return message;
}

function latestResumeByState(panel: CockpitPanelRecord, state: string) {
  return panel.resumes.find((resume) => resume.documentState === state) || null;
}

function topProofPoints(panel: CockpitPanelRecord) {
  const draft = panel.draftSeed?.content;
  if (!draft) {
    return [];
  }

  return draft.experience
    .flatMap((role) =>
      (role.description || '')
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .slice(0, 4);
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

// ── Accent alpha helper ──────────────────────────────────────────────
function a(color: string, alpha: string) {
  return `${color}${alpha}`;
}

// ── Stage toolbar config ─────────────────────────────────────────────
type ToolbarAction = { label: string; key: string; icon?: string };
type ToolbarConfig = { actions: ToolbarAction[]; transition: { label: string; key: string } | null };

const STAGE_TOOLBAR: Record<CockpitStage, ToolbarConfig> = {
  NEW:        { actions: [{ label: 'Launch Swipe', key: 'swipe', icon: '👆' }, { label: 'Filter Batch', key: 'filter', icon: '🔍' }], transition: { label: "Yes, I'm Interested →", key: 'to-interested' } },
  INTERESTED: { actions: [{ label: 'Add Note', key: 'note', icon: '📝' }, { label: 'Research', key: 'research', icon: '🔎' }], transition: { label: 'Start Crafting →', key: 'to-crafting' } },
  CRAFTING:   { actions: [{ label: 'Generate Resume', key: 'generate', icon: '✨' }, { label: 'Keywords', key: 'keywords', icon: '🎯' }, { label: 'Fact Lock', key: 'factlock', icon: '🔒' }], transition: { label: 'Mark as Applied →', key: 'to-applied' } },
  APPLIED:    { actions: [{ label: 'Review Resume', key: 'review-resume', icon: '📄' }, { label: 'Log Follow-up', key: 'followup', icon: '📞' }], transition: { label: 'Heard Back →', key: 'to-screening' } },
  SCREENING:  { actions: [{ label: 'View Resume', key: 'view-resume', icon: '📄' }, { label: 'Call Notes', key: 'call-notes', icon: '📱' }], transition: { label: 'Interview Scheduled →', key: 'to-interview' } },
  INTERVIEW:  { actions: [{ label: 'Prep Sheet', key: 'prep', icon: '📋' }, { label: 'Add Round', key: 'add-round', icon: '🎤' }], transition: { label: 'Offer Received →', key: 'to-offer' } },
  OFFER:      { actions: [{ label: 'View Journey', key: 'journey', icon: '🗺' }, { label: 'Compare Offers', key: 'compare', icon: '⚖️' }], transition: null },
};

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

function KanbanCard({
  card,
  active,
  selected,
  ghosted,
  onClick,
}: {
  card: CockpitCard;
  active: boolean;
  selected?: boolean;
  ghosted?: boolean;
  onClick: () => void;
}) {
  const visual = STAGE_VISUALS[card.stage];
  const identity = companyIdentity(card.company);
  const urgency = urgencyForStage(card.stage, card.updatedAt);

  return (
    <div className={cn(ghosted && 'opacity-[0.15] transition-opacity hover:opacity-[0.7]')}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'group relative w-full overflow-hidden border bg-[#0b0b0c] px-4 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5',
          selected
            ? 'rounded-t-[16px] rounded-b-none border-white/18'
            : 'rounded-[16px] border-white/10 hover:border-white/18',
          active && !selected && 'border-white/18 shadow-[0_18px_40px_rgba(0,0,0,0.38)]',
        )}
        style={{
          boxShadow: selected
            ? `inset 0 0 0 1px ${a(visual.accent, '44')}, 0 8px 28px -12px ${a(visual.accent, '33')}`
            : active
              ? `0 0 0 1px ${visual.tint}, 0 22px 45px rgba(0,0,0,0.32)`
              : undefined,
          background: selected
            ? `linear-gradient(135deg, ${a(visual.accent, '18')}, rgb(14,18,26))`
            : undefined,
          borderBottomLeftRadius: selected ? 0 : undefined,
          borderBottomRightRadius: selected ? 0 : undefined,
        }}
      >
        {!selected && (
          <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: visual.accent }} />
        )}
        {selected && (
          <div
            className="absolute inset-y-0 left-0 w-[3px] rounded-tl-[14px]"
            style={{ backgroundColor: a(visual.accent, '55') }}
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at top right, ${visual.tint}, transparent 55%)` }}
        />
        <div className="relative">
          <div className="flex items-start gap-3">
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
              style={{
                background: identity.background,
                border: identity.border,
                color: identity.text,
              }}
            >
              {identity.initials}
              {urgency.tone !== 'quiet' ? (
                <span
                  className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-black/70 animate-pulse"
                  style={{ backgroundColor: visual.accent }}
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold tracking-[0.01em] text-white/92">{card.company}</div>
                  <div className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-white/78">
                    {card.title}
                  </div>
                </div>
                {card.scoreLabel ? (
                  <span
                    className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold"
                    style={{
                      borderColor: visual.tint,
                      backgroundColor: visual.tint,
                      color: visual.accent,
                    }}
                  >
                    {card.scoreLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/56">
                <span className="truncate pr-2">{card.location || 'Location pending'}</span>
                <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium', urgencyClasses(urgency.tone))}>
                  {urgency.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function KanbanColumn({
  column,
  activeCardId,
  selectedCardId,
  onOpenCard,
  onBrowseStage,
  visibleCardCount,
  onLoadMore,
}: {
  column: CockpitKanbanColumn;
  activeCardId: string | null;
  selectedCardId: string | null;
  onOpenCard: (id: string) => void;
  onBrowseStage: (stage: CockpitStage) => void;
  visibleCardCount?: number;
  onLoadMore?: () => void;
}) {
  const visual = STAGE_VISUALS[column.stage];
  const displayedCards =
    typeof visibleCardCount === 'number' ? column.cards.slice(0, visibleCardCount) : column.cards;
  const hasSelected = displayedCards.some((c) => c.id === selectedCardId);
  const selectedIdx = hasSelected ? displayedCards.findIndex((c) => c.id === selectedCardId) : -1;

  return (
    <div
      className="overflow-hidden rounded-[16px] bg-[#080809] p-2.5"
      style={{
        paddingBottom: hasSelected ? 0 : undefined,
        borderBottomLeftRadius: hasSelected ? 0 : undefined,
        borderBottomRightRadius: hasSelected ? 0 : undefined,
        boxShadow: hasSelected
          ? [
              `inset  2px  0   0 0 ${a(visual.accent, '55')}`,
              `inset -2px  0   0 0 ${a(visual.accent, '55')}`,
              `inset  0    2px 0 0 ${a(visual.accent, '55')}`,
              `0 8px 28px -12px ${a(visual.accent, '33')}`,
            ].join(', ')
          : '0 0 0 1px rgba(255,255,255,0.06) inset',
      }}
    >
      <button
        type="button"
        onClick={() => onBrowseStage(column.stage)}
        className="mb-2 flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: visual.accent, color: visual.accent }}
          />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: visual.accent }}>
            {visual.title}
          </span>
        </div>
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: a(visual.accent, '1c'), color: visual.accent }}
        >
          {column.total}
        </span>
      </button>

      <div className="space-y-2">
        {displayedCards.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/28">
            Empty
          </div>
        ) : (
          displayedCards.map((card, idx) => {
            const isGhosted = hasSelected && idx !== selectedIdx;
            return (
              <KanbanCard
                key={card.id}
                card={card}
                active={activeCardId === card.id}
                selected={card.id === selectedCardId}
                ghosted={isGhosted}
                onClick={() => onOpenCard(card.id)}
              />
            );
          })
        )}
      </div>

      {column.total > displayedCards.length && !hasSelected ? (
        <div className="mt-2 space-y-2">
          <div className="rounded-[10px] border border-dashed border-white/10 px-2 py-1.5 text-center text-[10px] text-white/38">
            Showing {displayedCards.length} of {column.total}
          </div>
          {onLoadMore ? (
            <button
              type="button"
              onClick={onLoadMore}
              className="w-full rounded-[10px] border border-white/12 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/78 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              Load more
            </button>
          ) : (
            <div className="rounded-[10px] border border-dashed border-white/10 px-2 py-1.5 text-center text-[10px] text-white/32">
              +{column.total - displayedCards.length} more
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function stageTrack(stage: CockpitStage) {
  const activeIndex = STAGE_ORDER.indexOf(stage);
  return STAGE_ORDER.filter((_, index) => index <= activeIndex);
}

type WorkspaceNote = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

function WorkspaceNotesDesk({
  workspaceId,
  title,
  intro,
  accent,
  placeholder,
  emptyState,
}: {
  workspaceId: string;
  title: string;
  intro: string;
  accent: string;
  placeholder?: string;
  emptyState?: string;
}) {
  const [notes, setNotes] = useState<WorkspaceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [draftNote, setDraftNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNotes() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/workspace/${workspaceId}/notes`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load notes');
        }

        if (!cancelled) {
          setNotes(payload.notes || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load notes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  async function handleCreateNote() {
    if (!draftNote.trim()) {
      return;
    }

    setPosting(true);
    setError(null);

    try {
      const response = await fetch(`/api/workspace/${workspaceId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draftNote.trim() }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create note');
      }

      setNotes((current) => [payload.note, ...current]);
      setDraftNote('');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create note');
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
        <NotebookPen className="h-3.5 w-3.5" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-white/58">{intro}</p>

      <div className="mt-4">
        <CockpitBlockNoteEditor
          key={`notes-input-${workspaceId}`}
          value={draftNote}
          onChange={setDraftNote}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-white/36">Notes stay attached to this opportunity.</span>
          <Button
            type="button"
            onClick={handleCreateNote}
            disabled={posting || !draftNote.trim()}
            className="gap-2 rounded-full"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareMore className="h-4 w-4" />}
            {posting ? 'Saving note...' : 'Add note'}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-black/20 px-3 py-4 text-sm text-white/54">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading workspace notes...
          </div>
        ) : error ? (
          <div className="rounded-[18px] border border-rose-400/30 bg-rose-500/10 px-3 py-4 text-sm text-rose-100">
            {error}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-white/10 px-3 py-5 text-sm text-white/38">
            {emptyState || 'No notes yet. Add the first reason this opportunity matters.'}
          </div>
        ) : (
          notes.slice(0, 5).map((note) => (
            <article key={note.id} className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/30">
                {formatLongDate(note.updatedAt)}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/72">{note.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function CraftingDesk({ panel, accent }: { panel: CockpitPanelRecord; accent: string }) {
  type DeepEditorTarget =
    | { kind: 'summary' }
    | { kind: 'experience'; roleIndex: number };

  const [strategy, setStrategy] = useState<ResumeWritingStrategy>('balanced');
  const [draft, setDraft] = useState<ResumeDocumentData>(panel.draftSeed?.content ?? EMPTY_DRAFT);
  const [skillInput, setSkillInput] = useState((panel.draftSeed?.content.skills || []).join(', '));
  const [factLocks, setFactLocks] = useState<FactLockState>({
    contactInfo: true,
    workHistoryFacts: true,
    education: true,
    skills: false,
    metrics: true,
  });
  const [pendingDraft, setPendingDraft] = useState<ResumeDocumentData | null>(null);
  const [diffSummary, setDiffSummary] = useState<DraftDiffSummary | null>(null);
  const [reviewSelection, setReviewSelection] = useState<DraftReviewSelection | null>(null);
  const [rewriting, setRewriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [showDeepEditor, setShowDeepEditor] = useState(false);
  const [deepEditorSummary, setDeepEditorSummary] = useState(
    panel.draftSeed?.content.summary ?? '',
  );
  const [deepEditorTarget, setDeepEditorTarget] = useState<DeepEditorTarget>({
    kind: 'summary',
  });

  useEffect(() => {
    const nextDraft = panel.draftSeed?.content ?? EMPTY_DRAFT;
    setDraft(nextDraft);
    setSkillInput(nextDraft.skills.join(', '));
    setStrategy('balanced');
    setFactLocks({
      contactInfo: true,
      workHistoryFacts: true,
      education: true,
      skills: false,
      metrics: true,
    });
    setPendingDraft(null);
    setDiffSummary(null);
    setReviewSelection(null);
    setStatusMessage(null);
    setSaveState('idle');
    setShowDeepEditor(false);
    setDeepEditorSummary(nextDraft.summary ?? '');
    setDeepEditorTarget({ kind: 'summary' });
  }, [panel.id, panel.draftSeed]);

  const normalizedDraft: ResumeDocumentData = {
    ...draft,
    skills: normalizeSkillInput(skillInput),
  };
  const currentCoverage = buildKeywordCoverage(panel.description, normalizedDraft);
  const reviewedDraft =
    pendingDraft && reviewSelection
      ? applyDraftReviewSelection(normalizedDraft, pendingDraft, reviewSelection)
      : pendingDraft;
  const stagedCoverage = pendingDraft
    ? buildKeywordCoverage(panel.description, reviewedDraft ?? pendingDraft)
    : null;
  const previewDraft = reviewedDraft ?? normalizedDraft;
  const matchedKeywords = pendingDraft
    ? stagedCoverage?.matchedKeywords ?? []
    : currentCoverage.matchedKeywords;
  const missingKeywords = pendingDraft
    ? stagedCoverage?.missingKeywords ?? []
    : currentCoverage.missingKeywords;
  const experienceReviewEntries = pendingDraft
    ? buildExperienceReviewEntries(normalizedDraft, pendingDraft)
    : [];

  function updateExperienceDescription(index: number, value: string) {
    setDraft((current) => ({
      ...current,
      experience: current.experience.map((role, roleIndex) =>
        roleIndex === index ? { ...role, description: value } : role,
      ),
    }));
  }

  function deepEditorValueForTarget(target: DeepEditorTarget) {
    if (target.kind === 'summary') {
      return draft.summary || '';
    }

    const role = draft.experience[target.roleIndex];
    return role?.description || '';
  }

  function deepEditorTargetLabel(target: DeepEditorTarget) {
    if (target.kind === 'summary') {
      return 'Opening summary';
    }

    const role = draft.experience[target.roleIndex];
    const title = role?.title || `Role ${target.roleIndex + 1}`;
    const company = role?.company ? ` · ${role.company}` : '';
    return `${title}${company}`;
  }

  function loadDeepEditorFromDraft(target: DeepEditorTarget = deepEditorTarget) {
    setDeepEditorTarget(target);
    setDeepEditorSummary(deepEditorValueForTarget(target));
    setShowDeepEditor(true);
    setStatusMessage(`Deep editor loaded from ${deepEditorTargetLabel(target)}.`);
  }

  function applyDeepEditorToDraft() {
    const nextValue = deepEditorSummary.trim();

    if (deepEditorTarget.kind === 'summary') {
      setDraft((current) => ({ ...current, summary: nextValue }));
      setStatusMessage('BlockNote summary applied to the draft.');
      return;
    }

    setDraft((current) => ({
      ...current,
      experience: current.experience.map((role, index) =>
        index === deepEditorTarget.roleIndex
          ? { ...role, description: nextValue }
          : role,
      ),
    }));
    setStatusMessage(`BlockNote narrative applied to ${deepEditorTargetLabel(deepEditorTarget)}.`);
  }

  function toggleFactLock(key: keyof FactLockState) {
    setFactLocks((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function setSectionReview(section: keyof DraftReviewSelection, mode: 'current' | 'suggested') {
    setReviewSelection((current) => ({
      summary: current?.summary ?? 'current',
      skills: current?.skills ?? 'current',
      experience: current?.experience ?? 'current',
      [section]: mode,
    }));
  }

  async function handleRewrite() {
    setRewriting(true);
    setStatusMessage(null);

    try {
      const result = await generateAndPreviewResume(
        panel.jobId,
        mapStrategyToExaggerationLevel(strategy),
      );

      if (!result.success || !result.content) {
        throw new Error(result.error || 'Rewrite failed');
      }

      const protectedDraft = applyFactLocks(
        normalizedDraft,
        result.content as ResumeDocumentData,
        factLocks,
      );

      const nextDiff = summarizeDraftDiff(normalizedDraft, protectedDraft);
      setPendingDraft(protectedDraft);
      setDiffSummary(nextDiff);
      setReviewSelection(buildDraftReviewSelection(nextDiff));
      setSaveState('idle');
      setStatusMessage('Suggested rewrite is ready for review. Your working draft has not changed yet.');
    } catch (rewriteError) {
      setStatusMessage(humanizeRewriteError(rewriteError));
    } finally {
      setRewriting(false);
    }
  }

  function handleApplySuggestedDraft() {
    if (!pendingDraft) {
      return;
    }

    const reviewed = reviewSelection
      ? applyDraftReviewSelection(normalizedDraft, pendingDraft, reviewSelection)
      : pendingDraft;

    setDraft(reviewed);
    setSkillInput((reviewed.skills || []).join(', '));
    setPendingDraft(null);
    setDiffSummary(null);
    setReviewSelection(null);
    setSaveState('idle');
    setStatusMessage('Selected rewrite changes applied to the draft. Save when ready.');
  }

  function handleKeepCurrentDraft() {
    setPendingDraft(null);
    setDiffSummary(null);
    setReviewSelection(null);
    setStatusMessage('Suggested rewrite discarded. Your current draft stays in place.');
  }

  async function handleSaveDraft() {
    setSaving(true);
    setStatusMessage(null);

    try {
      const result = await saveResume(panel.jobId, normalizedDraft);

      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }

      setSaveState('saved');
      setStatusMessage('Working draft saved to this workspace.');
    } catch (saveError) {
      setSaveState('error');
      setStatusMessage(saveError instanceof Error ? saveError.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
        <FileText className="h-3.5 w-3.5" />
        Drafting studio
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/34">
            <span className="rounded-full border border-white/10 px-2 py-1 text-white/55">
              {panel.draftSeed ? formatDraftSource(panel.draftSeed.source) : 'No draft seed'}
            </span>
            {panel.draftSeed?.updatedAt ? (
              <span className="rounded-full border border-white/10 px-2 py-1 text-white/55">
                {formatLongDate(panel.draftSeed.updatedAt)}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-6 text-white/62">
            This is the cockpit-owned drafting studio for this opportunity. Rewrite against the live role, inspect the changes, then confirm before anything replaces your working draft.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Rewrite strength</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STRATEGY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setStrategy(option.id)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-xs font-medium transition',
                      strategy === option.id
                        ? 'border-primary/50 bg-primary/15 text-primary'
                        : 'border-white/10 bg-white/[0.03] text-white/56 hover:border-white/18 hover:text-white',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={handleRewrite}
                disabled={rewriting}
                className="gap-2 rounded-full"
              >
                {rewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {rewriting ? 'Rewriting...' : 'Rewrite draft'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
                className="gap-2 rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saveState === 'saved' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save draft'}
              </Button>
            </div>

            <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-3 text-xs leading-5 text-white/48">
              Rewrites are staged for review first. They do not replace the current draft until you accept them.
            </div>

            {statusMessage ? (
              <div
                className={cn(
                  'rounded-[16px] border px-3 py-2 text-sm',
                  saveState === 'error'
                    ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                    : 'border-white/10 bg-white/[0.03] text-white/62',
                )}
              >
                {statusMessage}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                {pendingDraft ? 'Suggested draft preview' : 'Live draft preview'}
              </div>
              <p className="mt-2 text-sm leading-6 text-white/52">
                {pendingDraft
                  ? 'This preview is the staged rewrite. Confirm it before it replaces your working draft.'
                  : 'This is the current draft that will save back to the workspace.'}
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/46">
              {pendingDraft ? 'review mode' : 'working draft'}
            </span>
          </div>

          <div className="mt-3 h-[520px] overflow-hidden rounded-[18px] border border-white/10 bg-[#0b0b0c]">
            <DraftPreviewBoundary draft={previewDraft}>
              <ResumePreview data={previewDraft} mode="dark" />
            </DraftPreviewBoundary>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.16em] text-white/34">Opening summary</label>
                <p className="mt-2 text-xs leading-5 text-white/44">
                  Quick edits live here. BlockNote can edit the summary or any role narrative.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => loadDeepEditorFromDraft({ kind: 'summary' })}
                  className="rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                >
                  Open BlockNote editor
                </Button>
              {showDeepEditor ? (
                <Button
                  type="button"
                  onClick={applyDeepEditorToDraft}
                  className="rounded-full"
                >
                  Apply BlockNote summary
                </Button>
              ) : null}
            </div>
          </div>
          <Textarea
            value={draft.summary}
            onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
            className="mt-3 min-h-[160px] border-white/10 bg-white/[0.02] text-white placeholder:text-white/26"
            placeholder="Shape the opening pitch for this specific role."
          />
          {showDeepEditor ? (
            <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.02] p-3">
              <div className="mb-3 text-[11px] uppercase tracking-[0.16em] text-white/36">
                BlockNote deep editor
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={deepEditorTarget.kind === 'summary' ? 'default' : 'outline'}
                  onClick={() => loadDeepEditorFromDraft({ kind: 'summary' })}
                  className="rounded-full"
                >
                  Summary
                </Button>
                {draft.experience.slice(0, 4).map((role, roleIndex) => (
                  <Button
                    key={role.id}
                    type="button"
                    size="sm"
                    variant={
                      deepEditorTarget.kind === 'experience' &&
                      deepEditorTarget.roleIndex === roleIndex
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() =>
                      loadDeepEditorFromDraft({ kind: 'experience', roleIndex })
                    }
                    className="rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  >
                    {role.title || `Role ${roleIndex + 1}`}
                  </Button>
                ))}
              </div>
              <div className="mb-3 rounded-[12px] border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/56">
                Editing target: {deepEditorTargetLabel(deepEditorTarget)}
              </div>
              <CockpitBlockNoteEditor
                value={deepEditorSummary}
                onChange={setDeepEditorSummary}
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
          <label className="text-[11px] uppercase tracking-[0.16em] text-white/34">Visible skills</label>
          <Input
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            className="mt-3 border-white/10 bg-white/[0.02] text-white"
            placeholder="AWS, Solution Selling, AI, Architecture"
          />
          <p className="mt-3 text-xs leading-5 text-white/42">
            Comma-separated. Keep this tight so the draft stays readable.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {normalizedDraft.skills.length === 0 ? (
              <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/32">
                No visible skills yet
              </span>
            ) : (
              normalizedDraft.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[20px] border border-white/10 bg-black/25 p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Experience focus</div>
          <p className="mt-2 text-sm leading-6 text-white/52">
            Tighten the proof and phrasing on the roles most likely to carry this application.
          </p>
          <div className="mt-4 space-y-3">
            {draft.experience.slice(0, 3).map((role, index) => (
              <div key={role.id} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm font-medium text-white">{role.title || 'Untitled role'}</div>
                <div className="mt-1 text-xs text-white/45">
                  {[role.company, role.location].filter(Boolean).join(' · ') || 'Role facts stay visible here'}
                </div>
                <Textarea
                  value={role.description}
                  onChange={(event) => updateExperienceDescription(index, event.target.value)}
                  className="mt-3 min-h-[120px] border-white/10 bg-black/25 text-white placeholder:text-white/24"
                  placeholder="Shape the evidence and story for this role."
                />
              </div>
            ))}
            {draft.experience.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-5 text-sm text-white/38">
                No experience blocks are available in this draft yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <section className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Fact lock</div>
            <p className="mt-2 text-sm leading-6 text-white/52">
              These controls protect the facts you do not want the rewrite pass to move or soften.
            </p>
            <div className="mt-4 space-y-2">
              {[
                {
                  key: 'contactInfo' as const,
                  label: 'Contact details',
                  description: 'Name, email, phone, and location stay untouched.',
                },
                {
                  key: 'workHistoryFacts' as const,
                  label: 'Work history facts',
                  description: 'Titles, companies, locations, and dates stay fixed.',
                },
                {
                  key: 'metrics' as const,
                  label: 'Metrics and numbers',
                  description: 'Keep numeric proof lines from being dropped during rewrite.',
                },
                {
                  key: 'skills' as const,
                  label: 'Visible skills',
                  description: 'Preserve the current skills list instead of letting rewrite replace it.',
                },
              ].map((lock) => {
                const isOn = Boolean(factLocks[lock.key]);
                return (
                  <button
                    key={lock.key}
                    type="button"
                    onClick={() => toggleFactLock(lock.key)}
                    className={cn(
                      'flex w-full items-start justify-between gap-3 rounded-[16px] border px-3 py-3 text-left transition',
                      isOn
                        ? 'border-primary/35 bg-primary/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/18',
                    )}
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{lock.label}</div>
                      <div className="mt-1 text-xs leading-5 text-white/46">{lock.description}</div>
                    </div>
                    <span
                      className={cn(
                        'rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em]',
                        isOn
                          ? 'border-primary/35 bg-primary/10 text-primary'
                          : 'border-white/10 text-white/42',
                      )}
                    >
                      {isOn ? 'locked' : 'editable'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-white/10 bg-black/25 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Keyword coverage</div>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  Coverage is visible, not hidden behind an opaque ATS score.
                </p>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/62">
                {pendingDraft ? `${stagedCoverage?.coveragePercent ?? currentCoverage.coveragePercent}% staged` : `${currentCoverage.coveragePercent}% current`}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Covered now</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {matchedKeywords.slice(0, 8).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                    >
                      {keyword}
                    </span>
                  ))}
                  {matchedKeywords.length === 0 ? (
                    <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/30">
                      No strong keyword overlap yet
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Still missing</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingKeywords.slice(0, 8).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100"
                    >
                      {keyword}
                    </span>
                  ))}
                  {missingKeywords.length === 0 ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                      Core keywords are covered
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {pendingDraft && diffSummary ? (
        <section className="mt-4 rounded-[20px] border border-primary/20 bg-[linear-gradient(180deg,rgba(53,227,117,0.08),rgba(255,255,255,0.02))] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-primary/80">
                Review rewrite before replacing your draft
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">
                This is a staged rewrite only. Compare it, then choose whether to apply it to the working draft.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleApplySuggestedDraft}
                className="gap-2 rounded-full"
              >
                <CheckCircle2 className="h-4 w-4" />
                Apply selected changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleKeepCurrentDraft}
                className="gap-2 rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <X className="h-4 w-4" />
                Keep current draft
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {diffSummary.changedSections.map((section) => (
              <span
                key={section}
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary"
              >
                {section === 'contactInfo'
                  ? 'contact'
                  : section === 'experience'
                    ? 'work history'
                    : section}
              </span>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {diffSummary.summaryChanged ? (
              <section className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Summary review</div>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      Choose whether the rewrite should replace the opening summary for this draft.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={reviewSelection?.summary === 'suggested' ? 'default' : 'outline'}
                      onClick={() => setSectionReview('summary', 'suggested')}
                      className="rounded-full"
                    >
                      Use suggested opening summary
                    </Button>
                    <Button
                      type="button"
                      variant={reviewSelection?.summary === 'current' ? 'default' : 'outline'}
                      onClick={() => setSectionReview('summary', 'current')}
                      className="rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    >
                      Keep current opening summary
                    </Button>
                  </div>
                </div>

                <div className="mt-4 rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                    Inline wording diff
                  </div>
                  <p className="mt-2 text-xs text-white/46">
                    Added phrasing is highlighted in green. Removed phrasing is struck in red.
                  </p>
                  <div className="mt-3">
                    <InlineWordDiff
                      current={normalizedDraft.summary || ''}
                      suggested={pendingDraft.summary || ''}
                    />
                  </div>
                </div>
              </section>
            ) : null}

            {(diffSummary.skills.added.length > 0 || diffSummary.skills.removed.length > 0) ? (
              <section className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Skills review</div>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      Decide whether the visible skills list should stay current or take the staged rewrite.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={reviewSelection?.skills === 'suggested' ? 'default' : 'outline'}
                      onClick={() => setSectionReview('skills', 'suggested')}
                      className="rounded-full"
                    >
                      Use suggested visible skills
                    </Button>
                    <Button
                      type="button"
                      variant={reviewSelection?.skills === 'current' ? 'default' : 'outline'}
                      onClick={() => setSectionReview('skills', 'current')}
                      className="rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    >
                      Keep current visible skills
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Current list</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {normalizedDraft.skills.length > 0 ? (
                        normalizedDraft.skills.map((skill) => (
                          <span key={skill} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/64">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/30">
                          No current skills
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-primary/20 bg-primary/[0.06] p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-primary/75">Suggested list</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pendingDraft.skills.length > 0 ? (
                        pendingDraft.skills.map((skill) => (
                          <span key={skill} className="rounded-full border border-primary/20 px-3 py-1 text-xs text-primary">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/30">
                          No suggested skills
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">Delta</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {diffSummary.skills.added.map((skill) => (
                        <span key={`add-${skill}`} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                          + {skill}
                        </span>
                      ))}
                      {diffSummary.skills.removed.map((skill) => (
                        <span key={`remove-${skill}`} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100">
                          - {skill}
                        </span>
                      ))}
                      {diffSummary.skills.added.length === 0 && diffSummary.skills.removed.length === 0 ? (
                        <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/30">
                          No skills changed
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {experienceReviewEntries.length > 0 ? (
              <section className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Experience review</div>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      Review role-by-role changes before the rewrite touches your working history blocks.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={reviewSelection?.experience === 'suggested' ? 'default' : 'outline'}
                      onClick={() => setSectionReview('experience', 'suggested')}
                      className="rounded-full"
                    >
                      Use suggested experience focus
                    </Button>
                    <Button
                      type="button"
                      variant={reviewSelection?.experience === 'current' ? 'default' : 'outline'}
                      onClick={() => setSectionReview('experience', 'current')}
                      className="rounded-full border-white/14 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                    >
                      Keep current experience focus
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {experienceReviewEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium text-white">{entry.title || 'Untitled role'}</div>
                          <div className="mt-1 text-xs text-white/45">{entry.company || 'Unknown company'}</div>
                        </div>
                        <span
                          className={cn(
                            'rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                            entry.status === 'added'
                              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                              : entry.status === 'removed'
                                ? 'border-rose-400/20 bg-rose-400/10 text-rose-100'
                                : 'border-primary/20 bg-primary/10 text-primary',
                          )}
                        >
                          {entry.status}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                          Narrative diff
                        </div>
                        <p className="mt-2 text-xs text-white/46">
                          Wording changes and bullet changes are both shown before apply.
                        </p>
                        {entry.status === 'updated' ? (
                          <div className="mt-3 rounded-[14px] border border-white/10 bg-black/25 p-3">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">
                              Inline wording diff
                            </div>
                            <div className="mt-3">
                              <InlineWordDiff
                                current={entry.currentDescription || ''}
                                suggested={entry.suggestedDescription || ''}
                              />
                            </div>
                          </div>
                        ) : null}
                        <div className="mt-3">
                          <InlineLineDiff
                            current={entry.currentDescription || ''}
                            suggested={entry.suggestedDescription || ''}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function StageAssetStack({ panel }: { panel: CockpitPanelRecord }) {
  const relevantResumes = panel.resumes.slice(0, 4);

  return (
    <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/34">
        <FileText className="h-3.5 w-3.5" />
        Workspace assets
      </div>
      {relevantResumes.length === 0 ? (
        <p className="mt-3 text-sm text-white/48">
          No stored resume artifacts yet for this opportunity.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {relevantResumes.map((resume) => (
            <div
              key={resume.id}
              className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{resume.title}</div>
                <div className="mt-1 text-xs text-white/42">
                  {documentStateLabel(resume.documentState)} · {formatLongDate(resume.updatedAt)}
                </div>
              </div>
              <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/44">
                stored
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AppliedDesk({ panel, accent }: { panel: CockpitPanelRecord; accent: string }) {
  const submittedSnapshot = latestResumeByState(panel, 'SUBMITTED_SNAPSHOT');
  const sentAt = panel.createdAt || panel.updatedAt;

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          <Briefcase className="h-3.5 w-3.5" />
          Submission record
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Status</div>
            <div className="mt-2 text-base font-semibold text-white">Application sent</div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Sent {formatLongDate(sentAt)}. This is where follow-up timing and the exact package stay visible.
            </p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Source revealed</div>
            {panel.sourceUrl ? (
              <a
                href={panel.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                View application source <ArrowRight className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-2 text-sm leading-6 text-white/56">
                Source link is not available on this record yet.
              </p>
            )}
            <p className="mt-2 text-xs text-white/38">
              Source stays hidden earlier in the pipeline and only becomes useful here.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25 p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Package sent</div>
          <p className="mt-2 text-sm leading-6 text-white/56">
            {submittedSnapshot
              ? `Latest submitted snapshot: ${submittedSnapshot.title} (${formatLongDate(submittedSnapshot.updatedAt)}).`
              : 'No explicit submitted snapshot is stored yet. The workspace still holds the current document trail.'}
          </p>
        </div>
      </section>

      <WorkspaceNotesDesk
        workspaceId={panel.workspaceId!}
        title="Follow-up log"
        intro="Track recruiter responses, follow-up timing, and anything you learn after the application leaves your hands."
        accent={accent}
        placeholder="Add a follow-up note, submission detail, or response update."
        emptyState="No follow-up notes yet. Capture the first post-submit update here."
      />

      <StageAssetStack panel={panel} />
    </div>
  );
}

function ScreeningDesk({ panel, accent }: { panel: CockpitPanelRecord; accent: string }) {
  const draft = panel.draftSeed?.content;
  const proofPoints = topProofPoints(panel);

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          <Target className="h-3.5 w-3.5" />
          Screening desk
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Conversation angle</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Use this stage to turn the draft into talking points for the first human conversation.
            </p>
            {draft?.summary ? (
              <p className="mt-3 text-sm leading-6 text-white/72">{draft.summary}</p>
            ) : null}
          </div>
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Signal to keep close</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(draft?.skills || []).slice(0, 6).map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62">
                  {skill}
                </span>
              ))}
              {(!draft?.skills || draft.skills.length === 0) && (
                <span className="rounded-full border border-dashed border-white/10 px-3 py-1 text-xs text-white/32">
                  No key skills surfaced yet
                </span>
              )}
            </div>
          </div>
        </div>

        {proofPoints.length > 0 ? (
          <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Proof points</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-white/68">
              {proofPoints.slice(0, 3).map((point) => (
                <li key={point} className="rounded-[14px] border border-white/8 bg-white/[0.02] px-3 py-2">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <WorkspaceNotesDesk
        workspaceId={panel.workspaceId!}
        title="Recruiter and screening notes"
        intro="Store names, conversation details, and what the other side seems to care about."
        accent={accent}
        placeholder="Add screening notes, recruiter details, or next-step commitments."
        emptyState="No screening notes yet. Capture the first live contact here."
      />
    </div>
  );
}

function InterviewDesk({ panel, accent }: { panel: CockpitPanelRecord; accent: string }) {
  const draft = panel.draftSeed?.content;
  const proofPoints = topProofPoints(panel);

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          <Sparkles className="h-3.5 w-3.5" />
          Interview prep board
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Story to hold</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              This is the stage where the written draft has to survive real questions and follow-up.
            </p>
            {draft?.summary ? (
              <p className="mt-3 text-sm leading-6 text-white/72">{draft.summary}</p>
            ) : null}
          </div>
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Signals you should be ready to defend</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(draft?.skills || []).slice(0, 6).map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-white/10 bg-black/25 p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Examples to bring</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/68">
            {(proofPoints.length ? proofPoints : ['Add notes after the screen so the best examples stay visible here.']).slice(0, 4).map((point) => (
              <li key={point} className="rounded-[14px] border border-white/8 bg-white/[0.02] px-3 py-2">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <WorkspaceNotesDesk
        workspaceId={panel.workspaceId!}
        title="Interview prep notes"
        intro="Collect likely questions, your strongest examples, and post-interview follow-ups in one place."
        accent={accent}
        placeholder="Add interview questions, answers, or post-call notes."
        emptyState="No interview notes yet. Start capturing prep and debrief details here."
      />
    </div>
  );
}

function OfferDesk({ panel, accent }: { panel: CockpitPanelRecord; accent: string }) {
  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          <Target className="h-3.5 w-3.5" />
          Decision board
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Role context</div>
            <div className="mt-2 text-base font-semibold text-white">{panel.company}</div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              {[panel.title, panel.location].filter(Boolean).join(' · ') || 'Offer details will settle here.'}
            </p>
            {panel.salary ? (
              <p className="mt-3 text-sm font-medium text-emerald-200">{panel.salary}</p>
            ) : null}
          </div>
          <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/32">Decision support</div>
            <p className="mt-2 text-sm leading-6 text-white/56">
              Track tradeoffs, negotiation notes, and what would make this a yes or a no.
            </p>
            {panel.sourceUrl ? (
              <a
                href={panel.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                View original role <ArrowRight className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <WorkspaceNotesDesk
        workspaceId={panel.workspaceId!}
        title="Offer decision notes"
        intro="Keep the decision logic and negotiation thread visible so the last step does not fragment across tools."
        accent={accent}
        placeholder="Add offer terms, negotiation notes, or final decision factors."
        emptyState="No decision notes yet. Start capturing tradeoffs and offer details here."
      />

      <StageAssetStack panel={panel} />
    </div>
  );
}

function WorkspaceSection({
  panel,
  colIdx,
  onClose,
  onTransition,
}: {
  panel: CockpitPanelRecord;
  colIdx: number;
  onClose: () => void;
  onTransition: (key: string) => void;
}) {
  const visual = STAGE_VISUALS[panel.stage];
  const identity = companyIdentity(panel.company);
  const urgency = urgencyForStage(panel.stage, panel.updatedAt);
  const toolbar = STAGE_TOOLBAR[panel.stage];
  const shoulderLeftW = `calc(${colIdx} * (100% + 0.5rem) / 7)`;
  const shoulderRightW = `calc(${6 - colIdx} * (100% + 0.5rem) / 7)`;

  return (
    <section
      className="relative p-6"
      style={{
        borderRadius: '0 0 20px 20px',
        background: 'linear-gradient(160deg, rgb(20,26,36) 0%, rgb(13,17,25) 50%, rgb(9,12,19) 100%)',
        boxShadow: [
          `inset  2px  0   0 0 ${a(visual.accent, '55')}`,
          `inset -2px  0   0 0 ${a(visual.accent, '55')}`,
          `inset  0   -2px 0 0 ${a(visual.accent, '55')}`,
          `0 40px 100px -50px rgba(0,0,0,0.9)`,
          `0 0 80px -20px ${a(visual.accent, '18')}`,
        ].join(', '),
      }}
    >
      {/* Left shoulder */}
      {colIdx > 0 && (
        <motion.div
          key={`ls-${panel.stage}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: shoulderLeftW, height: 2,
            transformOrigin: 'right center',
            background: a(visual.accent, '55'),
          }}
        />
      )}
      {/* Right shoulder */}
      {colIdx < 6 && (
        <motion.div
          key={`rs-${panel.stage}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute', top: 0, right: 0,
            width: shoulderRightW, height: 2,
            transformOrigin: 'left center',
            background: a(visual.accent, '55'),
          }}
        />
      )}

      {/* Accent rule */}
      <div className="mb-5 h-px" style={{ background: `linear-gradient(90deg, transparent, ${a(visual.accent, '44')}, transparent)` }} />

      {/* Stage toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {toolbar.actions.map((action) => (
            <button
              key={action.key}
              type="button"
              className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-white/[0.06]"
              style={{ borderColor: a(visual.accent, '33'), color: a(visual.accent, 'cc') }}
            >
              {action.icon ? `${action.icon} ` : ''}{action.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {toolbar.transition ? (
            <button
              type="button"
              onClick={() => onTransition(toolbar.transition!.key)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition hover:brightness-110"
              style={{ backgroundColor: a(visual.accent, '22'), color: visual.accent, border: `1px solid ${a(visual.accent, '44')}` }}
            >
              {toolbar.transition.label}
            </button>
          ) : null}
          {panel.stage === 'OFFER' ? (
            <>
              <button
                type="button"
                onClick={() => onTransition('accept')}
                className="rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                style={{ border: '1px solid rgba(52,211,153,0.35)' }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => onTransition('decline')}
                className="rounded-full bg-rose-500/15 px-4 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
                style={{ border: '1px solid rgba(244,63,94,0.3)' }}
              >
                Decline
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-1.5 text-white/45 transition hover:border-white/18 hover:text-white"
            aria-label="Close workspace"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Identity bar */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-sm font-semibold"
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
            <h2 className="mt-1 text-xl font-semibold leading-tight text-white">{panel.title}</h2>
            <p className="mt-1 text-sm text-white/56">
              {panel.company}
              {panel.location ? ` · ${panel.location}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ borderColor: visual.tint, backgroundColor: visual.tint, color: visual.accent }}
          >
            {visual.title}
          </span>
          <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-medium', urgencyClasses(urgency.tone))}>
            {urgency.label}
          </span>
          {scoreLabel(panel.compositeScore) ? (
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/65">
              {scoreLabel(panel.compositeScore)} fit
            </span>
          ) : null}
        </div>
      </div>

      {/* Workspace content — two column layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          {/* What this needs now */}
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/34">
              <Target className="h-3.5 w-3.5" />
              What this needs now
            </div>
            <p className="mt-3 text-base leading-relaxed text-white/82">{nextMove(panel.stage, panel.resumes.length)}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/54">{sectionIntro(panel.stage)}</p>
          </div>

          {/* Stage-specific desk */}
          {panel.stage === 'INTERESTED' && panel.workspaceId ? (
            <WorkspaceNotesDesk
              workspaceId={panel.workspaceId}
              title="Why this role matters"
              intro="Capture the real reason you saved this role before it turns into drafting work."
              accent={visual.accent}
            />
          ) : null}

          {panel.stage === 'CRAFTING' ? (
            <div className="space-y-4">
              <CraftingDesk panel={panel} accent={visual.accent} />
              {panel.workspaceId ? (
                <WorkspaceNotesDesk
                  workspaceId={panel.workspaceId}
                  title="War room notes"
                  intro="Keep recruiter context, talking points, and concerns next to the draft."
                  accent={visual.accent}
                  placeholder="Add recruiter context, a draft concern, or a tailoring note."
                  emptyState="No drafting notes yet. Capture the first concern or talking point here."
                />
              ) : null}
            </div>
          ) : null}

          {panel.stage === 'APPLIED' && panel.workspaceId ? (
            <AppliedDesk panel={panel} accent={visual.accent} />
          ) : null}

          {panel.stage === 'SCREENING' && panel.workspaceId ? (
            <ScreeningDesk panel={panel} accent={visual.accent} />
          ) : null}

          {panel.stage === 'INTERVIEW' && panel.workspaceId ? (
            <InterviewDesk panel={panel} accent={visual.accent} />
          ) : null}

          {panel.stage === 'OFFER' && panel.workspaceId ? (
            <OfferDesk panel={panel} accent={visual.accent} />
          ) : null}

          {/* Fallback link */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/8 pt-4 text-sm">
            {panel.workspaceId ? (
              <Link
                href={`/workspace/${panel.workspaceId}`}
                className="inline-flex items-center gap-1 text-primary transition hover:text-primary/80"
              >
                Open legacy workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1 text-primary transition hover:text-primary/80"
              >
                Open inbox fallback <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Right context sidebar */}
        <div className="space-y-4">
          <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/34">
              <Eye className="h-3.5 w-3.5" />
              Story snapshot
            </div>
            <p className="mt-3 text-sm leading-7 text-white/60">
              {panel.description.slice(0, 320) || 'No description loaded yet.'}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/34">
              <Clock3 className="h-3.5 w-3.5" />
              Stage track
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stageTrack(panel.stage).map((stage) => {
                const trackVisual = STAGE_VISUALS[stage];
                return (
                  <span
                    key={stage}
                    className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
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
            <p className="mt-3 text-xs text-white/48">
              Last touched {formatLongDate(panel.updatedAt)}. {panel.resumes.length} artifact{panel.resumes.length === 1 ? '' : 's'}, {panel.noteCount} note{panel.noteCount === 1 ? '' : 's'}.
            </p>
          </div>

          <StageAssetStack panel={panel} />
        </div>
      </div>
    </section>
  );
}

function StageBrowserDrawer({
  stage,
  panelRecords,
  onSelect,
  onClose,
}: {
  stage: CockpitStage;
  panelRecords: CockpitPanelRecord[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const visual = STAGE_VISUALS[stage];
  const items = panelRecords.filter((p) => p.stage === stage);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Drawer */}
      <div
        className="relative z-50 flex h-full w-[420px] flex-col border-l bg-[#09090a] shadow-[-24px_0_80px_rgba(0,0,0,0.5)]"
        style={{ borderColor: visual.tint }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: visual.accent, color: visual.accent }} />
            <span className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: visual.accent }}>{visual.title}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: a(visual.accent, '1c'), color: visual.accent }}>{items.length}</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 p-1.5 text-white/45 transition hover:border-white/18 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/38">
              Nothing in {visual.title} yet.
            </div>
          ) : (
            items.map((item) => {
              const identity = companyIdentity(item.company);
              const urgency = urgencyForStage(item.stage, item.updatedAt);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className="group w-full rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-left transition hover:border-white/16 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold" style={{ background: identity.background, border: identity.border, color: identity.text }}>
                      {identity.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{item.company}</div>
                      <div className="mt-0.5 truncate text-xs text-white/55">{item.title}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-white/38">
                        <span className="truncate">{item.location || 'Location pending'}</span>
                        <span className={cn('shrink-0 rounded-full border px-1.5 py-0.5', urgencyClasses(urgency.tone))}>{urgency.label}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function CockpitWireframeClient({
  userName,
  viewModel,
  panelRecords,
  initialSelectedCardId = null,
  initialNewVisibleCount = 4,
}: {
  userName: string;
  viewModel: CockpitPhaseOneViewModel;
  panelRecords: CockpitPanelRecord[];
  initialSelectedCardId?: string | null;
  initialNewVisibleCount?: number;
}) {
  const [activeCardId, setActiveCardId] = useState<string | null>(initialSelectedCardId);
  const [browseStage, setBrowseStage] = useState<CockpitStage | null>(null);
  const [visibleNewCards, setVisibleNewCards] = useState(initialNewVisibleCount);

  const panelLookup = useMemo(() => new Map(panelRecords.map((r) => [r.id, r])), [panelRecords]);
  const activePanel = activeCardId ? panelLookup.get(activeCardId) ?? null : null;
  const newColumn = useMemo(
    () => viewModel.kanbanColumns.find((column) => column.stage === 'NEW') ?? null,
    [viewModel.kanbanColumns],
  );

  const selectedColIdx = useMemo(() => {
    if (!activePanel) return -1;
    return STAGE_ORDER.indexOf(activePanel.stage);
  }, [activePanel]);

  const wywo = viewModel.whileYouWereOut;

  useEffect(() => {
    if (!newColumn) return;
    setVisibleNewCards((current) => {
      if (newColumn.cards.length === 0) {
        return initialNewVisibleCount;
      }

      return Math.min(Math.max(initialNewVisibleCount, current), newColumn.cards.length);
    });
  }, [initialNewVisibleCount, newColumn]);

  useEffect(() => {
    if (!activePanel || activePanel.stage !== 'NEW' || !newColumn) return;
    const selectedIndex = newColumn.cards.findIndex((card) => card.id === activePanel.id);
    if (selectedIndex >= visibleNewCards) {
      setVisibleNewCards(selectedIndex + 1);
    }
  }, [activePanel, newColumn, visibleNewCards]);

  async function handleTransition(key: string) {
    if (!activePanel?.workspaceId) return;
    const statusMap: Record<string, string> = {
      'to-interested': 'INTERESTED',
      'to-crafting': 'INTERESTED',
      'to-applied': 'APPLIED',
      'to-screening': 'SCREENING',
      'to-interview': 'INTERVIEW',
      'to-offer': 'OFFER',
    };
    const newStatus = statusMap[key];
    if (!newStatus) return;
    try {
      const res = await fetch(`/api/workspace/${activePanel.workspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Transition failed');
      window.location.reload();
    } catch (err) {
      console.error('[cockpit] transition error:', err);
    }
  }

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-[#050506] text-white">
        {/* Ambient glow */}
        <div
          className="pointer-events-none fixed inset-0 transition-all duration-1000"
          style={{
            background: activePanel
              ? `radial-gradient(ellipse 80% 50% at 50% 0%, ${a(STAGE_VISUALS[activePanel.stage].accent, '0c')}, transparent 70%)`
              : 'radial-gradient(circle at top left, rgba(53,227,117,0.06), transparent 28%), radial-gradient(circle at top right, rgba(124,124,255,0.05), transparent 24%)',
          }}
        />

        <div className="relative mx-auto flex min-h-screen max-w-[1720px] flex-col px-5 pb-8 pt-5 lg:px-8">

          {/* ── Hero ── */}
          <header className="mb-4 border-b border-white/8 pb-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.26em] text-primary/78">JobScout cockpit</div>
                <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-white">
                  Good morning, {userName.split(' ')[0] || userName}
                </h1>
              </div>
              {/* WYWO inline stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span>
                  <span className="font-semibold" style={{ color: STAGE_VISUALS.NEW.accent }}>{wywo.newJobsCount.toLocaleString()}</span>
                  {' '}KC matches
                </span>
                <span className="text-white/18">·</span>
                <span>
                  <span className="font-semibold" style={{ color: STAGE_VISUALS.INTERESTED.accent }}>{wywo.matchedJobsCount.toLocaleString()}</span>
                  {' '}match your profile
                </span>
                <span className="text-white/18">·</span>
                <span>
                  <span className="font-semibold" style={{ color: STAGE_VISUALS.OFFER.accent }}>{wywo.highFitCount.toLocaleString()}</span>
                  {' '}high fit
                </span>
                <Link href="/triage" className="ml-2 rounded-full border border-primary/25 px-3 py-1 text-xs font-medium text-primary transition hover:border-primary/50">
                  Swipe now →
                </Link>
              </div>
            </div>
          </header>

          {/* ── Pipeline kanban + workspace ── */}
          <section className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-3 min-w-[1280px]">
              {viewModel.kanbanColumns.map((column) => (
                <KanbanColumn
                  key={column.stage}
                  column={column}
                  activeCardId={activeCardId}
                  selectedCardId={activeCardId}
                  onOpenCard={setActiveCardId}
                  onBrowseStage={setBrowseStage}
                  visibleCardCount={column.stage === 'NEW' ? visibleNewCards : undefined}
                  onLoadMore={
                    column.stage === 'NEW'
                      ? () => setVisibleNewCards((count) => count + initialNewVisibleCount)
                      : undefined
                  }
                />
              ))}
            </div>

            {activePanel ? (
              <WorkspaceSection
                panel={activePanel}
                colIdx={selectedColIdx}
                onClose={() => setActiveCardId(null)}
                onTransition={handleTransition}
              />
            ) : null}
          </section>

          {/* ── Jump Back In — bottom ── */}
          <section className="mt-8">
            <RecentActivityRail
              activeCardId={activeCardId}
              items={viewModel.recentActivity}
              onSelect={setActiveCardId}
            />
          </section>

        </div>
      </div>

      {/* Stage browser drawer */}
      {browseStage ? (
        <StageBrowserDrawer
          stage={browseStage}
          panelRecords={panelRecords}
          onSelect={setActiveCardId}
          onClose={() => setBrowseStage(null)}
        />
      ) : null}
    </LayoutGroup>
  );
}
