'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Terminal, Activity, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SimulationSettings() {
    const [isRunning, setIsRunning] = useState(false);
    const [jobsPerHour, setJobsPerHour] = useState(10);
    const [junkRatio, setJunkRatio] = useState(0.5);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/simulation');
            const data = await res.json();
            setIsRunning(data.isRunning);
            setJobsPerHour(data.config.jobsPerHour);
            setJunkRatio(data.config.junkRatio);
        } finally {
            setLoading(false);
        }
    };

    const toggleSimulation = async (checked: boolean) => {
        setIsRunning(checked);
        await fetch('/api/simulation', {
            method: 'POST',
            body: JSON.stringify({ action: checked ? 'START' : 'STOP' })
        });
    };

    const updateConfig = async (newJobsPerHour: number, newJunkRatio: number) => {
        setJobsPerHour(newJobsPerHour);
        setJunkRatio(newJunkRatio);
        // Debouncing would be good here, but for an MVP direct update is fine
        await fetch('/api/simulation', {
            method: 'POST',
            body: JSON.stringify({
                action: 'UPDATE',
                jobsPerHour: newJobsPerHour,
                junkRatio: newJunkRatio
            })
        });
    };

    if (loading) return null;

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Chronos Simulator</h3>
                        <p className="text-sm text-slate-400">Inject synthetic market data</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-green-500/20 text-green-400" : ""}>
                        {isRunning ? 'ACTIVE' : 'IDLE'}
                    </Badge>
                    <Switch
                        checked={isRunning}
                        onCheckedChange={toggleSimulation}
                    />
                </div>
            </div>

            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Jobs Ingress / Hour</Label>
                        <span className="text-sm font-mono text-purple-400">{jobsPerHour} jobs</span>
                    </div>
                    <Slider
                        value={[jobsPerHour]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(vals) => updateConfig(vals[0], junkRatio)}
                        className="py-2"
                    />
                    <p className="text-xs text-slate-500">
                        Higher values simulate high-volume markets like NYC or Remote.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <Label className="text-slate-300">Market Noise (Junk Ratio)</Label>
                        <span className="text-sm font-mono text-orange-400">{(junkRatio * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                        value={[junkRatio]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={(vals) => updateConfig(jobsPerHour, vals[0])}
                        className="py-2"
                    />
                    <p className="text-xs text-slate-500">
                        0% = Only Elite Matches. 100% = Pure Chaos.
                    </p>
                </div>
            </div>

            {isRunning && (
                <div className="mt-6 p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                    <Activity className="w-4 h-4 animate-pulse text-green-500" />
                    Chronos is running. Check the Triage Feed for new signals.
                </div>
            )}
        </GlassCard>
    );
}
