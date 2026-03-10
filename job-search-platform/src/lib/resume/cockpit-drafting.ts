import type { ResumeDocumentData } from '@/lib/resume-document';

export type FactLockState = {
  contactInfo?: boolean;
  workHistoryFacts?: boolean;
  education?: boolean;
  skills?: boolean;
  metrics?: boolean;
};

export type KeywordCoverageResult = {
  coveragePercent: number;
  targetKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
};

export type DraftDiffSummary = {
  hasChanges: boolean;
  changedSections: Array<'contactInfo' | 'summary' | 'experience' | 'education' | 'skills'>;
  summaryChanged: boolean;
  contactChanged: boolean;
  experience: {
    added: number;
    removed: number;
    updated: number;
  };
  education: {
    added: number;
    removed: number;
    updated: number;
  };
  skills: {
    added: string[];
    removed: string[];
  };
};

export type DraftReviewSection = 'summary' | 'skills' | 'experience';

export type DraftReviewSelection = Record<DraftReviewSection, 'current' | 'suggested'>;

export type ExperienceReviewEntry = {
  id: string;
  title: string;
  company: string;
  status: 'added' | 'removed' | 'updated';
  currentDescription: string;
  suggestedDescription: string;
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'have',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'their',
  'this',
  'to',
  'with',
  'you',
  'your',
]);

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeLine(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function textToKeywordTokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 3 ||
        ['ai', 'ml', 'ui', 'ux', 'qa'].includes(token),
    )
    .filter((token) => !STOP_WORDS.has(token));
}

function roleIdentityChanged(
  current: ResumeDocumentData['experience'][number],
  next: ResumeDocumentData['experience'][number],
) {
  return (
    current.title !== next.title ||
    current.company !== next.company ||
    current.location !== next.location ||
    current.startDate !== next.startDate ||
    current.endDate !== next.endDate
  );
}

function educationIdentityChanged(
  current: ResumeDocumentData['education'][number],
  next: ResumeDocumentData['education'][number],
) {
  return (
    current.degree !== next.degree ||
    current.school !== next.school ||
    current.location !== next.location ||
    current.startDate !== next.startDate ||
    current.endDate !== next.endDate
  );
}

function preserveMetricLines(currentDescription: string, rewrittenDescription: string) {
  const currentLines = currentDescription
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const rewrittenLines = rewrittenDescription
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const existing = new Set(rewrittenLines.map(normalizeLine));
  const metricLines = currentLines.filter((line) => /[\d$%]/.test(line));

  const preserved = [...rewrittenLines];
  for (const line of metricLines) {
    const normalized = normalizeLine(line);
    if (!existing.has(normalized)) {
      preserved.push(line);
      existing.add(normalized);
    }
  }

  return preserved.join('\n');
}

export function flattenResumeDraftText(draft: ResumeDocumentData) {
  return [
    draft.contactInfo.name,
    draft.contactInfo.email,
    draft.contactInfo.phone,
    draft.contactInfo.location,
    draft.summary,
    ...draft.experience.flatMap((role) => [
      role.title,
      role.company,
      role.location,
      role.startDate,
      role.endDate,
      role.description,
    ]),
    ...draft.education.flatMap((item) => [
      item.degree,
      item.school,
      item.location,
      item.startDate,
      item.endDate,
    ]),
    ...draft.skills,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildKeywordCoverage(
  jobDescription: string,
  draft: ResumeDocumentData,
  maxKeywords = 12,
): KeywordCoverageResult {
  const jobTokens = uniq(textToKeywordTokens(jobDescription));
  const resumeTokens = new Set(textToKeywordTokens(flattenResumeDraftText(draft)));
  const targetKeywords = jobTokens.slice(0, maxKeywords);
  const matchedKeywords = targetKeywords.filter((keyword) => resumeTokens.has(keyword));
  const missingKeywords = targetKeywords.filter((keyword) => !resumeTokens.has(keyword));
  const coveragePercent = Math.round(
    (matchedKeywords.length / Math.max(targetKeywords.length, 1)) * 100,
  );

  return {
    coveragePercent,
    targetKeywords,
    matchedKeywords,
    missingKeywords,
  };
}

export function applyFactLocks(
  current: ResumeDocumentData,
  rewritten: ResumeDocumentData,
  locks: FactLockState,
): ResumeDocumentData {
  const nextExperience = rewritten.experience.map((role, index) => {
    const currentRole = current.experience[index];
    if (!currentRole) {
      return role;
    }

    const mergedDescription = locks.metrics
      ? preserveMetricLines(currentRole.description, role.description)
      : role.description;

    if (!locks.workHistoryFacts) {
      return { ...role, description: mergedDescription };
    }

    return {
      ...role,
      title: currentRole.title,
      company: currentRole.company,
      location: currentRole.location,
      startDate: currentRole.startDate,
      endDate: currentRole.endDate,
      description: mergedDescription,
    };
  });

  return {
    contactInfo: locks.contactInfo ? current.contactInfo : rewritten.contactInfo,
    summary: rewritten.summary,
    experience: nextExperience,
    education: locks.education ? current.education : rewritten.education,
    skills: locks.skills ? current.skills : rewritten.skills,
  };
}

export function summarizeDraftDiff(
  current: ResumeDocumentData,
  next: ResumeDocumentData,
): DraftDiffSummary {
  const changedSections: DraftDiffSummary['changedSections'] = [];

  const contactChanged =
    JSON.stringify(current.contactInfo) !== JSON.stringify(next.contactInfo);
  if (contactChanged) {
    changedSections.push('contactInfo');
  }

  const summaryChanged = current.summary !== next.summary;
  if (summaryChanged) {
    changedSections.push('summary');
  }

  const currentExperienceById = new Map(current.experience.map((role) => [role.id, role]));
  const nextExperienceById = new Map(next.experience.map((role) => [role.id, role]));
  const addedExperience = next.experience.filter((role) => !currentExperienceById.has(role.id)).length;
  const removedExperience = current.experience.filter((role) => !nextExperienceById.has(role.id)).length;
  const updatedExperience = next.experience.filter((role) => {
    const currentRole = currentExperienceById.get(role.id);
    if (!currentRole) {
      return false;
    }
    return JSON.stringify(currentRole) !== JSON.stringify(role);
  }).length;
  if (addedExperience || removedExperience || updatedExperience) {
    changedSections.push('experience');
  }

  const currentEducationById = new Map(current.education.map((item) => [item.id, item]));
  const nextEducationById = new Map(next.education.map((item) => [item.id, item]));
  const addedEducation = next.education.filter((item) => !currentEducationById.has(item.id)).length;
  const removedEducation = current.education.filter((item) => !nextEducationById.has(item.id)).length;
  const updatedEducation = next.education.filter((item) => {
    const currentItem = currentEducationById.get(item.id);
    if (!currentItem) {
      return false;
    }
    return JSON.stringify(currentItem) !== JSON.stringify(item);
  }).length;
  if (addedEducation || removedEducation || updatedEducation) {
    changedSections.push('education');
  }

  const currentSkills = new Set(current.skills);
  const nextSkills = new Set(next.skills);
  const addedSkills = next.skills.filter((skill) => !currentSkills.has(skill));
  const removedSkills = current.skills.filter((skill) => !nextSkills.has(skill));
  if (addedSkills.length || removedSkills.length) {
    changedSections.push('skills');
  }

  return {
    hasChanges: changedSections.length > 0,
    changedSections,
    summaryChanged,
    contactChanged,
    experience: {
      added: addedExperience,
      removed: removedExperience,
      updated: updatedExperience,
    },
    education: {
      added: addedEducation,
      removed: removedEducation,
      updated: updatedEducation,
    },
    skills: {
      added: addedSkills,
      removed: removedSkills,
    },
  };
}

export function buildDraftReviewSelection(
  diff: DraftDiffSummary,
): DraftReviewSelection {
  return {
    summary: diff.summaryChanged ? 'suggested' : 'current',
    skills:
      diff.skills.added.length > 0 || diff.skills.removed.length > 0
        ? 'suggested'
        : 'current',
    experience:
      diff.experience.added > 0 ||
      diff.experience.removed > 0 ||
      diff.experience.updated > 0
        ? 'suggested'
        : 'current',
  };
}

export function applyDraftReviewSelection(
  current: ResumeDocumentData,
  suggested: ResumeDocumentData,
  selection: DraftReviewSelection,
): ResumeDocumentData {
  return {
    contactInfo: current.contactInfo,
    education: current.education,
    summary: selection.summary === 'suggested' ? suggested.summary : current.summary,
    skills: selection.skills === 'suggested' ? suggested.skills : current.skills,
    experience:
      selection.experience === 'suggested'
        ? suggested.experience
        : current.experience,
  };
}

export function buildExperienceReviewEntries(
  current: ResumeDocumentData,
  suggested: ResumeDocumentData,
): ExperienceReviewEntry[] {
  const currentById = new Map(current.experience.map((role) => [role.id, role]));
  const suggestedById = new Map(suggested.experience.map((role) => [role.id, role]));
  const orderedIds = uniq([
    ...suggested.experience.map((role) => role.id),
    ...current.experience.map((role) => role.id),
  ]);

  return orderedIds.reduce<ExperienceReviewEntry[]>((entries, id) => {
    const currentRole = currentById.get(id);
    const suggestedRole = suggestedById.get(id);

    if (!currentRole && !suggestedRole) {
      return entries;
    }

    if (!currentRole && suggestedRole) {
      entries.push({
        id,
        title: suggestedRole.title,
        company: suggestedRole.company,
        status: 'added',
        currentDescription: '',
        suggestedDescription: suggestedRole.description,
      });
      return entries;
    }

    if (currentRole && !suggestedRole) {
      entries.push({
        id,
        title: currentRole.title,
        company: currentRole.company,
        status: 'removed',
        currentDescription: currentRole.description,
        suggestedDescription: '',
      });
      return entries;
    }

    if (currentRole && suggestedRole && JSON.stringify(currentRole) !== JSON.stringify(suggestedRole)) {
      entries.push({
        id,
        title: suggestedRole.title,
        company: suggestedRole.company,
        status: 'updated',
        currentDescription: currentRole.description,
        suggestedDescription: suggestedRole.description,
      });
      return entries;
    }

    return entries;
  }, []);
}
