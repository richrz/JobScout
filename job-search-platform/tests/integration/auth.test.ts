import { authOptions } from '../../src/lib/auth';
import { describe, expect, test } from '@jest/globals';

describe('Auth Configuration (Task 13)', () => {
  test('authOptions should be defined', () => {
    expect(authOptions).toBeDefined();
  });

  test('should have Google and Credentials providers', () => {
    const providers = authOptions.providers;
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThanOrEqual(2);
    
    const providerNames = providers.map((p: any) => p.id);
    expect(providerNames).toContain('google');
    expect(providerNames).toContain('credentials');
  });

  test('should use Prisma adapter', () => {
    expect(authOptions.adapter).toBeDefined();
  });

  test('should have session strategy set to jwt', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });
});
