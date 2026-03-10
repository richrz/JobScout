import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  buildCockpitPhaseOneViewModel,
  deriveCockpitStage,
  type CockpitManagedOpportunityInput,
  type CockpitDiscoveryJobInput,
  type CockpitStage,
} from '@/lib/cockpit-phase1';
import CockpitWireframeClient, {
  type CockpitPanelRecord,
} from './CockpitWireframeClient';

export const dynamic = 'force-dynamic';

function toIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : new Date().toISOString();
}

export default async function DashboardWireframePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const [managedWorkspaces, discoveryJobs] = await Promise.all([
    prisma.workspace.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            description: true,
            compositeScore: true,
          },
        },
        application: {
          select: {
            status: true,
          },
        },
        resumes: {
          select: {
            id: true,
            title: true,
            documentState: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    }),
    prisma.job.findMany({
      where: {
        NOT: {
          workspaces: {
            some: { userId: user.id },
          },
        },
      },
      orderBy: [{ compositeScore: 'desc' }, { postedAt: 'desc' }],
      take: 32,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        postedAt: true,
        compositeScore: true,
      },
    }),
  ]);

  const managedOpportunities: CockpitManagedOpportunityInput[] = managedWorkspaces.map(
    (workspace) => ({
      workspaceId: workspace.id,
      jobId: workspace.jobId,
      title: workspace.job.title,
      company: workspace.job.company,
      location: workspace.job.location,
      updatedAt: toIsoString(workspace.updatedAt),
      workspaceStatus: workspace.status,
      legacyStatus: workspace.application?.status ?? null,
      resumeStates: workspace.resumes.map((resume) => resume.documentState),
      compositeScore: workspace.job.compositeScore,
    }),
  );

  const discoveryInputs: CockpitDiscoveryJobInput[] = discoveryJobs.map((job) => ({
    jobId: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    postedAt: toIsoString(job.postedAt),
    compositeScore: job.compositeScore,
  }));

  const viewModel = buildCockpitPhaseOneViewModel({
    managedOpportunities,
    discoveryJobs: discoveryInputs,
    recentActivityLimit: 4,
    riverLimit: 4,
  });

  const panelRecords: CockpitPanelRecord[] = [
    ...discoveryJobs.map((job) => ({
      id: job.id,
      kind: 'discovery' as const,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      stage: 'NEW' as CockpitStage,
      updatedAt: toIsoString(job.postedAt),
      workspaceId: null,
      workspaceStatus: null,
      legacyStatus: null,
      resumes: [],
      compositeScore: job.compositeScore ?? null,
    })),
    ...managedWorkspaces.map((workspace) => ({
      id: workspace.id,
      kind: 'managed' as const,
      title: workspace.job.title,
      company: workspace.job.company,
      location: workspace.job.location,
      description: workspace.job.description,
      stage:
        deriveCockpitStage({
          workspaceStatus: workspace.status,
          legacyStatus: workspace.application?.status ?? null,
          resumeStates: workspace.resumes.map((resume) => resume.documentState),
        }) ?? 'INTERESTED',
      updatedAt: toIsoString(workspace.updatedAt),
      workspaceId: workspace.id,
      workspaceStatus: workspace.status,
      legacyStatus: workspace.application?.status ?? null,
      resumes: workspace.resumes.map((resume) => ({
        id: resume.id,
        title: resume.title,
        documentState: resume.documentState,
        updatedAt: toIsoString(resume.updatedAt),
      })),
      compositeScore: workspace.job.compositeScore ?? null,
    })),
  ];

  return (
    <CockpitWireframeClient
      userName={user.name ?? user.email}
      viewModel={viewModel}
      panelRecords={panelRecords}
    />
  );
}
