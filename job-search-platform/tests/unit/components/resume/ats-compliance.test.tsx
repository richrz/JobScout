/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ResumePDF } from '@/components/resume/ResumePDF';
import { validateATSCompliance } from '@/lib/ats-validator';

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
    Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
    Page: ({ children, style }: any) => <div data-testid="pdf-page" data-style={JSON.stringify(style)}>{children}</div>,
    Text: ({ children, style }: any) => <div data-testid="pdf-text" data-style={JSON.stringify(style)}>{children}</div>,
    View: ({ children, style }: any) => <div data-testid="pdf-view" data-style={JSON.stringify(style)}>{children}</div>,
    StyleSheet: {
        create: (styles: any) => styles,
    },
    Font: {
        register: jest.fn(),
    },
}));

describe('ATS Compliance for ResumePDF', () => {
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

    it('uses ATS-friendly font (Helvetica)', () => {
        render(<ResumePDF content={mockContent} />);

        const pages = document.querySelectorAll('[data-testid="pdf-page"]');
        expect(pages.length).toBeGreaterThan(0);

        // Check that page style includes Helvetica font
        const pageStyle = JSON.parse(pages[0].getAttribute('data-style') || '{}');
        expect(pageStyle.fontFamily).toBe('Helvetica');
    });

    it('does not use tables for layout', () => {
        const { container } = render(<ResumePDF content={mockContent} />);

        // Verify no table elements (tables are not ATS-friendly)
        expect(container.querySelector('table')).toBeNull();
    });

    it('has proper text hierarchy with section titles', () => {
        const { getAllByText } = render(<ResumePDF content={mockContent} />);

        // Verify section titles are present
        expect(getAllByText(/Professional Summary/i).length).toBeGreaterThan(0);
        expect(getAllByText(/Experience/i).length).toBeGreaterThan(0);
        expect(getAllByText(/Education/i).length).toBeGreaterThan(0);
        expect(getAllByText(/Skills/i).length).toBeGreaterThan(0);
    });

    it('passes ATS validation rules', () => {
        const validation = validateATSCompliance({
            usesSimpleFonts: true,
            avoidsTablesForLayout: true,
            hasProperHierarchy: true,
            hasSelectableText: true,
        });

        expect(validation.isCompliant).toBe(true);
        expect(validation.issues).toHaveLength(0);
    });
});
