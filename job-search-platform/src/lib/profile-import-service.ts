import '@/lib/load-root-env';
import mammoth from 'mammoth';
import {
  sanitizeImportedProfile,
  type ImportedProfile,
} from '@/lib/profile-import';

export async function extractTextFromResumeFile(file: File): Promise<string> {
  const filename = file.name.toLowerCase();
  const mimeType = (file.type || '').toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (mimeType.includes('wordprocessingml') || filename.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeResumeText(result.value);
  }

  if (mimeType.includes('pdf') || filename.endsWith('.pdf')) {
    throw new Error('PDF import is next. This shipped pass supports DOCX import first.');
  }

  throw new Error('Unsupported file type. Upload a DOCX resume for now.');
}

export async function extractProfileFromResumeText(text: string): Promise<ImportedProfile> {
  return parseResumeTextHeuristically(text);
}

function normalizeResumeText(text: string): string {
  return text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
}

function parseResumeTextHeuristically(text: string): ImportedProfile {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return sanitizeImportedProfile({
    contactInfo: {
      name: guessName(lines),
      summary: normalizeSectionText(sliceSection(text, 'Professional Summary', [
        'Key Achievements',
        'Professional Experience',
        'Experience',
        'Technical Proficiency',
        'Education',
      ])),
    },
    experiences: extractExperienceBlocks(text),
    educations: [],
    skills: extractTechnicalSkills(text),
    projects: [],
    certifications: [],
  });
}

function guessName(lines: string[]) {
  const firstLine = lines[0] || '';
  if (!firstLine || firstLine.length > 60 || /\d|@/.test(firstLine)) {
    return '';
  }
  return firstLine;
}

function extractSectionText(text: string, startHeading: string, endHeadings: string[]) {
  return normalizeSectionText(sliceSection(text, startHeading, endHeadings));
}

function sliceSection(text: string, startHeading: string, endHeadings: string[]) {
  const startIndex = text.toLowerCase().indexOf(startHeading.toLowerCase());
  if (startIndex < 0) return '';

  const afterStart = text.slice(startIndex + startHeading.length);
  let endIndex = afterStart.length;

  for (const heading of endHeadings) {
    const headingIndex = afterStart.toLowerCase().indexOf(heading.toLowerCase());
    if (headingIndex >= 0 && headingIndex < endIndex) {
      endIndex = headingIndex;
    }
  }

  return afterStart.slice(0, endIndex).trim();
}

function normalizeSectionText(text: string) {
  return text
    .replace(/[:\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTechnicalSkills(text: string) {
  const matches =
    text.match(
      /\b(AWS|Azure|VMWare|VMware|Hyper-V|Citrix|Cisco|Palo Alto|NetApp|HPE|Dell\/EMC|cloud|security|virtualization|VDI|data center|SaaS|collaboration|network security|disaster recovery)\b/gi,
    ) || [];

  return Array.from(new Set(matches.map((skill) => skill.trim())));
}

function extractExperienceBlocks(text: string) {
  const section = sliceSection(text, 'Professional Experience', [
    'Technical Proficiency',
    'Education',
    'Certifications',
  ]);

  if (!section) return [];

  const paragraphs = section
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const experiences: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    technologies: string[];
  }> = [];

  let index = 0;
  while (index < paragraphs.length) {
    const header = paragraphs[index];
    const headerMatch = header.match(/^(.*?),\s*([A-Za-z .]+,\s*[A-Z]{2})(\d{4})\s*-\s*(Present|\d{4})$/);

    if (!headerMatch) {
      index += 1;
      continue;
    }

    const [, titleAndCompanyRaw, locationRaw, startYear, endYear] = headerMatch;
    const { position, company } = splitTitleAndCompany(titleAndCompanyRaw);
    const bulletParts: string[] = [];
    let nextIndex = index + 1;

    while (nextIndex < paragraphs.length && !/\d{4}\s*-\s*(Present|\d{4})$/.test(paragraphs[nextIndex])) {
      bulletParts.push(paragraphs[nextIndex]);
      nextIndex += 1;
    }

    const description = bulletParts.join(' ');

    experiences.push({
      position,
      company,
      location: locationRaw.trim(),
      startDate: `${startYear}-01-01`,
      endDate: endYear === 'Present' ? '' : `${endYear}-01-01`,
      current: endYear === 'Present',
      description,
      technologies: extractTechnicalSkills(description),
    });

    index = nextIndex;
  }

  return experiences;
}

function splitTitleAndCompany(raw: string) {
  const trimmed = raw.trim();
  let splitIndex = -1;

  for (let index = 0; index < trimmed.length - 1; index += 1) {
    if (/[a-z)]/.test(trimmed[index]) && /[A-Z]/.test(trimmed[index + 1])) {
      splitIndex = index + 1;
    }
  }

  if (splitIndex > 0) {
    return {
      position: cleanText(trimmed.slice(0, splitIndex)),
      company: cleanText(trimmed.slice(splitIndex)),
    };
  }

  return {
    position: cleanText(trimmed),
    company: '',
  };
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}
