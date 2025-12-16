
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { Page } from '@/components/layout/Page';
import { Section } from '@/components/layout/Section';

export default async function PipelinePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        include: { job: true },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <Page width="wide" className="h-[calc(100vh-100px)] flex flex-col">
            <Section
                title="Application Pipeline"
                description="Manage your applications and track your progress."
                className="flex-none"
            />
            <div className="flex-1 min-h-0">
                <KanbanBoard initialApplications={applications} />
            </div>
        </Page>
    );
}
