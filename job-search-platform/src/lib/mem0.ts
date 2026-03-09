import '@/lib/load-root-env';

type Mem0Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Mem0SearchResult = {
  id: string;
  memory: string;
  metadata?: Record<string, unknown>;
};

type JobContext = {
  title: string;
  company: string;
  description: string;
};

type ProfileForMemory = {
  contactInfo?: unknown;
  experiences?: Array<{
    position?: string;
    company?: string;
    description?: string;
    technologies?: string[];
  }> | unknown[];
  educations?: Array<{
    degree?: string;
    field?: string;
    school?: string;
  }> | unknown[];
  skills?: string[] | unknown[];
  projects?: Array<{
    name?: string;
    description?: string;
  }> | unknown[];
  certifications?: Array<{
    name?: string;
    issuer?: string;
  }> | unknown[];
};

const MEM0_BASE_URL = process.env.MEM0_API_BASE_URL || 'https://api.mem0.ai';

function getMem0Headers() {
  const apiKey = process.env.mem0_api_key || process.env.MEM0_API_KEY;
  if (!apiKey) {
    return null;
  }

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Token ${apiKey}`,
  };
}

export function isMem0Enabled() {
  return Boolean(process.env.mem0_api_key || process.env.MEM0_API_KEY);
}

export function buildProfileMemoryMessages(profile: ProfileForMemory): Mem0Message[] {
  const facts: string[] = [];
  const contactInfo =
    profile.contactInfo && typeof profile.contactInfo === 'object'
      ? profile.contactInfo as { name?: string; location?: string; summary?: string }
      : {};

  if (contactInfo.name) {
    facts.push(`My name is ${contactInfo.name}.`);
  }

  if (contactInfo.location) {
    facts.push(`I am based in ${contactInfo.location}.`);
  }

  if (contactInfo.summary) {
    facts.push(`My professional summary: ${contactInfo.summary}`);
  }

  const skills = Array.isArray(profile.skills)
    ? profile.skills.filter((skill): skill is string => typeof skill === 'string')
    : [];

  if (skills.length) {
    facts.push(`My core skills are ${skills.slice(0, 15).join(', ')}.`);
  }

  const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
  experiences.slice(0, 6).forEach((experience) => {
    if (!experience || typeof experience !== 'object') {
      return;
    }

    const typedExperience = experience as {
      position?: string;
      company?: string;
      description?: string;
      technologies?: string[];
    };
    const parts = [
      typedExperience.position ? `I worked as ${typedExperience.position}` : null,
      typedExperience.company ? `at ${typedExperience.company}` : null,
      typedExperience.description ? `where ${typedExperience.description}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      const technologies = typedExperience.technologies?.length
        ? ` Technologies used: ${typedExperience.technologies.slice(0, 8).join(', ')}.`
        : '';
      facts.push(`${parts.join(' ')}.${technologies}`);
    }
  });

  const educations = Array.isArray(profile.educations) ? profile.educations : [];
  educations.slice(0, 3).forEach((education) => {
    if (!education || typeof education !== 'object') {
      return;
    }

    const typedEducation = education as {
      degree?: string;
      field?: string;
      school?: string;
    };
    const parts = [
      typedEducation.degree ? `${typedEducation.degree}` : null,
      typedEducation.field ? `in ${typedEducation.field}` : null,
      typedEducation.school ? `from ${typedEducation.school}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      facts.push(`My education includes ${parts.join(' ')}.`);
    }
  });

  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  projects.slice(0, 4).forEach((project) => {
    if (!project || typeof project !== 'object') {
      return;
    }

    const typedProject = project as {
      name?: string;
      description?: string;
    };

    if (typedProject.name || typedProject.description) {
      facts.push(
        `A notable project is ${typedProject.name || 'an unnamed project'}${typedProject.description ? `: ${typedProject.description}` : '.'}`
      );
    }
  });

  const certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
  certifications.slice(0, 4).forEach((certification) => {
    if (!certification || typeof certification !== 'object') {
      return;
    }

    const typedCertification = certification as {
      name?: string;
      issuer?: string;
    };

    if (typedCertification.name) {
      facts.push(
        `I hold the certification ${typedCertification.name}${typedCertification.issuer ? ` from ${typedCertification.issuer}` : ''}.`
      );
    }
  });

  if (facts.length === 0) {
    return [];
  }

  return [{ role: 'user', content: facts.join('\n') }];
}

export function buildResumeMemoryQuery(job: JobContext) {
  return `Relevant candidate facts, achievements, skills, and preferences for tailoring a resume to the ${job.title} role at ${job.company}. Job context: ${job.description.slice(0, 500)}`;
}

export function formatMem0Context(results: Mem0SearchResult[]) {
  if (results.length === 0) {
    return '';
  }

  const lines = results
    .map((result) => result.memory?.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((memory) => `- ${memory}`);

  if (lines.length === 0) {
    return '';
  }

  return `Use these retrieved long-term candidate memories when relevant, but do not invent claims:\n${lines.join('\n')}`;
}

export async function addProfileMemory(profile: ProfileForMemory, userId: string) {
  const headers = getMem0Headers();
  const messages = buildProfileMemoryMessages(profile);

  if (!headers || messages.length === 0) {
    return null;
  }

  const response = await fetch(`${MEM0_BASE_URL}/v1/memories/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: userId,
      messages,
      metadata: {
        source: 'profile_save',
        section: 'career_profile',
      },
      version: 'v2',
      output_format: 'v1.1',
      async_mode: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mem0 add failed with status ${response.status}`);
  }

  return response.json();
}

export async function getResumeMemoryContext(job: JobContext, userId: string) {
  const headers = getMem0Headers();

  if (!headers) {
    return '';
  }

  const response = await fetch(`${MEM0_BASE_URL}/v2/memories/search/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: buildResumeMemoryQuery(job),
      filters: {
        AND: [{ user_id: userId }],
      },
      version: 'v2',
    }),
  });

  if (!response.ok) {
    throw new Error(`Mem0 search failed with status ${response.status}`);
  }

  const data = await response.json();
  const results = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  return formatMem0Context(results);
}
