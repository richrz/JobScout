'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Clock3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    hint: 'Triage fresh signal quickly.',
    cards: [
      { company: 'Stripe', role: 'Senior Solutions Engineer', urgency: 'watch', stale: '18m' },
      { company: 'Datadog', role: 'Field Architect', urgency: 'calm', stale: '42m' },
    ],
    tools: ['Quick score', 'Skill gaps', 'Pass / Save'],
    notes: ['Signal spikes at midday', 'Location fit trending high'],
  },
  {
    id: 'INTERESTED',
    label: 'Interested',
    accent: '#57a6ff',
    badge: 'saved',
    hint: 'Capture why this pursuit matters.',
    cards: [
      { company: 'OpenAI', role: 'Solutions Architect', urgency: 'urgent', stale: '2h' },
      { company: 'Snowflake', role: 'Principal SE', urgency: 'watch', stale: '1h' },
    ],
    tools: ['Fit notes', 'Risk notes', 'Move to crafting'],
    notes: ['Need deeper governance proof', 'Comp band worth pursuing'],
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
    notes: ['Summary version B is stronger', 'Role #2 needs one measurable outcome'],
  },
  {
    id: 'APPLIED',
    label: 'Applied',
    accent: '#8b82ff',
    badge: 'sent',
    hint: 'Track submitted artifacts and follow-up.',
    cards: [
      { company: 'Cloudflare', role: 'Enterprise Architect', urgency: 'watch', stale: '5h' },
      { company: 'Confluent', role: 'Strategic SE', urgency: 'calm', stale: '1d' },
    ],
    tools: ['Submission snapshot', 'Follow-up note', 'Reveal source'],
    notes: ['Follow-up due tomorrow 09:00', 'Submitted with resume v14'],
  },
  {
    id: 'SCREENING',
    label: 'Screening',
    accent: '#53d5ff',
    badge: 'moving',
    hint: 'Prep first human conversation.',
    cards: [{ company: 'Nvidia', role: 'AI Platform Architect', urgency: 'urgent', stale: '38m' }],
    tools: ['Call notes', 'Contact panel', 'Next step log'],
    notes: ['Recruiter asks for distributed systems examples'],
  },
  {
    id: 'INTERVIEW',
    label: 'Interview',
    accent: '#c58fff',
    badge: 'high focus',
    hint: 'Pressure-test your narrative.',
    cards: [{ company: 'Anthropic', role: 'Partner Engineer', urgency: 'urgent', stale: '11m' }],
    tools: ['Prep board', 'STAR answers', 'Follow-up draft'],
    notes: ['Panel likes GTM + architecture blend'],
  },
  {
    id: 'OFFER',
    label: 'Offer',
    accent: '#45df7d',
    badge: 'decision',
    hint: 'Evaluate and decide.',
    cards: [{ company: 'Acme AI', role: 'Principal Solutions Architect', urgency: 'watch', stale: '3h' }],
    tools: ['Decision board', 'Negotiation notes', 'Accept / Decline'],
    notes: ['Need equity clarity', 'Remote clause under review'],
  },
];

const PANEL_WIDTH = 560;
const PANEL_GAP = 64;

function urgencyClass(urgency: 'calm' | 'watch' | 'urgent') {
  if (urgency === 'urgent') return 'bg-[#ff6d6d] text-[#ffd9d9]';
  if (urgency === 'watch') return 'bg-[#f8c56a] text-[#2a1d08]';
  return 'bg-[#53d6a1] text-[#062417]';
}

export default function CockpitPrototypeClient() {
  const [activeStage, setActiveStage] = useState<StageId>('CRAFTING');

  const activeIndex = useMemo(() => STAGES.findIndex((s) => s.id === activeStage), [activeStage]);
  const activeSpec = STAGES[activeIndex] ?? STAGES[0];

  const trackShift = useMemo(() => {
    const stageCenter = activeIndex * (PANEL_WIDTH + PANEL_GAP) + PANEL_WIDTH / 2;
    const targetCenter = 360;
    return targetCenter - stageCenter;
  }, [activeIndex]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#03060a] text-white">
      <style jsx>{`
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
        @keyframes rowGlow {
          0% {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
          50% {
            box-shadow: 0 0 36px rgba(255, 255, 255, 0.1);
          }
          100% {
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
        }
        .telemetry-bar {
          animation: telemetryPulse 2.3s ease-in-out infinite;
          transform-origin: bottom;
        }
        .row-glow {
          animation: rowGlow 500ms ease-out;
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
              Prototype mode. This route is fake-data only so we can validate spatial layout and motion before touching live cockpit behavior.
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
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">River</div>
          <div className="mt-3 overflow-x-auto pb-2">
            <div className="flex min-w-[1280px] gap-3">
              {STAGES.map((stage, index) => {
                const selected = stage.id === activeStage;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStage(stage.id)}
                    className={cn(
                      'group relative h-[214px] flex-1 overflow-hidden rounded-[18px] border border-white/10 px-3 py-3 text-left transition-all duration-500 ease-out',
                      selected ? 'row-glow -translate-y-0.5 border-white/30 bg-white/[0.06]' : 'bg-white/[0.02] hover:border-white/20',
                    )}
                    style={{
                      boxShadow: selected ? `0 0 0 1px ${stage.accent}66 inset` : undefined,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: stage.accent, opacity: selected ? 1 : 0.45 }} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{stage.label}</div>
                          <div className="text-[11px] text-white/52">{stage.cards.length} active cards</div>
                        </div>
                        <span
                          className="rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: '#0b0d10', background: stage.accent }}
                        >
                          {stage.badge}
                        </span>
                      </div>
                      <div className="mt-2 h-px bg-white/10" />
                      <div className="mt-3 space-y-2">
                        {stage.cards.slice(0, 2).map((card) => (
                          <div key={`${stage.id}-${card.company}`} className="rounded-[11px] border border-white/10 bg-black/25 px-2.5 py-2">
                            <div className="text-xs font-medium">{card.company}</div>
                            <div className="mt-0.5 line-clamp-1 text-[11px] text-white/68">{card.role}</div>
                            <div className="mt-2 flex items-center justify-between text-[10px]">
                              <span className={cn('rounded-full px-1.5 py-0.5 uppercase', urgencyClass(card.urgency))}>{card.urgency}</span>
                              <span className="text-white/45">{card.stale}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {index < STAGES.length - 1 && <ArrowRight className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-white/18" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative mt-4 rounded-[28px] border border-white/14 bg-[#060b12]/92 px-4 py-5 sm:px-5">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Stage workspace motion rail</div>
            <div className="text-xs text-white/55">
              Active stage: <span className="font-semibold text-white">{activeSpec.label}</span>
            </div>
          </div>

          <div className="relative h-[430px] overflow-hidden rounded-[20px] border border-white/10 bg-[#04080f]">
            <div
              className="absolute left-0 top-6 h-[390px] transition-transform duration-700 ease-out"
              style={{
                width: `${STAGES.length * (PANEL_WIDTH + PANEL_GAP)}px`,
                transform: `translateX(${trackShift}px)`,
              }}
            >
              {STAGES.map((stage, index) => {
                const selected = stage.id === activeStage;
                const distance = Math.abs(index - activeIndex);
                return (
                  <article
                    key={`workspace-${stage.id}`}
                    className={cn(
                      'absolute top-0 rounded-[20px] border p-5 transition-all duration-700 ease-out md:p-6',
                      selected ? 'border-white/28 opacity-100' : 'border-white/10',
                    )}
                    style={{
                      left: `${index * (PANEL_WIDTH + PANEL_GAP)}px`,
                      width: `${PANEL_WIDTH}px`,
                      background: selected ? 'rgba(14,20,31,0.96)' : 'rgba(11,16,24,0.78)',
                      transform: `scale(${selected ? 1 : Math.max(0.88, 1 - distance * 0.08)}) translateY(${selected ? 0 : 12}px)`,
                      zIndex: selected ? 40 : Math.max(10, 30 - distance),
                      boxShadow: selected
                        ? `0 28px 70px -26px ${stage.accent}88, inset 0 0 0 1px ${stage.accent}55`
                        : '0 14px 34px -22px rgba(0,0,0,0.75)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/48">{stage.label} workspace</div>
                        <h2 className="mt-1 font-['Sora',_sans-serif] text-2xl font-semibold">{stage.label} operating panel</h2>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: stage.accent, background: `${stage.accent}33` }}
                      >
                        {selected ? 'in focus' : 'context'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
                      <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">Tools</div>
                        <ul className="mt-3 space-y-2 text-sm text-white/84">
                          {stage.tools.map((tool) => (
                            <li key={`${stage.id}-${tool}`} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: stage.accent }} />
                              {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-white/45">Stage notes</div>
                        <div className="mt-3 space-y-2.5 text-sm text-white/84">
                          {stage.notes.map((note) => (
                            <div key={`${stage.id}-${note}`} className="rounded-[10px] border border-white/10 bg-black/20 px-3 py-2">
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-50 w-20 bg-gradient-to-r from-[#060b12] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-50 w-28 bg-gradient-to-l from-[#060b12] to-transparent" />
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
                <div key={item} className="rounded-[12px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/80">
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
      </div>
    </main>
  );
}
