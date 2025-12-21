import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TriageDeck } from '@/components/triage/TriageDeck';
import { PillNav } from '@/components/layout/PillNav';
import { TriageQueueProvider } from '@/contexts/TriageQueueContext';
import { TriageFloat } from '@/components/triage/TriageFloat';

// Ayu Dark (Neutralized)
const colors = {
    bg: '#0a0a0a',
    surface: '#171717',
    border: '#262626',
    textPrimary: '#ededed',
    textMuted: '#a1a1aa',
    accent: '#7fd962', // Money Green
};

export default async function TriagePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
            <PillNav />
            <main className="container mx-auto px-4 pt-16 pb-32">
                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-10">
                    <h1
                        className="text-4xl font-bold mb-3"
                        style={{ color: colors.textPrimary }}
                    >
                        JobSwipe
                    </h1>
                    <p style={{ color: colors.textMuted }}>
                        Swipe right to save • Left to pass • Reach Inbox Zero
                    </p>
                </div>

                {/* Card Container */}
                <TriageQueueProvider>
                    <TriageDeck />
                    <TriageFloat />
                </TriageQueueProvider>
            </main>
        </div>
    );
}
