import { isMockMode } from '../../../src/lib/env';

describe('env utility', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should return true when NEXT_PUBLIC_MOCK_MODE is "true"', () => {
        process.env.NEXT_PUBLIC_MOCK_MODE = 'true';
        expect(isMockMode()).toBe(true);
    });

    it('should return false when NEXT_PUBLIC_MOCK_MODE is "false"', () => {
        process.env.NEXT_PUBLIC_MOCK_MODE = 'false';
        expect(isMockMode()).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_MOCK_MODE is undefined', () => {
        delete process.env.NEXT_PUBLIC_MOCK_MODE;
        expect(isMockMode()).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_MOCK_MODE is empty string', () => {
        process.env.NEXT_PUBLIC_MOCK_MODE = '';
        expect(isMockMode()).toBe(false);
    });
});
