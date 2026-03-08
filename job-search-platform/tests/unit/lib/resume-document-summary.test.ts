import { describe, expect, test } from '@jest/globals';
import { summarizeResumeDocuments } from '@/lib/resume/document-summary';

const baseDate = new Date('2026-03-08T12:00:00.000Z');

describe('summarizeResumeDocuments', () => {
  test('returns the latest document in each accepted state bucket', () => {
    const summary = summarizeResumeDocuments([
      {
        id: 'reference-old',
        title: 'Legacy Resume.pdf',
        documentState: 'REFERENCE',
        createdAt: new Date(baseDate.getTime() - 60_000),
        pdfSnapshot: '/uploads/legacy.pdf',
      },
      {
        id: 'reference-new',
        title: 'Updated Resume.pdf',
        documentState: 'REFERENCE',
        createdAt: baseDate,
        pdfSnapshot: '/uploads/updated.pdf',
      },
      {
        id: 'draft-1',
        title: 'Working Draft',
        documentState: 'WORKING_DRAFT',
        createdAt: new Date(baseDate.getTime() - 30_000),
      },
      {
        id: 'snapshot-old',
        title: 'Submitted Snapshot 1',
        documentState: 'SUBMITTED_SNAPSHOT',
        createdAt: new Date(baseDate.getTime() - 20_000),
      },
      {
        id: 'snapshot-new',
        title: 'Submitted Snapshot 2',
        documentState: 'SUBMITTED_SNAPSHOT',
        createdAt: new Date(baseDate.getTime() - 10_000),
      },
    ]);

    expect(summary.hasAnyDocuments).toBe(true);
    expect(summary.reference?.id).toBe('reference-new');
    expect(summary.workingDraft?.id).toBe('draft-1');
    expect(summary.latestSubmittedSnapshot?.id).toBe('snapshot-new');
  });

  test('returns empty buckets when no documents exist', () => {
    expect(summarizeResumeDocuments([])).toEqual({
      hasAnyDocuments: false,
      latestSubmittedSnapshot: null,
      reference: null,
      savedVariants: [],
      workingDraft: null,
    });
  });
});
