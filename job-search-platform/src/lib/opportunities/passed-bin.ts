export type WorkspaceStatus =
  | 'INTERESTED'
  | 'APPLIED'
  | 'FOLLOW_UP'
  | 'DORMANT'
  | 'ARCHIVED'
  | 'PASSED';

export type RestoreDestination = 'INBOX' | 'WORKSPACE';

export interface PassedRestorePlan {
  destination: RestoreDestination;
  workspaceStatus: WorkspaceStatus | null;
}

function mapApplicationStatusToWorkspaceStatus(status: string): WorkspaceStatus | null {
  switch (status) {
    case 'interested':
      return 'INTERESTED';
    case 'applied':
      return 'APPLIED';
    case 'screening':
    case 'interview':
    case 'offer':
      return 'FOLLOW_UP';
    default:
      return null;
  }
}

export function getPassedRestorePlan(applicationStatus: string | null | undefined): PassedRestorePlan {
  const workspaceStatus = applicationStatus
    ? mapApplicationStatusToWorkspaceStatus(applicationStatus)
    : null;

  if (!workspaceStatus) {
    return {
      destination: 'INBOX',
      workspaceStatus: null,
    };
  }

  return {
    destination: 'WORKSPACE',
    workspaceStatus,
  };
}

export function shouldHideFromPipeline(workspaceStatus: WorkspaceStatus | null | undefined) {
  return workspaceStatus === 'PASSED' || workspaceStatus === 'ARCHIVED';
}
