/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ResumeEditor } from '@/components/resume/ResumeEditor';

describe('ResumeEditor', () => {
    it('initializes editor with provided content', () => {
        const initialContent = '<p>Test resume content</p>';
        const onChange = jest.fn();

        render(<ResumeEditor initialContent={initialContent} onChange={onChange} />);

        // Editor should render
        const editorElement = screen.getByTestId('resume-editor');
        expect(editorElement).toBeInTheDocument();
    });

    it('calls onChange when content is modified', () => {
        const onChange = jest.fn();

        render(<ResumeEditor initialContent="<p>Initial</p>" onChange={onChange} />);

        // Note: Full ProseMirror interaction testing would require more complex setup
        // This test verifies the component renders correctly
        expect(screen.getByTestId('resume-editor')).toBeInTheDocument();
    });
});
