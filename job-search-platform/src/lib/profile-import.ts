import { z } from 'zod';
import {
  buildContactName,
  formatPhoneDisplay,
  normalizeContactInfo,
  type Profile,
} from '@/lib/profile-utils';

const contactInfoSchema = z.object({
  honorific: z.string().trim().optional().default(''),
  firstName: z.string().trim().optional().default(''),
  lastName: z.string().trim().optional().default(''),
  name: z.string().trim().optional().default(''),
  email: z.string().trim().optional().default(''),
  phone: z.string().trim().optional().default(''),
  linkedin: z.string().trim().optional().default(''),
  location: z.string().trim().optional().default(''),
  portfolio: z.string().trim().optional().default(''),
  summary: z.string().trim().optional().default(''),
});

const workExperienceSchema = z.object({
  position: z.string().trim().optional().default(''),
  company: z.string().trim().optional().default(''),
  location: z.string().trim().optional().default(''),
  startDate: z.string().trim().optional().default(''),
  endDate: z.string().trim().optional().default(''),
  current: z.boolean().optional().default(false),
  description: z.string().trim().optional().default(''),
  technologies: z.array(z.string().trim()).optional().default([]),
});

const educationSchema = z.object({
  school: z.string().trim().optional().default(''),
  degree: z.string().trim().optional().default(''),
  field: z.string().trim().optional().default(''),
  startDate: z.string().trim().optional().default(''),
  endDate: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
});

const projectSchema = z.object({
  id: z.string().trim().optional().default(''),
  name: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  technologies: z.array(z.string().trim()).optional().default([]),
  url: z.string().trim().optional().default(''),
});

const certificationSchema = z.object({
  id: z.string().trim().optional().default(''),
  name: z.string().trim().optional().default(''),
  issuer: z.string().trim().optional().default(''),
  date: z.string().trim().optional().default(''),
  url: z.string().trim().optional().default(''),
});

export const importedProfileSchema = z.object({
  contactInfo: contactInfoSchema.optional().default({}),
  experiences: z.array(workExperienceSchema).optional().default([]),
  educations: z.array(educationSchema).optional().default([]),
  skills: z.array(z.string().trim()).optional().default([]),
  projects: z.array(projectSchema).optional().default([]),
  certifications: z.array(certificationSchema).optional().default([]),
});

export type ImportedProfile = z.infer<typeof importedProfileSchema>;

export function sanitizeImportedProfile(payload: unknown): ImportedProfile {
  const parsed = importedProfileSchema.parse(payload);

  return {
    contactInfo: sanitizeContactInfo(parsed.contactInfo),
    experiences: parsed.experiences
      .map(sanitizeExperience)
      .filter((experience) => experience.position || experience.company || experience.description),
    educations: parsed.educations
      .map(sanitizeEducation)
      .filter((education) => education.school || education.degree || education.field),
    skills: uniqueStrings(parsed.skills),
    projects: parsed.projects
      .map(sanitizeProject)
      .filter((project) => project.name || project.description),
    certifications: parsed.certifications
      .map(sanitizeCertification)
      .filter((certification) => certification.name || certification.issuer),
  };
}

export function mergeImportedProfile(current: Profile, imported: ImportedProfile): Profile {
  return {
    ...current,
    contactInfo: mergeContactInfo(current.contactInfo || {}, imported.contactInfo || {}),
    workHistory: current.workHistory || [],
    education: current.education || [],
    experiences: mergeExperiences(current.experiences || [], imported.experiences || []),
    educations: mergeEducations(current.educations || [], imported.educations || []),
    skills: uniqueStrings([...(current.skills || []), ...(imported.skills || [])]),
    projects: mergeProjects(current.projects || [], imported.projects || []),
    certifications: mergeCertifications(current.certifications || [], imported.certifications || []),
  };
}

function sanitizeContactInfo(contactInfo: ImportedProfile['contactInfo']) {
  return normalizeContactInfo({
    honorific: cleanText(contactInfo.honorific),
    firstName: cleanText(contactInfo.firstName),
    lastName: cleanText(contactInfo.lastName),
    name: cleanText(contactInfo.name),
    email: cleanText(contactInfo.email),
    phone: formatPhoneDisplay(contactInfo.phone),
    linkedin: cleanText(contactInfo.linkedin),
    location: cleanText(contactInfo.location),
    portfolio: cleanText(contactInfo.portfolio),
    summary: cleanText(contactInfo.summary),
  });
}

function sanitizeExperience(experience: ImportedProfile['experiences'][number]) {
  return {
    position: cleanText(experience.position),
    company: cleanText(experience.company),
    location: cleanText(experience.location),
    startDate: normalizeDate(experience.startDate),
    endDate: normalizeDate(experience.endDate),
    current: Boolean(experience.current) || isPresentLabel(experience.endDate),
    description: cleanText(experience.description),
    technologies: uniqueStrings(experience.technologies || []),
  };
}

function sanitizeEducation(education: ImportedProfile['educations'][number]) {
  return {
    school: cleanText(education.school),
    degree: cleanText(education.degree),
    field: cleanText(education.field),
    startDate: normalizeDate(education.startDate),
    endDate: normalizeDate(education.endDate),
    description: cleanText(education.description),
  };
}

function sanitizeProject(project: ImportedProfile['projects'][number]) {
  return {
    id: cleanText(project.id) || crypto.randomUUID(),
    name: cleanText(project.name),
    description: cleanText(project.description),
    technologies: uniqueStrings(project.technologies || []),
    url: cleanText(project.url),
  };
}

function sanitizeCertification(certification: ImportedProfile['certifications'][number]) {
  return {
    id: cleanText(certification.id) || crypto.randomUUID(),
    name: cleanText(certification.name),
    issuer: cleanText(certification.issuer),
    date: normalizeDate(certification.date),
    url: cleanText(certification.url),
  };
}

function mergeContactInfo(current: Profile['contactInfo'], imported: ImportedProfile['contactInfo']) {
  const normalizedCurrent = normalizeContactInfo(current);
  const normalizedImported = normalizeContactInfo(imported as Profile['contactInfo']);
  const honorific = normalizedCurrent.honorific || normalizedImported.honorific || '';
  const firstName = normalizedCurrent.firstName || normalizedImported.firstName || '';
  const lastName = normalizedCurrent.lastName || normalizedImported.lastName || '';

  return {
    honorific,
    firstName,
    lastName,
    name: buildContactName({ firstName, lastName }),
    email: normalizedCurrent.email || normalizedImported.email || '',
    phone: normalizedCurrent.phone || normalizedImported.phone || '',
    linkedin: normalizedCurrent.linkedin || normalizedImported.linkedin || '',
    location: normalizedCurrent.location || normalizedImported.location || '',
    portfolio: normalizedCurrent.portfolio || normalizedImported.portfolio || '',
    summary: chooseLongerText(normalizedCurrent.summary || '', normalizedImported.summary || ''),
  };
}

function mergeExperiences(current: Profile['experiences'], imported: ImportedProfile['experiences']) {
  const merged = [...current];

  for (const experience of imported) {
    const key = buildExperienceKey(experience);
    const existingIndex = merged.findIndex((item) => buildExperienceKey(item) === key);

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        location: merged[existingIndex].location || experience.location,
        endDate: merged[existingIndex].endDate || experience.endDate,
        current: merged[existingIndex].current || experience.current,
        description: chooseLongerText(merged[existingIndex].description, experience.description),
        technologies: uniqueStrings([
          ...(merged[existingIndex].technologies || []),
          ...(experience.technologies || []),
        ]),
      };
    } else {
      merged.push({
        id: crypto.randomUUID(),
        position: experience.position,
        company: experience.company,
        location: experience.location,
        startDate: experience.startDate,
        endDate: experience.current ? '' : experience.endDate,
        current: experience.current,
        description: experience.description,
        technologies: experience.technologies,
      });
    }
  }

  return merged;
}

function mergeEducations(current: Profile['educations'], imported: ImportedProfile['educations']) {
  const merged = [...current];

  for (const education of imported) {
    const key = buildEducationKey(education);
    const existingIndex = merged.findIndex((item) => buildEducationKey(item) === key);

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        field: merged[existingIndex].field || education.field,
        description: chooseLongerText(merged[existingIndex].description || '', education.description || ''),
        endDate: merged[existingIndex].endDate || education.endDate,
      };
    } else {
      merged.push({
        id: crypto.randomUUID(),
        school: education.school,
        degree: education.degree,
        field: education.field,
        startDate: education.startDate,
        endDate: education.endDate,
        description: education.description,
      });
    }
  }

  return merged;
}

function mergeProjects(current: Profile['projects'], imported: ImportedProfile['projects']) {
  const merged = [...current];

  for (const project of imported) {
    const key = cleanText(project.name).toLowerCase();
    const existingIndex = merged.findIndex((item) => cleanText(item.name).toLowerCase() === key);

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        description: chooseLongerText(merged[existingIndex].description, project.description),
        technologies: uniqueStrings([
          ...stringArrayFromUnknown(merged[existingIndex].technologies),
          ...project.technologies,
        ]),
        url: merged[existingIndex].url || project.url,
      } as Profile['projects'][number];
    } else {
      merged.push({
        id: project.id || crypto.randomUUID(),
        name: project.name,
        description: project.description,
        url: project.url,
        technologies: project.technologies,
      } as Profile['projects'][number]);
    }
  }

  return merged;
}

function mergeCertifications(current: Profile['certifications'], imported: ImportedProfile['certifications']) {
  const merged = [...current];

  for (const certification of imported) {
    const key = `${cleanText(certification.name).toLowerCase()}::${cleanText(certification.issuer).toLowerCase()}`;
    const existingIndex = merged.findIndex((item) => {
      return `${cleanText(item.name).toLowerCase()}::${cleanText(item.issuer).toLowerCase()}` === key;
    });

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        date: merged[existingIndex].date || certification.date,
        url: merged[existingIndex].url || certification.url,
      };
    } else {
      merged.push({
        id: certification.id || crypto.randomUUID(),
        name: certification.name,
        issuer: certification.issuer,
        date: certification.date,
        url: certification.url,
      });
    }
  }

  return merged;
}

function buildExperienceKey(experience: {
  company?: string;
  position?: string;
  startDate?: string;
}) {
  return `${cleanText(experience.company).toLowerCase()}::${cleanText(experience.position).toLowerCase()}::${normalizeDate(experience.startDate)}`;
}

function buildEducationKey(education: {
  school?: string;
  degree?: string;
  startDate?: string;
}) {
  return `${cleanText(education.school).toLowerCase()}::${cleanText(education.degree).toLowerCase()}::${normalizeDate(education.startDate)}`;
}

function uniqueStrings(values: Array<string | undefined | null>) {
  const seen = new Map<string, string>();

  for (const value of values) {
    const cleaned = cleanText(value);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, cleaned);
    }
  }

  return Array.from(seen.values());
}

function stringArrayFromUnknown(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function chooseLongerText(current: string, incoming: string) {
  return incoming.length > current.length ? incoming : current;
}

function cleanText(value: string | undefined | null) {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function normalizeDate(value: string | undefined | null) {
  const raw = cleanText(value);
  if (!raw) return '';
  if (isPresentLabel(raw)) return '';

  const isoMonthMatch = raw.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (isoMonthMatch) {
    return `${isoMonthMatch[1]}-${isoMonthMatch[2]}-01`;
  }

  const yearMatch = raw.match(/^(\d{4})$/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }

  const monthYearMatch = raw.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,/-]+(\d{4})$/i);
  if (monthYearMatch) {
    const month = monthNameToNumber(monthYearMatch[1]);
    return `${monthYearMatch[2]}-${month}-01`;
  }

  return '';
}

function monthNameToNumber(month: string) {
  const months: Record<string, string> = {
    jan: '01',
    feb: '02',
    mar: '03',
    apr: '04',
    may: '05',
    jun: '06',
    jul: '07',
    aug: '08',
    sep: '09',
    sept: '09',
    oct: '10',
    nov: '11',
    dec: '12',
  };

  return months[month.toLowerCase().slice(0, 4)] || '01';
}

function isPresentLabel(value: string | undefined | null) {
  const normalized = cleanText(value).toLowerCase();
  return normalized === 'present' || normalized === 'current' || normalized === 'now';
}
