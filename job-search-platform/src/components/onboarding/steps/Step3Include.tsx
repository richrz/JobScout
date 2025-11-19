import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export function Step3Include() {
  const { register, watch, setValue } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const keywords = watch('include_keywords') || [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        setValue('include_keywords', [...keywords, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...keywords];
    newKeywords.splice(index, 1);
    setValue('include_keywords', newKeywords);
  };

  return (
    <div className="space-y-4">
      <label className="block font-medium">Keywords to Include</label>
      <p className="text-sm text-gray-500">Jobs MUST contain these words.</p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a keyword (e.g. Remote, React) and press Enter"
        className="w-full border p-2 rounded"
      />
      <div className="flex flex-wrap gap-2">
        {keywords.map((word: string, index: number) => (
          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
            {word}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="ml-2 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input type="hidden" {...register('include_keywords')} />
    </div>
  );
}
