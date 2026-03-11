'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight, Clock3, Sparkles } from 'lucide-react';

type StageId =
  | 'NEW'
  | 'INTERESTED'
  | 'CRAFTING'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER';

type StageSpec = {
  id: StageId;
  label: string;
  accent: string;
  badge: string;
  hint: string;
  cards: Array<{
    company: string;
    role: string;
    urgency: 'calm' | 'watch' | 'urgent';
    stale: string;
  }>;
  tools: string[];
  notes: string[];
};

const STAGES: StageSpec[] = [
  {
    id: 'NEW',
    label: 'New',
    accent: '#f4b74d',
    badge: 'inflow',
    hint: 'Triage fresh signal fast.',
    cards: [
      { company: 'Stripe', role: 'Senior Solutions Engineer', urgency: 'watch', stale: '18m' },
      { company: 'Datadog', role: 'Field Architect', urgency: 'calm', stale: '42m' },
    ],
    tools: ['Quick score', 'Skill gaps', 'Pass / Save'],
    notes: ['Match quality spikes after noon', 'Location fit is strong'],
  },
  {
    id: 'INTERESTED',
    label: 'Interested',
    accent: '#57a6ff',
    badge: 'saved',
    hint: 'Capture why this is worth pursuit.',
    cards: [
      { company: 'OpenAI', role: 'Solutions Architect', urgency: 'urgent', stale: '2h' },
      { company: 'Snowflake', role: 'Principal SE', urgency: 'watch', stale: '1h' },
    ],
    tools: ['Fit notes', 'Risk notes', 'Move to crafting'],
    notes: ['Need stronger AI governance proof', 'Good comp band'],
  },
  {
    id: 'CRAFTING',
    label: 'Crafting',
    accent: '#ffb45a',
    badge: 'active',
    hint: 'Build and tune the package.',
    cards: [
      { company: 'Deloitte', role: 'GenAI Architect', urgency: 'urgent', stale: '7m' },
      { company: 'Jobot', role: 'Sales Engineer', urgency: 'watch', stale: '29m' },
    ],
    tools: ['Rewrite', 'Fact lock', 'Keyword coverage'],
    notes: ['Summary version B has better clarity', 'Need one stronger metric in role #2'],
  },
  {
    id: 'APPLIED',
    label: 'Applied',
    accent: '#8b82ff',
    badge: 'sent',
    hint: 'What was sent and what happens next.',
    cards: [
      { company: 'Cloudflare', role: 'Enterprise Architect', urgency: 'watch', stale: '5h' },
      { company: 'Confluent', role: 'Strategic SE', urgency: 'calm', stale: '1d' },
    ],
    tools: ['Submission snapshot', 'Follow-up note', 'Reveal source'],
    notes: ['Follow-up due tomorrow 09:00', 'Used tailored resume v14'],
  },
  {
    id: 'SCREENING',
    label: 'Screening',
    accent: '#53d5ff',
    badge: 'moving',
    hint: 'Recruiter contact and prep context.',
    cards: [{ company: 'Nvidia', role: 'AI Platform Architect', urgency: 'urgent', stale: '38m' }],
    tools: ['Call notes', 'Contact panel', 'Next step log'],
    notes: ['Recruiter asks for distributed systems examples'],
  },
  {
    id: 'INTERVIEW',
    label: 'Interview',
    accent: '#c58fff',
    badge: 'high focus',
    hint: 'Prep material and evidence.',
    cards: [{ company: 'Anthropic', role: 'Partner Engineer', urgency: 'urgent', stale: '11m' }],
    tools: ['Prep board', 'STAR answers', 'Follow-up draft'],
    notes: ['Panel likes GTM + architecture blend'],
  },
  {
    id: 'OFFER',
    label: 'Offer',
    accent: '#45df7d',
    badge: 'decision',
    hint: 'Evaluate terms and choose.',
    cards: [{ company: 'Acme AI', role: 'Principal Solutions Architect', urgency: 'watch', stale: '3h' }],
    tools: ['Decision board', 'Negotiation notes', 'Accept / Decline'],
    notes: ['Need equity clarity and remote clause'],
  },
];

function urgencyClass(urgency: 'calm' | 'watch' | 'urgent') {
  if (urgency === 'urgent') return 'bg-[#ff6d6d] text-[#ffd9d9]';
  if (urgency === 'watch') return 'bg-[#f8c56a] text-[#2a1d08]';
  return 'bg-[#53d6a1] text-[#062417]';
}

export default function CockpitPrototypeClient() {
  const [activeStage, setActiveStage] = useState<StageId>('CRAFTING');
  const [lastChangedAt, setLastChangedAt] = useState<number>(Date.now());
  const sectionRefs = useRef<Record<StageId, HTMLElement | null>>({
    NEW: null,
    INTERESTED: null,
    CRAFTING: null,
    APPLIED: null,
    SCREENING: null,
    INTERVIEW: null,
    OFFER: null,
  });

  const activeIndex = useMemo(
    () => STAGES.findIndex((stage) => stage.id === activeStage),
    [activeStage],
  );
  const activeSpec = STAGES[activeIndex] ?? STAGES[0];

  useEffect(() => {
    const section = sectionRefs.current[activeStage];
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
    setLastChangedAt(Date.now());
  }, [activeStage]);

  return (
    <main className="min-h-screen bg-[#06080b] text-white">
      <style jsx>{`
        @keyframes telemetryPulse {
          0% {
            opacity: 0.45;
            transform: scaleY(0.45);
          }
          50% {
            opacity: 1;
            transform: scaleY(1);
          }
          100% {
            opacity: 0.45;
            transform: scaleY(0.45);
          }
        }
        @keyframes stageGlow {
          0% {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
          50% {
            box-shadow: 0 0 26px rgba(255, 255, 255, 0.12);
          }
          100% {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
        }
        .telemetry-bar {
          animation: telemetryPulse 2.2s ease-in-out infinite;
          transform-origin: bottom;
        }
        .stage-glow {
          animation: stageGlow 480ms ease-out;
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <header className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_2fr]">
          <section className="rounded-[22px] border border-white/12 bg-gradient-to-br from-[#111722] to-[#0d1018] p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">JobScout cockpit</div>
            <h1 className="mt-2 font-['Sora',_sans-serif] text-2xl font-semibold">Good morning, Richard</h1>
            <p className="mt-2 text-sm text-white/65">
              Prototype mode. This surface is intentionally fake-data so layout and motion can be tuned safely.
            </p>
          </section>

          <section className="rounded-[22px] border border-white/12 bg-gradient-to-br from-[#101c25] via-[#0a1117] to-[#090d13] p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">Live telemetry</div>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[11px] text-emerald-100">
                Ambient motion
              </span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-2">
              {new Array(22).fill(0).map((_, index) => (
                <div
                  key={`bar-${index}`}
                  className="telemetry-bar w-2 rounded-t-md bg-gradient-to-t from-[#46df7d]/30 to-[#66d9ff]"
                  style={{
                    height: `${20 + ((index * 11) % 40)}px`,
                    animationDelay: `${index * 70}ms`,
                  }}
                />
              ))}
            </div>
          </section>
        </header>

        <section className="relative mt-5 rounded-[26px] border border-white/12 bg-gradient-to-b from-[#0b0f16] to-[#06080d] px-4 py-5 sm:px-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">River</div>
          <div className="mt-3 overflow-x-auto pb-3">
            <div className="flex min-w-[1200px] gap-3">
              {STAGES.map((stage, index) => {
                const selected = stage.id === activeStage;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStage(stage.id)}
                    className={cn(
                      'group relative h-[220px] flex-1 overflow-hidden rounded-[18px] border border-white/10 px-3 py-3 text-left transition-all duration-500 ease-out',
                      selected
                        ? 'stage-glow -translate-y-0.5 border-white/30 bg-white/[0.06]'
                        : 'bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
                    )}
                    style={{
                      boxShadow: selected ? `0 0 0 1px ${stage.accent}55 inset` : undefined,
                    }}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1.5 transition-opacity duration-500"
                      style={{ backgroundColor: stage.accent, opacity: selected ? 1 : 0.4 }}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{stage.label}</div>
                          <div className="text-[11px] text-white/55">{stage.cards.length} active cards</div>
                        </div>
                        <span
                          className="rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em]"
                          style={{
                            color: '#0b0d10',
                            background: stage.accent,
                          }}
                        >
                          {stage.badge}
                        </span>
                      </div>
                      <div className="mt-2 h-px bg-white/10" />
                      <div className="mt-3 space-y-2">
                        {stage.cards.slice(0, 2).map((card) => (
                          <div
                            key={`${stage.id}-${card.company}-${card.role}`}
                            className="rounded-[12px] border border-white/10 bg-black/20 px-2.5 py-2"
                          >
                            <div className="text-xs font-medium">{card.company}</div>
                            <div className="mt-0.5 line-clamp-1 text-[11px] text-white/70">{card.role}</div>
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className={cn('rounded-full px-1.5 py-0.5 uppercase', urgencyClass(card.urgency))}>
                                {card.urgency}
                              </span>
                              <span className="text-white/45">{card.stale}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-[11px] text-white/55">{stage.hint}</div>
                    </div>
                    {selected && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
                    )}
                    {index < STAGES.length - 1 && (
                      <ArrowRight className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-8 bottom-[318px] z-30 hidden h-10 bg-gradient-to-b from-transparent to-[#06080d] lg:block" />

          <div className="relative z-40 -mt-2">
            <div className="mb-2 flex items-center justify-between px-1">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Stage workspace motion rail
              </div>
              <div className="text-xs text-white/55">
                Active stage: <span className="font-semibold text-white">{activeSpec.label}</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-5 px-[10%]">
                {STAGES.map((stage) => {
                  const selected = stage.id === activeStage;
                  return (
                    <section
                      key={`workspace-${stage.id}`}
                      ref={(node) => {
                        sectionRefs.current[stage.id] = node;
                      }}
                      className={cn(
                        'w-[84vw] max-w-[980px] min-w-[620px] snap-center rounded-[22px] border bg-[#0e131d]/95 p-5 backdrop-blur transition-all duration-700 ease-out md:p-6',
                        selected
                          ? 'scale-[1] border-white/28 opacity-100'
                          : 'scale-[0.94] border-white/10 opacity-45',
                      )}
                      style={{
                        boxShadow: selected
                          ? `0 22px 64px -24px ${stage.accent}88, inset 0 0 0 1px ${stage.accent}55`
                          : '0 18px 40px -28px rgba(0,0,0,0.75)',
                      }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                            {stage.label} workspace
                          </div>
                          <h2 className="mt-1 font-['Sora',_sans-serif] text-2xl font-semibold">
                            {stage.label} operating panel
                          </h2>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                          style={{ background: `${stage.accent}33`, color: stage.accent }}
                        >
                          {selected ? 'in focus' : 'background context'}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
                          <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">Tools</div>
                          <ul className="mt-3 space-y-2 text-sm text-white/82">
                            {stage.tools.map((tool) => (
                              <li key={`${stage.id}-tool-${tool}`} className="flex items-center gap-2">
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ background: stage.accent }}
                                />
                                {tool}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-[16px] border border-white/10 bg-white/[0.02] p-4">
                          <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">Stage notes</div>
                          <div className="mt-3 space-y-2.5 text-sm text-white/82">
                            {stage.notes.map((note) => (
                              <div
                                key={`${stage.id}-note-${note}`}
                                className="rounded-[10px] border border-white/10 bg-black/20 px-3 py-2"
                              >
                                {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[18px] border border-white/12 bg-[#0b1016]/92 p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">Jump back in</div>
              <Clock3 className="h-4 w-4 text-white/55" />
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                'Deloitte rewrite review pending',
                'Nvidia screening notes due in 20m',
                'OpenAI fit note not finalized',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/12 bg-[#0b1116]/92 p-4">
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
          </div>
        </section>

        <section className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-white/55">
          <div>
            Stage switches: <span className="font-semibold text-white">{new Date(lastChangedAt).toLocaleTimeString()}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="rounded-full border border-white/15 px-2.5 py-1">Prototype only</span>
            <span className="rounded-full border border-white/15 px-2.5 py-1">No DB reads</span>
          </div>
        </section>
      </div>
    </main>
  );
}
