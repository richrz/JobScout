import { ApplicationStatus, Prisma } from '@prisma/client';

export type LegacyApplicationStatus =
  | 'discovered'
  | 'interested'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'archived';

const WORKSPACE_STATUS_BY_LEGACY_STATUS: Record<LegacyApplicationStatus, ApplicationStatus> = {
  discovered: 'INTERESTED',
  interested: 'INTERESTED',
  applied: 'APPLIED',
  screening: 'FOLLOW_UP',
  interview: 'FOLLOW_UP',
  offer: 'FOLLOW_UP',
  rejected: 'ARCHIVED',
  archived: 'ARCHIVED',
};

export function workspaceStatusForLegacyStatus(status: LegacyApplicationStatus): ApplicationStatus {
  return WORKSPACE_STATUS_BY_LEGACY_STATUS[status];
}

function buildStatusHistoryEntry(status: LegacyApplicationStatus) {
  return {
    status,
    timestamp: new Date().toISOString(),
  };
}

function getJsonHistoryArray(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonValue[] {
  return Array.isArray(value) ? [...value] as Prisma.InputJsonValue[] : [];
}

export async function syncOpportunityState(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    jobId: string;
    legacyStatus: LegacyApplicationStatus;
    resumePath?: string | null;
  }
) {
  const { userId, jobId, legacyStatus, resumePath } = input;
  const workspaceStatus = workspaceStatusForLegacyStatus(legacyStatus);

  const existingApplication = await tx.application.findFirst({
    where: { userId, jobId },
    select: {
      id: true,
      status: true,
      statusHistory: true,
      appliedAt: true,
    },
  });

  if (existingApplication) {
    const currentHistory = getJsonHistoryArray(existingApplication.statusHistory);
    const updateData: Prisma.ApplicationUpdateInput = {
      updatedAt: new Date(),
    };

    if (existingApplication.status !== legacyStatus) {
      updateData.status = legacyStatus;
      updateData.statusHistory = [
        ...currentHistory,
        buildStatusHistoryEntry(legacyStatus),
      ] as Prisma.InputJsonValue[];
    }

    if (resumePath) {
      updateData.resumePath = resumePath;
    }

    if (legacyStatus === 'applied' && !existingApplication.appliedAt) {
      updateData.appliedAt = new Date();
    }

    await tx.application.update({
      where: { id: existingApplication.id },
      data: updateData,
    });
  } else {
    await tx.application.create({
      data: {
        userId,
        jobId,
        status: legacyStatus,
        resumePath: resumePath || undefined,
        appliedAt: legacyStatus === 'applied' ? new Date() : null,
        statusHistory: [buildStatusHistoryEntry(legacyStatus)],
      },
    });
  }

  await tx.workspace.upsert({
    where: { userId_jobId: { userId, jobId } },
    update: {
      status: workspaceStatus,
      updatedAt: new Date(),
    },
    create: {
      userId,
      jobId,
      status: workspaceStatus,
    },
  });
}

export async function dismissOpportunity(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    jobId: string;
  }
) {
  const { userId, jobId } = input;

  await tx.workspace.upsert({
    where: { userId_jobId: { userId, jobId } },
    update: {
      status: 'DISMISSED',
      updatedAt: new Date(),
    },
    create: {
      userId,
      jobId,
      status: 'DISMISSED',
    },
  });

  await tx.application.deleteMany({
    where: {
      userId,
      jobId,
      status: {
        in: ['discovered', 'interested', 'rejected', 'archived'],
      },
    },
  });
}
