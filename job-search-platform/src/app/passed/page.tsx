import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PassedBinClient } from '@/components/passed/PassedBinClient';

export default async function PassedPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const workspaces = await prisma.workspace.findMany({
        where: {
            userId: session.user.id,
            status: 'PASSED',
        },
        include: {
            job: true,
            application: {
                select: {
                    id: true,
                    status: true,
                    updatedAt: true,
                }
            }
        },
        orderBy: {
            updatedAt: 'desc',
        }
    });

    return (
        <div className="w-full px-6 lg:px-8 py-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Passed Bin</h1>
                    <p className="text-muted-foreground text-base">
                        Recover opportunities you passed without losing the notes and document work behind them.
                    </p>
                </div>

                <PassedBinClient
                    items={workspaces.map((workspace) => ({
                        id: workspace.id,
                        jobId: workspace.jobId,
                        title: workspace.job.title,
                        company: workspace.job.company,
                        location: workspace.job.location,
                        updatedAt: workspace.updatedAt.toISOString(),
                        applicationStatus: workspace.application?.status || null,
                    }))}
                />
            </div>
        </div>
    );
}
