import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import type { ResumeDocumentData } from '@/lib/resume-document';

export type ResumeExportData = ResumeDocumentData;

export function createResumeExportFileName(
  data: ResumeExportData,
  extension: 'pdf' | 'docx',
  job?: { company?: string; title?: string } | null,
) {
  const parts = [
    data.contactInfo.name || 'resume',
    job?.company || '',
    job?.title || '',
  ]
    .map((value) => slugify(value))
    .filter(Boolean)
    .slice(0, 3);

  const stem = parts.length > 0 ? parts.join('-') : 'resume';
  return `${stem}.${extension}`;
}

export async function buildResumeDocxBuffer(data: ResumeExportData) {
  return Packer.toBuffer(buildResumeDocxDocument(data));
}

export async function buildResumeDocxBlob(data: ResumeExportData) {
  return Packer.toBlob(buildResumeDocxDocument(data));
}

function buildResumeDocxDocument(data: ResumeExportData) {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: data.contactInfo.name || 'Resume',
          bold: true,
          size: 32,
        }),
      ],
    }),
  );

  const contactLine = [
    data.contactInfo.email,
    data.contactInfo.phone,
    data.contactInfo.location,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' | ');

  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: contactLine, size: 20 })],
      }),
    );
  }

  pushSection(children, 'Professional Summary');
  children.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun(stripHtml(data.summary) || ' ')],
    }),
  );

  pushSection(children, 'Experience');
  if (data.experience.length === 0) {
    children.push(new Paragraph('No experience added yet.'));
  } else {
    for (const entry of data.experience) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: entry.title || 'Untitled Role', bold: true }),
            new TextRun({ text: entry.company ? ` - ${entry.company}` : '' }),
          ],
        }),
      );
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: formatDateRange(entry.startDate, entry.endDate),
              italics: true,
            }),
            new TextRun({ text: entry.location ? ` | ${entry.location}` : '', italics: true }),
          ],
        }),
      );
      if (entry.description) {
        children.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun(stripHtml(entry.description))],
          }),
        );
      }
    }
  }

  pushSection(children, 'Education');
  if (data.education.length === 0) {
    children.push(new Paragraph('No education added yet.'));
  } else {
    for (const entry of data.education) {
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: entry.school || 'School', bold: true }),
            new TextRun({ text: entry.degree ? ` - ${entry.degree}` : '' }),
          ],
        }),
      );
      const educationMeta = [
        formatDateRange(entry.startDate, entry.endDate),
        entry.location,
      ]
        .filter(Boolean)
        .join(' | ');

      if (educationMeta) {
        children.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: educationMeta, italics: true })],
          }),
        );
      }
    }
  }

  pushSection(children, 'Skills');
  children.push(
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun(data.skills.join(' • ') || 'No skills added yet.')],
    }),
  );

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

function pushSection(children: Paragraph[], title: string) {
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: title, bold: true })],
    }),
  );
}

function formatDateRange(startDate: string, endDate: string) {
  const start = formatDisplayDate(startDate);
  const end = endDate ? formatDisplayDate(endDate) : 'Present';

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || '';
}

function formatDisplayDate(value: string) {
  if (!value) {
    return '';
  }

  const [year, month] = value.split('-');
  if (!year) {
    return value;
  }

  if (!month) {
    return year;
  }

  return `${year}-${month}`;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
