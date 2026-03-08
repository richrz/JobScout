import { ApplicationStatus, Prisma } from '@prisma/client';

export type LegacyApplicationStatus =
  | 'discovered'
  | 'interested'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'passed'
  | 'rejected'
  | 'archived';

const WORKSPACE_STATUS_BY_LEGACY_STATUS: Record<LegacyApplicationStatus, ApplicationStatus> = {
  discovered: 'INTERESTED',
  interested: 'INTERESTED',
  applied: 'APPLIED',
  screening: 'FOLLOW_UP',
  interview: 'FOLLOW_UP',
  offer: 'FOLLOW_UP',
  passed: 'PASSED',
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
  }
) {
  const { userId, jobId, legacyStatus } = input;
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

  let applicationId: string | null = existingApplication?.id ?? null;

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

    if (legacyStatus === 'applied' && !existingApplication.appliedAt) {
      updateData.appliedAt = new Date();
    }

    await tx.application.update({
      where: { id: existingApplication.id },
      data: updateData,
    });
  } else {
    const application = await tx.application.create({
      data: {
        userId,
        jobId,
        status: legacyStatus,
        appliedAt: legacyStatus === 'applied' ? new Date() : null,
        statusHistory: [buildStatusHistoryEntry(legacyStatus)],
      },
    });

    applicationId = application.id;
  }

  const workspace = await tx.workspace.upsert({
    where: { userId_jobId: { userId, jobId } },
    update: {
      status: workspaceStatus,
      applicationId: applicationId ?? undefined,
      updatedAt: new Date(),
    },
    create: {
      userId,
      jobId,
      applicationId: applicationId ?? undefined,
      status: workspaceStatus,
    },
  });

  return {
    applicationId,
    workspaceId: workspace.id,
    workspaceStatus,
  };
}

export async function dismissOpportunity(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    jobId: string;
  }
) {
  const { userId, jobId } = input;
  const existingApplication = await tx.application.findFirst({
    where: { userId, jobId },
    select: { id: true },
  });

  const workspace = await tx.workspace.upsert({
    where: { userId_jobId: { userId, jobId } },
    update: {
      status: 'PASSED',
      applicationId: existingApplication?.id ?? undefined,
      updatedAt: new Date(),
    },
    create: {
      userId,
      jobId,
      applicationId: existingApplication?.id ?? undefined,
      status: 'PASSED',
    },
  });

  return {
    applicationId: existingApplication?.id ?? null,
    workspaceId: workspace.id,
  };
}
