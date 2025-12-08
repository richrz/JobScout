'use client';

import React, { useRef } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function AdvancedSettings() {
    const { config, updateConfig } = useConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const exportConfig = () => {
        if (!config) return;

        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-search-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedConfig = JSON.parse(text);
            await updateConfig(importedConfig);
            alert('Configuration imported successfully!');
        } catch (error) {
            alert('Failed to import configuration. Please check the file format.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Export/Import Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Save your configuration as a JSON file or import from a previous export.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button type="button" onClick={exportConfig}>
                        Export Configuration
                    </Button>

                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={importConfig}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Import Configuration
                        </Button>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Export your configuration regularly to back up your settings.
                        You can also use this to transfer settings between different installations.
                    </p>
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Configuration Info</h3>
                {config && (
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Version:</dt>
                            <dd className="font-mono">{config.version}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Last Updated:</dt>
                            <dd>{new Date(config.lastUpdated).toLocaleString()}</dd>
                        </div>
                    </dl>
                )}
            </div>
        </div>
    );
}
