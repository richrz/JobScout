import '@/lib/load-root-env';
import * as cheerio from 'cheerio';
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
    const result = await mammoth.convertToHtml({ buffer });
    return normalizeResumeText(convertResumeHtmlToText(result.value));
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
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseResumeTextHeuristically(text: string): ImportedProfile {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return sanitizeImportedProfile({
    contactInfo: {
      name: guessName(lines),
      email: extractEmail(text),
      phone: extractPhone(text),
      linkedin: extractLinkedIn(text),
      summary: normalizeSectionText(
        sliceFirstAvailableSection(text, ['Professional Summary', 'Summary'], [
          'Key Achievements',
          'Professional Experience',
          'Work Experience',
          'Experience',
          'Technical Proficiency',
          'Key Skills',
          'Skills',
          'Education',
        ]),
      ),
    },
    experiences: extractExperienceBlocks(text),
    educations: extractEducationEntries(text),
    skills: extractTechnicalSkills(text),
    projects: [],
    certifications: [],
  });
}

function guessName(lines: string[]) {
  const firstLine = lines[0] || '';
  if (
    !firstLine ||
    firstLine.length > 60 ||
    /\d|@/.test(firstLine) ||
    isSectionHeading(firstLine)
  ) {
    return '';
  }
  return firstLine;
}

function extractSectionText(text: string, startHeading: string, endHeadings: string[]) {
  return normalizeSectionText(sliceSection(text, startHeading, endHeadings));
}

function sliceSection(text: string, startHeading: string, endHeadings: string[]) {
  const startMatch = findHeadingMatch(text, startHeading);
  if (!startMatch) return '';

  const afterStart = text.slice(startMatch.index + startMatch[0].length);
  let endIndex = afterStart.length;

  for (const heading of endHeadings) {
    const headingMatch = findHeadingMatch(afterStart, heading);
    const headingIndex = headingMatch?.index ?? -1;
    if (headingIndex >= 0 && headingIndex < endIndex) {
      endIndex = headingIndex;
    }
  }

  return afterStart.slice(0, endIndex).trim();
}

function sliceFirstAvailableSection(text: string, startHeadings: string[], endHeadings: string[]) {
  for (const heading of startHeadings) {
    const section = sliceSection(text, heading, endHeadings);
    if (section) {
      return section;
    }
  }

  return '';
}

function findHeadingMatch(text: string, heading: string) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.match(new RegExp(`(?:^|\\n)\\s*${escapedHeading}\\s*(?::)?\\s*(?:\\n|$)`, 'i'));
}

function normalizeSectionText(text: string) {
  return text
    .replace(/[:\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSectionHeading(value: string) {
  return /^(professional summary|professional experience|work experience|experience|education|skills|technical proficiency|core competencies|certifications)$/i.test(
    value.trim(),
  );
}

function extractTechnicalSkills(text: string) {
  const sectionSkills = extractSkillsFromSections(text);
  const matches =
    text.match(
      /\b(AWS|Azure|VMWare|VMware|Hyper-V|Citrix|Cisco|Palo Alto|NetApp|HPE|Dell\/EMC|cloud|security|virtualization|VDI|data center|SaaS|collaboration|network security|disaster recovery)\b/gi,
    ) || [];

  return Array.from(
    new Set([...matches.map((skill) => skill.trim()), ...sectionSkills]),
  );
}

function extractExperienceBlocks(text: string) {
  const section = normalizeDenseExperienceSection(
    sliceFirstAvailableSection(
      text,
      ['Professional Experience', 'Work Experience', 'Experience'],
      [
        'Technical Proficiency',
        'Core Competencies',
        'Key Skills',
        'Skills',
        'Education',
        'Certifications',
        'Projects',
      ],
    ),
  );

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
    const parsedHeader = parseExperienceHeader(header);

    if (!parsedHeader) {
      index += 1;
      continue;
    }

    const bulletParts: string[] = [];
    let nextIndex = index + 1;

    while (nextIndex < paragraphs.length && !parseExperienceHeader(paragraphs[nextIndex])) {
      bulletParts.push(paragraphs[nextIndex]);
      nextIndex += 1;
    }

    const description = normalizeBulletParagraphs([
      ...(parsedHeader.inlineDescription ? [parsedHeader.inlineDescription] : []),
      ...bulletParts,
    ]);

    experiences.push({
      position: parsedHeader.position,
      company: parsedHeader.company,
      location: parsedHeader.location,
      startDate: `${parsedHeader.startYear}-01-01`,
      endDate: parsedHeader.endYear === 'Present' ? '' : `${parsedHeader.endYear}-01-01`,
      current: parsedHeader.endYear === 'Present',
      description,
      technologies: extractTechnicalSkills(description),
    });

    index = nextIndex;
  }

  return experiences;
}

function extractEducationEntries(text: string) {
  const section = sliceFirstAvailableSection(text, ['Education'], [
    'Certifications',
    'Professional Affiliations',
    'Projects',
    'Technical Skills',
    'Core Competencies',
    'Skills',
  ]);

  if (!section) return [];

  return section
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const lines = paragraph
        .split('\n')
        .map((line) => cleanText(line.replace(/^-+\s*/, '')))
        .filter(Boolean);

      if (lines.length >= 2) {
        const { degree, field } = splitDegreeAndField(lines[0]);

        return {
          school: lines.slice(1).join(' '),
          degree,
          field,
          startDate: '',
          endDate: '',
          description: '',
        };
      }

      const singleLine = cleanText(paragraph.replace(/^-+\s*/, ''));
      const commaIndex = singleLine.lastIndexOf(',');

      if (commaIndex > 0) {
        const { degree, field } = splitDegreeAndField(singleLine.slice(0, commaIndex));

        return {
          school: cleanText(singleLine.slice(commaIndex + 1)),
          degree,
          field,
          startDate: '',
          endDate: '',
          description: '',
        };
      }

      const { position, company } = splitTitleAndCompany(paragraph);
      const { degree, field } = splitDegreeAndField(position);

      return {
        school: company,
        degree,
        field,
        startDate: '',
        endDate: '',
        description: '',
      };
    })
    .filter((education) => education.school || education.degree || education.field);
}

function normalizeDenseExperienceSection(section: string) {
  return section
    .replace(/[–—]/g, '-')
    .replace(/(\d{4}\s*-\s*(?:Present|\d{4}))(?=-\s*[A-Z])/g, '$1\n\n')
    .replace(/\u2022/g, '\n- ');
}

function convertResumeHtmlToText(html: string) {
  const $ = cheerio.load(`<div id="resume-root">${html}</div>`);
  $('br').replaceWith('\n');

  const blocks: string[] = [];

  $('#resume-root')
    .contents()
    .each((_, node) => {
      collectResumeBlocks($, node, blocks);
    });

  return blocks.join('\n\n');
}

function collectResumeBlocks(
  $: cheerio.CheerioAPI,
  node: cheerio.AnyNode,
  blocks: string[],
) {
  if (node.type === 'text') {
    const text = normalizeBlockText(node.data || '');
    if (text) {
      blocks.push(text);
    }
    return;
  }

  if (node.type !== 'tag') {
    return;
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === 'ul' || tagName === 'ol') {
    $(node)
      .children('li')
      .each((_, item) => {
        const text = normalizeBlockText($(item).text());
        if (text) {
          blocks.push(`- ${text.replace(/^-+\s*/, '')}`);
        }
      });
    return;
  }

  if (isBlockTag(tagName)) {
    const text = normalizeBlockText($(node).text());
    if (text) {
      blocks.push(text);
    }
    return;
  }

  $(node)
    .contents()
    .each((_, child) => {
      collectResumeBlocks($, child, blocks);
    });
}

function isBlockTag(tagName: string) {
  return ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'].includes(tagName);
}

function normalizeBlockText(text: string) {
  return text
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function parseExperienceHeader(header: string) {
  const compactHeader = header.replace(/[–—]/g, '-').trim();
  const headerLines = compactHeader
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (headerLines.length >= 3) {
    const dateLineIndex = headerLines.findIndex((line) => /\b\d{4}\s*-\s*(Present|\d{4})\b/i.test(line));
    const companyLineIndex = headerLines.findIndex((line) => /[A-Za-z .]+,\s*[A-Z]{2}/.test(line));
    const companyLine = companyLineIndex >= 0 ? headerLines[companyLineIndex] : undefined;

    if (dateLineIndex >= 0 && companyLine) {
      const dateLine = headerLines[dateLineIndex];
      const dateMatch = dateLine.match(/(\d{4})\s*-\s*(Present|\d{4})/i);
      const companyLocation = splitCompanyAndLocation(companyLine);

      if (dateMatch && companyLocation) {
        const trailingCompany = headerLines
          .slice(companyLineIndex + 1, dateLineIndex)
          .filter((line) => line && !isSectionHeading(line))
          .join(' ');

        return {
          position: cleanText(headerLines[0]),
          company: cleanText([companyLocation.company, trailingCompany].filter(Boolean).join(' ')),
          location: companyLocation.location,
          startYear: dateMatch[1],
          endYear: normalizeYearLabel(dateMatch[2]),
          inlineDescription: normalizeBulletParagraphs(headerLines.slice(dateLineIndex + 1)),
        };
      }
    }
  }

  const singleLineMatch = compactHeader.match(
    /^(.*?)(?:,\s*|\s+-\s+)([A-Za-z .]+,\s*[A-Z]{2})([A-Z][A-Za-z0-9&().,'/ -]+)?\s*(\d{4})\s*-\s*(Present|\d{4})$/i,
  );

  if (!singleLineMatch) {
    return null;
  }

  const [, titleAndCompanyRaw, locationRaw, trailingCompanyRaw, startYear, endYear] = singleLineMatch;
  const { position, company } = splitTitleAndCompany(
    joinTitleAndCompanyRemainder(titleAndCompanyRaw, trailingCompanyRaw),
  );

  return {
    position,
    company,
    location: locationRaw.trim(),
    startYear,
    endYear: normalizeYearLabel(endYear),
    inlineDescription: '',
  };
}

function splitCompanyAndLocation(value: string) {
  const normalized = value.replace(/[–—]/g, '-').trim();
  const match = normalized.match(/^(.*?)(?:,\s*|\s+-\s+)([A-Za-z .]+,\s*[A-Z]{2})$/);

  if (!match) {
    return null;
  }

  return {
    company: cleanText(match[1]),
    location: cleanText(match[2]),
  };
}

function normalizeYearLabel(value: string) {
  return /^present$/i.test(value.trim()) ? 'Present' : value.trim();
}

function normalizeBulletParagraphs(paragraphs: string[]) {
  return paragraphs
    .flatMap((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.replace(/^-+\s*/, '').trim())
        .filter(Boolean),
    )
    .join(' ');
}

function joinTitleAndCompanyRemainder(titleAndCompanyRaw: string, trailingCompanyRaw?: string) {
  const parts = [cleanText(titleAndCompanyRaw.replace(/[,-]\s*$/, ''))];

  if (trailingCompanyRaw) {
    parts.push(cleanText(trailingCompanyRaw));
  }

  return parts.filter(Boolean).join(' ');
}

function extractSkillsFromSections(text: string) {
  const sections = ['Technical Proficiency', 'Technical Skills', 'Core Competencies', 'Skills'];
  const skills = new Set<string>();

  for (const sectionName of sections) {
    const sectionText = extractSectionText(text, sectionName, [
      'Professional Experience',
      'Work Experience',
      'Experience',
      'Education',
      'Certifications',
      'Projects',
    ]);

    if (!sectionText) {
      continue;
    }

    for (const part of sectionText.split(/[,•|]/)) {
      const cleaned = cleanText(part.replace(/^[-:]+/, ''));
      if (cleaned && cleaned.length <= 60) {
        skills.add(cleaned);
      }
    }
  }

  return Array.from(skills);
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

function splitDegreeAndField(value: string) {
  const trimmed = cleanText(value);
  const match = trimmed.match(
    /^(?<degree>.+?(?:Degree|Bachelor(?:'s|’s)?|Master(?:'s|’s)?|Associate(?:'s|’s)?|B\.?S\.?|M\.?S\.?|PhD|Doctorate))(?:\s+in\s+(?<field>.+))?$/i,
  );

  if (!match?.groups) {
    return {
      degree: trimmed,
      field: '',
    };
  }

  return {
    degree: cleanText(match.groups.degree),
    field: cleanText(match.groups.field || ''),
  };
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
}

function extractPhone(text: string) {
  return text.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/)?.[0] || '';
}

function extractLinkedIn(text: string) {
  return text.match(/linkedin\.com\/in\/[A-Za-z0-9-_/]+/i)?.[0] || '';
}
