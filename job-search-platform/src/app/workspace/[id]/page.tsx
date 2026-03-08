import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { ArtifactViewer } from '@/components/workspace/ArtifactViewer';
import { NotesEditor } from '@/components/workspace/NotesEditor';
import { StatusToggle } from '@/components/workspace/StatusToggle';
import { ResumeDocumentsPanel } from '@/components/workspace/ResumeDocumentsPanel';
import { ArrowLeft, Building2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspacePageProps {
    params: Promise<{ id: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const workspace = await prisma.workspace.findUnique({
        where: { id },
        include: {
            job: true,
            resumes: {
                orderBy: { createdAt: 'desc' }
            },
            artifacts: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!workspace) {
        notFound();
    }

    // Verify ownership
    if (workspace.userId !== session.user.id) {
        notFound();
    }

    const { job, artifacts, resumes } = workspace;

    return (
        <div className="min-h-screen w-full bg-background">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Back Button & Breadcrumbs */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/pipeline">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Pipeline
                        </Button>
                    </Link>
                </div>

                {/* Job Header */}
                <GlassCard variant="highlight" className="p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {job.company}
                                </span>
                                {job.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {job.location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Applied {new Date(workspace.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {job.salary && (
                                <p className="text-electric-green font-medium">{job.salary}</p>
                            )}
                        </div>
                        {job.sourceUrl && (
                            <a
                                href={job.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-cyan-400 hover:underline"
                            >
                                View Original Posting
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </GlassCard>

                {/* Status Section */}
                <div className="mb-8">
                    <StatusToggle
                        workspaceId={workspace.id}
                        currentStatus={workspace.status}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Artifacts */}
                    <div>
                        <ResumeDocumentsPanel
                            resumes={resumes.map((resume) => ({
                                id: resume.id,
                                title: resume.title,
                                documentState: resume.documentState,
                                pdfSnapshot: resume.pdfSnapshot,
                                createdAt: resume.createdAt.toISOString(),
                                content: JSON.stringify(resume.content, null, 2),
                            }))}
                        />

                        <ArtifactViewer
                            artifacts={artifacts.map(a => ({
                                ...a,
                                createdAt: a.createdAt.toISOString()
                            }))}
                            workspaceId={workspace.id}
                        />
                    </div>

                    {/* Right Column: Notes */}
                    <div>
                        <NotesEditor workspaceId={workspace.id} />
                    </div>
                </div>

                {/* Job Description */}
                <div className="mt-8">
                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Job Description</h3>
                        <div className="prose prose-invert max-w-none text-muted-foreground">
                            {job.description || 'No description available.'}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
