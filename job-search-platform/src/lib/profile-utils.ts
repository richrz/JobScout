export interface WorkExperience {
  id?: string;
  position: string;
  company: string;
  location?: string;
  startDate: string; // ISO date string
  endDate?: string;  // ISO date string
  current: boolean;
  description: string;
  technologies: string[];
}

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string; // ISO date string
  endDate?: string;  // ISO date string
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies?: string[] | string;
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Profile {
  contactInfo: {
    honorific?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    portfolio?: string;
    summary?: string;
  };
  workHistory: any[]; // Deprecated
  experiences: WorkExperience[];
  education: any[]; // Deprecated
  educations: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
}

const HONORIFIC_MAP: Record<string, string> = {
  mr: 'Mr',
  mrs: 'Mrs',
  ms: 'Ms',
  mx: 'Mx',
  dr: 'Dr',
  other: 'Other',
};

export function formatPhoneDisplay(phone?: string) {
  const digits = (phone || '').replace(/\D/g, '').slice(0, 10);

  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function buildContactName(contactInfo: Profile['contactInfo'] = {}) {
  return [contactInfo.firstName, contactInfo.lastName]
    .map((value) => cleanInlineText(value))
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function normalizeContactInfo(contactInfo: Profile['contactInfo'] = {}) {
  const fallbackName = parseLegacyName(contactInfo.name || '');
  const honorific = normalizeHonorific(contactInfo.honorific || fallbackName.honorific);
  const firstName = normalizeNamePart(contactInfo.firstName || fallbackName.firstName);
  const lastName = normalizeNamePart(contactInfo.lastName || fallbackName.lastName);
  const name = buildContactName({ firstName, lastName });

  return {
    ...contactInfo,
    honorific,
    firstName,
    lastName,
    name,
    email: cleanInlineText(contactInfo.email),
    phone: formatPhoneDisplay(contactInfo.phone),
    linkedin: cleanInlineText(contactInfo.linkedin),
    location: normalizeLocation(contactInfo.location),
    portfolio: cleanInlineText(contactInfo.portfolio),
    summary: contactInfo.summary || '',
  };
}

export function calculateCompleteness(profile: Profile): number {
  let score = 0;

  if (profile.contactInfo.email) score += 10;
  if (profile.experiences?.length > 0) score += 40;
  if (profile.educations?.length > 0) score += 15;
  if (profile.skills?.length >= 5) score += 15;
  if (profile.projects?.length > 0) score += 10;
  if (profile.certifications?.length > 0) score += 10;

  return Math.min(100, score);
}

function normalizeHonorific(value?: string) {
  const normalizedKey = cleanInlineText(value).replace(/\./g, '').toLowerCase();
  return HONORIFIC_MAP[normalizedKey] || '';
}

function parseLegacyName(name: string) {
  const normalized = cleanInlineText(name);
  if (!normalized) {
    return { honorific: '', firstName: '', lastName: '' };
  }

  const parts = normalized.split(/\s+/);
  let honorific = '';

  if (parts[0] && HONORIFIC_MAP[parts[0].replace(/\./g, '').toLowerCase()]) {
    honorific = HONORIFIC_MAP[parts.shift()!.replace(/\./g, '').toLowerCase()];
  }

  return {
    honorific,
    firstName: normalizeNamePart(parts[0] || ''),
    lastName: normalizeNamePart(parts.slice(1).join(' ')),
  };
}

function normalizeNamePart(value?: string) {
  const cleaned = cleanInlineText(value);
  if (!cleaned) return '';
  if (cleaned === cleaned.toLowerCase()) {
    return cleaned.replace(/\b\w/g, (match) => match.toUpperCase());
  }
  return cleaned;
}

function normalizeLocation(value?: string) {
  return cleanInlineText(value)
    .replace(/\s*,\s*,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ');
}

function cleanInlineText(value?: string) {
  return (value || '').replace(/\s+/g, ' ').trim();
}
