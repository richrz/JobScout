'use client';

import { useState, useEffect } from 'react';
import { TriageCard, TriageJob, TriageActions } from './TriageCard';
import { GlassCard } from '@/components/ui/glass-card';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTriageQueue } from '@/contexts/TriageQueueContext';

export function TriageDeck() {
    const [jobs, setJobs] = useState<TriageJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/triage/feed?limit=20');
            const data = await res.json();
            setJobs(data.jobs || []);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const { addToQueue, undoLastAction } = useTriageQueue();

    // Listen to undo events (this is hacky but connects the Toast Undo button to the Deck state)
    // Ideally, the Context should expose "undoneItem" as a state change we listen to.
    // For now, let's just make the Toast undo function pass the item back to us via a callback or event?
    // Actually, simple way: We use the context state to re-hydrate the job list.

    // Instead of complex undo listeners, let's just rely on the QueueContext state.
    // But TriageDeck holds the `jobs` state. We need to push the job back IF an undo happens.

    // Refactor: We need a way to restore the job.
    // Let's modify the queue context to return the job ID upon undo, and we listen to it.

    // For MVP Speed:
    // We will just fetch the jobs again? No, that's slow.
    // We keep a "history" here locally just for visual restoration.
    const [actionHistory, setActionHistory] = useState<TriageJob[]>([]);

    const handleAction = async (jobId: string, action: 'INTERESTED' | 'DISMISSED') => {
        if (actionLoading) return;

        const job = jobs.find(j => j.id === jobId);
        if (!job) return;

        // 1. Optimistic UI Removal
        setJobs(prev => prev.filter(j => j.id !== jobId));

        // 2. Add to History (Stack)
        setActionHistory(prev => [...prev, job]);

        // 3. Add to Undo Queue (Context)
        addToQueue(jobId, action);
    };

    // Watch for Undo
    // This is tricky without a direct signal.
    // Let's add a "Restore" button locally or change TriageQueueContext to support a subscription.
    // For now, let's implement a manual "Undo" button on the UI as well, not just Toast.

    const triggerUndo = () => {
        const item = undoLastAction();
        if (item) {
            // Restore from history
            const history = [...actionHistory];
            const restoredJob = history.pop();

            if (restoredJob && restoredJob.id === item.jobId) {
                setJobs(prev => [restoredJob, ...prev]);
                setActionHistory(history);
            }
        }
    };

    if (loading && jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <RefreshCw className="w-10 h-10 animate-spin text-electric-green mb-4" />
                <p className="text-muted-foreground">Loading feed...</p>
            </div>
        );
    }

    if (!loading && jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
                <GlassCard className="p-8 max-w-md flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-electric-green/10 flex items-center justify-center mb-6">
                        <Inbox className="w-8 h-8 text-electric-green" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Inbox Zero!</h2>
                    <p className="text-muted-foreground mb-6">
                        You've triaged all available jobs. Great work!
                        Check back later for new opportunities.
                    </p>
                    <Button onClick={fetchJobs} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check Again
                    </Button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="relative w-full max-w-md h-[500px] mb-8">
                <AnimatePresence>
                    {jobs.map((job, index) => (
                        <TriageCard
                            key={job.id}
                            job={job}
                            index={index}
                            onSwipe={(direction) => {
                                const action = direction === 'right' ? 'INTERESTED' : 'DISMISSED';
                                handleAction(job.id, action);
                            }}
                        />
                    ))}
                </AnimatePresence>

                {jobs.length > 0 && (
                    /* Placeholder for empty space behind cards */
                    <div className="absolute inset-0 bg-transparent z-[-1]" />
                )}
            </div>

            {jobs.length > 0 && (
                <div className="flex flex-col gap-4 w-full max-w-md mb-24">
                    <TriageActions
                        onPass={() => handleAction(jobs[0].id, 'DISMISSED')}
                        onSave={() => handleAction(jobs[0].id, 'INTERESTED')}
                        disabled={actionLoading}
                    />
                    {actionHistory.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={triggerUndo} className="mx-auto text-muted-foreground hover:text-white">
                            Undo Last Swipe
                        </Button>
                    )}
                </div>
            )}

            <div className="mt-8 text-sm text-muted-foreground">
                <p>Use arrows keys or swipe cards to navigate</p>
            </div>
        </div>
    );
}
