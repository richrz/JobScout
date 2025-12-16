import { Profile } from './profile-utils';

export async function parseResume(file: File): Promise<Profile> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mocked response from GPT-5.1 Vision
  return {
    contactInfo: {
      email: 'john.doe@example.com',
      phone: '555-0123',
      linkedin: 'linkedin.com/in/johndoe'
    },
    workHistory: [], // Deprecated
    experiences: [
      {
        id: '1',
        company: 'Tech Corp',
        position: 'Senior Developer',
        startDate: '2020-01',
        endDate: 'Present',
        current: true,
        description: 'Led frontend team...',
        technologies: ['React', 'TypeScript']
      }
    ],
    education: [], // Deprecated
    educations: [
      {
        id: '1',
        school: 'University of Tech',
        degree: 'BS Computer Science',
        field: 'Computer Science',
        startDate: '2015-09',
        endDate: '2019-05'
      }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    projects: [],
    certifications: []
  };
}
