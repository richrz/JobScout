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

  it('shows the rewritten flow and seven voice dimensions', () => {
    renderRail();

    expect(screen.getByText('What this changes')).toBeInTheDocument();
    expect(screen.getByText('How hard should JobScout rewrite this?')).toBeInTheDocument();
    expect(screen.getByText('Tune The Voice')).toBeInTheDocument();
    expect(screen.queryByText('Starting Point')).not.toBeInTheDocument();

    STRATEGY_OPTIONS.forEach((option) => {
      expect(screen.getByRole('button', { name: new RegExp(option.label, 'i') })).toBeInTheDocument();
    });

    VOICE_DIMENSIONS.forEach((dimension) => {
      expect(screen.getByText(dimension.label)).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: dimension.label })).toBeInTheDocument();
    });
  });

  it('lets the user pick a primary writing strategy', () => {
    const { onStrategyChange } = renderRail();

    fireEvent.click(screen.getByRole('button', { name: /push it harder/i }));

    expect(onStrategyChange).toHaveBeenCalledWith('standout');
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
