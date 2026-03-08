import { describe, expect, test } from '@jest/globals';
import { getPassedRestorePlan, shouldHideFromPipeline } from '@/lib/opportunities/passed-bin';

describe('getPassedRestorePlan', () => {
  test('restores to inbox when no prior application state exists', () => {
    expect(getPassedRestorePlan(null)).toEqual({
      destination: 'INBOX',
      workspaceStatus: null,
    });
  });

  test('restores interested opportunities back to interested workspace state', () => {
    expect(getPassedRestorePlan('interested')).toEqual({
      destination: 'WORKSPACE',
      workspaceStatus: 'INTERESTED',
    });
  });

  test('restores applied opportunities back to applied workspace state', () => {
    expect(getPassedRestorePlan('applied')).toEqual({
      destination: 'WORKSPACE',
      workspaceStatus: 'APPLIED',
    });
  });

  test('restores later active stages back to the follow-up workspace bucket', () => {
    expect(getPassedRestorePlan('screening')).toEqual({
      destination: 'WORKSPACE',
      workspaceStatus: 'FOLLOW_UP',
    });

    expect(getPassedRestorePlan('interview')).toEqual({
      destination: 'WORKSPACE',
      workspaceStatus: 'FOLLOW_UP',
    });

    expect(getPassedRestorePlan('offer')).toEqual({
      destination: 'WORKSPACE',
      workspaceStatus: 'FOLLOW_UP',
    });
  });

  test('falls back to inbox for closed or unknown legacy states', () => {
    expect(getPassedRestorePlan('archived')).toEqual({
      destination: 'INBOX',
      workspaceStatus: null,
    });

    expect(getPassedRestorePlan('rejected')).toEqual({
      destination: 'INBOX',
      workspaceStatus: null,
    });

    expect(getPassedRestorePlan('something-else')).toEqual({
      destination: 'INBOX',
      workspaceStatus: null,
    });
  });
});

describe('shouldHideFromPipeline', () => {
  test('hides passed and archived workspaces from the pipeline board', () => {
    expect(shouldHideFromPipeline('PASSED')).toBe(true);
    expect(shouldHideFromPipeline('ARCHIVED')).toBe(true);
  });

  test('keeps active workspaces visible in the pipeline board', () => {
    expect(shouldHideFromPipeline('INTERESTED')).toBe(false);
    expect(shouldHideFromPipeline('APPLIED')).toBe(false);
    expect(shouldHideFromPipeline('FOLLOW_UP')).toBe(false);
    expect(shouldHideFromPipeline('DORMANT')).toBe(false);
  });
});
