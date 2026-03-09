import type { ExaggerationLevel } from '@/types/llm';

export type ResumeWritingStrategy = 'conservative' | 'balanced' | 'standout';

export interface ResumeVoiceProfile {
  formality: number;
  brevity: number;
  technicalDepth: number;
  evidence: number;
  confidence: number;
  warmth: number;
  persuasion: number;
}

export type ResumeVoiceDimensionKey = keyof ResumeVoiceProfile;

interface ResumeVoiceDimension {
  key: ResumeVoiceDimensionKey;
  label: string;
  description: string;
  lowLabel: string;
  highLabel: string;
  lowDescriptor: string;
  midDescriptor: string;
  highDescriptor: string;
  promptLow: string;
  promptMid: string;
  promptHigh: string;
}

export const VOICE_DIMENSIONS: ResumeVoiceDimension[] = [
  {
    key: 'formality',
    label: 'Formality',
    description: 'How polished or conversational the wording feels.',
    lowLabel: 'Conversational',
    highLabel: 'Executive',
    lowDescriptor: 'Conversational',
    midDescriptor: 'Professional',
    highDescriptor: 'Executive',
    promptLow: 'Use natural, plain-spoken language that still reads cleanly.',
    promptMid: 'Keep a professional business tone without sounding stiff.',
    promptHigh: 'Use polished, executive-level phrasing with strong control and restraint.',
  },
  {
    key: 'brevity',
    label: 'Brevity',
    description: 'How compressed or expansive each bullet becomes.',
    lowLabel: 'Expansive',
    highLabel: 'Punchy',
    lowDescriptor: 'Expansive',
    midDescriptor: 'Balanced',
    highDescriptor: 'Punchy',
    promptLow: 'Allow fuller context and more complete sentences when it helps clarity.',
    promptMid: 'Keep bullets balanced: concise, but with enough context to feel complete.',
    promptHigh: 'Favor short, high-signal bullets that scan fast.',
  },
  {
    key: 'technicalDepth',
    label: 'Technical Depth',
    description: 'How much specialist language and technical detail to keep.',
    lowLabel: 'Plain-English',
    highLabel: 'Specialist',
    lowDescriptor: 'Plain-English',
    midDescriptor: 'Mixed Audience',
    highDescriptor: 'Specialist',
    promptLow: 'Translate technical work into plain-English value for generalist readers.',
    promptMid: 'Keep enough technical detail for credibility while staying readable to recruiters.',
    promptHigh: 'Lean into specialist terminology and technical specifics when they are supported by the facts.',
  },
  {
    key: 'evidence',
    label: 'Evidence',
    description: 'How strongly the writing leans on metrics, proof, and concrete examples.',
    lowLabel: 'Narrative',
    highLabel: 'Proof-Heavy',
    lowDescriptor: 'Narrative',
    midDescriptor: 'Grounded',
    highDescriptor: 'Proof-Heavy',
    promptLow: 'Use broader story framing when hard proof is limited, but stay honest.',
    promptMid: 'Balance readable narrative with concrete outcomes and examples.',
    promptHigh: 'Lead with metrics, scope, and concrete proof whenever the evidence exists.',
  },
  {
    key: 'confidence',
    label: 'Confidence',
    description: 'How strongly the resume claims ownership and impact.',
    lowLabel: 'Modest',
    highLabel: 'Assertive',
    lowDescriptor: 'Modest',
    midDescriptor: 'Calm',
    highDescriptor: 'Assertive',
    promptLow: 'Use measured language and avoid overstating ownership.',
    promptMid: 'Use calm, credible ownership language that stays believable.',
    promptHigh: 'Use stronger action verbs and more direct ownership framing, but stay inside the facts.',
  },
  {
    key: 'warmth',
    label: 'Warmth',
    description: 'How human, relational, or crisp the writing feels.',
    lowLabel: 'Crisp',
    highLabel: 'Human',
    lowDescriptor: 'Crisp',
    midDescriptor: 'Balanced',
    highDescriptor: 'Human',
    promptLow: 'Keep the tone direct and crisp, with minimal relational language.',
    promptMid: 'Balance professionalism with a little personality and collaboration.',
    promptHigh: 'Let the writing feel more human, collaborative, and approachable without losing polish.',
  },
  {
    key: 'persuasion',
    label: 'Persuasion',
    description: 'How hard the draft should sell fit for the target role.',
    lowLabel: 'Descriptive',
    highLabel: 'Targeted',
    lowDescriptor: 'Descriptive',
    midDescriptor: 'Positioned',
    highDescriptor: 'Targeted',
    promptLow: 'Describe the work clearly without pushing hard on fit or framing.',
    promptMid: 'Position the background for the role in a clear, credible way.',
    promptHigh: 'Actively frame the candidate as a strong fit for the target role while staying truthful.',
  },
];

export const RESUME_WRITER_ZERO_PROFILE: ResumeVoiceProfile = {
  formality: 58,
  brevity: 64,
  technicalDepth: 66,
  evidence: 72,
  confidence: 57,
  warmth: 36,
  persuasion: 54,
};

export const STARTER_PROFILES: Array<{
  id: string;
  label: string;
  description: string;
  profile: ResumeVoiceProfile;
}> = [
  {
    id: 'writer-zero',
    label: 'Resume Writer Zero',
    description: 'Strong default for high-signal tech resumes that still read cleanly to recruiters.',
    profile: RESUME_WRITER_ZERO_PROFILE,
  },
  {
    id: 'technical-ic',
    label: 'Technical IC',
    description: 'More specialist depth and proof for engineering-heavy roles.',
    profile: {
      formality: 56,
      brevity: 60,
      technicalDepth: 80,
      evidence: 76,
      confidence: 58,
      warmth: 30,
      persuasion: 50,
    },
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'More executive polish, evidence, and strategic positioning.',
    profile: {
      formality: 72,
      brevity: 52,
      technicalDepth: 58,
      evidence: 76,
      confidence: 66,
      warmth: 42,
      persuasion: 62,
    },
  },
  {
    id: 'customer-facing',
    label: 'Customer-Facing',
    description: 'Warmer language and stronger positioning for client-facing roles.',
    profile: {
      formality: 54,
      brevity: 62,
      technicalDepth: 42,
      evidence: 64,
      confidence: 60,
      warmth: 62,
      persuasion: 68,
    },
  },
];

export const STRATEGY_OPTIONS: Array<{
  id: ResumeWritingStrategy;
  label: string;
  description: string;
  exaggerationLevel: ExaggerationLevel;
}> = [
  {
    id: 'conservative',
    label: 'Conservative',
    description: 'Stay close to the source facts and keep the phrasing restrained.',
    exaggerationLevel: 'authentic',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Resume Writer Zero default: strong, readable, and credible.',
    exaggerationLevel: 'professional',
  },
  {
    id: 'standout',
    label: 'Standout',
    description: 'Push fit and positioning harder while staying inside the facts.',
    exaggerationLevel: 'persuasive',
  },
];

function clampValue(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function clampVoiceProfile(profile: ResumeVoiceProfile): ResumeVoiceProfile {
  return {
    formality: clampValue(profile.formality),
    brevity: clampValue(profile.brevity),
    technicalDepth: clampValue(profile.technicalDepth),
    evidence: clampValue(profile.evidence),
    confidence: clampValue(profile.confidence),
    warmth: clampValue(profile.warmth),
    persuasion: clampValue(profile.persuasion),
  };
}

function bucketValue(value: number): 'low' | 'mid' | 'high' {
  if (value <= 33) return 'low';
  if (value >= 67) return 'high';
  return 'mid';
}

export function getVoiceDimensionMeta(key: ResumeVoiceDimensionKey): ResumeVoiceDimension {
  const dimension = VOICE_DIMENSIONS.find((item) => item.key === key);
  if (!dimension) {
    throw new Error(`Unknown voice dimension: ${key}`);
  }
  return dimension;
}

export function getVoiceDimensionDescriptor(
  key: ResumeVoiceDimensionKey,
  value: number,
): string {
  const dimension = getVoiceDimensionMeta(key);
  switch (bucketValue(value)) {
    case 'low':
      return dimension.lowDescriptor;
    case 'high':
      return dimension.highDescriptor;
    case 'mid':
    default:
      return dimension.midDescriptor;
  }
}

export function mapStrategyToExaggerationLevel(
  strategy: ResumeWritingStrategy,
): ExaggerationLevel {
  return STRATEGY_OPTIONS.find((item) => item.id === strategy)?.exaggerationLevel || 'professional';
}

export function buildVoiceProfilePrompt(
  profile: ResumeVoiceProfile,
  strategy: ResumeWritingStrategy,
): string {
  const safeProfile = clampVoiceProfile(profile);
  const strategyMeta = STRATEGY_OPTIONS.find((item) => item.id === strategy) || STRATEGY_OPTIONS[1];

  const lines = VOICE_DIMENSIONS.map((dimension) => {
    const value = safeProfile[dimension.key];
    const bucket = bucketValue(value);
    const instruction =
      bucket === 'low'
        ? dimension.promptLow
        : bucket === 'high'
          ? dimension.promptHigh
          : dimension.promptMid;

    return `- ${dimension.label} (${getVoiceDimensionDescriptor(dimension.key, value)}): ${instruction}`;
  });

  return [
    `Resume customization profile:`,
    `- Strategy: ${strategyMeta.label}. ${strategyMeta.description}`,
    `- Apply the voice profile below while preserving facts and staying ATS-friendly.`,
    ...lines,
    `- Do not invent metrics, employers, titles, or scope.`,
  ].join('\n');
}
