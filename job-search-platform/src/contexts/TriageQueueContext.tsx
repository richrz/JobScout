'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

export type TriageAction = 'INTERESTED' | 'PASSED';

interface QueuedItem {
    jobId: string;
    action: TriageAction;
    timestamp: number;
}

interface TriageQueueContextType {
    queue: QueuedItem[];
    addToQueue: (jobId: string, action: TriageAction) => void;
    undoLastAction: () => QueuedItem | null;
    commitQueue: () => Promise<void>;
    isCommitting: boolean;
}

const TriageQueueContext = createContext<TriageQueueContextType | undefined>(undefined);

export function TriageQueueProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<QueuedItem[]>([]);
    const [isCommitting, setIsCommitting] = useState(false);

    const addToQueue = useCallback(async (jobId: string, action: TriageAction) => {
        const item: QueuedItem = { jobId, action, timestamp: Date.now() };

        // Instant Save (Auto-commit)
        setIsCommitting(true);
        try {
            await fetch('/api/triage/batch-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [item] })
            });
            // We don't add to 'queue' state to avoid the floating button appearing.
            // This means we are now in "Instant Mode".
        } catch (error) {
            console.error('Failed to auto-save action', error);
            toast.error('Failed to save action. Please try again.');
        } finally {
            setIsCommitting(false);
        }

        toast(action === 'INTERESTED' ? '✓ Added to pipeline' : 'Passed', {
            description: action === 'INTERESTED' ? 'Now in your Interested stage.' : 'Moved to Passed Bin.',
            duration: 2000
        });
    }, []);

    const undoLastAction = useCallback(() => {
        // Undo is disabled in Instant Mode for now as it requires backend rollback.
        // We notify the user.
        toast.info('Undo not available in instant mode yet.');
        return null;
    }, []);

    const commitQueue = useCallback(async () => {
        // No-op in instant mode
    }, []);

    return (
        <TriageQueueContext.Provider value={{ queue, addToQueue, undoLastAction, commitQueue, isCommitting }}>
            {children}
        </TriageQueueContext.Provider>
    );
}

export function useTriageQueue() {
    const context = useContext(TriageQueueContext);
    if (context === undefined) {
        throw new Error('useTriageQueue must be used within a TriageQueueProvider');
    }
    return context;
}
