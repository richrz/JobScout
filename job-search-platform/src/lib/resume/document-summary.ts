export type ResumeDocumentState =
  | 'REFERENCE'
  | 'WORKING_DRAFT'
  | 'SAVED_VARIANT'
  | 'SUBMITTED_SNAPSHOT';

export interface ResumeDocumentLike {
  id: string;
  title: string;
  documentState: ResumeDocumentState;
  createdAt: Date;
  pdfSnapshot?: string | null;
}

export interface ResumeDocumentSummary {
  hasAnyDocuments: boolean;
  reference: ResumeDocumentLike | null;
  workingDraft: ResumeDocumentLike | null;
  savedVariants: ResumeDocumentLike[];
  latestSubmittedSnapshot: ResumeDocumentLike | null;
}

function sortNewestFirst<T extends { createdAt: Date }>(items: T[]) {
  return [...items].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
}

export function summarizeResumeDocuments(
  documents: ResumeDocumentLike[]
): ResumeDocumentSummary {
  const references = sortNewestFirst(
    documents.filter((document) => document.documentState === 'REFERENCE')
  );
  const workingDrafts = sortNewestFirst(
    documents.filter((document) => document.documentState === 'WORKING_DRAFT')
  );
  const savedVariants = sortNewestFirst(
    documents.filter((document) => document.documentState === 'SAVED_VARIANT')
  );
  const submittedSnapshots = sortNewestFirst(
    documents.filter((document) => document.documentState === 'SUBMITTED_SNAPSHOT')
  );

  return {
    hasAnyDocuments: documents.length > 0,
    reference: references[0] ?? null,
    workingDraft: workingDrafts[0] ?? null,
    savedVariants,
    latestSubmittedSnapshot: submittedSnapshots[0] ?? null,
  };
}
