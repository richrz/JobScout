/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPage } from '@/components/settings/SettingsPage';

// Mock tabs component
jest.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, defaultValue, onValueChange }: any) => (
        <div data-testid="tabs" data-default-value={defaultValue}>
            {children}
        </div>
    ),
    TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ children, value, onClick }: any) => (
        <button data-testid={`tab-trigger-${value}`} data-value={value} onClick={onClick}>
            {children}
        </button>
    ),
    TabsContent: ({ children, value }: any) => (
        <div data-testid={`tab-content-${value}`} data-value={value}>
            {children}
        </div>
    ),
}));

describe('SettingsPage', () => {
    it('renders all tab triggers', () => {
        render(<SettingsPage />);

        expect(screen.getByTestId('tab-trigger-search')).toBeInTheDocument();
        expect(screen.getByTestId('tab-trigger-llm')).toBeInTheDocument();
        expect(screen.getByTestId('tab-trigger-automation')).toBeInTheDocument();
        expect(screen.getByTestId('tab-trigger-advanced')).toBeInTheDocument();
    });

    it('renders all tab content sections', () => {
        render(<SettingsPage />);

        expect(screen.getByTestId('tab-content-search')).toBeInTheDocument();
        expect(screen.getByTestId('tab-content-llm')).toBeInTheDocument();
        expect(screen.getByTestId('tab-content-automation')).toBeInTheDocument();
        expect(screen.getByTestId('tab-content-advanced')).toBeInTheDocument();
    });

    it('displays correct tab labels', () => {
        render(<SettingsPage />);

        // Use more specific queries since these texts appear in both triggers and content
        const triggers = screen.getAllByText('Search Parameters');
        expect(triggers.length).toBeGreaterThan(0);
        expect(screen.getAllByText('LLM Configuration').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Automation').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Advanced').length).toBeGreaterThan(0);
    });
});
