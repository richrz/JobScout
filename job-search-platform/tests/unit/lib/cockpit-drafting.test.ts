import type { ResumeDocumentData } from '@/lib/resume-document';
import {
  applyFactLocks,
  applyDraftReviewSelection,
  buildDraftReviewSelection,
  buildExperienceReviewEntries,
  buildInlineLineDiff,
  buildInlineWordDiff,
  buildKeywordCoverage,
  flattenResumeDraftText,
  summarizeDraftDiff,
  type FactLockState,
} from '@/lib/resume/cockpit-drafting';

const baseDraft: ResumeDocumentData = {
  contactInfo: {
    name: 'Richard Ruiz',
    email: 'rruiz@example.com',
    phone: '(949) 743-4975',
    location: 'Colorado Springs, CO',
  },
  summary:
    'Solutions engineer translating complex AI and cloud programs into clear business outcomes.',
  experience: [
    {
      id: 'exp-1',
      title: 'Principal Solutions Architect',
      company: 'Acme',
      location: 'Remote',
      startDate: '2022-01-01',
      endDate: '',
      description:
        'Led cloud adoption for enterprise accounts.\nSaved $650k annually by redesigning the deployment workflow.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. Information Systems',
      school: 'State University',
      location: 'Denver, CO',
      startDate: '2010-08-01',
      endDate: '2014-05-01',
    },
  ],
  skills: ['AWS', 'Solution Selling', 'AI Architecture'],
};

describe('cockpit drafting helpers', () => {
  it('flattens resume draft text for keyword coverage', () => {
    const text = flattenResumeDraftText(baseDraft);

    expect(text).toContain('Richard Ruiz');
    expect(text).toContain('Solutions engineer translating complex AI');
    expect(text).toContain('Principal Solutions Architect');
    expect(text).toContain('Saved $650k annually');
    expect(text).toContain('AI Architecture');
  });

  it('builds plain keyword coverage without a black-box score', () => {
    const result = buildKeywordCoverage(
      'Principal AI solutions architect for AWS cloud modernization, enterprise sales, and customer-facing delivery leadership.',
      baseDraft,
    );

    expect(result.coveragePercent).toBeGreaterThan(0);
    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(['ai', 'aws', 'solutions', 'architect']),
    );
    expect(result.missingKeywords).toEqual(expect.arrayContaining(['modernization']));
    expect(result.targetKeywords.length).toBeGreaterThanOrEqual(result.matchedKeywords.length);
  });

  it('applies fact locks while still allowing rewrites around the locked facts', () => {
    const rewritten: ResumeDocumentData = {
      ...baseDraft,
      contactInfo: {
        name: 'R. Ruiz',
        email: 'updated@example.com',
        phone: '000',
        location: 'Anywhere',
      },
      summary: 'Sharper summary for a target role.',
      experience: [
        {
          id: 'exp-1',
          title: 'Enterprise AI Architect',
          company: 'Different Company',
          location: 'New York, NY',
          startDate: '2025-01-01',
          endDate: '2025-02-01',
          description:
            'Modernized enterprise delivery motion and improved sales velocity.\nReduced onboarding time by 40% across the field team.',
        },
      ],
      skills: ['Enterprise Architecture'],
    };

    const locks: FactLockState = {
      contactInfo: true,
      workHistoryFacts: true,
      skills: true,
      metrics: true,
    };

    const merged = applyFactLocks(baseDraft, rewritten, locks);

    expect(merged.contactInfo).toEqual(baseDraft.contactInfo);
    expect(merged.skills).toEqual(baseDraft.skills);
    expect(merged.summary).toBe('Sharper summary for a target role.');
    expect(merged.experience[0]).toMatchObject({
      title: baseDraft.experience[0].title,
      company: baseDraft.experience[0].company,
      location: baseDraft.experience[0].location,
      startDate: baseDraft.experience[0].startDate,
      endDate: baseDraft.experience[0].endDate,
    });
    expect(merged.experience[0].description).toContain(
      'Saved $650k annually by redesigning the deployment workflow.',
    );
    expect(merged.experience[0].description).toContain(
      'Reduced onboarding time by 40% across the field team.',
    );
  });

  it('summarizes the draft diff for preview and confirm', () => {
    const changedDraft: ResumeDocumentData = {
      ...baseDraft,
      summary: 'Sharper summary for a target role.',
      experience: [
        {
          ...baseDraft.experience[0],
          description:
            'Led cloud adoption for enterprise accounts.\nSaved $650k annually by redesigning the deployment workflow.\nBuilt a clearer executive story for AI programs.',
        },
        {
          id: 'exp-2',
          title: 'Sales Engineer',
          company: 'Reply',
          location: 'Kansas City, MO',
          startDate: '2020-01-01',
          endDate: '2021-12-31',
          description: 'Supported enterprise pursuits across data and AI programs.',
        },
      ],
      skills: [...baseDraft.skills, 'Enterprise Sales'],
    };

    const diff = summarizeDraftDiff(baseDraft, changedDraft);

    expect(diff.hasChanges).toBe(true);
    expect(diff.changedSections).toEqual(
      expect.arrayContaining(['summary', 'experience', 'skills']),
    );
    expect(diff.summaryChanged).toBe(true);
    expect(diff.experience.added).toBe(1);
    expect(diff.experience.updated).toBe(1);
    expect(diff.skills.added).toEqual(['Enterprise Sales']);
  });

  it('builds section review defaults from the staged diff', () => {
    const changedDraft: ResumeDocumentData = {
      ...baseDraft,
      summary: 'Sharper summary for a target role.',
      skills: [...baseDraft.skills, 'Enterprise Sales'],
    };

    const diff = summarizeDraftDiff(baseDraft, changedDraft);
    const selection = buildDraftReviewSelection(diff);

    expect(selection).toEqual({
      summary: 'suggested',
      skills: 'suggested',
      experience: 'current',
    });
  });

  it('applies only the selected staged sections back to the working draft', () => {
    const suggested: ResumeDocumentData = {
      ...baseDraft,
      summary: 'Sharper summary for this role.',
      skills: ['AWS', 'AI', 'Stakeholder Management'],
      experience: [
        {
          ...baseDraft.experience[0],
          description: 'Built a cleaner executive story for strategic pursuits.',
        },
      ],
      education: [
        {
          id: 'edu-2',
          degree: 'M.S. Computer Science',
          school: 'Another School',
          location: 'Remote',
          startDate: '2014-09-01',
          endDate: '2016-05-01',
        },
      ],
    };

    const merged = applyDraftReviewSelection(baseDraft, suggested, {
      summary: 'current',
      skills: 'suggested',
      experience: 'suggested',
    });

    expect(merged.summary).toBe(baseDraft.summary);
    expect(merged.skills).toEqual(suggested.skills);
    expect(merged.experience[0].description).toBe(
      'Built a cleaner executive story for strategic pursuits.',
    );
    expect(merged.contactInfo).toEqual(baseDraft.contactInfo);
    expect(merged.education).toEqual(baseDraft.education);
  });

  it('builds review entries for changed experience blocks', () => {
    const suggested: ResumeDocumentData = {
      ...baseDraft,
      experience: [
        {
          ...baseDraft.experience[0],
          description: 'Built a cleaner executive story for strategic pursuits.',
        },
        {
          id: 'exp-2',
          title: 'Sales Engineer',
          company: 'Reply',
          location: 'Kansas City, MO',
          startDate: '2020-01-01',
          endDate: '2021-12-31',
          description: 'Supported enterprise pursuits across data and AI programs.',
        },
      ],
    };

    const reviewEntries = buildExperienceReviewEntries(baseDraft, suggested);

    expect(reviewEntries).toEqual([
      expect.objectContaining({
        id: 'exp-1',
        status: 'updated',
        currentDescription: baseDraft.experience[0].description,
        suggestedDescription: 'Built a cleaner executive story for strategic pursuits.',
      }),
      expect.objectContaining({
        id: 'exp-2',
        status: 'added',
        currentDescription: '',
        suggestedDescription: 'Supported enterprise pursuits across data and AI programs.',
      }),
    ]);
  });

  it('builds inline word diffs for summary wording changes', () => {
    const chunks = buildInlineWordDiff(
      'Technical seller for enterprise cloud programs.',
      'Technical seller and architect for enterprise cloud programs.',
    );

    expect(chunks.some((chunk) => chunk.type === 'added' && chunk.value.includes('and architect'))).toBe(true);
    expect(chunks.some((chunk) => chunk.type === 'same' && chunk.value.includes('Technical seller'))).toBe(true);
  });

  it('builds inline line diffs for experience bullet changes', () => {
    const lines = buildInlineLineDiff(
      'Led cloud adoption.\nSaved $650k annually.',
      'Led cloud adoption.\nSaved $650k annually.\nBuilt an executive-ready proof narrative.',
    );

    expect(lines).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'added',
          line: 'Built an executive-ready proof narrative.',
        }),
        expect.objectContaining({
          type: 'same',
          line: 'Led cloud adoption.',
        }),
      ]),
    );
  });
});
