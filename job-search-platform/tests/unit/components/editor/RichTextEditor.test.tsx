/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { RichTextEditor } from '../../../../src/components/ui/RichTextEditor';
import '@testing-library/jest-dom';

describe('RichTextEditor', () => {
  test('renders editor with placeholder', () => {
    const { container } = render(<RichTextEditor content="" onChange={() => {}} placeholder="Describe your experience..." />);
    // Tiptap renders placeholder as data attribute
    const placeholderElement = container.querySelector('[data-placeholder="Describe your experience..."]');
    expect(placeholderElement).toBeInTheDocument();
  });
});
