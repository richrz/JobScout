'use client';

import { useEffect, useMemo, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { ChevronDown, Clock3, FileText, Inbox, KanbanSquare, Mail, PanelRight, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type StageId =
  | 'NEW'
  | 'INTERESTED'
  | 'CRAFTING'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER';

type SectionData = {
  notes: string[];
  artifacts?: string[];
};

type Opportunity = {
  id: string;
  company: string;
  role: string;
  location: string;
  currentStage: StageId;
  stale: string;
  signal: string;
  chip?: string;
  summary: string;
  sections: Partial<Record<Exclude<StageId, 'NEW'>, SectionData>>;
};

const STAGE_ORDER: StageId[] = ['NEW', 'INTERESTED', 'CRAFTING', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];
const RIVER_PREVIEW_LIMIT = 4;

const SHARED_TRANSITION = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
};

const STAGE_META: Record<StageId, { label: string; accent: string; hint: string }> = {
  NEW: {
    label: 'New',
    accent: '#f4b74d',
    hint: 'Fresh discovery worth triage.',
  },
  INTERESTED: {
    label: 'Interested',
    accent: '#57a6ff',
    hint: 'Worth a closer look. Decide if it deserves real drafting time.',
  },
  CRAFTING: {
    label: 'Crafting',
    accent: '#ffb45a',
    hint: 'Drafting, tailoring, and artifact generation are in motion.',
  },
  APPLIED: {
    label: 'Applied',
    accent: '#8b82ff',
    hint: 'Track what was sent and what needs follow-up.',
  },
  SCREENING: {
    label: 'Screening',
    accent: '#53d5ff',
    hint: 'Recruiter and early-call context belongs here.',
  },
  INTERVIEW: {
    label: 'Interview',
    accent: '#c58fff',
    hint: 'Prep, debriefs, and proof points for real conversations.',
  },
  OFFER: {
    label: 'Offer',
    accent: '#45df7d',
    hint: 'Decision math, negotiation notes, and offer terms.',
  },
};

const INTERESTED_OPPORTUNITY_SEEDS = [
  {
    id: 'opp-jobot',
    company: 'Jobot',
    role: 'Sales Engineer - Security Integration',
    location: 'Kansas City, Missouri',
    stale: '2d idle',
    signal: 'Security-heavy consultative fit',
    chip: 'needs fit call',
    summary: 'Saved because the role fits technical selling and security integration depth, but it still needs a real fit judgment before drafting starts.',
    notes: [
      'Strong domain fit for security systems and client-facing architecture.',
      'Need to confirm comp and travel burden before investing in draft work.',
    ],
  },
  {
    id: 'opp-tuttle',
    company: 'Tuttle AAG, LLC',
    role: 'Sales Engineer',
    location: 'Denver, Colorado',
    stale: '4h',
    signal: 'Fast path if comp is clean',
    chip: 'new signal',
    summary: 'Good consultative selling fit with lower complexity. This likely needs a quick yes/no before it soaks drafting time.',
    notes: [
      'Looks like a faster-moving commercial cycle.',
      'Need to verify whether solution depth is enough to stay interesting.',
    ],
  },
  {
    id: 'opp-reply',
    company: 'Reply',
    role: 'Principal Solutions Consultant',
    location: 'Remote',
    stale: '7h',
    signal: 'Enterprise story fit',
    chip: 'worth a look',
    summary: 'Saved for the mix of architecture depth and client-facing communication.',
    notes: [
      'Potentially strong fit for complex stakeholder translation.',
      'Need better clarity on travel expectations.',
    ],
  },
  {
    id: 'opp-splunk',
    company: 'Splunk',
    role: 'Senior Field Architect',
    location: 'Chicago, Illinois',
    stale: '1d',
    signal: 'High-value security narrative',
    chip: 'cooling',
    summary: 'Could be a compelling security-platform story if the role still has enough solution ownership.',
    notes: [
      'Strong story overlap with platform + customer leadership.',
      'May require clearer recent observability proof.',
    ],
  },
  {
    id: 'opp-datadog',
    company: 'Datadog',
    role: 'Enterprise Solutions Architect',
    location: 'Remote',
    stale: '3h',
    signal: 'Platform fit, needs sharper proof',
    chip: 'hot',
    summary: 'Worth pursuing if the draft can quickly foreground scale and platform influence.',
    notes: [
      'Draft would need stronger observability/system-scale framing.',
      'Comp seems promising enough to keep warm.',
    ],
  },
  {
    id: 'opp-wiz',
    company: 'Wiz',
    role: 'Cloud Security Architect',
    location: 'Austin, Texas',
    stale: '38m',
    signal: 'Very strong domain fit',
    chip: 'hot',
    summary: 'This is a strong technical and domain fit. Main question is whether to move to drafting immediately.',
    notes: [
      'Security cloud narrative is credible here.',
      'Could move to crafting quickly if interest remains strong.',
    ],
  },
  {
    id: 'opp-okta',
    company: 'Okta',
    role: 'Advisory Solutions Engineer',
    location: 'Remote',
    stale: '6h',
    signal: 'IAM story could land well',
    chip: 'good fit',
    summary: 'Worth keeping warm because identity/security plus enterprise selling is a natural story.',
    notes: [
      'Likely easy to tailor for recruiter readability.',
      'Need to decide if the role is senior enough.',
    ],
  },
  {
    id: 'opp-palo',
    company: 'Palo Alto Networks',
    role: 'Principal Customer Architect',
    location: 'Dallas, Texas',
    stale: '8h',
    signal: 'Prestige + domain credibility',
    chip: 'high upside',
    summary: 'High-upside opportunity if the resume can sharpen security leadership quickly.',
    notes: [
      'Could be one of the stronger top-end targets in Interested.',
      'Would need a more aggressive positioning pass.',
    ],
  },
  {
    id: 'opp-verkada',
    company: 'Verkada',
    role: 'Senior Solutions Architect',
    location: 'San Mateo, California',
    stale: '11h',
    signal: 'Physical security relevance',
    chip: 'specific fit',
    summary: 'Saved for physical security overlap and customer-facing architecture story.',
    notes: [
      'Direct product/domain overlap is unusually clean.',
      'Need to test whether the team/comp tradeoffs are worth it.',
    ],
  },
  {
    id: 'opp-crowdstrike',
    company: 'CrowdStrike',
    role: 'Field CTO Advisor',
    location: 'Remote',
    stale: '13m',
    signal: 'Stretch but credible',
    chip: 'stretch',
    summary: 'Higher-risk role, but the narrative is compelling enough to keep in view.',
    notes: [
      'Would need sharper executive and market-facing framing.',
      'Still a meaningful possibility if the story is elevated.',
    ],
  },
  {
    id: 'opp-zscaler',
    company: 'Zscaler',
    role: 'Principal Advisory Architect',
    location: 'Remote',
    stale: '1d',
    signal: 'Good enterprise-security mix',
    chip: 'watch',
    summary: 'Looks promising but not urgent yet. Needs more signal before drafting.',
    notes: [
      'Resume angle would be clean if it gets promoted.',
      'Not enough urgency yet to consume crafting time.',
    ],
  },
  {
    id: 'opp-ibm',
    company: 'IBM',
    role: 'Client Engineering Lead',
    location: 'New York, New York',
    stale: '19h',
    signal: 'AI + client engineering overlap',
    chip: 'interesting',
    summary: 'Worth tracking because AI plus client engineering is directionally strong.',
    notes: [
      'Potential story overlap is good, but still needs hard fit judgment.',
      'Would need a more tailored leadership emphasis.',
    ],
  },
  {
    id: 'opp-snowflake',
    company: 'Snowflake',
    role: 'Industry Principal Architect',
    location: 'Remote',
    stale: '5h',
    signal: 'Architecture story is strong',
    chip: 'review',
    summary: 'Interesting if the market-facing architecture story can be made more explicit.',
    notes: [
      'Could benefit from a more solution-led positioning pass.',
      'Not yet urgent enough to displace hotter roles.',
    ],
  },
  {
    id: 'opp-servicenow',
    company: 'ServiceNow',
    role: 'Advisory Solution Consultant',
    location: 'Remote',
    stale: '9h',
    signal: 'Readable recruiter narrative',
    chip: 'easy tailor',
    summary: 'Potentially easy to tailor because the recruiter-facing story is straightforward.',
    notes: [
      'Could move quickly if the role feels senior enough.',
      'Would likely be a lighter lift than deeper architecture roles.',
    ],
  },
];

const OPPORTUNITIES: Opportunity[] = [
  ...INTERESTED_OPPORTUNITY_SEEDS.map((seed) => ({
    id: seed.id,
    company: seed.company,
    role: seed.role,
    location: seed.location,
    currentStage: 'INTERESTED' as const,
    stale: seed.stale,
    signal: seed.signal,
    chip: seed.chip,
    summary: seed.summary,
    sections: {
      INTERESTED: {
        notes: seed.notes,
      },
    },
  })),
  {
    id: 'opp-deloitte',
    company: 'Deloitte',
    role: 'GenAI Architect',
    location: 'Denver, Colorado',
    currentStage: 'CRAFTING',
    stale: '7m',
    signal: 'Drafting now with active artifacts',
    chip: 'active draft',
    summary: 'This one is already in motion. Workspace needs tailored resume artifacts and drafting notes in one place.',
    sections: {
      INTERESTED: {
        notes: [
          'Worth pursuing because AI architecture + customer-facing translation is a strong match.',
          'Concerns were mainly large-firm politics, not role fit.',
        ],
      },
      CRAFTING: {
        notes: [
          'Resume version B is the strongest baseline.',
          'Need one more measurable leadership bullet in the second role.',
        ],
        artifacts: ['Tailored resume v4', 'Keyword capture', 'Call prep outline'],
      },
    },
  },
  {
    id: 'opp-cloudflare',
    company: 'Cloudflare',
    role: 'Enterprise Architect',
    location: 'Remote',
    currentStage: 'APPLIED',
    stale: '5h',
    signal: 'Applied manually, follow-up pending',
    chip: 'follow up',
    summary: 'Application was sent manually. Workspace now needs applied-state notes, confirmation trail, and follow-up tracking.',
    sections: {
      INTERESTED: {
        notes: ['Saved for architecture scope and strong platform story.'],
      },
      CRAFTING: {
        notes: ['Resume tuned toward enterprise and edge platform language.'],
        artifacts: ['Submitted resume v14'],
      },
      APPLIED: {
        notes: [
          'Applied over recruiter phone intake; no portal screenshot exists.',
          'Follow-up scheduled for tomorrow morning.',
        ],
        artifacts: ['Follow-up draft email'],
      },
    },
  },
  {
    id: 'opp-nvidia',
    company: 'Nvidia',
    role: 'AI Platform Architect',
    location: 'Santa Clara, California',
    currentStage: 'SCREENING',
    stale: '38m',
    signal: 'Recruiter context needs capture',
    chip: 'screening',
    summary: 'Workspace has moved beyond apply. Screening notes, recruiter context, and next-step prep belong here now.',
    sections: {
      INTERESTED: {
        notes: ['Saved because this is a true stretch but credible reach role.'],
      },
      CRAFTING: {
        notes: ['Draft positioned platform scale and cross-functional influence.'],
        artifacts: ['Resume v6', 'Platform proof bullets'],
      },
      APPLIED: {
        notes: ['Applied through recruiter channel with direct intro.'],
      },
      SCREENING: {
        notes: ['Recruiter wants distributed systems examples and AI platform depth.'],
        artifacts: ['Recruiter email paste'],
      },
    },
  },
  {
    id: 'opp-anthropic',
    company: 'Anthropic',
    role: 'Partner Engineer',
    location: 'San Francisco, California',
    currentStage: 'INTERVIEW',
    stale: '11m',
    signal: 'Prep stories need tightening',
    chip: 'interview',
    summary: 'At interview stage, the workspace turns into prep and debrief history, not just application tracking.',
    sections: {
      INTERESTED: {
        notes: ['Compelling because partner-facing technical communication is central.'],
      },
      CRAFTING: {
        notes: ['Tailored toward LLM platform partnerships and solution design.'],
        artifacts: ['Resume v9', 'Intro note'],
      },
      APPLIED: {
        notes: ['Applied with partner-focused resume draft.'],
      },
      SCREENING: {
        notes: ['Recruiter liked GTM plus deep technical mix.'],
      },
      INTERVIEW: {
        notes: ['Need stronger stories on ambiguity and ecosystem influence.'],
        artifacts: ['Panel prep sheet', 'STAR answer draft'],
      },
    },
  },
  {
    id: 'opp-acme',
    company: 'Acme AI',
    role: 'Principal Solutions Architect',
    location: 'Remote',
    currentStage: 'OFFER',
    stale: '3h',
    signal: 'Decision stage with offer notes',
    chip: 'offer',
    summary: 'Offer stage should open the same workspace, with all earlier history intact and the decision section now active.',
    sections: {
      INTERESTED: {
        notes: ['Strong fit and clean story from the start.'],
      },
      CRAFTING: {
        notes: ['Resume leaned hard into leadership and architectural depth.'],
        artifacts: ['Resume final', 'Email draft'],
      },
      APPLIED: {
        notes: ['Applied directly to hiring manager referral.'],
      },
      SCREENING: {
        notes: ['Screen passed cleanly; team wanted more solution-selling examples.'],
      },
      INTERVIEW: {
        notes: ['Interview feedback was positive; comp discussion opened early.'],
      },
      OFFER: {
        notes: ['Need clarity on equity and remote support.'],
        artifacts: ['Offer summary', 'Negotiation notes'],
      },
    },
  },
];

function itemsForStage(stage: StageId) {
  return OPPORTUNITIES.filter((opportunity) => opportunity.currentStage === stage);
}

function stageStatus(opportunity: Opportunity, stage: StageId) {
  const currentIndex = STAGE_ORDER.indexOf(opportunity.currentStage);
  const stageIndex = STAGE_ORDER.indexOf(stage);

  if (stage === 'NEW') return opportunity.currentStage === 'NEW' ? 'active' : 'hidden';
  if (opportunity.currentStage === 'NEW') return stage === 'INTERESTED' ? 'next' : 'future';
  if (stageIndex < currentIndex) return 'complete';
  if (stageIndex === currentIndex) return 'active';
  if (stageIndex === currentIndex + 1) return 'next';
  return 'future';
}

function sectionTone(status: ReturnType<typeof stageStatus>, stage: StageId) {
  const accent = STAGE_META[stage].accent;

  if (status === 'active') {
    return {
      border: `${accent}75`,
      background: `${accent}15`,
      badge: 'current',
      badgeStyle: { color: accent, background: `${accent}22` },
    };
  }

  if (status === 'complete') {
    return {
      border: 'rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.028)',
      badge: 'history',
      badgeStyle: { color: '#dbe2ef', background: 'rgba(255,255,255,0.06)' },
    };
  }

  if (status === 'next') {
    return {
      border: 'rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.02)',
      badge: 'next',
      badgeStyle: { color: '#f3d59b', background: 'rgba(248,197,106,0.14)' },
    };
  }

  return {
    border: 'rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.015)',
    badge: 'future',
    badgeStyle: { color: '#8a93a5', background: 'rgba(255,255,255,0.04)' },
  };
}

function initials(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function withAlpha(color: string, alpha: string) {
  return `${color}${alpha}`;
}

function OpportunityIdentity({
  opportunity,
  compact = false,
  variant = 'river',
  shared = true,
}: {
  opportunity: Opportunity;
  compact?: boolean;
  variant?: 'river' | 'browser' | 'workspace';
  shared?: boolean;
}) {
  const accent = STAGE_META[opportunity.currentStage].accent;
  const variantClasses =
    variant === 'workspace'
      ? 'rounded-[22px] border px-4 py-3.5 shadow-[0_24px_60px_-42px_rgba(0,0,0,0.95)]'
      : variant === 'browser'
        ? 'rounded-[18px] border px-3 py-2.5'
        : 'rounded-[14px] border px-2.5 py-2';
  const variantStyle =
    variant === 'workspace'
      ? {
          borderColor: withAlpha(accent, '4f'),
          background: `linear-gradient(135deg, ${withAlpha(accent, '24')} 0%, rgba(18,24,33,0.96) 68%)`,
        }
      : variant === 'browser'
        ? {
            borderColor: withAlpha(accent, '3d'),
            background: `linear-gradient(180deg, ${withAlpha(accent, '18')} 0%, rgba(10,14,20,0.92) 100%)`,
          }
        : {
            borderColor: 'rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.025)',
          };

  return (
    <motion.div
      layoutId={shared ? `opportunity-identity-${opportunity.id}` : undefined}
      transition={SHARED_TRANSITION}
      className={cn('flex min-w-0 items-center gap-3', compact ? 'gap-2.5' : 'gap-3.5', variantClasses)}
      style={variantStyle}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-2xl border font-semibold',
          compact ? 'h-9 w-9 text-[11px]' : 'h-11 w-11 text-xs',
        )}
        style={{ borderColor: `${accent}66`, color: accent, background: `${accent}18` }}
      >
        {initials(opportunity.company)}
      </div>
      <div className="min-w-0">
        <div className={cn('truncate font-semibold text-white', compact ? 'text-[12px]' : 'text-sm')}>{opportunity.company}</div>
        <div className={cn('truncate text-white/72', compact ? 'text-[11px]' : 'text-[13px]')}>{opportunity.role}</div>
      </div>
    </motion.div>
  );
}

export default function CockpitPrototypeClient() {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('opp-deloitte');
  const [browsingStage, setBrowsingStage] = useState<StageId | null>(null);
  const [collapsedByStage, setCollapsedByStage] = useState<Record<string, boolean>>({});
  const [draftTextByStage, setDraftTextByStage] = useState<Record<string, string>>({});

  const selectedOpportunity = OPPORTUNITIES.find((opportunity) => opportunity.id === selectedOpportunityId) ?? OPPORTUNITIES[0];

  const stageItemsMap = useMemo(
    () =>
      Object.fromEntries(STAGE_ORDER.map((stage) => [stage, itemsForStage(stage)])) as Record<StageId, Opportunity[]>,
    [],
  );

  const browserItems = browsingStage ? stageItemsMap[browsingStage] : [];
  const currentSectionStage = selectedOpportunity.currentStage === 'NEW' ? 'INTERESTED' : selectedOpportunity.currentStage;
  const browserAccent = browsingStage ? STAGE_META[browsingStage].accent : null;
  const workspaceAccent = STAGE_META[selectedOpportunity.currentStage].accent;

  useEffect(() => {
    if (!browsingStage) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setBrowsingStage(null);
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [browsingStage]);

  useEffect(() => {
    const nextDraft: Record<string, string> = {};
    STAGE_ORDER.filter((stage): stage is Exclude<StageId, 'NEW'> => stage !== 'NEW').forEach((stage) => {
      const notes = selectedOpportunity.sections[stage]?.notes ?? [];
      nextDraft[stage] = notes.join('\n\n');
    });
    setDraftTextByStage(nextDraft);
    setCollapsedByStage({});
  }, [selectedOpportunity.id]);

  return (
    <LayoutGroup id="cockpit-prototype">
      <main className="min-h-screen bg-[#03060a] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(90,180,255,0.12),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(68,230,140,0.10),transparent_24%),linear-gradient(180deg,#05080d_0%,#03060a_48%,#020408_100%)]" />

        <div className="relative z-10 w-full px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
            <div className="text-sm font-medium tracking-[0.02em] text-white/88">Good morning, Richard</div>
            <div className="flex items-center gap-2 text-white/56">
              {[
                { label: 'Inbox fallback', icon: Inbox },
                { label: 'Pipeline fallback', icon: KanbanSquare },
                { label: 'Resume fallback', icon: FileText },
                { label: 'Workspace fallback', icon: PanelRight },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`Open ${label}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </header>

          <section className="mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,21,0.96)_0%,rgba(5,8,14,0.9)_100%)] px-4 py-5 sm:px-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Pipeline</div>
                <p className="mt-2 text-sm text-white/58">Stable kanban on top. Click a stage to browse. Click a card to open the workspace below.</p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/56">
                Kanban cockpit
              </div>
            </div>

            <div className="mt-4 overflow-x-auto pb-2">
              <div className="grid min-w-[1420px] grid-cols-7 gap-3">
                {STAGE_ORDER.map((stage) => {
                  const stageItems = stageItemsMap[stage];
                  const stageMeta = STAGE_META[stage];
                  const previewItems = stageItems.slice(0, RIVER_PREVIEW_LIMIT);
                  const hiddenCount = Math.max(stageItems.length - previewItems.length, 0);
                  const stageFocused = browsingStage === stage;

                  return (
                    <motion.section
                      key={stage}
                      layout
                      className="rounded-[24px] border px-3 py-3 backdrop-blur-[2px]"
                      style={{
                        borderColor: withAlpha(stageMeta.accent, stageFocused ? '75' : '28'),
                        background: stageFocused
                          ? `linear-gradient(180deg, ${withAlpha(stageMeta.accent, '34')} 0%, ${withAlpha(stageMeta.accent, '18')} 32%, rgba(7,10,14,0.92) 100%)`
                          : `linear-gradient(180deg, ${withAlpha(stageMeta.accent, '0a')} 0%, rgba(7,10,14,0.7) 24%, rgba(4,7,12,0.24) 100%)`,
                        boxShadow: stageFocused
                          ? `0 0 0 1px ${withAlpha(stageMeta.accent, '66')} inset, 0 26px 48px -34px ${withAlpha(stageMeta.accent, 'aa')}`
                          : `0 0 0 1px ${withAlpha(stageMeta.accent, '1a')} inset`,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Browse ${stageMeta.label} opportunities`}
                        onClick={() => setBrowsingStage(stage)}
                        className={cn(
                          'w-full rounded-[16px] border px-3 py-3 text-left transition',
                          stageFocused ? 'border-white/20 bg-white/[0.05]' : 'border-transparent hover:border-white/12 hover:bg-white/[0.03]',
                        )}
                      >
                        <motion.div layoutId={`stage-bridge-${stage}`} transition={SHARED_TRANSITION}>
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold" style={{ color: stageMeta.accent }}>
                                {stageMeta.label}
                              </div>
                              <div className="mt-1 text-[11px] text-white/48">{stageItems.length} opportunities</div>
                            </div>
                            <div
                              className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]"
                              style={{ color: stageMeta.accent, background: `${stageMeta.accent}20` }}
                            >
                              browse
                            </div>
                          </div>
                        </motion.div>
                      </button>

                      <div className="mt-3 space-y-2">
                        {previewItems.length > 0 ? (
                          previewItems.map((opportunity) => {
                            const selected = selectedOpportunity.id === opportunity.id && browsingStage === null;
                            return (
                              <motion.button
                                key={opportunity.id}
                                layout
                                type="button"
                                aria-label={`Open river workspace for ${opportunity.company} ${opportunity.role}`}
                                onClick={() => {
                                  setSelectedOpportunityId(opportunity.id);
                                  setBrowsingStage(null);
                                }}
                                className={cn('w-full rounded-[16px] border px-3 py-2.5 text-left transition')}
                                style={{
                                  borderColor: selected ? withAlpha(stageMeta.accent, '66') : 'rgba(255,255,255,0.08)',
                                  background: selected
                                    ? `linear-gradient(180deg, ${withAlpha(stageMeta.accent, '18')} 0%, rgba(28,34,43,0.82) 100%)`
                                    : 'linear-gradient(180deg, rgba(17,21,28,0.92) 0%, rgba(10,13,18,0.78) 100%)',
                                  boxShadow: selected ? `0 0 0 1px ${stageMeta.accent}52 inset, 0 18px 34px -24px ${stageMeta.accent}88` : `0 10px 24px -28px ${stageMeta.accent}66`,
                                }}
                              >
                                <OpportunityIdentity opportunity={opportunity} compact variant="river" shared={false} />
                                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-white/44">
                                  <span className="truncate">{opportunity.signal}</span>
                                  <span>{opportunity.stale}</span>
                                </div>
                              </motion.button>
                            );
                          })
                        ) : (
                          <div className="rounded-[14px] border border-dashed border-white/8 px-3 py-10 text-center text-xs text-white/34">
                            Empty beach
                          </div>
                        )}

                        {hiddenCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setBrowsingStage(stage)}
                            aria-label={`Browse ${hiddenCount} more ${stageMeta.label.toLowerCase()} opportunities`}
                            className="w-full rounded-[14px] border border-dashed border-white/10 px-3 py-3 text-left text-xs text-white/58 transition hover:border-white/18 hover:text-white/74"
                          >
                            +{hiddenCount} more in {stageMeta.label.toLowerCase()}
                          </button>
                        ) : null}
                      </div>
                    </motion.section>
                  );
                })}
              </div>
            </div>
          </section>

          {browsingStage ? (
            <motion.section
              key={`browser-${browsingStage}`}
              layout
              transition={SHARED_TRANSITION}
              className="mt-5 rounded-[30px] border px-5 py-5 sm:px-6"
              style={{
                borderColor: withAlpha(browserAccent ?? '#ffffff', '55'),
                background: `linear-gradient(180deg, ${withAlpha(browserAccent ?? '#ffffff', '2c')} 0%, ${withAlpha(
                  browserAccent ?? '#ffffff',
                  '16',
                )} 26%, rgba(18,24,31,0.94) 100%)`,
                boxShadow: `0 34px 80px -54px ${withAlpha(browserAccent ?? '#000000', '7a')}`,
              }}
            >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <motion.div
                      layoutId={`stage-bridge-${browsingStage}`}
                      transition={SHARED_TRANSITION}
                      className="inline-flex items-center gap-3 rounded-[18px] border px-3 py-2"
                      style={{
                        borderColor: withAlpha(browserAccent ?? '#ffffff', '36'),
                        background: `linear-gradient(135deg, ${withAlpha(browserAccent ?? '#ffffff', '24')} 0%, rgba(14,19,26,0.96) 100%)`,
                      }}
                    >
                      <span
                        className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]"
                        style={{
                          color: STAGE_META[browsingStage].accent,
                          background: `${STAGE_META[browsingStage].accent}20`,
                        }}
                      >
                        {STAGE_META[browsingStage].label}
                      </span>
                      <span className="text-[11px] text-white/58">{browserItems.length} opportunities</span>
                    </motion.div>
                    <h2 className="mt-4 font-['Sora',_sans-serif] text-2xl font-semibold">
                      {STAGE_META[browsingStage].label} opportunities
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm text-white/58">
                      Select an opportunity below to open its workspace. This surface is in browser mode for{' '}
                      <span className="text-white/82">{STAGE_META[browsingStage].label}</span>. Press <span className="text-white/82">Esc</span> or close it.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Close stage browser"
                    onClick={() => setBrowsingStage(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/70 transition hover:border-white/18 hover:bg-white/[0.07]"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </button>
                </div>

                <motion.div layout className="mt-5 rounded-[24px] border p-3 sm:p-4" style={{ borderColor: withAlpha(browserAccent ?? '#ffffff', '40'), background: 'rgba(14,20,28,0.72)' }}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
                  {browserItems.map((opportunity) => {
                    const accent = STAGE_META[opportunity.currentStage].accent;
                    return (
                      <motion.button
                        key={opportunity.id}
                        layout
                        type="button"
                        aria-label={`Open browser workspace for ${opportunity.company} ${opportunity.role}`}
                        onClick={() => {
                          setSelectedOpportunityId(opportunity.id);
                          setBrowsingStage(null);
                        }}
                        className="rounded-[18px] border px-3 py-3 text-left transition"
                        style={{
                          borderColor: withAlpha(accent, '24'),
                          background: `linear-gradient(180deg, ${withAlpha(accent, '12')} 0%, rgba(18,23,31,0.94) 100%)`,
                          boxShadow: `0 16px 34px -28px ${withAlpha(accent, '66')}`,
                        }}
                      >
                        <OpportunityIdentity opportunity={opportunity} compact variant="browser" />
                        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-white/46">
                          <span className="truncate">{opportunity.signal}</span>
                          <span>{opportunity.stale}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px]"
                            style={{ color: accent, background: `${accent}18` }}
                          >
                            {opportunity.chip ?? 'live'}
                          </span>
                          <span className="text-[10px] text-white/34">{opportunity.location}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                  </div>
                </motion.div>
            </motion.section>
          ) : (
            <motion.section
              key={`workspace-${selectedOpportunity.id}`}
              layout
              transition={SHARED_TRANSITION}
              className="mt-5 rounded-[30px] border px-5 py-5 sm:px-6"
              style={{
                borderColor: withAlpha(workspaceAccent, '5f'),
                background: `linear-gradient(180deg, rgba(30,36,45,0.98) 0%, rgba(24,29,36,0.99) 100%)`,
                boxShadow: `0 44px 96px -64px rgba(0,0,0,0.7)`,
              }}
            >
                <div className="mb-4 h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${withAlpha(workspaceAccent, 'b2')} 0%, ${withAlpha(workspaceAccent, '35')} 60%, transparent 100%)` }} />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Opportunity workspace</div>
                    <div className="mt-3 rounded-[20px] border p-4" style={{ borderColor: withAlpha(workspaceAccent, '44'), background: `linear-gradient(180deg, ${withAlpha(workspaceAccent, '1f')} 0%, rgba(16,20,26,0.94) 100%)` }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold"
                          style={{ borderColor: `${workspaceAccent}66`, color: workspaceAccent, background: `${workspaceAccent}18` }}
                        >
                          {initials(selectedOpportunity.company)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold text-white">{selectedOpportunity.company}</div>
                          <div className="truncate text-[13px] text-white/62">{selectedOpportunity.location}</div>
                        </div>
                      </div>
                      <h2 className="mt-4 font-['Sora',_sans-serif] text-[30px] font-semibold leading-tight text-white">
                        {selectedOpportunity.role}
                      </h2>
                      <p className="mt-3 max-w-4xl text-sm leading-6 text-white/66">{selectedOpportunity.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span
                      aria-label={`Current stage: ${STAGE_META[selectedOpportunity.currentStage].label}`}
                      className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                      style={{
                        color: STAGE_META[selectedOpportunity.currentStage].accent,
                        background: `${STAGE_META[selectedOpportunity.currentStage].accent}22`,
                      }}
                    >
                      {`Current stage: ${STAGE_META[selectedOpportunity.currentStage].label}`}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/54">
                      1 opportunity = 1 workspace
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {STAGE_ORDER.filter((stage) => stage !== 'NEW').map((stage) => {
                    const status = stageStatus(selectedOpportunity, stage);
                    return (
                      <span
                        key={`${selectedOpportunity.id}-track-${stage}`}
                        className="rounded-full border px-3 py-1 text-[11px]"
                        style={{
                          borderColor: status === 'active' ? `${STAGE_META[stage].accent}66` : 'rgba(255,255,255,0.1)',
                          color: status === 'active' ? STAGE_META[stage].accent : 'rgba(255,255,255,0.55)',
                          background: status === 'active' ? `${STAGE_META[stage].accent}18` : 'rgba(255,255,255,0.025)',
                        }}
                      >
                        {STAGE_META[stage].label}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-3">
                  {STAGE_ORDER.filter((stage) => stage !== 'NEW').map((stage) => {
                    const status = stageStatus(selectedOpportunity, stage);
                    const tone = sectionTone(status, stage);
                    const section = selectedOpportunity.sections[stage];
                    const isCurrent = stage === currentSectionStage;
                    const key = `${selectedOpportunity.id}-${stage}`;
                    const isCollapsed = collapsedByStage[key] ?? !isCurrent;

                    return (
                      <article
                        key={`${selectedOpportunity.id}-${stage}`}
                        className={cn(
                          'rounded-[18px] border px-4 py-4 transition-all duration-300 ease-out',
                          isCurrent ? 'shadow-[0_24px_70px_-38px_rgba(0,0,0,0.88)]' : '',
                        )}
                        style={{ borderColor: tone.border, background: tone.background }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold" style={{ color: STAGE_META[stage].accent }}>
                              {STAGE_META[stage].label}
                            </div>
                            <div className="mt-1 text-[12px] text-white/48">{STAGE_META[stage].hint}</div>
                          </div>
                          <span className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em]" style={tone.badgeStyle}>
                            {tone.badge}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-center">
                          <button
                            type="button"
                            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${STAGE_META[stage].label} section`}
                            onClick={() =>
                              setCollapsedByStage((previous) => ({
                                ...previous,
                                [key]: !isCollapsed,
                              }))
                            }
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/[0.04] text-white/70 transition hover:border-white/26 hover:bg-white/[0.08]"
                          >
                            <ChevronDown className={cn('h-4 w-4 transition-transform', isCollapsed ? 'rotate-[-90deg]' : 'rotate-0')} />
                          </button>
                        </div>

                        {!isCollapsed && status === 'future' ? (
                          <div className="mt-4 rounded-[14px] border border-dashed border-white/10 px-4 py-4 text-sm text-white/38">
                            Blank until this opportunity reaches {STAGE_META[stage].label.toLowerCase()}.
                          </div>
                        ) : null}

                        {!isCollapsed && status === 'next' ? (
                          <div className="mt-4 rounded-[14px] border border-white/10 bg-black/18 px-4 py-4 text-sm text-white/54">
                            This section becomes active immediately after the opportunity moves here.
                          </div>
                        ) : null}

                        {!isCollapsed && status !== 'future' && status !== 'next' && section ? (
                          <div className="mt-4 space-y-3">
                            {isCurrent ? (
                              <div className="rounded-[16px] border p-4" style={{ borderColor: withAlpha(STAGE_META[stage].accent, '4f'), background: `linear-gradient(180deg, ${withAlpha(STAGE_META[stage].accent, '14')} 0%, rgba(12,16,21,0.96) 100%)` }}>
                                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/56">
                                  <FileText className="h-3.5 w-3.5" />
                                  Active work area
                                </div>
                                <div
                                  contentEditable
                                  suppressContentEditableWarning
                                  onInput={(event) =>
                                    setDraftTextByStage((previous) => ({
                                      ...previous,
                                      [stage]: event.currentTarget.textContent ?? '',
                                    }))
                                  }
                                  className="min-h-[320px] rounded-[12px] border border-white/14 bg-black/36 px-4 py-3 text-[15px] leading-7 text-white/86 outline-none"
                                >
                                  {draftTextByStage[stage] ?? ''}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-[14px] border border-white/10 bg-black/16 p-4">
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/42">
                                  <FileText className="h-3.5 w-3.5" />
                                  Notes
                                </div>
                                <div className="mt-3 space-y-2.5 text-sm text-white/82">
                                  {section.notes.map((note) => (
                                    <div key={note} className="rounded-[10px] border border-white/10 bg-white/[0.035] px-3 py-2">
                                      {note}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="rounded-[14px] border border-white/10 bg-black/16 p-4">
                              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/42">
                                <Mail className="h-3.5 w-3.5" />
                                Attachments + meta
                              </div>
                              <div className="mt-3 space-y-2 text-sm text-white/78">
                                {section.artifacts && section.artifacts.length > 0 ? (
                                  section.artifacts.map((artifact) => (
                                    <div key={artifact} className="rounded-[10px] border border-white/10 bg-white/[0.035] px-3 py-2">
                                      {artifact}
                                    </div>
                                  ))
                                ) : (
                                  <div className="rounded-[10px] border border-dashed border-white/10 px-3 py-3 text-white/40">
                                    No artifacts attached in this stage yet.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
            </motion.section>
          )}

          <section className="mt-6 grid gap-3 text-white/72 lg:grid-cols-[1fr_1.25fr]">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.018] p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">Jump back in</div>
                <Clock3 className="h-4 w-4 text-white/42" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {['Deloitte rewrite review pending', 'Nvidia screening notes due in 20m', 'Anthropic prep notes need examples'].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/66">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-white/8 bg-white/[0.018] p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">While you were out</div>
                <Sparkles className="h-4 w-4 text-[#8ad7ff]" />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'New jobs', value: '4,327' },
                  { label: 'Profile fit', value: '18' },
                  { label: '90%+', value: '3' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[14px] border border-white/8 bg-white/[0.02] px-3 py-3">
                    <div className="text-xs text-white/42">{stat.label}</div>
                    <div className="mt-1 text-xl font-semibold text-white/84">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </LayoutGroup>
  );
}
