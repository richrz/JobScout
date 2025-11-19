import React from 'react';

interface ConfigActionsProps {
  onExport: () => void;
  onImport: (data: any) => void;
}

export function ConfigActions({ onExport, onImport }: ConfigActionsProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        onImport(json);
      } catch (error) {
        console.error('Invalid JSON', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex space-x-4">
      <button
        onClick={onExport}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Export Configuration
      </button>
      
      <label className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer">
        Import Configuration
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
