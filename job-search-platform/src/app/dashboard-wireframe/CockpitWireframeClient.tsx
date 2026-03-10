'use client';

import Link from 'next/link';
import { useState } from 'react';
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

const STAGE_TITLES: Record<CockpitStage, string> = {
  NEW: 'New',
  INTERESTED: 'Interested',
  CRAFTING: 'Crafting',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
};

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scoreLabel(score: number | null) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return null;
  }

  return `${Math.round(score * 100)}% fit`;
}

function ShellSection({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">{title}</div>
          {subtitle ? <p className="mt-1 text-sm text-white/55">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-3 text-left transition ${
        active
          ? 'border-primary/60 bg-primary/10 shadow-[0_14px_36px_rgba(53,227,117,0.14)]'
          : 'border-white/8 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{card.company}</div>
          <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-white/58">{card.title}</div>
        </div>
        {card.scoreLabel ? (
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {card.scoreLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-white/38">
        <span className="truncate">{card.location || 'Location pending'}</span>
        <span className="shrink-0">{card.meta}</span>
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
  return (
    <div className="min-w-[220px] max-w-[220px] rounded-[24px] border border-white/8 bg-black/20 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
          {column.label}
        </div>
        <div className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60">
          {column.total}
        </div>
      </div>

      <div className="space-y-2">
        {column.cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/8 px-3 py-6 text-center text-xs text-white/25">
            No work here yet
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
        <div className="mt-2 rounded-xl border border-dashed border-white/8 px-3 py-2 text-center text-[11px] text-white/28">
          +{column.total - column.cards.length} more
        </div>
      ) : null}
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'primary';
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${tone === 'primary' ? 'text-primary' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function stageSummary(stage: CockpitStage) {
  switch (stage) {
    case 'NEW':
      return 'Discovery item. Review it before it becomes managed work.';
    case 'CRAFTING':
      return 'Draft work is already underway for this opportunity.';
    case 'APPLIED':
      return 'Submission is done. Track follow-up from here.';
    case 'SCREENING':
      return 'Conversation has started. This is beyond submit.';
    case 'INTERVIEW':
      return 'Interview prep, notes, and receipts belong here.';
    case 'OFFER':
      return 'Decision-stage work. Keep this tight and factual.';
    default:
      return 'Saved and worth revisiting. No draft work has started yet.';
  }
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
  const [activeCardId, setActiveCardId] = useState<string | null>(
    viewModel.recentActivity[0]?.id ?? null,
  );

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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px] flex-col px-5 pb-8 pt-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-5 border-b border-white/8 pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-primary/75">JobScout cockpit</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                Good morning, {userName.split(' ')[0] || userName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/58">
                One cockpit. Real opportunity state. Legacy pages stay available while this shell takes over.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/jobs"
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 transition hover:border-white/20 hover:text-white"
              >
                Inbox fallback
              </Link>
              <Link
                href="/pipeline"
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 transition hover:border-white/20 hover:text-white"
              >
                Pipeline fallback
              </Link>
              <Link
                href="/resume"
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55 transition hover:border-white/20 hover:text-white"
              >
                Resume fallback
              </Link>
              <Link
                href="/triage"
                className="rounded-full border border-primary/30 bg-primary/12 px-3 py-2 text-xs font-medium text-primary transition hover:border-primary/60 hover:bg-primary/18"
              >
                Open swipe fallback
              </Link>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              label="New matches"
              value={viewModel.whileYouWereOut.newJobsCount.toLocaleString()}
            />
            <MetricTile
              label="Worth a look"
              value={viewModel.whileYouWereOut.matchedJobsCount.toLocaleString()}
            />
            <MetricTile label="Drafting now" value={craftingCount.toLocaleString()} tone="primary" />
            <MetricTile label="Beyond submit" value={lateStageCount.toLocaleString()} />
          </div>
        </header>

        <div className="flex flex-1 gap-5 overflow-hidden">
          <div className={`flex min-w-0 flex-col gap-5 overflow-y-auto pr-1 transition-all duration-300 ${activePanel ? 'lg:w-[56%]' : 'w-full'}`}>
            <div className={`grid gap-5 ${activePanel ? 'xl:grid-cols-1' : 'xl:grid-cols-[1.35fr_0.95fr]'}`}>
              <ShellSection
                title="Recent Activity"
                subtitle="Jump back into the work you already touched instead of re-finding it."
                action={
                  <Link href="/pipeline" className="inline-flex items-center gap-1 text-xs text-white/45 transition hover:text-primary">
                    Open pipeline <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                }
              >
                <div className="space-y-2">
                  {viewModel.recentActivity.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/8 px-4 py-6 text-sm text-white/35">
                      No managed work yet. Save a few roles and this section will become your jump-back anchor.
                    </div>
                  ) : (
                    viewModel.recentActivity.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveCardId(item.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                          activeCardId === item.id
                            ? 'border-primary/60 bg-primary/10'
                            : 'border-white/8 bg-black/20 hover:border-white/18 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white">
                            {item.company}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-white/56">{item.title}</div>
                        </div>
                        <div className="ml-3 flex shrink-0 items-center gap-2 text-[11px] text-white/38">
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/55">
                            {STAGE_TITLES[item.stage]}
                          </span>
                          <span>{formatLongDate(item.updatedAt)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ShellSection>

              <ShellSection
                title="While You Were Out"
                subtitle="Reduce the inbox flood to the small set that might actually deserve attention."
                action={
                  <Link href="/triage" className="inline-flex items-center gap-1 text-xs text-primary transition hover:text-primary/80">
                    Review in swipe fallback <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-sm text-white/52">New discovery jobs since your last pass</div>
                    <div className="text-lg font-semibold text-white">
                      {viewModel.whileYouWereOut.newJobsCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-sm text-white/52">Jobs scoring 70%+ right now</div>
                    <div className="text-lg font-semibold text-white">
                      {viewModel.whileYouWereOut.matchedJobsCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-primary/18 bg-primary/[0.08] px-4 py-3">
                    <div className="text-sm text-primary/78">High-fit jobs scoring 90%+</div>
                    <div className="text-lg font-semibold text-primary">
                      {viewModel.whileYouWereOut.highFitCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </ShellSection>
            </div>

            <ShellSection
              title="The River"
              subtitle="One persistent pipeline. Cards reflect live state only. No stage moves from this view yet."
            >
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-3">
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
            </ShellSection>

            <ShellSection
              title="Momentum"
              subtitle="Embedded, lightweight, and tied to the river instead of living on another page."
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                  <div className="flex items-center gap-2 text-white/42">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.18em]">Managed work</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">{activeManagedCount}</div>
                  <p className="mt-1 text-sm text-white/48">Everything beyond discovery that already has a workspace.</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                  <div className="flex items-center gap-2 text-white/42">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.18em]">Crafting load</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-primary">{craftingCount}</div>
                  <p className="mt-1 text-sm text-white/48">Resume or cover-letter work already underway.</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                  <div className="flex items-center gap-2 text-white/42">
                    <Target className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-[0.18em]">High-signal discovery</span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">{viewModel.whileYouWereOut.highFitCount}</div>
                  <p className="mt-1 text-sm text-white/48">Discovery cards already strong enough to justify attention.</p>
                </div>
              </div>
            </ShellSection>
          </div>

          {activePanel ? (
            <aside className="hidden lg:flex lg:w-[44%] lg:flex-col lg:overflow-y-auto">
              <div className="sticky top-0 rounded-[28px] border border-primary/15 bg-[#0d0d0d] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-primary/70">
                      {STAGE_TITLES[activePanel.stage]} workspace
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{activePanel.title}</h2>
                    <p className="mt-1 text-sm text-white/55">
                      {activePanel.company}
                      {activePanel.location ? ` · ${activePanel.location}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCardId(null)}
                    className="rounded-full border border-white/10 p-2 text-white/45 transition hover:border-white/20 hover:text-white"
                    aria-label="Close workspace panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {STAGE_TITLES[activePanel.stage]}
                  </span>
                  {scoreLabel(activePanel.compositeScore) ? (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/58">
                      {scoreLabel(activePanel.compositeScore)}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">
                    Updated {formatLongDate(activePanel.updatedAt)}
                  </span>
                </div>

                <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/36">
                    <Eye className="h-4 w-4" />
                    Read-only summary
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/66">
                    {stageSummary(activePanel.stage)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/54">
                    {activePanel.description.slice(0, 420) || 'No description available yet.'}
                  </p>
                </div>

                <div className="mb-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/36">
                      <Clock3 className="h-4 w-4" />
                      Current state
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-white/62">
                      <div>Workspace status: {activePanel.workspaceStatus ?? 'None yet'}</div>
                      <div>Legacy state: {activePanel.legacyStatus ?? 'None yet'}</div>
                      <div>Drafts: {activePanel.resumes.length}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/36">
                      <FileText className="h-4 w-4" />
                      Transition fallback
                    </div>
                    <div className="mt-3 space-y-2">
                      {activePanel.workspaceId ? (
                        <Link
                          href={`/workspace/${activePanel.workspaceId}`}
                          className="inline-flex items-center gap-1 text-sm text-primary transition hover:text-primary/80"
                        >
                          Open legacy workspace <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href="/jobs"
                          className="inline-flex items-center gap-1 text-sm text-primary transition hover:text-primary/80"
                        >
                          Open inbox fallback <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/36">Artifacts in this workspace</div>
                  {activePanel.resumes.length === 0 ? (
                    <p className="mt-3 text-sm text-white/45">
                      No stored resume artifacts yet. This is still a read-only cockpit surface.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {activePanel.resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                        >
                          <div className="text-sm font-medium text-white">{resume.title}</div>
                          <div className="mt-1 text-xs text-white/45">
                            {resume.documentState} · {formatLongDate(resume.updatedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
