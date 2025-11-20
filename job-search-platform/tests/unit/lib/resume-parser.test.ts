import { describe, expect, test, jest } from '@jest/globals';
import { parseResume } from '../../../src/lib/resume-parser';

describe('parseResume', () => {
  test('returns structured data from mocked API response', async () => {
    const mockFile = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });
    
    const result = await parseResume(mockFile);
    
    expect(result).toHaveProperty('contactInfo');
    expect(result).toHaveProperty('workHistory');
    expect(result.contactInfo).toHaveProperty('email');
  });
});
