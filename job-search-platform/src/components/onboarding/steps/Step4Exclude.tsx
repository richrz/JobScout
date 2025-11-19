import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Step4Exclude() {
  const { register, watch, setValue } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const keywords = watch('exclude_keywords') || [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        setValue('exclude_keywords', [...keywords, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setValue('exclude_keywords', newKeywords);
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium">Keywords to Exclude</label>
      <p className="text-sm text-gray-500">Jobs containing these words will be hidden.</p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a keyword to exclude (e.g. Legacy, C#) and press Enter"
        className="w-full border p-2 rounded"
      />
      <div className="flex flex-wrap gap-2">
        {keywords.map((word: string, index: number) => (
          <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded flex items-center">
            {word}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input type="hidden" {...register('exclude_keywords')} />
    </div>
  );
}
