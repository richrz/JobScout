import React from 'react';
import { useFormContext } from 'react-hook-form';

export function Step1Cities() {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cityName">City Name</label>
        <input
          id="cityName"
          {...register('cities.0.name')}
          className="border p-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="radius">Radius (miles)</label>
        <input
            id="radius"
            type="number"
            {...register('cities.0.radius_miles', { valueAsNumber: true })}
            className="border p-2 rounded"
        />
      </div>
    </div>
  );
}
