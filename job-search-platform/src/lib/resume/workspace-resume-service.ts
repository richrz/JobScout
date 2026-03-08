import { ApplicationStatus, Prisma, type DocumentState } from '@prisma/client';

function toResumeContent(content: unknown): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  if (content === null) {
    return Prisma.JsonNull;
  }

  if (
    typeof content === 'string' ||
    typeof content === 'number' ||
    typeof content === 'boolean'
  ) {
    return content;
  }

  if (Array.isArray(content)) {
    return content as Prisma.InputJsonValue[];
  }

  if (typeof content === 'object') {
    return content as Prisma.InputJsonObject;
  }

  return {} as Prisma.InputJsonObject;
}

export async function ensureWorkspaceForDocuments(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    jobId: string;
    status?: ApplicationStatus;
    applicationId?: string | null;
  }
) {
  const { userId, jobId, status = 'INTERESTED', applicationId } = input;

  return tx.workspace.upsert({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
    update: {
      status,
      applicationId: applicationId ?? undefined,
      updatedAt: new Date(),
    },
    create: {
      userId,
      jobId,
      status,
      applicationId: applicationId ?? undefined,
    },
  });
}

export async function upsertWorkspaceResume(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    jobId: string;
    title: string;
    content: unknown;
    documentState: DocumentState;
    applicationId?: string | null;
    workspaceId?: string | null;
    pdfSnapshot?: string | null;
  }
) {
  const workspace =
    input.workspaceId
      ? await tx.workspace.findUnique({
          where: { id: input.workspaceId },
        })
      : await ensureWorkspaceForDocuments(tx, {
          userId: input.userId,
          jobId: input.jobId,
          applicationId: input.applicationId,
          status: input.documentState === 'SUBMITTED_SNAPSHOT' ? 'APPLIED' : 'INTERESTED',
        });

  if (!workspace) {
    throw new Error('Workspace not found for resume document');
  }

  const existingSingleStateResume =
    input.documentState === 'WORKING_DRAFT'
      ? await tx.resume.findFirst({
          where: {
            workspaceId: workspace.id,
            documentState: 'WORKING_DRAFT',
          },
          orderBy: {
            updatedAt: 'desc',
          },
        })
      : null;

  if (existingSingleStateResume) {
    return tx.resume.update({
      where: { id: existingSingleStateResume.id },
      data: {
        title: input.title,
        content: toResumeContent(input.content),
        applicationId: input.applicationId ?? undefined,
        pdfSnapshot: input.pdfSnapshot ?? undefined,
        updatedAt: new Date(),
      },
    });
  }

  return tx.resume.create({
    data: {
      userId: input.userId,
      jobId: input.jobId,
      workspaceId: workspace.id,
      applicationId: input.applicationId ?? undefined,
      title: input.title,
      documentState: input.documentState,
      content: toResumeContent(input.content),
      pdfSnapshot: input.pdfSnapshot ?? undefined,
      tailoringMode: 'strategic',
    },
  });
}
