export type DiscoveryProfileInput = {
  skills: string[];
  summary?: string | null;
  experiences: Array<{
    position: string;
    description: string;
    company: string;
  }>;
};

export type DiscoveryJobCandidate = {
  title: string;
  company: string;
  location: string | null;
  description: string;
  skillsTags?: string[];
  compositeScore?: number | null;
  postedAt: string | Date;
};

export type DiscoveryMatcher = {
  locationTerms: string[];
  roleTerms: string[];
  domainTerms: string[];
  skillTerms: string[];
  queryTerms: string[];
};

const KC_METRO_TERMS = [
  'kansas city',
  'overland park',
  'olathe',
  'lenexa',
  'shawnee',
  'leawood',
  "lee's summit",
  'lees summit',
  'independence',
  'liberty',
  'north kansas city',
  'mission, ks',
  'mission, kansas',
];

const DEFAULT_ROLE_TERMS = [
  'sales engineer',
  'solutions engineer',
  'solution engineer',
  'solutions architect',
  'solution architect',
  'customer engineer',
  'sales architect',
  'pre sales',
  'presales',
  'solutions consultant',
  'technical sales',
  'technical account manager',
  'sales consultant',
];

const DEFAULT_DOMAIN_TERMS = [
  'ai',
  'artificial intelligence',
  'genai',
  'machine learning',
  'software',
  'saas',
  'cloud',
  'data',
  'security',
  'platform',
];

function normalizeTerm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function uniqueTerms(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => normalizeTerm(value || '')).filter((value) => value.length >= 2))];
}

function textIncludesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function countMatches(text: string, terms: string[]) {
  return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0);
}

export function buildDiscoveryMatcher(profile: DiscoveryProfileInput | null): DiscoveryMatcher {
  const positionTerms = profile?.experiences.flatMap((experience) => {
    const normalized = normalizeTerm(experience.position);
    if (!normalized) return [];

    const splitTerms = normalized
      .split(/[|,/()-]/)
      .map((part) => normalizeTerm(part))
      .filter((part) => part.length >= 4);

    return [normalized, ...splitTerms];
  }) ?? [];

  const skillTerms = uniqueTerms([
    ...(profile?.skills ?? []).slice(0, 16),
    ...(profile?.summary ? profile.summary.split(/[^a-zA-Z0-9+#.-]+/) : []),
  ]).filter((term) =>
    DEFAULT_DOMAIN_TERMS.some((domain) => term.includes(domain) || domain.includes(term)) ||
    DEFAULT_ROLE_TERMS.some((role) => term.includes(role) || role.includes(term)),
  );

  const roleTerms = uniqueTerms([...DEFAULT_ROLE_TERMS, ...positionTerms]).slice(0, 20);
  const domainTerms = uniqueTerms([...DEFAULT_DOMAIN_TERMS, ...skillTerms]).slice(0, 20);
  const queryTerms = uniqueTerms([...roleTerms, ...domainTerms, ...skillTerms]);

  return {
    locationTerms: KC_METRO_TERMS,
    roleTerms,
    domainTerms,
    skillTerms,
    queryTerms,
  };
}

export function isKansasCityDiscoveryJob(location: string | null | undefined) {
  const normalized = normalizeTerm(location || '');
  return normalized.length > 0 && textIncludesAny(normalized, KC_METRO_TERMS);
}

export function scoreDiscoveryJob(job: DiscoveryJobCandidate, matcher: DiscoveryMatcher) {
  const title = normalizeTerm(job.title);
  const description = normalizeTerm(job.description);
  const company = normalizeTerm(job.company);
  const location = normalizeTerm(job.location || '');
  const skills = (job.skillsTags ?? []).map((skill) => normalizeTerm(skill));

  let score = 0;

  if (textIncludesAny(title, matcher.roleTerms)) score += 140;
  score += countMatches(title, matcher.roleTerms) * 24;
  score += countMatches(title, matcher.domainTerms) * 18;
  score += countMatches(description, matcher.roleTerms) * 18;
  score += countMatches(description, matcher.domainTerms) * 10;
  score += countMatches(company, matcher.domainTerms) * 8;
  score += skills.reduce((total, skill) => {
    if (matcher.skillTerms.includes(skill)) return total + 18;
    if (matcher.domainTerms.some((term) => skill.includes(term) || term.includes(skill))) return total + 10;
    return total;
  }, 0);

  if (textIncludesAny(location, matcher.locationTerms)) score += 40;
  score += Math.round((job.compositeScore ?? 0) * 100);

  return score;
}
