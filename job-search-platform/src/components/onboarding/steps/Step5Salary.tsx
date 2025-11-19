import React from 'react';
import { useFormContext } from 'react-hook-form';

export function Step5Salary() {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="minSalary" className="block font-medium">Minimum Salary (USD)</label>
        <input
          id="minSalary"
          type="number"
          {...register('salary_usd.min', { valueAsNumber: true })}
          className="w-full border p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="maxSalary" className="block font-medium">Maximum Salary (USD)</label>
        <input
          id="maxSalary"
          type="number"
          {...register('salary_usd.max', { valueAsNumber: true })}
          className="w-full border p-2 rounded"
        />
      </div>
    </div>
  );
}
