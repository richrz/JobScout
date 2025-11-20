export interface Profile {
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  workHistory: any[];
  education: any[];
  skills: string[];
  projects: any[];
  certifications: any[];
}

export function calculateCompleteness(profile: Profile): number {
  let score = 0;
  
  if (profile.contactInfo.email) score += 10;
  if (profile.workHistory.length > 0) score += 40;
  if (profile.education.length > 0) score += 15;
  if (profile.skills.length >= 5) score += 15;
  if (profile.projects.length > 0) score += 10;
  if (profile.certifications.length > 0) score += 10;
  
  return Math.min(100, score);
}
