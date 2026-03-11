'use client';

import { useMemo, useState } from 'react';
import { Clock3, FileText, Mail, Sparkles } from 'lucide-react';
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
  summary: string;
  sections: Partial<Record<Exclude<StageId, 'NEW'>, SectionData>>;
};

const STAGE_ORDER: StageId[] = ['NEW', 'INTERESTED', 'CRAFTING', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'];

const STAGE_META: Record<StageId, { label: string; accent: string; hint: string }> = {
  NEW: {
    label: 'New',
    accent: '#f4b74d',
    hint: 'Fresh discovery worth triage.',
  },
  INTERESTED: {
    label: 'Interested',
    accent: '#57a6ff',
    hint: 'Capture why this is worth chasing.',
  },
  CRAFTING: {
    label: 'Crafting',
    accent: '#ffb45a',
    hint: 'Draft and tailor the package.',
  },
  APPLIED: {
    label: 'Applied',
    accent: '#8b82ff',
    hint: 'Track what was sent and what happened.',
  },
  SCREENING: {
    label: 'Screening',
    accent: '#53d5ff',
    hint: 'Record recruiter and early-call context.',
  },
  INTERVIEW: {
    label: 'Interview',
    accent: '#c58fff',
    hint: 'Prep and debrief real conversations.',
  },
  OFFER: {
    label: 'Offer',
    accent: '#45df7d',
    hint: 'Evaluate terms and make the call.',
  },
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-jobot',
    company: 'Jobot',
    role: 'Sales Engineer - Security Integration',
    location: 'Kansas City, Missouri',
    currentStage: 'INTERESTED',
    stale: '2d idle',
    summary: 'Saved because the role fits technical selling and security integration depth, but it still needs a real fit judgment before drafting starts.',
    sections: {
      INTERESTED: {
        notes: [
          'Strong domain fit for security systems and client-facing architecture.',
          'Need to confirm comp and travel burden before investing in draft work.',
        ],
      },
    },
  },
  {
    id: 'opp-deloitte',
    company: 'Deloitte',
    role: 'GenAI Architect',
    location: 'Denver, Colorado',
    currentStage: 'CRAFTING',
    stale: '7m',
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

  if (stage === 'NEW') {
    return opportunity.currentStage === 'NEW' ? 'active' : 'hidden';
  }
  if (opportunity.currentStage === 'NEW') {
    return stage === 'INTERESTED' ? 'next' : 'future';
  }
  if (stageIndex < currentIndex) return 'complete';
  if (stageIndex === currentIndex) return 'active';
  if (stageIndex === currentIndex + 1) return 'next';
  return 'future';
}

function sectionTone(status: ReturnType<typeof stageStatus>, stage: StageId) {
  const accent = STAGE_META[stage].accent;

  if (status === 'active') {
    return {
      border: `${accent}66`,
      background: `${accent}14`,
      badge: 'current',
      badgeStyle: { color: accent, background: `${accent}22` },
    };
  }

  if (status === 'complete') {
    return {
      border: 'rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.03)',
      badge: 'history',
      badgeStyle: { color: '#d8dde7', background: 'rgba(255,255,255,0.06)' },
    };
  }

  if (status === 'next') {
    return {
      border: 'rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.02)',
      badge: 'next',
      badgeStyle: { color: '#f3d59b', background: 'rgba(248,197,106,0.15)' },
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

export default function CockpitPrototypeClient() {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('opp-deloitte');
  const selectedOpportunity =
    OPPORTUNITIES.find((opportunity) => opportunity.id === selectedOpportunityId) ?? OPPORTUNITIES[0];

  const currentSectionStage = selectedOpportunity.currentStage === 'NEW' ? 'INTERESTED' : selectedOpportunity.currentStage;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#03060a] text-white">
      <style>{`
        @keyframes telemetryPulse {
          0% {
            opacity: 0.4;
            transform: scaleY(0.45);
          }
          50% {
            opacity: 1;
            transform: scaleY(1);
          }
          100% {
            opacity: 0.4;
            transform: scaleY(0.45);
          }
        }

        @keyframes workspaceSwap {
          0% {
            opacity: 0.52;
            transform: translateY(18px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .telemetry-bar {
          animation: telemetryPulse 2.3s ease-in-out infinite;
          transform-origin: bottom;
        }

        .workspace-swap {
          animation: workspaceSwap 420ms ease-out;
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(90,180,255,0.13),transparent_35%),radial-gradient(circle_at_86%_12%,rgba(68,230,140,0.12),transparent_28%),linear-gradient(180deg,#05080d_0%,#03060a_55%,#020408_100%)]" />
      </div>

      <div className="relative z-10 w-full px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_2fr]">
          <section className="rounded-[24px] border border-white/12 bg-gradient-to-br from-[#101825] to-[#0b121c] p-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">JobScout cockpit</div>
            <h1 className="mt-2 font-['Sora',_sans-serif] text-3xl font-semibold leading-tight">Good morning, Richard</h1>
            <p className="mt-2 max-w-xl text-sm text-white/64">
              River stays primary. Click any opportunity and the matching workspace below opens with the current stage ready to work.
            </p>
          </section>

          <section className="rounded-[24px] border border-white/12 bg-gradient-to-br from-[#0e1f28] via-[#0b131b] to-[#081018] p-6">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/44">Live telemetry</div>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[11px] text-emerald-100">
                Ambient motion
              </span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-2">
              {new Array(24).fill(0).map((_, index) => (
                <div
                  key={`telemetry-${index}`}
                  className="telemetry-bar w-2 rounded-t-sm bg-gradient-to-t from-[#3de56f]/30 to-[#62c8ff]"
                  style={{
                    height: `${14 + ((index * 13) % 44)}px`,
                    animationDelay: `${index * 70}ms`,
                  }}
                />
              ))}
            </div>
          </section>
        </header>

        <section className="mt-5 rounded-[28px] border border-white/14 bg-[#080d14]/90 px-4 py-5 sm:px-5">
          <div className="flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">The river</div>
            <div className="text-xs text-white/55">Select one opportunity. The workspace below switches 1:1.</div>
          </div>

          <div className="mt-3 overflow-x-auto pb-2">
            <div className="flex min-w-[1320px] gap-3">
              {STAGE_ORDER.map((stage) => {
                const stageItems = itemsForStage(stage);
                const stageMeta = STAGE_META[stage];

                return (
                  <section
                    key={stage}
                    className="min-h-[286px] flex-1 rounded-[20px] border border-white/10 bg-white/[0.02] px-3 py-3"
                    style={{ boxShadow: `0 0 0 1px ${stageMeta.accent}22 inset` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold" style={{ color: stageMeta.accent }}>
                          {stageMeta.label}
                        </div>
                        <div className="text-[11px] text-white/50">{stageItems.length} opportunities</div>
                      </div>
                      <div
                        className="rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em]"
                        style={{ background: `${stageMeta.accent}22`, color: stageMeta.accent }}
                      >
                        beach
                      </div>
                    </div>

                    <div className="mt-2 h-px bg-white/10" />

                    <div className="mt-3 space-y-2.5">
                      {stageItems.map((opportunity) => {
                        const selected = opportunity.id === selectedOpportunity.id;
                        return (
                          <button
                            key={opportunity.id}
                            type="button"
                            aria-label={`Open ${opportunity.company} ${opportunity.role} workspace`}
                            onClick={() => setSelectedOpportunityId(opportunity.id)}
                            className={cn(
                              'w-full rounded-[14px] border px-3 py-3 text-left transition-all duration-300 ease-out',
                              selected ? 'border-white/28 bg-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]' : 'border-white/10 bg-black/24 hover:border-white/20 hover:bg-white/[0.04]',
                            )}
                            style={{
                              boxShadow: selected ? `0 0 0 1px ${stageMeta.accent}66 inset, 0 18px 32px -24px ${stageMeta.accent}aa` : undefined,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-semibold"
                                style={{ borderColor: `${stageMeta.accent}66`, color: stageMeta.accent, background: `${stageMeta.accent}18` }}
                              >
                                {initials(opportunity.company)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-white">{opportunity.company}</div>
                                <div className="truncate text-[12px] text-white/74">{opportunity.role}</div>
                                <div className="mt-2 flex items-center justify-between text-[10px] text-white/44">
                                  <span className="truncate">{opportunity.location}</span>
                                  <span>{opportunity.stale}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}

                      {stageItems.length === 0 ? (
                        <div className="rounded-[14px] border border-dashed border-white/8 px-3 py-6 text-center text-xs text-white/35">
                          Empty beach for now
                        </div>
                      ) : null}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/14 bg-[#060b12]/92 px-4 py-5 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Opportunity workspace</div>
              <h2 className="mt-2 font-['Sora',_sans-serif] text-2xl font-semibold">
                {selectedOpportunity.role}
              </h2>
              <p className="mt-1 text-sm text-white/58">
                {selectedOpportunity.company} · {selectedOpportunity.location}
              </p>
            </div>
            <div
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{
                color: STAGE_META[selectedOpportunity.currentStage].accent,
                background: `${STAGE_META[selectedOpportunity.currentStage].accent}22`,
              }}
            >
              Current stage: {STAGE_META[selectedOpportunity.currentStage].label}
            </div>
          </div>

          <div key={selectedOpportunity.id} className="workspace-swap grid gap-4 lg:grid-cols-[1.35fr_0.75fr]">
            <section className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Workspace logic</div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">{selectedOpportunity.summary}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/55">
                  1 opportunity = 1 workspace
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {STAGE_ORDER.filter((stage) => stage !== 'NEW').map((stage) => {
                  const status = stageStatus(selectedOpportunity, stage);
                  const tone = sectionTone(status, stage);
                  const section = selectedOpportunity.sections[stage];
                  const isCurrent = stage === currentSectionStage;

                  return (
                    <article
                      key={`${selectedOpportunity.id}-${stage}`}
                      className={cn(
                        'rounded-[18px] border px-4 py-4 transition-all duration-300 ease-out',
                        isCurrent ? 'shadow-[0_22px_60px_-32px_rgba(0,0,0,0.8)]' : '',
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

                      {status === 'future' ? (
                        <div className="mt-4 rounded-[14px] border border-dashed border-white/10 px-4 py-4 text-sm text-white/38">
                          Blank until this opportunity reaches {STAGE_META[stage].label.toLowerCase()}.
                        </div>
                      ) : null}

                      {status === 'next' ? (
                        <div className="mt-4 rounded-[14px] border border-white/10 bg-black/18 px-4 py-4 text-sm text-white/54">
                          This section becomes active immediately after the opportunity moves here.
                        </div>
                      ) : null}

                      {status !== 'future' && status !== 'next' && section ? (
                        <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_0.9fr]">
                          <div className="rounded-[14px] border border-white/10 bg-black/18 p-4">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/42">
                              <FileText className="h-3.5 w-3.5" />
                              Notes
                            </div>
                            <div className="mt-3 space-y-2.5 text-sm text-white/82">
                              {section.notes.map((note) => (
                                <div key={note} className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2">
                                  {note}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[14px] border border-white/10 bg-black/18 p-4">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/42">
                              <Mail className="h-3.5 w-3.5" />
                              Attachments + meta
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-white/78">
                              {section.artifacts && section.artifacts.length > 0 ? (
                                section.artifacts.map((artifact) => (
                                  <div key={artifact} className="rounded-[10px] border border-white/10 bg-white/[0.02] px-3 py-2">
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
            </section>

            <aside className="space-y-4">
              <section className="rounded-[18px] border border-white/12 bg-[#0b1016]/92 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Jump back in</div>
                  <Clock3 className="h-4 w-4 text-white/55" />
                </div>
                <div className="mt-3 space-y-2.5">
                  {[
                    'Deloitte rewrite review pending',
                    'Nvidia screening notes due in 20m',
                    'Anthropic prep notes need examples',
                  ].map((item) => (
                    <div key={item} className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80">
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[18px] border border-white/12 bg-[#0b1116]/92 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">While you were out</div>
                  <Sparkles className="h-4 w-4 text-[#8ad7ff]" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-2.5 text-center">
                    <div className="text-xs text-white/50">New jobs</div>
                    <div className="mt-1 text-lg font-semibold">4,327</div>
                  </div>
                  <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-2.5 text-center">
                    <div className="text-xs text-white/50">Profile fit</div>
                    <div className="mt-1 text-lg font-semibold">18</div>
                  </div>
                  <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-2.5 text-center">
                    <div className="text-xs text-white/50">90%+</div>
                    <div className="mt-1 text-lg font-semibold">3</div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
