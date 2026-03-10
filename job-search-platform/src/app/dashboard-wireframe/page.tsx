import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ResumeDocumentData } from '@/lib/resume-document';
import { buildContactName, normalizeContactInfo } from '@/lib/profile-utils';
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

function toDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().split('T')[0] : '';
}

function buildProfileDraftSeed(profile: {
  updatedAt: Date;
  contactInfo: unknown;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    description: string;
  }>;
  educations: Array<{
    id: string;
    school: string;
    degree: string;
    startDate: Date;
    endDate: Date | null;
  }>;
  skills: string[];
} | null): { updatedAt: string; content: ResumeDocumentData } | null {
  if (!profile) {
    return null;
  }

  const normalizedContact = normalizeContactInfo(
    (typeof profile.contactInfo === 'object' && profile.contactInfo
      ? profile.contactInfo
      : {}) as Parameters<typeof normalizeContactInfo>[0],
  );

  return {
    updatedAt: toIsoString(profile.updatedAt),
    content: {
      contactInfo: {
        name: buildContactName(normalizedContact) || normalizedContact.name || '',
        email: normalizedContact.email || '',
        phone: normalizedContact.phone || '',
        location: normalizedContact.location || '',
      },
      summary: normalizedContact.summary || '',
      experience: profile.experiences.map((experience) => ({
        id: experience.id,
        title: experience.position,
        company: experience.company,
        location: experience.location || '',
        startDate: toDateInput(experience.startDate),
        endDate: toDateInput(experience.endDate),
        description: experience.description || '',
      })),
      education: profile.educations.map((education) => ({
        id: education.id,
        school: education.school,
        degree: education.degree,
        location: '',
        startDate: toDateInput(education.startDate),
        endDate: toDateInput(education.endDate),
      })),
      skills: profile.skills || [],
    },
  };
}

function coerceDraftContent(value: unknown): ResumeDocumentData | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<ResumeDocumentData>;
  if (!candidate.contactInfo || typeof candidate.contactInfo !== 'object') {
    return null;
  }

  return {
    contactInfo: {
      name: candidate.contactInfo.name || '',
      email: candidate.contactInfo.email || '',
      phone: candidate.contactInfo.phone || '',
      location: candidate.contactInfo.location || '',
    },
    summary: candidate.summary || '',
    experience: Array.isArray(candidate.experience) ? candidate.experience : [],
    education: Array.isArray(candidate.education) ? candidate.education : [],
    skills: Array.isArray(candidate.skills) ? candidate.skills : [],
  };
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

  const [managedWorkspaces, discoveryJobs, profile] = await Promise.all([
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
            salary: true,
            sourceUrl: true,
            compositeScore: true,
          },
        },
        application: {
          select: {
            status: true,
            createdAt: true,
            appliedAt: true,
          },
        },
        resumes: {
          select: {
            id: true,
            title: true,
            documentState: true,
            updatedAt: true,
            content: true,
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            notes: true,
          },
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
        salary: true,
        sourceUrl: true,
        postedAt: true,
        compositeScore: true,
      },
    }),
    prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        updatedAt: true,
        contactInfo: true,
        skills: true,
        experiences: {
          select: {
            id: true,
            company: true,
            position: true,
            location: true,
            startDate: true,
            endDate: true,
            description: true,
          },
          orderBy: [{ current: 'desc' }, { startDate: 'desc' }],
        },
        educations: {
          select: {
            id: true,
            school: true,
            degree: true,
            startDate: true,
            endDate: true,
          },
          orderBy: { startDate: 'desc' },
        },
      },
    }),
  ]);

  const profileDraftSeed = buildProfileDraftSeed(profile);

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
      jobId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      sourceUrl: job.sourceUrl,
      salary: job.salary,
      stage: 'NEW' as CockpitStage,
      createdAt: toIsoString(job.postedAt),
      updatedAt: toIsoString(job.postedAt),
      workspaceId: null,
      workspaceStatus: null,
      legacyStatus: null,
      noteCount: 0,
      resumes: [],
      compositeScore: job.compositeScore ?? null,
      draftSeed: null,
    })),
    ...managedWorkspaces.map((workspace) => {
      const stage =
        deriveCockpitStage({
          workspaceStatus: workspace.status,
          legacyStatus: workspace.application?.status ?? null,
          resumeStates: workspace.resumes.map((resume) => resume.documentState),
        }) ?? 'INTERESTED';
      const workingDraft =
        workspace.resumes.find((resume) => resume.documentState === 'WORKING_DRAFT') ||
        workspace.resumes.find((resume) => resume.documentState === 'SAVED_VARIANT');
      const workingDraftContent = coerceDraftContent(workingDraft?.content);

      return {
        id: workspace.id,
        kind: 'managed' as const,
        jobId: workspace.jobId,
        title: workspace.job.title,
        company: workspace.job.company,
        location: workspace.job.location,
        description: workspace.job.description,
        sourceUrl: workspace.job.sourceUrl,
        salary: workspace.job.salary,
        stage,
        createdAt: workspace.application?.appliedAt
          ? toIsoString(workspace.application.appliedAt)
          : workspace.application?.createdAt
            ? toIsoString(workspace.application.createdAt)
            : toIsoString(workspace.createdAt),
        updatedAt: toIsoString(workspace.updatedAt),
        workspaceId: workspace.id,
        workspaceStatus: workspace.status,
        legacyStatus: workspace.application?.status ?? null,
        noteCount: workspace._count.notes,
        resumes: workspace.resumes.map((resume) => ({
          id: resume.id,
          title: resume.title,
          documentState: resume.documentState,
          updatedAt: toIsoString(resume.updatedAt),
        })),
        compositeScore: workspace.job.compositeScore ?? null,
        draftSeed: workingDraftContent
          ? {
              source: 'working-draft' as const,
              updatedAt: toIsoString(workingDraft?.updatedAt),
              content: workingDraftContent,
            }
          : profileDraftSeed
            ? {
                source: 'career-data' as const,
                updatedAt: profileDraftSeed.updatedAt,
                content: profileDraftSeed.content,
              }
            : null,
      };
    }),
  ];

  return (
    <CockpitWireframeClient
      userName={user.name ?? user.email}
      viewModel={viewModel}
      panelRecords={panelRecords}
    />
  );
}
