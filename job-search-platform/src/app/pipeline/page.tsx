import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';

export default async function PipelinePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const applications = await prisma.application.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            job: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Application Pipeline</h1>
            </div>
            <KanbanBoard initialApplications={applications} />
        </div>
    );
}
