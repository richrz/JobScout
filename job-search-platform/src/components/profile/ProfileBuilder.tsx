import React, { useState } from 'react';

const sections = [
  { id: 'contact', title: 'Contact Information' },
  { id: 'work', title: 'Work History' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'projects', title: 'Projects' },
  { id: 'certifications', title: 'Certifications' }
];

export function ProfileBuilder() {
  const [activeSection, setActiveSection] = useState('contact');

  return (
    <div className="flex h-full">
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
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">
          {sections.find(s => s.id === activeSection)?.title}
        </h2>
        {/* Section content will go here */}
      </div>
    </div>
  );
}
