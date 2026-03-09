/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ResumeBuilder from '@/app/resume/ResumeBuilder';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
}));

jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent(props: any) {
    if (typeof props.children === 'function') {
      return props.children({ loading: false });
    }
    return <div data-testid="dynamic-component" />;
  };
});

jest.mock('@/components/resume/ResumePreview', () => ({
  ResumePreview: () => <div data-testid="resume-preview">Preview</div>,
}));

jest.mock('@/components/resume/AISettingsRail', () => ({
  AISettingsRail: () => <div data-testid="ai-settings-rail">AI Settings Rail</div>,
}));

jest.mock('@/components/resume/ResumePDF', () => ({
  ResumePDF: () => <div data-testid="resume-pdf">PDF</div>,
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <button type="button">{children}</button>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/lib/resume-generator', () => ({
  generateAndPreviewResume: jest.fn(),
}));

jest.mock('@/app/resume/actions', () => ({
  saveResume: jest.fn(),
}));

describe('ResumeBuilder drafting workspace shell', () => {
  it('renders one drafting workspace instead of tabs beside a detached preview pane', () => {
    render(
      <ResumeBuilder
        jobs={[{ id: 'job-1', title: 'Solutions Engineer', company: 'Acme' }]}
        initialProfile={{
          contactInfo: {
            name: 'Richard Ruiz',
            email: 'rruiz@example.com',
            phone: '(949) 743-4975',
            location: 'Colorado Springs, CO',
          },
          experiences: [],
          educations: [],
          skills: ['React', 'TypeScript'],
        }}
      />,
    );

    expect(screen.getByText('Draft Workspace')).toBeInTheDocument();
    expect(screen.getByText('Jump to section')).toBeInTheDocument();
    expect(screen.getByText('What the current draft looks like')).toBeInTheDocument();
    expect(screen.getByText(/Career Data is the source/i)).toBeInTheDocument();
    expect(screen.queryByText('Draft Sections')).not.toBeInTheDocument();
  });
});
