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
import {
  buildDiscoveryMatcher,
  scoreDiscoveryJob,
} from '@/lib/cockpit-discovery';
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
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        salary: true,
        skillsTags: true,
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
  const normalizedContact = normalizeContactInfo(
    (typeof profile?.contactInfo === 'object' && profile?.contactInfo
      ? profile.contactInfo
      : {}) as Parameters<typeof normalizeContactInfo>[0],
  );
  const discoveryMatcher = buildDiscoveryMatcher(
    profile
      ? {
          skills: profile.skills ?? [],
          summary: normalizedContact.summary || '',
          experiences: profile.experiences.map((experience) => ({
            position: experience.position,
            description: experience.description || '',
            company: experience.company,
          })),
        }
      : null,
  );

  const filteredDiscoveryJobs = discoveryJobs.filter((job) => {
    const location = job.location?.toLowerCase() ?? '';
    const inKansasCityMetro = discoveryMatcher.locationTerms.some((term) => location.includes(term));
    if (!inKansasCityMetro) {
      return false;
    }

    const title = job.title.toLowerCase();
    const description = job.description.toLowerCase();
    const skills = (job.skillsTags ?? []).map((skill) => skill.toLowerCase());

    const roleMatch = discoveryMatcher.roleTerms.some(
      (term) => title.includes(term) || description.includes(term),
    );
    const domainMatch = discoveryMatcher.domainTerms.some(
      (term) => title.includes(term) || description.includes(term),
    );
    const skillMatch = discoveryMatcher.skillTerms.some((term) =>
      skills.some((skill) => skill.includes(term) || term.includes(skill)),
    );

    return roleMatch || domainMatch || skillMatch;
  });

  const rankedDiscoveryJobs = [...filteredDiscoveryJobs].sort((left, right) => {
    const fitDiff =
      scoreDiscoveryJob(right, discoveryMatcher) - scoreDiscoveryJob(left, discoveryMatcher);
    if (fitDiff !== 0) {
      return fitDiff;
    }

    const compositeDiff = (right.compositeScore ?? -1) - (left.compositeScore ?? -1);
    if (compositeDiff !== 0) {
      return compositeDiff;
    }

    return new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime();
  });

  const managedOpportunities: CockpitManagedOpportunityInput[] = managedWorkspaces.map(
    (workspace) => ({
      workspaceId: workspace.id,
      jobId: workspace.jobId,
      title: workspace.job.title,
      company: workspace.job.company,
      location: workspace.job.location,
      updatedAt: toIsoString(workspace.updatedAt),
      workspaceStatus: workspace.status,
      resumeStates: workspace.resumes.map((resume) => resume.documentState),
      compositeScore: workspace.job.compositeScore,
    }),
  );

  const discoveryInputs: CockpitDiscoveryJobInput[] = rankedDiscoveryJobs.map((job) => ({
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
    kanbanLimit: 4,
    perStageLimits: {
      NEW: discoveryInputs.length,
    },
    treatDiscoveryAsMatched: true,
  });

  const panelRecords: CockpitPanelRecord[] = [
    ...rankedDiscoveryJobs.map((job) => ({
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
      noteCount: 0,
      resumes: [],
      compositeScore: job.compositeScore ?? null,
      draftSeed: null,
    })),
    ...managedWorkspaces.map((workspace) => {
      const stage =
        deriveCockpitStage({
          workspaceStatus: workspace.status,
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
      initialNewVisibleCount={4}
    />
  );
}
