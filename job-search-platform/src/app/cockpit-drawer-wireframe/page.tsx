/**
 * ARCHIVED PROTOTYPE — 2026-03-15
 *
 * This prototype proved the T-shape visual architecture (∩ card + U workspace + animated shoulders).
 * Those patterns have been migrated into the production cockpit at /dashboard-wireframe.
 * This file is preserved for reference but is no longer the active development target.
 */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCockpitPipeline, type PipelineWorkspace } from '@/hooks/useCockpitPipeline';

const WorkspaceBlockNote = dynamic(
  () => import('@/components/workspace/WorkspaceBlockNote').then(m => m.WorkspaceBlockNote),
  { ssr: false, loading: () => <div className="min-h-[180px] rounded-[12px] bg-black/30 animate-pulse" /> },
);

type StageId = 'NEW' | 'INTERESTED' | 'CRAFTING' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER';
type Opp = { id: number | string; company: string; role: string; signal: string; stale: string; chip: string; stage: StageId; wsId?: string };

const STAGES: { id: StageId; label: string; accent: string; count: number }[] = [
  { id: 'NEW',       label: 'New',       accent: '#f4b74d', count: 47  },
  { id: 'INTERESTED',label: 'Interested',accent: '#57a6ff', count: 103 },
  { id: 'CRAFTING',  label: 'Crafting',  accent: '#ffb45a', count: 4   },
  { id: 'APPLIED',   label: 'Applied',   accent: '#8b82ff', count: 8   },
  { id: 'SCREENING', label: 'Screening', accent: '#53d5ff', count: 2   },
  { id: 'INTERVIEW', label: 'Interview', accent: '#c58fff', count: 1   },
  { id: 'OFFER',     label: 'Offer',     accent: '#45df7d', count: 1   },
];

const INTERESTED_OPPS: Opp[] = [
  { id: 1,  company: 'Wiz',                role: 'Cloud Security Architect',         signal: 'Very strong domain fit',              stale: '38m', chip: 'hot',           stage: 'INTERESTED' },
  { id: 2,  company: 'Datadog',            role: 'Enterprise Solutions Architect',   signal: 'Platform fit, needs sharper proof',   stale: '3h',  chip: 'hot',           stage: 'INTERESTED' },
  { id: 3,  company: 'Palo Alto Networks', role: 'Principal Customer Architect',     signal: 'Prestige + domain credibility',       stale: '8h',  chip: 'high upside',   stage: 'INTERESTED' },
  { id: 4,  company: 'CrowdStrike',        role: 'Field CTO Advisor',               signal: 'Stretch but credible',                stale: '13m', chip: 'stretch',       stage: 'INTERESTED' },
  { id: 5,  company: 'Okta',              role: 'Advisory Solutions Engineer',      signal: 'IAM story could land well',           stale: '6h',  chip: 'good fit',      stage: 'INTERESTED' },
  { id: 6,  company: 'Splunk',            role: 'Senior Field Architect',           signal: 'High-value security narrative',        stale: '1d',  chip: 'cooling',       stage: 'INTERESTED' },
  { id: 7,  company: 'Jobot',             role: 'Sales Engineer - Security',        signal: 'Security-heavy consultative fit',     stale: '2d',  chip: 'needs fit call',stage: 'INTERESTED' },
  { id: 8,  company: 'Reply',             role: 'Principal Solutions Consultant',   signal: 'Enterprise story fit',                stale: '7h',  chip: 'worth a look',  stage: 'INTERESTED' },
  { id: 9,  company: 'Snowflake',         role: 'Industry Principal Architect',     signal: 'Architecture story is strong',        stale: '5h',  chip: 'review',        stage: 'INTERESTED' },
  { id: 10, company: 'Zscaler',           role: 'Principal Advisory Architect',     signal: 'Good enterprise-security mix',        stale: '1d',  chip: 'watch',         stage: 'INTERESTED' },
  { id: 11, company: 'ServiceNow',        role: 'Advisory Solution Consultant',     signal: 'Readable recruiter narrative',        stale: '9h',  chip: 'easy tailor',   stage: 'INTERESTED' },
  { id: 12, company: 'IBM',              role: 'Client Engineering Lead',           signal: 'AI + client engineering overlap',     stale: '19h', chip: 'interesting',   stage: 'INTERESTED' },
  { id: 13, company: 'Verkada',          role: 'Senior Solutions Architect',        signal: 'Physical security relevance',         stale: '11h', chip: 'specific fit',  stage: 'INTERESTED' },
  { id: 14, company: 'Tuttle AAG',       role: 'Sales Engineer',                   signal: 'Fast path if comp is clean',          stale: '4h',  chip: 'new signal',    stage: 'INTERESTED' },
];

const STAGE_OPPS: Record<StageId, Opp[]> = {
  NEW: [
    { id: 201, company: 'Elastic',   role: 'Solutions Architect - Security', signal: 'Just posted, strong domain match', stale: '12m', chip: 'new',      stage: 'NEW' },
    { id: 202, company: 'Lacework',  role: 'Field CTO',                      signal: 'Referral from network',           stale: '45m', chip: 'referred',  stage: 'NEW' },
  ],
  INTERESTED: [
    { id: 1,  company: 'Wiz',                role: 'Cloud Security Architect',       signal: 'Very strong domain fit',            stale: '38m', chip: 'hot',           stage: 'INTERESTED' },
    { id: 2,  company: 'Datadog',            role: 'Enterprise Solutions Architect', signal: 'Platform fit, needs sharper proof', stale: '3h',  chip: 'hot',           stage: 'INTERESTED' },
    { id: 3,  company: 'Palo Alto Networks', role: 'Principal Customer Architect',   signal: 'Prestige + domain credibility',     stale: '8h',  chip: 'high upside',   stage: 'INTERESTED' },
    { id: 4,  company: 'CrowdStrike',        role: 'Field CTO Advisor',             signal: 'Stretch but credible',              stale: '13m', chip: 'stretch',       stage: 'INTERESTED' },
    { id: 5,  company: 'Okta',               role: 'Advisory Solutions Engineer',   signal: 'IAM story could land well',         stale: '6h',  chip: 'good fit',      stage: 'INTERESTED' },
    { id: 6,  company: 'Splunk',             role: 'Senior Field Architect',         signal: 'High-value security narrative',     stale: '1d',  chip: 'cooling',       stage: 'INTERESTED' },
    { id: 7,  company: 'Jobot',              role: 'Sales Engineer - Security',      signal: 'Security-heavy consultative fit',   stale: '2d',  chip: 'needs fit call',stage: 'INTERESTED' },
    { id: 8,  company: 'Reply',              role: 'Principal Solutions Consultant', signal: 'Enterprise story fit',              stale: '7h',  chip: 'worth a look',  stage: 'INTERESTED' },
    { id: 9,  company: 'Snowflake',          role: 'Industry Principal Architect',   signal: 'Architecture story is strong',      stale: '5h',  chip: 'review',        stage: 'INTERESTED' },
    { id: 10, company: 'Zscaler',            role: 'Principal Advisory Architect',   signal: 'Good enterprise-security mix',      stale: '1d',  chip: 'watch',         stage: 'INTERESTED' },
    { id: 11, company: 'ServiceNow',         role: 'Advisory Solution Consultant',   signal: 'Readable recruiter narrative',      stale: '9h',  chip: 'easy tailor',   stage: 'INTERESTED' },
    { id: 12, company: 'IBM',                role: 'Client Engineering Lead',        signal: 'AI + client engineering overlap',   stale: '19h', chip: 'interesting',   stage: 'INTERESTED' },
    { id: 13, company: 'Verkada',            role: 'Senior Solutions Architect',     signal: 'Physical security relevance',       stale: '11h', chip: 'specific fit',  stage: 'INTERESTED' },
    { id: 14, company: 'Tuttle AAG',         role: 'Sales Engineer',                 signal: 'Fast path if comp is clean',        stale: '4h',  chip: 'new signal',    stage: 'INTERESTED' },
  ],
  CRAFTING: [
    { id: 99,  company: 'Deloitte',  role: 'GenAI Architect',       signal: 'Drafting now with active artifacts', stale: '7m',  chip: 'active draft', stage: 'CRAFTING' },
    { id: 100, company: 'Microsoft', role: 'Principal Architect AI', signal: 'Tailoring for Azure AI angle',      stale: '1d',  chip: 'in progress',  stage: 'CRAFTING' },
  ],
  APPLIED: [
    { id: 301, company: 'Nvidia',     role: 'Senior Solutions Architect', signal: 'Applied via referral, awaiting screen', stale: '2d', chip: 'submitted', stage: 'APPLIED' },
    { id: 302, company: 'Anthropic',  role: 'Field AI Architect',         signal: 'Application acknowledged',             stale: '5d', chip: 'waiting',   stage: 'APPLIED' },
  ],
  SCREENING: [
    { id: 401, company: 'Cloudflare', role: 'Principal Solutions Engineer', signal: 'HR screen Thursday 2pm', stale: '1d', chip: 'scheduled', stage: 'SCREENING' },
    { id: 402, company: 'HashiCorp',  role: 'Senior Solutions Engineer',    signal: 'Recruiter outreach, call set', stale: '6h', chip: 'call set', stage: 'SCREENING' },
  ],
  INTERVIEW: [
    { id: 501, company: 'Stripe',  role: 'Solutions Architect',          signal: 'Technical round this Thursday', stale: '3h', chip: 'prep now',  stage: 'INTERVIEW' },
    { id: 502, company: 'Figma',   role: 'Enterprise Solutions Engineer', signal: 'Panel interview next Monday',   stale: '1d', chip: 'scheduled', stage: 'INTERVIEW' },
  ],
  OFFER: [
    { id: 601, company: 'Palantir', role: 'Forward Deployed Engineer', signal: 'Offer received, negotiating comp', stale: '4h', chip: 'offer!',   stage: 'OFFER' },
    { id: 602, company: 'OpenAI',   role: 'Solutions Architect',        signal: 'Verbal offer, written pending',    stale: '2h', chip: 'pending',  stage: 'OFFER' },
  ],
};

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function a(color: string, alpha: string) { return `${color}${alpha}`; }

// ── Kanban card ─────────────────────────────────────────────────────
function KanbanCard({ opp, stage, selected, onSelect }: {
  opp: Opp;
  stage: typeof STAGES[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onSelect}
        className="relative w-full rounded-[11px] px-2.5 py-2 text-left transition-all duration-200"
        style={{
          background: selected
            ? `linear-gradient(135deg, ${a(stage.accent, '22')} 0%, rgb(14,18,26) 70%)`
            : 'rgba(255,255,255,0.032)',
          boxShadow: selected
            ? `0 0 0 1px ${a(stage.accent, '66')} inset, 0 4px 20px -6px ${a(stage.accent, '44')}`
            : '0 0 0 1px rgba(255,255,255,0.05) inset',
          borderBottomLeftRadius: selected ? 0 : undefined,
          borderBottomRightRadius: selected ? 0 : undefined,
        }}
      >
        {/* Left accent strip */}
        <div
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{
            background: selected ? stage.accent : a(stage.accent, '66'),
            borderRadius: selected ? '11px 0 0 0' : '11px 0 0 11px',
          }}
        />
        <div className="flex items-center gap-2 pl-1.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold"
            style={{
              color: stage.accent,
              background: `linear-gradient(135deg, ${a(stage.accent, '2c')} 0%, ${a(stage.accent, '14')} 100%)`,
              border: `1px solid ${a(stage.accent, '44')}`,
              boxShadow: selected ? `0 0 16px ${a(stage.accent, '66')}` : `0 0 6px ${a(stage.accent, '22')}`,
            }}
          >
            {initials(opp.company)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <span className="truncate text-[12px] font-semibold leading-tight text-white/90">{opp.company}</span>
              <span
                className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none"
                style={{ color: stage.accent, background: a(stage.accent, '1c') }}
              >
                {opp.chip}
              </span>
            </div>
            <div className="mt-0.5 truncate text-[11px] leading-tight text-white/42">{opp.role}</div>
          </div>
        </div>
      </button>
    </>
  );
}

// ── Stage toolbar config ────────────────────────────────────────────
const STAGE_TOOLBAR: Record<StageId, { actions: { label: string; icon?: string; key: string }[]; transition: { label: string; key: string } | null }> = {
  NEW:        { actions: [{ label: 'Launch Swipe', key: 'swipe', icon: '👆' }], transition: { label: "I'm Interested →", key: 'to-interested' } },
  INTERESTED: { actions: [{ label: 'Add Note', key: 'note', icon: '📝' }, { label: 'Research', key: 'research', icon: '🔍' }], transition: { label: 'Start Crafting →', key: 'to-crafting' } },
  CRAFTING:   { actions: [{ label: 'Generate Resume', key: 'generate', icon: '✨' }, { label: 'Open Resume Studio', key: 'resume-studio', icon: '📄' }, { label: 'Keywords', key: 'keywords', icon: '🏷' }], transition: { label: 'Mark Applied →', key: 'to-applied' } },
  APPLIED:    { actions: [{ label: 'Review Resume', key: 'review-resume', icon: '📋' }, { label: 'Log Follow-up', key: 'followup', icon: '📨' }], transition: { label: 'Heard Back →', key: 'to-screening' } },
  SCREENING:  { actions: [{ label: 'View Resume Sent', key: 'view-resume', icon: '📄' }, { label: 'Add Call Notes', key: 'call-notes', icon: '📞' }], transition: { label: 'Interview Scheduled →', key: 'to-interview' } },
  INTERVIEW:  { actions: [{ label: 'Prep Materials', key: 'prep', icon: '📚' }, { label: 'Add Round Notes', key: 'round-notes', icon: '🎤' }], transition: { label: 'Offer Received →', key: 'to-offer' } },
  OFFER:      { actions: [{ label: 'View Journey', key: 'journey', icon: '🗺' }, { label: 'Compare Offers', key: 'compare', icon: '⚖️' }], transition: null },
};

// ── Map DB status → cockpit stage ───────────────────────────────────
const STATUS_TO_STAGE: Record<string, StageId> = {
  INTERESTED: 'INTERESTED',
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  INTERVIEW: 'INTERVIEW',
  OFFER: 'OFFER',
  FOLLOW_UP: 'SCREENING',
  DORMANT: 'APPLIED',
  ARCHIVED: 'APPLIED',
  PASSED: 'NEW',
};

function timeSince(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function wsToOpp(ws: PipelineWorkspace): Opp {
  const stage = STATUS_TO_STAGE[ws.status] ?? 'INTERESTED';
  const score = ws.job.compositeScore;
  const chip = score && score >= 90 ? 'hot'
    : score && score >= 75 ? 'good fit'
    : score && score >= 50 ? 'worth a look'
    : 'new';
  return {
    id: ws.id,
    company: ws.job.company,
    role: ws.job.title,
    signal: ws.job.salary ? `${ws.job.location} · ${ws.job.salary}` : ws.job.location,
    stale: timeSince(ws.updatedAt),
    chip,
    stage,
    wsId: ws.id,
  };
}

// ── Stage transition map ────────────────────────────────────────────
const TRANSITION_MAP: Record<string, string> = {
  'to-interested': 'INTERESTED',
  'to-crafting': 'INTERESTED',   // crafting is still INTERESTED in DB (no separate status yet)
  'to-applied': 'APPLIED',
  'to-screening': 'FOLLOW_UP',
  'to-interview': 'FOLLOW_UP',
  'to-offer': 'FOLLOW_UP',
};

// ── Main page ────────────────────────────────────────────────────────
export default function CockpitDrawerWireframe() {
  const { data: pipelineData, loading: pipelineLoading, transitionStage, saveNote, fetchNotes } = useCockpitPipeline();
  const [drawerStage, setDrawerStage] = useState<StageId | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opp>(INTERESTED_OPPS[0]);
  const [filterText, setFilterText] = useState('');
  // Workspace notes per opp (keyed by opp id)
  const [oppNotes, setOppNotes] = useState<Record<number | string, string>>({
    1: '## First Impressions\n\nVery strong domain fit — cloud security architecture aligns perfectly with my background.\n\n### Research Notes\n- Check Glassdoor for recent reviews\n- Look at their Series C announcement',
  });
  // Resume studio drawer
  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false);
  // Swipe mode
  const [swipeMode, setSwipeMode] = useState(false);
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [swipeNote, setSwipeNote] = useState('');
  const [swipeResult, setSwipeResult] = useState<'interested' | 'pass' | null>(null);

  // Merge real data with mock data — real data takes priority
  const liveStageOpps = useMemo<Record<StageId, Opp[]>>(() => {
    if (!pipelineData || pipelineData.total === 0) return STAGE_OPPS; // fallback to mock
    const result: Record<StageId, Opp[]> = { NEW: [], INTERESTED: [], CRAFTING: [], APPLIED: [], SCREENING: [], INTERVIEW: [], OFFER: [] };
    for (const [status, workspaces] of Object.entries(pipelineData.pipeline)) {
      for (const ws of workspaces) {
        const opp = wsToOpp(ws);
        result[opp.stage].push(opp);
      }
    }
    return result;
  }, [pipelineData]);

  const liveStageCounts = useMemo(() => {
    return STAGES.map(s => ({
      ...s,
      count: pipelineData && pipelineData.total > 0 ? (liveStageOpps[s.id]?.length ?? 0) : s.count,
    }));
  }, [liveStageOpps, pipelineData]);

  const drawerMeta   = STAGES.find(s => s.id === drawerStage);
  const wsMeta       = STAGES.find(s => s.id === selectedOpp.stage) ?? STAGES[1];
  const wsAccent     = wsMeta.accent;
  const colIdx        = STAGES.findIndex(s => s.id === selectedOpp.stage);
  const shoulderLeftW  = `calc(${colIdx} * (100% + 0.5rem) / 7)`;
  const shoulderRightW = `calc(${6 - colIdx} * (100% + 0.5rem) / 7)`;

  const drawerOpps = drawerStage ? (liveStageOpps[drawerStage] ?? []) : [];
  const filteredOpps = drawerOpps.filter(o =>
    !filterText
      || o.company.toLowerCase().includes(filterText.toLowerCase())
      || o.role.toLowerCase().includes(filterText.toLowerCase())
  );

  function selectOpp(opp: Opp) {
    setSelectedOpp(opp);
    setDrawerStage(null);
    // If this is a real workspace, fetch its notes
    if (opp.wsId) {
      fetchNotes(opp.wsId).then(notes => {
        if (notes.length > 0) {
          setOppNotes(prev => ({ ...prev, [opp.id]: notes.map(n => n.content).join('\n\n---\n\n') }));
        }
      });
    }
  }

  const handleNoteChange = useCallback((val: string) => {
    setOppNotes(prev => ({ ...prev, [selectedOpp.id]: val }));
  }, [selectedOpp.id]);

  const handleToolbarAction = useCallback((key: string) => {
    if (key === 'resume-studio') setResumeDrawerOpen(true);
    if (key === 'swipe') setSwipeMode(true);
    // Stage transitions
    if (key.startsWith('to-') && selectedOpp.wsId) {
      const newStatus = TRANSITION_MAP[key];
      if (newStatus) {
        transitionStage(selectedOpp.wsId, newStatus).catch(console.error);
      }
    }
  }, [selectedOpp.wsId, transitionStage]);

  useEffect(() => {
    if (!drawerStage && !resumeDrawerOpen && !swipeMode) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDrawerStage(null);
        setResumeDrawerOpen(false);
        setSwipeMode(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerStage, resumeDrawerOpen, swipeMode]);

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#020508',
      }}
    >
      {/* ── Ambient — shifts with selected opp accent ─────────────── */}
      <motion.div
        className="pointer-events-none fixed inset-0"
        animate={{
          background: [
            `radial-gradient(ellipse 100% 55% at 10% -10%, ${a(wsAccent, '1c')} 0%, transparent 55%)`,
            `radial-gradient(ellipse 60% 45% at 88% 8%,   ${a(wsAccent, '0e')} 0%, transparent 50%)`,
            `radial-gradient(ellipse 70% 70% at 50% 110%, ${a(wsAccent, '14')} 0%, transparent 55%)`,
            'linear-gradient(180deg, #040709 0%, #020508 60%, #010406 100%)',
          ].join(', '),
        }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
      />

      {/* ── Noise texture ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative z-10">
        <div
          className="transition-all duration-300 ease-out"
          style={{ marginRight: drawerStage ? 440 : 0 }}
        >
          <LayoutGroup>
            <div className="mx-auto max-w-[1680px] px-6 pb-16 pt-5 sm:px-8 lg:px-10">

              {/* ── Header ──────────────────────────────────────── */}
              <header className="flex items-center justify-between pb-5">
                <div>
                  <h1 className="text-[22px] font-bold tracking-tight text-white">
                    Good morning, Richard
                  </h1>
                  <p className="mt-1 text-[13px] text-white/38">
                    {STAGES.reduce((s, st) => s + st.count, 0)} opportunities across {STAGES.length} stages
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {[
                    { label: 'New jobs',    value: '4,327', color: '#57a6ff' },
                    { label: 'Profile fit', value: '18',    color: '#c58fff' },
                    { label: '90%+ match', value: '3',     color: '#45df7d' },
                  ].map(s => (
                    <div
                      key={s.label}
                      className="rounded-2xl px-4 py-2.5"
                      style={{
                        background: `linear-gradient(135deg, ${s.color}0e 0%, rgba(8,11,18,0.85) 100%)`,
                        boxShadow: `0 0 0 1px ${s.color}22 inset`,
                      }}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: `${s.color}66` }}>{s.label}</div>
                      <div className="mt-0.5 text-[22px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </header>

              {/* ── PIPELINE STRIP ──────────────────────────────── */}
              <div className="mb-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/22">Pipeline</span>
                  <span className="text-[11px] text-white/18">Click stage to browse · Click card to work</span>
                </div>
                <div className="overflow-x-auto">
                  <div className="grid min-w-[1100px] grid-cols-7 gap-2">
                    {liveStageCounts.map(stage => {
                      const isOpen      = drawerStage === stage.id;
                      const hasSelected = stage.id === selectedOpp.stage && !drawerStage;
                      const allItems    = (liveStageOpps[stage.id] ?? []).slice(0, 3);
                      const selIdx      = hasSelected ? allItems.findIndex(o => o.id === selectedOpp.id) : -1;
                      return (
                        <div
                          key={stage.id}
                          className="rounded-[14px] p-2 transition-all duration-200"
                          style={{
                            paddingBottom: hasSelected ? 0 : undefined,
                            borderBottomLeftRadius:  hasSelected ? 0 : undefined,
                            borderBottomRightRadius: hasSelected ? 0 : undefined,
                            background: hasSelected
                              ? `linear-gradient(180deg, ${a(stage.accent, '1a')} 0%, ${a(stage.accent, '0b')} 100%)`
                              : isOpen
                                ? `linear-gradient(180deg, ${a(stage.accent, '16')} 0%, ${a(stage.accent, '07')} 100%)`
                                : 'rgba(255,255,255,0.024)',
                            boxShadow: hasSelected
                              ? [
                                  `inset  2px  0    0 0 ${a(stage.accent, '55')}`,
                                  `inset -2px  0    0 0 ${a(stage.accent, '55')}`,
                                  `inset  0    2px  0 0 ${a(stage.accent, '55')}`,
                                  `0 8px 28px -12px ${a(stage.accent, '33')}`,
                                ].join(', ')
                              : isOpen
                                ? `0 0 0 1px ${a(stage.accent, '44')} inset, 0 8px 28px -12px ${a(stage.accent, '55')}`
                                : '0 0 0 1px rgba(255,255,255,0.06) inset',
                          }}
                        >
                          {/* Stage header button */}
                          <button
                            type="button"
                            onClick={() => setDrawerStage(isOpen ? null : stage.id)}
                            className="w-full px-1.5 py-1.5 text-left transition hover:opacity-75"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="truncate text-[12px] font-bold" style={{ color: stage.accent }}>
                                {stage.label}
                              </span>
                              <span
                                className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                                style={{ color: stage.accent, background: a(stage.accent, '1c') }}
                              >
                                {stage.count}
                              </span>
                            </div>
                          </button>

                          {/* Preview cards — ghost all non-selected cards equally */}
                          <div className="mt-1.5 space-y-1.5">
                            {allItems.map((opp, idx) => {
                              const isSel = selIdx !== -1 && idx === selIdx;
                              const isGhosted = hasSelected && selIdx !== -1 && !isSel;
                              return isGhosted ? (
                                <div
                                  key={opp.id}
                                  className="opacity-[0.15] transition-opacity duration-150 hover:opacity-[0.7]"
                                  title="Click to switch to this opportunity"
                                >
                                  <KanbanCard opp={opp} stage={stage} selected={false} onSelect={() => selectOpp(opp)} />
                                </div>
                              ) : (
                                <KanbanCard key={opp.id} opp={opp} stage={stage} selected={isSel} onSelect={() => selectOpp(opp)} />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* ── WORKSPACE HERO ──────────────────────────────── */}
              <section
                className="relative px-6 pb-6 pt-5"
                style={{
                  borderRadius: '0 0 26px 26px',
                  background: 'linear-gradient(160deg, rgb(20,26,36) 0%, rgb(13,17,25) 50%, rgb(9,12,19) 100%)',
                  boxShadow: [
                    `inset  2px  0    0 0 ${a(wsAccent, '55')}`,  // left border
                    `inset -2px  0    0 0 ${a(wsAccent, '55')}`,  // right border
                    `inset  0   -2px  0 0 ${a(wsAccent, '55')}`,  // bottom border (no top — T-shape)
                    `0 40px 100px -50px rgba(0,0,0,0.9)`,
                    `0 0 80px -20px ${a(wsAccent, '18')}`,
                  ].join(', '),
                }}
              >
                {/* T-shape shoulders: horizontal border segments left and right of the card column */}
                {colIdx > 0 && (
                  <motion.div
                    key={`ls-${selectedOpp.stage}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: shoulderLeftW,
                      height: 2,
                      transformOrigin: 'right center',
                      background: a(wsAccent, '55'),
                    }}
                  />
                )}
                {colIdx < 6 && (
                  <motion.div
                    key={`rs-${selectedOpp.stage}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      position: 'absolute',
                      top: 0, right: 0,
                      width: shoulderRightW,
                      height: 2,
                      transformOrigin: 'left center',
                      background: a(wsAccent, '55'),
                    }}
                  />
                )}

                {/* Accent rule */}
                <motion.div
                  className="mb-4 h-px"
                  animate={{
                    background: `linear-gradient(90deg, ${wsAccent} 0%, ${a(wsAccent, '55')} 25%, transparent 65%)`,
                  }}
                  transition={{ duration: 0.8 }}
                />

                {/* Identity bar — compact header */}
                <div className="flex items-center gap-4">
                  <motion.div
                    layoutId={`avatar-${selectedOpp.id}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold"
                    style={{
                      color: wsAccent,
                      background: `linear-gradient(135deg, ${a(wsAccent, '30')} 0%, ${a(wsAccent, '14')} 100%)`,
                      border: `1.5px solid ${a(wsAccent, '55')}`,
                      boxShadow: `0 0 24px ${a(wsAccent, '33')}, 0 0 8px ${a(wsAccent, '18')}`,
                    }}
                  >
                    {initials(selectedOpp.company)}
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <motion.h2
                        layout="position"
                        className="text-[22px] font-bold leading-none tracking-tight text-white"
                      >
                        {selectedOpp.company}
                      </motion.h2>
                      <span className="text-[14px] text-white/36">&middot;</span>
                      <p className="truncate text-[14px] text-white/50">
                        {selectedOpp.role}
                      </p>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/36">{selectedOpp.signal}</p>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: wsAccent,
                      background: a(wsAccent, '1a'),
                      boxShadow: `0 0 0 1px ${a(wsAccent, '44')} inset`,
                    }}
                  >
                    {wsMeta.label}
                  </span>
                </div>

                {/* Two-column workspace: active work (primary) | context (secondary) */}
                <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_320px]">
                  {/* ── LEFT: Active work ── */}
                  <motion.div
                    layout
                    className="rounded-[16px] p-5"
                    animate={{
                      background: `linear-gradient(160deg, ${a(wsAccent, '10')} 0%, rgba(11,15,23,0.98) 55%)`,
                      boxShadow: `0 0 0 1px ${a(wsAccent, '3a')} inset, 0 16px 48px -20px ${a(wsAccent, '22')}`,
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* ── Stage Toolbar ── */}
                    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
                      {STAGE_TOOLBAR[selectedOpp.stage].actions.map(act => (
                        <button
                          key={act.key}
                          type="button"
                          onClick={() => handleToolbarAction(act.key)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all hover:brightness-125"
                          style={{
                            background: `linear-gradient(135deg, ${a(wsAccent, '14')} 0%, rgba(11,15,23,0.9) 100%)`,
                            boxShadow: `0 0 0 1px ${a(wsAccent, '30')} inset`,
                            color: 'rgba(255,255,255,0.7)',
                          }}
                        >
                          {act.icon && <span className="text-[13px]">{act.icon}</span>}
                          {act.label}
                        </button>
                      ))}
                      <div className="flex-1" />
                      {STAGE_TOOLBAR[selectedOpp.stage].transition && (
                        <button
                          type="button"
                          className="flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition-all hover:brightness-125"
                          style={{
                            background: `linear-gradient(135deg, ${a(wsAccent, '30')} 0%, ${a(wsAccent, '18')} 100%)`,
                            boxShadow: `0 0 0 1px ${a(wsAccent, '55')} inset, 0 0 12px ${a(wsAccent, '22')}`,
                            color: wsAccent,
                          }}
                        >
                          {STAGE_TOOLBAR[selectedOpp.stage].transition!.label}
                        </button>
                      )}
                      {selectedOpp.stage === 'OFFER' && (
                        <>
                          <button type="button" className="shrink-0 rounded-lg px-4 py-1.5 text-[12px] font-bold" style={{ background: 'rgba(69,223,125,0.22)', color: '#45df7d', boxShadow: '0 0 0 1px rgba(69,223,125,0.44) inset' }}>Accept ✓</button>
                          <button type="button" className="shrink-0 rounded-lg px-4 py-1.5 text-[12px] font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', boxShadow: '0 0 0 1px rgba(239,68,68,0.33) inset' }}>Decline ✗</button>
                        </>
                      )}
                    </div>

                    {/* ── Stage-specific workspace content ── */}
                    <WorkspaceBlockNote
                      key={selectedOpp.id}
                      value={oppNotes[selectedOpp.id] ?? ''}
                      onChange={handleNoteChange}
                      placeholder={
                        selectedOpp.stage === 'INTERESTED' ? 'What caught your eye about this one? Use / for block commands…'
                        : selectedOpp.stage === 'CRAFTING' ? 'Resume drafting notes… Keywords to hit, angles to try…'
                        : selectedOpp.stage === 'APPLIED' ? 'Follow-up log — track what you sent and when…'
                        : selectedOpp.stage === 'SCREENING' ? 'Call notes — questions asked, recruiter name…'
                        : selectedOpp.stage === 'INTERVIEW' ? 'Round notes, prep thoughts, reflections…'
                        : selectedOpp.stage === 'OFFER' ? 'Offer terms, negotiation notes, decision factors…'
                        : 'Notes…'
                      }
                    />

                    {/* Artifacts row */}
                    {selectedOpp.stage === 'CRAFTING' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['Tailored resume v4', 'Cover letter draft'].map(art => (
                          <span
                            key={art}
                            className="rounded-xl px-3.5 py-2 text-[12px] font-medium text-white/58"
                            style={{
                              background: `linear-gradient(135deg, ${a(wsAccent, '10')} 0%, rgba(11,15,23,0.9) 100%)`,
                              boxShadow: `0 0 0 1px ${a(wsAccent, '28')} inset`,
                            }}
                          >
                            📄 {art}
                          </span>
                        ))}
                      </div>
                    )}
                    {selectedOpp.stage === 'APPLIED' && (
                      <div className="mt-3 rounded-xl px-4 py-3 text-[12px] text-white/50" style={{ background: 'rgba(139,130,255,0.08)', boxShadow: '0 0 0 1px rgba(139,130,255,0.22) inset' }}>
                        <span className="font-semibold text-white/70">📎 Submitted:</span> Resume_Wiz_v4.pdf · Applied via LinkedIn · 2 days ago
                        <div className="mt-1.5 text-[11px] text-white/30">⚠️ Editing this resume will move this opp back to Crafting.</div>
                      </div>
                    )}
                  </motion.div>

                  {/* ── RIGHT: Context sidebar ── */}
                  <div className="space-y-3">
                    {/* History */}
                    <div
                      className="rounded-[16px] px-4 py-3.5"
                      style={{ background: 'rgba(255,255,255,0.022)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Interested (history)
                        <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.28)' }}>
                          done
                        </span>
                      </div>
                      <div className="mt-2.5 space-y-1.5">
                        {[
                          'Worth pursuing because AI architecture + customer-facing translation is strong.',
                          'Concerns were mainly large-firm politics, not role fit.',
                        ].map(note => (
                          <p
                            key={note}
                            className="rounded-lg px-3 py-2 text-[12px] leading-relaxed text-white/50"
                            style={{ background: 'rgba(255,255,255,0.025)', boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset' }}
                          >
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Next stage */}
                    <div
                      className="rounded-[16px] px-4 py-3.5"
                      style={{ background: 'rgba(255,255,255,0.015)', boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset' }}
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/20">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Applied (next)
                        <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: 'rgba(248,197,106,0.06)', color: '#f3d59b55' }}>
                          next up
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-white/24">Activates when the opportunity moves here.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Bottom widgets ───────────────────────────────── */}
              <section className="mt-4 grid gap-3 lg:grid-cols-2">
                {/* Jump back in */}
                <div
                  className="rounded-[20px] p-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(83,213,255,0.04) 0%, rgba(9,12,19,0.92) 60%)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 12px 40px -20px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/28">Jump back in</span>
                    <svg className="h-4 w-4 text-[#53d5ff33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { text: 'Deloitte rewrite review pending',     color: '#ffb45a' },
                      { text: 'Nvidia screening notes due in 20m',   color: '#53d5ff' },
                      { text: 'Anthropic prep needs examples',       color: '#c58fff' },
                    ].map(item => (
                      <div
                        key={item.text}
                        className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[13px]"
                        style={{
                          background: 'rgba(255,255,255,0.022)',
                          boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
                        }}
                      >
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: item.color, boxShadow: `0 0 5px ${item.color}` }} />
                        <span className="text-white/68">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* While you were out */}
                <div
                  className="rounded-[20px] p-5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(138,215,255,0.04) 0%, rgba(9,12,19,0.92) 60%)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 12px 40px -20px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/28">While you were out</span>
                    <svg className="h-4 w-4 text-[#8ad7ff33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: 'New jobs',    value: '4,327', color: '#57a6ff' },
                      { label: 'Profile fit', value: '18',    color: '#c58fff' },
                      { label: '90%+ match', value: '3',     color: '#45df7d' },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="rounded-[12px] px-3.5 py-3"
                        style={{
                          background: `linear-gradient(135deg, ${s.color}0c 0%, rgba(11,15,23,0.95) 100%)`,
                          boxShadow: `0 0 0 1px ${s.color}18 inset`,
                        }}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: `${s.color}55` }}>{s.label}</div>
                        <div className="mt-1 text-[22px] font-bold leading-none" style={{ color: `${s.color}cc` }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </div>
          </LayoutGroup>
        </div>

        {/* ── Backdrop ────────────────────────────────────────────── */}
        {drawerStage && (
          <div
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerStage(null)}
          />
        )}

        {/* ── STAGE DRAWER ─────────────────────────────────────────── */}
        <div
          className="fixed right-0 top-0 z-40 h-full transition-transform duration-300 ease-out"
          style={{ width: 440, transform: drawerStage ? 'translateX(0)' : 'translateX(100%)' }}
        >
          {/* Edge shadow */}
          <div
            className="absolute inset-y-0 -left-12 w-12"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.7) 100%)' }}
          />

          <div
            className="flex h-full flex-col overflow-hidden"
            style={{
              borderLeft: drawerMeta ? `1px solid ${a(drawerMeta.accent, '2e')}` : '1px solid rgba(255,255,255,0.05)',
              background: 'linear-gradient(180deg, rgba(15,19,28,0.99) 0%, rgba(8,11,18,1) 100%)',
              boxShadow: drawerMeta ? `inset 2px 0 40px ${a(drawerMeta.accent, '0c')}` : 'none',
            }}
          >
            {drawerMeta && (
              <>
                {/* Ambient glow inside drawer */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div
                    className="absolute -top-24 left-1/2 h-48 w-[220%] -translate-x-1/2"
                    style={{ background: `radial-gradient(ellipse 50% 100% at 50% 100%, ${a(drawerMeta.accent, '16')}, transparent)` }}
                  />
                </div>

                {/* Drawer header */}
                <div
                  className="relative shrink-0 px-6 pt-7 pb-5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="mb-5 h-px"
                    style={{ background: `linear-gradient(90deg, ${drawerMeta.accent} 0%, ${a(drawerMeta.accent, '44')} 45%, transparent 100%)` }}
                  />
                  <div className="flex items-baseline gap-3">
                    <span className="text-[20px] font-bold" style={{ color: drawerMeta.accent }}>{drawerMeta.label}</span>
                    <span className="text-[13px] text-white/38">{drawerMeta.count} opportunities</span>
                  </div>
                  <p className="mt-1 text-[12px] text-white/28">Pick one to open its workspace</p>
                  <input
                    type="text"
                    placeholder="Filter by company, role…"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    className="mt-4 w-full rounded-xl px-4 py-2.5 text-[13px] outline-none placeholder:text-white/18"
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      boxShadow: `0 0 0 1px ${a(drawerMeta.accent, '22')} inset`,
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  />
                </div>

                {/* Drawer list */}
                <div className="relative flex-1 overflow-y-auto p-3">
                  <div className="space-y-1">
                    {filteredOpps.map(opp => {
                      const sel = selectedOpp.id === opp.id;
                      return (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => selectOpp(opp)}
                          className="flex w-full items-start gap-3 rounded-[12px] px-3.5 py-3 text-left transition"
                          style={{
                            background: sel
                              ? `linear-gradient(135deg, ${a(drawerMeta.accent, '14')} 0%, rgba(11,15,23,0.9) 100%)`
                              : 'transparent',
                            boxShadow: sel ? `0 0 0 1px ${a(drawerMeta.accent, '40')} inset` : '0 0 0 1px transparent inset',
                          }}
                        >
                          <div
                            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold"
                            style={{
                              color: drawerMeta.accent,
                              background: a(drawerMeta.accent, '14'),
                              boxShadow: `0 0 0 1px ${a(drawerMeta.accent, '25')} inset`,
                            }}
                          >
                            {initials(opp.company)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-[13px] font-semibold text-white/85">{opp.company}</span>
                              <span className="shrink-0 text-[11px] text-white/28">{opp.stale}</span>
                            </div>
                            <div className="truncate text-[12px] text-white/44">{opp.role}</div>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="truncate text-[11px] text-white/26">{opp.signal}</span>
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ color: drawerMeta.accent, background: a(drawerMeta.accent, '14') }}
                              >
                                {opp.chip}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="relative shrink-0 px-6 py-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[11px] text-white/20">Esc to close · Click outside to dismiss</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── RESUME STUDIO DRAWER (slides over cockpit) ────────────── */}
      <AnimatePresence>
        {resumeDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
              onClick={() => setResumeDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full flex-col"
              style={{
                width: 'min(720px, 85vw)',
                background: 'linear-gradient(180deg, rgba(15,19,28,0.99) 0%, rgba(8,11,18,1) 100%)',
                borderLeft: `1px solid ${a(wsAccent, '2e')}`,
                boxShadow: `-20px 0 60px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Drawer header */}
              <div className="shrink-0 px-8 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[20px] font-bold text-white">Resume Studio</h2>
                    <p className="mt-1 text-[13px] text-white/38">
                      {selectedOpp.company} · {selectedOpp.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResumeDrawerOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-white/50 transition hover:bg-white/5 hover:text-white/80"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="mt-4 h-px" style={{ background: `linear-gradient(90deg, ${wsAccent} 0%, ${a(wsAccent, '33')} 50%, transparent 100%)` }} />
              </div>

              {/* Drawer body — mock resume editor */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: wsAccent }}>Draft Workspace</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: a(wsAccent, '14'), color: a(wsAccent, 'cc') }}>v4</span>
                </div>
                <div className="space-y-4">
                  {['Summary', 'Experience', 'Skills', 'Education'].map(section => (
                    <div key={section} className="rounded-[14px] px-5 py-4" style={{ background: 'rgba(255,255,255,0.022)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}>
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">{section}</div>
                      <div className="min-h-[60px] rounded-lg px-3 py-2 text-[13px] leading-relaxed text-white/55" style={{ background: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
                        {section === 'Summary' && 'Seasoned enterprise solutions architect with 15+ years bridging complex technical capabilities to business outcomes…'}
                        {section === 'Experience' && 'Principal Solutions Architect — SHI International (2019–Present)\n• Led $12M cloud migration for Fortune 500 client…'}
                        {section === 'Skills' && 'Cloud Architecture · AWS · Azure · Kubernetes · Security Architecture · SIEM · Zero Trust · Enterprise Sales'}
                        {section === 'Education' && 'B.S. Computer Science — University of Texas'}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button type="button" className="rounded-lg px-5 py-2.5 text-[13px] font-bold transition hover:brightness-125" style={{ background: `linear-gradient(135deg, ${a(wsAccent, '30')}, ${a(wsAccent, '18')})`, color: wsAccent, boxShadow: `0 0 0 1px ${a(wsAccent, '55')} inset` }}>
                    ✨ Generate Rewrite
                  </button>
                  <button type="button" className="rounded-lg px-5 py-2.5 text-[13px] font-medium text-white/50 transition hover:bg-white/5" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset' }}>
                    📥 Export PDF
                  </button>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="shrink-0 px-8 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[11px] text-white/20">Esc to close · Changes save automatically</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── SWIPE MODE OVERLAY ───────────────────────────────────────── */}
      <AnimatePresence>
        {swipeMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(2,5,8,0.96)', backdropFilter: 'blur(12px)' }}
          >
            <div className="w-full max-w-md px-6">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-white">Swipe Triage</h2>
                  <p className="mt-1 text-[13px] text-white/38">{(liveStageOpps.NEW ?? []).length - swipeIdx} remaining</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSwipeMode(false); setSwipeIdx(0); setSwipeResult(null); setSwipeNote(''); }}
                  className="rounded-lg px-3 py-1.5 text-[12px] text-white/40 transition hover:bg-white/5 hover:text-white/70"
                >
                  ✕ Exit
                </button>
              </div>

              {/* Card */}
              {(() => {
                const swipeOpps = liveStageOpps.NEW ?? [];
                const opp = swipeOpps[swipeIdx];
                if (!opp) return (
                  <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset' }}>
                    <div className="text-[48px] mb-3">🎉</div>
                    <h3 className="text-[18px] font-bold text-white">All caught up!</h3>
                    <p className="mt-2 text-[13px] text-white/40">No more new opportunities to triage.</p>
                  </div>
                );
                return (
                  <div>
                    <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(160deg, rgba(244,183,77,0.08), rgba(11,15,23,0.95))', boxShadow: '0 0 0 1px rgba(244,183,77,0.2) inset, 0 20px 60px -20px rgba(0,0,0,0.7)' }}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold" style={{ color: '#f4b74d', background: 'rgba(244,183,77,0.18)', border: '1px solid rgba(244,183,77,0.33)' }}>
                          {initials(opp.company)}
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold text-white">{opp.company}</h3>
                          <p className="text-[13px] text-white/50">{opp.role}</p>
                        </div>
                      </div>
                      <p className="text-[13px] leading-relaxed text-white/40 mb-4">{opp.signal}</p>

                      {/* Swipe result feedback */}
                      {swipeResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4"
                        >
                          {swipeResult === 'interested' && (
                            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(87,166,255,0.1)', boxShadow: '0 0 0 1px rgba(87,166,255,0.25) inset' }}>
                              <div className="mb-2 text-[13px] font-semibold" style={{ color: '#57a6ff' }}>✓ Interested!</div>
                              <label className="block text-[12px] text-white/50 mb-1.5">What caught your eye about this one?</label>
                              <textarea
                                value={swipeNote}
                                onChange={e => setSwipeNote(e.target.value)}
                                placeholder="Optional — but this note will show up in your Interested workspace…"
                                className="w-full rounded-lg px-3 py-2 text-[13px] text-white/80 outline-none placeholder:text-white/20"
                                style={{ background: 'rgba(0,0,0,0.4)', boxShadow: '0 0 0 1px rgba(87,166,255,0.15) inset', minHeight: 60, resize: 'vertical' }}
                              />
                              <button
                                type="button"
                                onClick={() => { setSwipeResult(null); setSwipeNote(''); setSwipeIdx(i => i + 1); }}
                                className="mt-2.5 rounded-lg px-4 py-1.5 text-[12px] font-bold transition hover:brightness-125"
                                style={{ background: 'rgba(87,166,255,0.2)', color: '#57a6ff', boxShadow: '0 0 0 1px rgba(87,166,255,0.33) inset' }}
                              >
                                Continue →
                              </button>
                            </div>
                          )}
                          {swipeResult === 'pass' && (
                            <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(239,68,68,0.08)', boxShadow: '0 0 0 1px rgba(239,68,68,0.18) inset' }}>
                              <span className="text-[13px] text-white/40">Passed — moving on…</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {!swipeResult && (
                      <div className="mt-6 flex items-center justify-center gap-8">
                        <button
                          type="button"
                          onClick={() => { setSwipeResult('pass'); setTimeout(() => { setSwipeResult(null); setSwipeIdx(i => i + 1); }, 800); }}
                          className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-bold transition-all hover:scale-110"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', color: '#ef4444', boxShadow: '0 8px 24px rgba(239,68,68,0.15)' }}
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          onClick={() => setSwipeResult('interested')}
                          className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-bold transition-all hover:scale-110"
                          style={{ background: 'rgba(87,166,255,0.1)', border: '2px solid #57a6ff', color: '#57a6ff', boxShadow: '0 8px 24px rgba(87,166,255,0.15)' }}
                        >
                          ✓
                        </button>
                      </div>
                    )}
                    {!swipeResult && (
                      <div className="mt-4 flex items-center justify-center gap-6 text-[12px] text-white/25">
                        <span>← Pass</span>
                        <span>Interested →</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
