'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useConfig, SearchConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SearchSettings() {
    const { config, updateConfig, isLoading } = useConfig();
    const { register, handleSubmit, formState: { errors } } = useForm<SearchConfig>({
        defaultValues: config?.search,
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="cities">Cities (comma-separated)</Label>
                    <Input
                        id="cities"
                        {...register('cities', {
                            setValueAs: (v) => v ? v.split(',').map((s: string) => s.trim()) : []
                        })}
                        placeholder="New York, San Francisco, Remote"
                        defaultValue={config?.search.cities.join(', ')}
                    />
                </div>

                <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                        id="keywords"
                        {...register('keywords', {
                            setValueAs: (v) => v ? v.split(',').map((s: string) => s.trim()) : []
                        })}
                        placeholder="React, TypeScript, Node.js"
                        defaultValue={config?.search.keywords.join(', ')}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="minSalary">Min Salary</Label>
                        <Input
                            id="minSalary"
                            type="number"
                            {...register('minSalary', { valueAsNumber: true })}
                            placeholder="80000"
                        />
                    </div>

                    <div>
                        <Label htmlFor="maxSalary">Max Salary</Label>
                        <Input
                            id="maxSalary"
                            type="number"
                            {...register('maxSalary', { valueAsNumber: true })}
                            placeholder="150000"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="recencyDays">Job Recency (days)</Label>
                    <Input
                        id="recencyDays"
                        type="number"
                        {...register('recencyDays', {
                            required: 'Recency is required',
                            valueAsNumber: true,
                            min: { value: 1, message: 'Must be at least 1 day' }
                        })}
                        placeholder="30"
                    />
                    {errors.recencyDays && (
                        <p className="text-sm text-red-500 mt-1">{errors.recencyDays.message}</p>
                    )}
                </div>
            </div>

            <Button type="submit">Save Settings</Button>
        </form>
    );
}
