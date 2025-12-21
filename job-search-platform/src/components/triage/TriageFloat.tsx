'use client';

import React from 'react';
import { useTriageQueue } from '@/contexts/TriageQueueContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';

// Ayu Dark Palette
const colors = {
    surface: '#151920',
    border: '#1c232e',
    accent: '#7fd962',
    accentDim: 'rgba(127, 217, 98, 0.2)',
    textDark: '#0d1017',
};

export function TriageFloat() {
    const { queue, commitQueue, isCommitting } = useTriageQueue();

    if (queue.length === 0) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <AnimatePresence>
                <motion.button
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={commitQueue}
                    disabled={isCommitting}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all"
                    style={{
                        backgroundColor: colors.accent,
                        color: colors.textDark,
                        boxShadow: `0 8px 32px ${colors.accentDim}`,
                        border: `1px solid rgba(255,255,255,0.2)`
                    }}
                >
                    {isCommitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>Save {queue.length} Changes</span>
                </motion.button>
            </AnimatePresence>
        </div>
    );
}
