export interface WorkExperience {
  id?: string;
  position: string;
  company: string;
  location?: string;
  startDate: string; // ISO date string
  endDate?: string;  // ISO date string
  current: boolean;
  description: string;
  technologies: string[];
}

export interface Education {
  id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string; // ISO date string
  endDate?: string;  // ISO date string
  description?: string;
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
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
    portfolio?: string;
    summary?: string;
  };
  workHistory: any[]; // Deprecated
  experiences: WorkExperience[];
  education: any[]; // Deprecated
  educations: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
}

export function calculateCompleteness(profile: Profile): number {
  let score = 0;

  if (profile.contactInfo.email) score += 10;
  if (profile.experiences?.length > 0) score += 40;
  if (profile.educations?.length > 0) score += 15;
  if (profile.skills?.length >= 5) score += 15;
  if (profile.projects?.length > 0) score += 10;
  if (profile.certifications?.length > 0) score += 10;

  return Math.min(100, score);
}
