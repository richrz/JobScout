/**
 * useCockpitPipeline — fetches real workspace data for the cockpit
 *
 * Returns workspaces grouped by stage with job metadata,
 * plus helpers for stage transitions and note persistence.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export interface PipelineWorkspace {
    id: string;
    userId: string;
    jobId: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        salary: string | null;
        compositeScore: number | null;
        sourceUrl: string;
    };
    _count: {
        notes: number;
        artifacts: number;
        resumes: number;
    };
}

export interface CockpitPipeline {
    pipeline: Record<string, PipelineWorkspace[]>;
    total: number;
}

export function useCockpitPipeline() {
    const [data, setData] = useState<CockpitPipeline | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/cockpit/pipeline');
            if (!res.ok) {
                // If 401, user may not be logged in — return empty pipeline
                if (res.status === 401) {
                    setData({ pipeline: {}, total: 0 });
                    setError(null);
                    return;
                }
                throw new Error(`Pipeline fetch failed: ${res.status}`);
            }
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    /** Update workspace status (stage transition) */
    const transitionStage = useCallback(async (workspaceId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Transition failed');
            await refresh(); // re-fetch pipeline after transition
        } catch (e) {
            console.error('Stage transition error:', e);
            throw e;
        }
    }, [refresh]);

    /** Save a note to a workspace */
    const saveNote = useCallback(async (workspaceId: string, content: string) => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            if (!res.ok) throw new Error('Note save failed');
            return await res.json();
        } catch (e) {
            console.error('Note save error:', e);
            throw e;
        }
    }, []);

    /** Fetch notes for a workspace */
    const fetchNotes = useCallback(async (workspaceId: string) => {
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/notes`);
            if (!res.ok) throw new Error('Note fetch failed');
            const json = await res.json();
            return json.notes as { id: string; content: string; createdAt: string; updatedAt: string }[];
        } catch (e) {
            console.error('Note fetch error:', e);
            return [];
        }
    }, []);

    return {
        data,
        loading,
        error,
        refresh,
        transitionStage,
        saveNote,
        fetchNotes,
    };
}
