import React, { useState } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { useAutoSave } from '@/hooks/useAutoSave';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calculateCompleteness, Profile } from '@/lib/profile-utils';

const sections = [
  { id: 'contact', title: 'Contact Information' },
  { id: 'work', title: 'Work History' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'projects', title: 'Projects' },
  { id: 'certifications', title: 'Certifications' }
];

function WorkHistorySection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workHistory'
  });

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => append({ id: Date.now().toString(), description: '' })}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Job
      </button>
      {fields.map((field, index) => (
        <div key={field.id} className="border p-4 rounded space-y-4">
          <input
            {...control.register(`workHistory.${index}.company`)}
            placeholder="Company"
            className="w-full border p-2 rounded"
          />
          <div className="h-64">
            <label className="block font-medium mb-2">Description</label>
            {/* RichTextEditor Integration - needing Controller for real usage */}
            <div className="border rounded h-48 bg-gray-50 flex items-center justify-center text-gray-400">
               (Rich Editor Placeholder for Index {index})
            </div>
          </div>
          <button onClick={() => remove(index)} className="text-red-600">Remove</button>
        </div>
      ))}
    </div>
  );
}

export function ProfileBuilder() {
  const [activeSection, setActiveSection] = useState('contact');
  const [saveStatus, setSaveStatus] = useState('Saved');
  
  const methods = useForm<Profile>({
    defaultValues: {
      contactInfo: {},
      workHistory: [],
      education: [],
      skills: [],
      projects: [],
      certifications: []
    }
  });

  const handleSave = async (data: Profile) => {
    setSaveStatus('Saving...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved data:', data);
    setSaveStatus('Saved');
  };

  const values = methods.watch();
  const progress = calculateCompleteness(values);

  useAutoSave(values, handleSave, 2000);

  return (
    <FormProvider {...methods}>
      <div className="flex h-full flex-col">
        <div className="bg-white border-b p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Profile Builder</h1>
            <span className="text-sm text-gray-500">{saveStatus}</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
        <div className="flex flex-1">
          <div className="w-64 bg-gray-100 p-4 border-r">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
            {activeSection === 'work' && <WorkHistorySection />}
            {/* Other sections would go here */}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
