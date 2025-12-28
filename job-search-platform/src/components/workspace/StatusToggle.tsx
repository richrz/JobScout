'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { ApplicationStatus } from '@prisma/client';
import { CheckCircle, Clock, Archive, Moon } from 'lucide-react';

interface StatusToggleProps {
    workspaceId: string;
    currentStatus: ApplicationStatus;
    onStatusChange?: (status: ApplicationStatus) => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
    APPLIED: {
        label: 'Applied',
        color: 'text-electric-green border-electric-green/50',
        icon: <CheckCircle className="w-4 h-4" />
    },
    FOLLOW_UP: {
        label: 'Follow Up',
        color: 'text-amber-400 border-amber-400/50',
        icon: <Clock className="w-4 h-4" />
    },
    DORMANT: {
        label: 'Dormant',
        color: 'text-muted-foreground border-border',
        icon: <Moon className="w-4 h-4" />
    },
    ARCHIVED: {
        label: 'Archived',
        color: 'text-slate-500 border-slate-500/50',
        icon: <Archive className="w-4 h-4" />
    }
};

export function StatusToggle({ workspaceId, currentStatus, onStatusChange }: StatusToggleProps) {
    const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
    const [updating, setUpdating] = useState(false);

    const updateStatus = async (newStatus: ApplicationStatus) => {
        if (newStatus === status) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setStatus(newStatus);
                onStatusChange?.(newStatus);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Application Status</h3>
            <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as ApplicationStatus[]).map((statusKey) => {
                    const config = STATUS_CONFIG[statusKey];
                    const isActive = status === statusKey;

                    return (
                        <button
                            key={statusKey}
                            onClick={() => updateStatus(statusKey)}
                            disabled={updating}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
                                ${isActive
                                    ? `${config.color} bg-white/5`
                                    : 'border-border/50 text-muted-foreground hover:border-border hover:bg-white/5'
                                }
                                ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {config.icon}
                            <span className="text-sm font-medium">{config.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
