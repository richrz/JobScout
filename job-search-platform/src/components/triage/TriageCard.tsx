'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Building2, MapPin, DollarSign, Calendar, Check, X } from 'lucide-react';
import { useState } from 'react';

// Ayu Dark (Neutralized)
const colors = {
    bg: '#0a0a0a',      // True neutral black/gray
    surface: '#171717', // True neutral dark gray (Zinc-900)
    surfaceHighlight: '#262626',
    border: '#262626',
    textPrimary: '#ededed',
    textMuted: '#a1a1aa',
    accent: '#7fd962', // Money Green
    accentDim: 'rgba(127, 217, 98, 0.1)',
    danger: '#ef4444',
    dangerDim: 'rgba(239, 68, 68, 0.1)',
};

export interface TriageJob {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string | null;
    description: string;
    postedAt: string;
    source: string;
}

interface TriageCardProps {
    job: TriageJob;
    onSwipe: (direction: 'left' | 'right') => void;
    index: number;
}

export function TriageCard({ job, onSwipe, index }: TriageCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const overlayRightOpacity = useTransform(x, [0, 150], [0, 0.6]);
    const overlayLeftOpacity = useTransform(x, [-150, 0], [0.6, 0]);

    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        const swipeThreshold = 100;
        if (info.offset.x > swipeThreshold) {
            onSwipe('right');
        } else if (info.offset.x < -swipeThreshold) {
            onSwipe('left');
        }
    };

    if (index > 2) return null;

    return (
        <motion.div
            style={{
                x: index === 0 ? x : 0,
                rotate: index === 0 ? rotate : 0,
                zIndex: 100 - index,
                y: index * 8,
                scale: 1 - index * 0.04,
                opacity: index === 0 ? opacity : 1 - index * 0.25,
            }}
            drag={index === 0 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="absolute w-full max-w-md cursor-grab active:cursor-grabbing origin-bottom"
        >
            <div
                className="h-[480px] rounded-2xl overflow-hidden flex flex-col"
                style={{
                    backgroundColor: colors.surface,
                    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7)'
                }}
            >
                {/* Swipe Indicators */}
                <motion.div
                    style={{ opacity: overlayRightOpacity }}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                    <div
                        className="rounded-2xl p-5 transform rotate-12 font-bold text-3xl uppercase tracking-wider"
                        style={{
                            border: `3px solid ${colors.accent}`,
                            color: colors.accent,
                            backgroundColor: colors.accentDim
                        }}
                    >
                        Save
                    </div>
                </motion.div>

                <motion.div
                    style={{ opacity: overlayLeftOpacity }}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                    <div
                        className="rounded-2xl p-5 transform -rotate-12 font-bold text-3xl uppercase tracking-wider"
                        style={{
                            border: `3px solid ${colors.danger}`,
                            color: colors.danger,
                            backgroundColor: colors.dangerDim
                        }}
                    >
                        Pass
                    </div>
                </motion.div>

                {/* Card Content */}
                <div className="p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="space-y-3 mb-5">
                        <h2
                            className="text-2xl font-bold line-clamp-2"
                            style={{ color: colors.textPrimary }}
                        >
                            {job.title}
                        </h2>
                        <div className="flex items-center gap-2" style={{ color: colors.textMuted }}>
                            <Building2 className="w-4 h-4" style={{ color: colors.accent }} />
                            <span className="font-medium">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: colors.textMuted }}>
                            <MapPin className="w-4 h-4" style={{ color: colors.textMuted }} />
                            <span>{job.location}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex-1 overflow-hidden relative">
                        <div
                            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                            style={{ background: `linear-gradient(to bottom, transparent, ${colors.surface})` }}
                        />
                        <p
                            className="text-sm leading-relaxed line-clamp-[8]"
                            style={{ color: colors.textMuted }}
                        >
                            {job.description}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="pt-4 flex flex-wrap gap-2 mt-auto">
                        {job.salary && (
                            <span
                                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                                style={{
                                    backgroundColor: colors.accentDim,
                                    color: colors.accent
                                }}
                            >
                                <DollarSign className="w-3 h-3" />
                                {job.salary}
                            </span>
                        )}
                        <span
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: colors.textMuted
                            }}
                        >
                            <Calendar className="w-3 h-3" />
                            {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                        <span
                            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: colors.textMuted
                            }}
                        >
                            {job.source}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Action Buttons - Ayu Dark styled
export function TriageActions({ onPass, onSave, disabled }: { onPass: () => void, onSave: () => void, disabled?: boolean }) {
    return (
        <div className="flex items-center justify-center gap-8 mt-10">
            <button
                onClick={onPass}
                disabled={disabled}
                className="w-16 h-16 rounded-full transition-all transform hover:scale-110 flex items-center justify-center"
                style={{
                    backgroundColor: colors.surface,
                    border: `2px solid ${colors.danger}`,
                    color: colors.danger,
                    boxShadow: `0 8px 24px ${colors.dangerDim}`
                }}
            >
                <X className="w-7 h-7" />
            </button>
            <button
                onClick={onSave}
                disabled={disabled}
                className="w-16 h-16 rounded-full transition-all transform hover:scale-110 flex items-center justify-center"
                style={{
                    backgroundColor: colors.surface,
                    border: `2px solid ${colors.accent}`,
                    color: colors.accent,
                    boxShadow: `0 8px 24px ${colors.accentDim}`
                }}
            >
                <Check className="w-7 h-7" />
            </button>
        </div>
    );
}
