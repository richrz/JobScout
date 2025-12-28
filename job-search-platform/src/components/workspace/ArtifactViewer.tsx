'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { FileText, Download, Eye } from 'lucide-react';

interface Artifact {
    id: string;
    type: string;
    name: string;
    content?: string | null;
    createdAt: string;
}

interface ArtifactViewerProps {
    artifacts: Artifact[];
    workspaceId: string;
}

export function ArtifactViewer({ artifacts, workspaceId }: ArtifactViewerProps) {
    const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const viewArtifact = async (artifact: Artifact) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/workspace/${workspaceId}/artifacts/${artifact.id}`);
            const data = await res.json();
            setSelectedArtifact(artifact);
            setContent(data.content || '[No content available]');
        } catch (error) {
            console.error('Failed to fetch artifact:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'RESUME':
                return <FileText className="w-5 h-5 text-electric-green" />;
            case 'COVER_LETTER':
                return <FileText className="w-5 h-5 text-cyan-400" />;
            default:
                return <FileText className="w-5 h-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Locked Artifacts</h3>
            <p className="text-sm text-muted-foreground">
                These documents were snapshotted at the time of application and cannot be modified.
            </p>

            <div className="grid gap-3">
                {artifacts.map((artifact) => (
                    <GlassCard key={artifact.id} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getIcon(artifact.type)}
                                <div>
                                    <p className="font-medium text-foreground">{artifact.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {artifact.type} • Locked {new Date(artifact.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewArtifact(artifact)}
                                    disabled={loading}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Content Preview Modal */}
            {selectedArtifact && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getIcon(selectedArtifact.type)}
                                <h4 className="font-semibold">{selectedArtifact.name}</h4>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedArtifact(null)}
                            >
                                ✕
                            </Button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-deep-space/50 p-4 rounded-lg">
                                {content}
                            </pre>
                        </div>
                    </GlassCard>
                </div>
            )}

            {artifacts.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                    No artifacts were saved for this application.
                </p>
            )}
        </div>
    );
}
