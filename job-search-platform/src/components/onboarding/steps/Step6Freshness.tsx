import React from 'react';
import { useFormContext } from 'react-hook-form';

export function Step6Freshness() {
  const { register } = useFormContext();

  const options = [
    { label: 'Last 24 Hours', value: 24 },
    { label: 'Last 3 Days', value: 72 },
    { label: 'Last 7 Days', value: 168 },
    { label: 'Last 30 Days', value: 720 }
  ];

  return (
    <div className="space-y-4">
      <label className="block font-medium">Job Freshness</label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2">
            <input
              type="radio"
              value={option.value}
              {...register('posted_within_hours', { valueAsNumber: true })}
              className="form-radio"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
