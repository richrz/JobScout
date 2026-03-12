/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CockpitPrototypeClient from '@/app/dashboard-cockpit-prototype/CockpitPrototypeClient';

const hasExactText = (value: string) => (_: string, element: Element | null) => element?.textContent === value;

describe('CockpitPrototypeClient', () => {
  it('opens a workspace directly from a river card', async () => {
    render(<CockpitPrototypeClient />);

    fireEvent.click(screen.getByRole('button', { name: /open river workspace for cloudflare enterprise architect/i }));

    expect((await screen.findAllByText(hasExactText('Enterprise Architect'))).length).toBeGreaterThan(0);
    expect(await screen.findByText(hasExactText('Current stage: Applied'))).toBeInTheDocument();
    expect(await screen.findByText('Follow-up draft email')).toBeInTheDocument();
  });

  it('opens the lower stage browser from a stage heading and closes it again', async () => {
    render(<CockpitPrototypeClient />);

    fireEvent.click(screen.getByRole('button', { name: /browse interested opportunities/i }));

    expect(await screen.findByRole('button', { name: /close stage browser/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close stage browser/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close stage browser/i })).not.toBeInTheDocument();
    });
    expect((await screen.findAllByText(hasExactText('GenAI Architect'))).length).toBeGreaterThan(0);
  });

  it('opens a workspace from the stage browser and exits browser mode', async () => {
    render(<CockpitPrototypeClient />);

    fireEvent.click(screen.getByRole('button', { name: /browse interested opportunities/i }));
    expect(await screen.findByRole('button', { name: /close stage browser/i })).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /open browser workspace for jobot sales engineer - security integration/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close stage browser/i })).not.toBeInTheDocument();
    });
    expect((await screen.findAllByText(hasExactText('Sales Engineer - Security Integration'))).length).toBeGreaterThan(0);
    expect(await screen.findByText(hasExactText('Current stage: Interested'))).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /expand crafting section/i }));
    expect(await screen.findByText('This section becomes active immediately after the opportunity moves here.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /expand applied section/i }));
    expect(await screen.findByText('Blank until this opportunity reaches applied.')).toBeInTheDocument();
  });

  it('closes browser mode with escape', async () => {
    render(<CockpitPrototypeClient />);

    fireEvent.click(screen.getByRole('button', { name: /browse interested opportunities/i }));
    expect(await screen.findByRole('button', { name: /close stage browser/i })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /close stage browser/i })).not.toBeInTheDocument();
    });
    expect((await screen.findAllByText(hasExactText('GenAI Architect'))).length).toBeGreaterThan(0);
  });
});
