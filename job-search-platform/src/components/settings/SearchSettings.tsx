
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, SearchConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

export function SearchSettings() {
    const { config, updateConfig, isLoading } = useConfig();

    const form = useForm<SearchConfig>({
        defaultValues: config?.search || {
            cities: [],
            keywords: [],
            minSalary: 0,
            maxSalary: 0,
            recencyDays: 30
        },
    });

    const onSubmit = async (data: SearchConfig) => {
        try {
            await updateConfig({ search: data });
            alert('Search settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Reset form when config loads
    React.useEffect(() => {
        if (config?.search) {
            form.reset(config.search);
        }
    }, [config, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="cities"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cities</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                        placeholder="New York, San Francisco, Remote"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Comma-separated list of cities to search in.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="keywords"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Keywords</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                                        onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()))}
                                        placeholder="React, TypeScript, Node.js"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Key technologies or roles to filter by.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="minSalary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Salary</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="80000"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxSalary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Salary</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            placeholder="150000"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="recencyDays"
                        rules={{ required: 'Recency is required', min: { value: 1, message: 'Must be at least 1 day' } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Recency (days)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        placeholder="30"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit">Save Settings</Button>
            </form>
        </Form>
    );
}
