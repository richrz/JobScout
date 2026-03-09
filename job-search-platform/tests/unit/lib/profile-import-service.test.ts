import { describe, expect, it } from '@jest/globals';
import { extractProfileFromResumeText } from '@/lib/profile-import-service';

describe('profile import resume parser', () => {
  it('parses multiline DOCX-style experience headers into master-data experiences', async () => {
    const imported = await extractProfileFromResumeText(`
Richard Ruiz

Professional Summary

Dynamic and results-driven Principal Architect and Sales Engineer with extensive experience in Data Center technologies, Cloud, AI, Backup Solutions, Disaster Recovery, and File Sync Software.

Professional Experience

VP of Sales & Systems Engineering
Adroit Worldwide Media (AWM Inc.) - Aliso Viejo, CA
2020 - Present

- Conducted product demos, assessing and documenting prospect environments, and validating technical solutions.
- Managed pre-sales trial setups, ensuring smooth onboarding and support for clients.

Principal Sales Architect
Ease Inc. - Aliso Viejo, CA
2017 - 2020

- Led technical presales activities, offering expertise in data center, cloud, and backup solutions.
- Designed and presented solution architectures, addressing client requirements with detailed configurations and bills of materials.

Skills

Cloud, AI, Backup Solutions, Disaster Recovery
    `);

    expect(imported.contactInfo.name).toBe('Richard Ruiz');
    expect(imported.experiences).toHaveLength(2);
    expect(imported.experiences[0]).toMatchObject({
      position: 'VP of Sales & Systems Engineering',
      company: 'Adroit Worldwide Media (AWM Inc.)',
      location: 'Aliso Viejo, CA',
      current: true,
    });
    expect(imported.experiences[1]).toMatchObject({
      position: 'Principal Sales Architect',
      company: 'Ease Inc.',
      location: 'Aliso Viejo, CA',
      startDate: '2017-01-01',
      endDate: '2020-01-01',
    });
    expect(imported.skills).toEqual(
      expect.arrayContaining(['Cloud', 'AI', 'Backup Solutions', 'Disaster Recovery']),
    );
  });

  it('parses resume text that starts directly at the summary without a name header', async () => {
    const imported = await extractProfileFromResumeText(`
Professional Summary
Seasoned Strategic Solutions Engineer with extensive experience in complex data center sales and cloud security technologies.

Professional Experience

Principal Solutions Architect
Ease Inc., Aliso Viejo, CA
2017 - 2020

- Spearheaded complex data center sales opportunities, aligning technical solutions with client business strategies.

VP of Sales & Systems Engineering
Adroit Worldwide Media (AWM Inc.), Aliso Viejo, CA
2020 - Present

- Led pre-sales engineering initiatives and strategic sales efforts across cloud and data center technologies.
    `);

    expect(imported.contactInfo.name).toBe('');
    expect(imported.experiences).toHaveLength(2);
    expect(imported.experiences[0]?.company).toBe('Ease Inc.');
    expect(imported.experiences[1]?.current).toBe(true);
  });
});
