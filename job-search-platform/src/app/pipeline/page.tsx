import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { PipelineHeader } from '@/components/pipeline/PipelineHeader';
import { Search } from 'lucide-react';
import { shouldHideFromPipeline } from '@/lib/opportunities/passed-bin';

export default async function PipelinePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const [applications, workspaces] = await Promise.all([
        prisma.application.findMany({
            where: { userId: session.user.id },
            include: { job: true },
            orderBy: { updatedAt: 'desc' }
        }),
        prisma.workspace.findMany({
            where: { userId: session.user.id },
            select: {
                id: true,
                jobId: true,
                status: true,
                resumes: {
                    select: {
                        id: true,
                        title: true,
                        documentState: true,
                        pdfSnapshot: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    }
                }
            }
        })
    ]);

    const workspaceByJobId = new Map(workspaces.map((workspace) => [workspace.jobId, workspace]));
    const visibleApplications = applications
        .map((application) => ({
            ...application,
            workspace: workspaceByJobId.get(application.jobId) || null,
        }))
        .filter((application) => !shouldHideFromPipeline(application.workspace?.status || null));

    console.log(`[PipelinePage] User: ${session.user.id} (${session.user.email})`);
    console.log(`[PipelinePage] Applications found: ${visibleApplications.length}`);
    visibleApplications.forEach(a => console.log(` - App: ${a.job?.title} Status: ${a.status}`));

    // Count applications per stage
    const stageCounts = {
        interested: visibleApplications.filter(a => a.status === 'interested').length,
        applied: visibleApplications.filter(a => a.status === 'applied').length,
        screening: visibleApplications.filter(a => a.status === 'screening').length,
        interview: visibleApplications.filter(a => a.status === 'interview').length,
        offer: visibleApplications.filter(a => a.status === 'offer').length,
        rejected: visibleApplications.filter(a => a.status === 'rejected').length,
    };

    const interviewCount = stageCounts.interview;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            {/* Controls & Header */}
            <div className="flex flex-col gap-6 px-6 lg:px-10 py-8 shrink-0 border-b border-border">
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <PipelineHeader interviewCount={interviewCount} />
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between w-full">
                    {/* Search */}
                    <div className="w-full lg:max-w-[400px] h-10 group">
                        <div className="flex w-full h-full items-center rounded-full bg-card border border-border px-3 focus-within:border-primary transition-colors">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <input
                                className="w-full bg-transparent border-none text-foreground placeholder-muted-foreground focus:ring-0 text-sm ml-2"
                                placeholder="Search applications..."
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {['Date Added', 'Role Type', 'Salary Range'].map((filter) => (
                            <button
                                key={filter}
                                className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-card border border-border pl-4 pr-3 hover:border-muted-foreground transition-colors"
                            >
                                <p className="text-foreground text-xs font-medium">{filter}</p>
                                <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 min-h-0 overflow-x-auto p-6 lg:p-10">
                <KanbanBoard initialApplications={visibleApplications} />
            </div>
        </div>
    );
}
