
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, AutomationConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export function AutomationSettings() {
    const { config, updateConfig, isLoading } = useConfig();

    const form = useForm<AutomationConfig>({
        defaultValues: config?.automation || {
            dailyApplicationLimit: 20,
            autoApply: false,
            requireManualReview: true
        },
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

    // Reset when config loads
    React.useEffect(() => {
        if (config?.automation) {
            form.reset(config.automation);
        }
    }, [config, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="dailyApplicationLimit"
                        rules={{ required: 'Daily limit is required', min: 1, max: 100 }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Daily Application Limit</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        onChange={e => field.onChange(parseInt(e.target.value))}
                                        placeholder="20"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Maximum number of applications to submit per day (Max 100)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="autoApply"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Enable automatic job applications
                                    </FormLabel>
                                    <FormDescription>
                                        Allow the system to automatically apply to jobs matching your criteria.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requireManualReview"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Require manual review before applying
                                    </FormLabel>
                                    <FormDescription>
                                        You will need to manually approve each application before it is sent.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    {form.watch('autoApply') && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                Warning: Automatic applications will use your configured LLM to generate tailored resumes and
                                cover letters. Ensure your LLM settings are correct and you have sufficient API credits.
                            </p>
                        </div>
                    )}
                </div>

                <Button type="submit">Save Settings</Button>
            </form>
        </Form>
    );
}
