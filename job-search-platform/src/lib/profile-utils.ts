export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Profile {
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    portfolio?: string;
  };
  workHistory: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
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
