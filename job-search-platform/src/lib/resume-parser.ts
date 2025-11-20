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
    workHistory: [
      {
        id: '1',
        company: 'Tech Corp',
        role: 'Senior Developer',
        startDate: '2020-01',
        endDate: 'Present',
        description: 'Led frontend team...'
      }
    ],
    education: [
      {
        id: '1',
        school: 'University of Tech',
        degree: 'BS Computer Science',
        year: '2019'
      }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    projects: [],
    certifications: []
  };
}
