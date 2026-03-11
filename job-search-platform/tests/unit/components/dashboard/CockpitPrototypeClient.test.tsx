/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import CockpitPrototypeClient from '@/app/dashboard-cockpit-prototype/CockpitPrototypeClient';

describe('CockpitPrototypeClient', () => {
  it('switches the single workspace when a different opportunity is selected in the river', () => {
    render(<CockpitPrototypeClient />);

    expect(screen.getByRole('heading', { name: 'GenAI Architect' })).toBeInTheDocument();
    expect(screen.getByText('Current stage: Crafting')).toBeInTheDocument();
    expect(screen.getByText('Tailored resume v4')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /open cloudflare enterprise architect workspace/i }));

    expect(screen.getByRole('heading', { name: 'Enterprise Architect' })).toBeInTheDocument();
    expect(screen.getByText('Current stage: Applied')).toBeInTheDocument();
    expect(screen.getByText('Follow-up draft email')).toBeInTheDocument();
  });

  it('keeps future stage sections blank until the opportunity reaches them', () => {
    render(<CockpitPrototypeClient />);

    fireEvent.click(screen.getByRole('button', { name: /open jobot sales engineer - security integration workspace/i }));

    expect(screen.getByText('Current stage: Interested')).toBeInTheDocument();
    expect(screen.getByText('This section becomes active immediately after the opportunity moves here.')).toBeInTheDocument();
    expect(screen.getByText('Blank until this opportunity reaches applied.')).toBeInTheDocument();
  });
});
