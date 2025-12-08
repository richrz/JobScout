'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, AutomationConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function AutomationSettings() {
    const { config, updateConfig, isLoading } = useConfig();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AutomationConfig>({
        defaultValues: config?.automation,
    });

    const onSubmit = async (data: AutomationConfig) => {
        try {
            await updateConfig({ automation: data });
            alert('Automation settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="dailyApplicationLimit">Daily Application Limit</Label>
                    <Input
                        id="dailyApplicationLimit"
                        type="number"
                        {...register('dailyApplicationLimit', {
                            required: 'Daily limit is required',
                            valueAsNumber: true,
                            min: { value: 1, message: 'Must be at least 1' },
                            max: { value: 100, message: 'Maximum 100 applications per day' }
                        })}
                        placeholder="20"
                    />
                    {errors.dailyApplicationLimit && (
                        <p className="text-sm text-red-500 mt-1">{errors.dailyApplicationLimit.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                        Maximum number of applications to submit per day
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="autoApply"
                        checked={watch('autoApply')}
                        onCheckedChange={(checked) => setValue('autoApply', !!checked)}
                    />
                    <Label htmlFor="autoApply" className="font-normal">
                        Enable automatic job applications
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="requireManualReview"
                        checked={watch('requireManualReview')}
                        onCheckedChange={(checked) => setValue('requireManualReview', !!checked)}
                    />
                    <Label htmlFor="requireManualReview" className="font-normal">
                        Require manual review before applying
                    </Label>
                </div>

                {watch('autoApply') && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Automatic applications will use your configured LLM to generate tailored resumes and
                            cover letters. Ensure your LLM settings are correct and you have sufficient API credits.
                        </p>
                    </div>
                )}
            </div>

            <Button type="submit">Save Settings</Button>
        </form>
    );
}
