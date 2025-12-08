/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AppLayout } from '@/components/layout/AppLayout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

// Mock child components
jest.mock('@/components/layout/MobileNav', () => ({
    MobileNav: () => <div data-testid="mobile-nav">MobileNav</div>,
}));

jest.mock('@/components/theme-toggle', () => ({
    ThemeToggle: () => <button data-testid="theme-toggle">Toggle</button>,
}));

describe('AppLayout', () => {
    it('renders children', () => {
        render(
            <AppLayout>
                <div>Test Content</div>
            </AppLayout>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders desktop header', () => {
        render(
            <AppLayout>
                <div>Content</div>
            </AppLayout>
        );

        expect(screen.getByText('Job Search Platform')).toBeInTheDocument();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Jobs')).toBeInTheDocument();
        expect(screen.getByText('Pipeline')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders mobile navigation', () => {
        render(
            <AppLayout>
                <div>Content</div>
            </AppLayout>
        );

        expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
    });

    it('renders theme toggle', () => {
        render(
            <AppLayout>
                <div>Content</div>
            </AppLayout>
        );

        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
});
