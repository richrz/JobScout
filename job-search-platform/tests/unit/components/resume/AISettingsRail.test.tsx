/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { AISettingsRail } from '@/components/resume/AISettingsRail';
import {
  RESUME_WRITER_ZERO_PROFILE,
  STRATEGY_OPTIONS,
  VOICE_DIMENSIONS,
  type ResumeVoiceProfile,
  type ResumeWritingStrategy,
} from '@/lib/resume/voice-profile';

jest.mock('@/components/ui/slider', () => ({
  Slider: ({
    value,
    onValueChange,
    'aria-label': ariaLabel,
    min = 0,
    max = 100,
    step = 1,
  }: any) => (
    <input
      aria-label={ariaLabel}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value?.[0] ?? 0}
      onChange={(event) => onValueChange?.([Number(event.target.value)])}
    />
  ),
}));

describe('AISettingsRail', () => {
  const defaultProfile: ResumeVoiceProfile = RESUME_WRITER_ZERO_PROFILE;

  function renderRail(
    props: Partial<{
      profile: ResumeVoiceProfile;
      onProfileChange: jest.Mock;
      strategy: ResumeWritingStrategy;
      onStrategyChange: jest.Mock;
    }> = {},
  ) {
    const onProfileChange = props.onProfileChange ?? jest.fn();
    const onStrategyChange = props.onStrategyChange ?? jest.fn();

    render(
      <AISettingsRail
        profile={props.profile ?? defaultProfile}
        onProfileChange={onProfileChange}
        strategy={props.strategy ?? 'balanced'}
        onStrategyChange={onStrategyChange}
      />,
    );

    return { onProfileChange, onStrategyChange };
  }

  it('shows one primary rewrite control and grouped voice disclosures', () => {
    renderRail();

    expect(screen.getByText('Writing Profile')).toBeInTheDocument();
    expect(screen.getByText('Rewrite Strength')).toBeInTheDocument();
    expect(screen.getByText('Voice Controls')).toBeInTheDocument();
    expect(screen.getByText('Manual for now. Upload-based voice learning comes later.')).toBeInTheDocument();
    expect(screen.queryByText('Starting Point')).not.toBeInTheDocument();

    STRATEGY_OPTIONS.forEach((option) => {
      expect(screen.getByRole('button', { name: new RegExp(option.label, 'i') })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /tone & clarity/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /technical signal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /positioning/i })).toBeInTheDocument();

    expect(screen.getByText('Professional Tone')).toBeInTheDocument();
    expect(screen.getByText('Human Tone')).toBeInTheDocument();
    expect(screen.getByText('Bullet Length')).toBeInTheDocument();
    expect(screen.queryByText('Technical Detail')).not.toBeInTheDocument();
  });

  it('lets the user pick a primary writing strategy', () => {
    const { onStrategyChange } = renderRail();

    fireEvent.click(screen.getByRole('button', { name: /push it harder/i }));

    expect(onStrategyChange).toHaveBeenCalledWith('standout');
  });

  it('expands another voice group and hides the previous one', () => {
    renderRail();

    fireEvent.click(screen.getByRole('button', { name: /technical signal/i }));

    expect(screen.getByText('Technical Detail')).toBeInTheDocument();
    expect(screen.getByText('Proof Level')).toBeInTheDocument();
    expect(screen.queryByText('Professional Tone')).not.toBeInTheDocument();
  });

  it('updates one voice dimension without dropping the rest of the profile', () => {
    const { onProfileChange } = renderRail();

    fireEvent.change(screen.getByRole('slider', { name: 'Professional Tone' }), {
      target: { value: '80' },
    });

    expect(onProfileChange).toHaveBeenCalledWith({
      ...defaultProfile,
      formality: 80,
    });
  });

  it('resets both the strategy and profile to Resume Writer Zero', () => {
    const onProfileChange = jest.fn();
    const onStrategyChange = jest.fn();

    renderRail({
      profile: {
        ...defaultProfile,
        warmth: 82,
      },
      strategy: 'standout',
      onProfileChange,
      onStrategyChange,
    });

    fireEvent.click(screen.getByLabelText('Reset rewrite settings'));

    expect(onStrategyChange).toHaveBeenCalledWith('balanced');
    expect(onProfileChange).toHaveBeenCalledWith(RESUME_WRITER_ZERO_PROFILE);
  });
});
