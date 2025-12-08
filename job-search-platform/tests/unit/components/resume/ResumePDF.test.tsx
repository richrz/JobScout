/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ResumePDF } from '@/components/resume/ResumePDF';

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
    Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
    Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
    Text: ({ children }: any) => <div data-testid="pdf-text">{children}</div>,
    View: ({ children }: any) => <div data-testid="pdf-view">{children}</div>,
    StyleSheet: {
        create: (styles: any) => styles,
    },
    Font: {
        register: jest.fn(),
    },
}));

describe('ResumePDF', () => {
    const mockContent = {
        contactInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            location: 'New York, NY',
        },
        summary: 'Experienced developer...',
        experience: [
            {
                id: '1',
                title: 'Senior Developer',
                company: 'Tech Corp',
                location: 'Remote',
                startDate: '2020-01',
                endDate: 'Present',
                description: 'Built amazing things',
            },
        ],
        education: [
            {
                id: '1',
                degree: 'BS Computer Science',
                school: 'University of Tech',
                location: 'City',
                startDate: '2016',
                endDate: '2020',
            },
        ],
        skills: ['React', 'TypeScript'],
    };

    it('renders resume content correctly', () => {
        const { getByText } = render(<ResumePDF content={mockContent} />);

        expect(getByText('John Doe')).toBeInTheDocument();
        expect(getByText('john@example.com | 123-456-7890 | New York, NY')).toBeInTheDocument();
        expect(getByText('Experienced developer...')).toBeInTheDocument();
        expect(getByText('Senior Developer')).toBeInTheDocument();
        expect(getByText('Tech Corp')).toBeInTheDocument();
    });
});
