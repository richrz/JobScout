import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Step2Titles() {
  const { register, watch, setValue } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const categories = watch('categories') || [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        setValue('categories', [...categories, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setValue('categories', newCategories);
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium">Target Job Titles</label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a job title (e.g. Frontend Developer) and press Enter"
        className="w-full border p-2 rounded"
      />
      <div className="flex flex-wrap gap-2">
        {categories.map((cat: string, index: number) => (
          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
            {cat}
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {/* Hidden input to register field for validation if needed, though setValue handles it */}
      <input type="hidden" {...register('categories')} />
    </div>
  );
}
