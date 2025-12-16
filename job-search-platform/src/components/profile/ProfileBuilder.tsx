import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { useAutoSave } from '@/hooks/useAutoSave';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calculateCompleteness, Profile } from '@/lib/profile-utils';

const sections = [
  { id: 'contact', title: 'Contact Information' },
  { id: 'work', title: 'Work History' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'projects', title: 'Projects' },
  { id: 'certifications', title: 'Certifications' }
];



function ContactSection() {
  const { register } = useFormContext();

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <input
            {...register('contactInfo.name')}
            placeholder="John Doe"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register('contactInfo.email')}
            placeholder="john@example.com"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <input
            {...register('contactInfo.phone')}
            placeholder="+1 (555) 000-0000"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <input
            {...register('contactInfo.location')}
            placeholder="San Francisco, CA"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn URL</label>
          <input
            {...register('contactInfo.linkedin')}
            placeholder="https://linkedin.com/in/johndoe"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Portfolio URL</label>
          <input
            {...register('contactInfo.portfolio')}
            placeholder="https://johndoe.com"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Professional Summary</label>
        <textarea
          {...register('contactInfo.summary')}
          placeholder="Brief overview of your professional background..."
          rows={6}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y"
        />
      </div>
    </div>
  );
}

function WorkHistorySection() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <button
          type="button"
          onClick={() => append({
            position: '',
            company: '',
            startDate: '',
            current: false,
            description: '',
            technologies: []
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Add Position
        </button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="border p-6 rounded-lg space-y-4 bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input
                {...register(`experiences.${index}.position`)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <input
                {...register(`experiences.${index}.company`)}
                placeholder="e.g. Acme Corp"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                {...register(`experiences.${index}.startDate`)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  {...register(`experiences.${index}.endDate`)}
                  disabled={control._formValues.experiences?.[index]?.current}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input
                    type="checkbox"
                    {...register(`experiences.${index}.current`)}
                    className="rounded border-gray-300"
                  />
                  Current
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description & Key Achievements</label>
            <textarea
              {...register(`experiences.${index}.description`)}
              placeholder="Describe your responsibilities, achievements, and tech stack..."
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive/90 text-sm font-medium"
            >
              Remove Position
            </button>
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          No work history added yet. Add your experience to generate better resumes.
        </div>
      )}
    </div>
  );
}

function EducationSection() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'educations'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Education</h3>
        <button
          type="button"
          onClick={() => append({
            school: '',
            degree: '',
            field: '',
            startDate: '',
            description: ''
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Add Education
        </button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="border p-6 rounded-lg space-y-4 bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">School / University</label>
              <input
                {...register(`educations.${index}.school`)}
                placeholder="e.g. Stanford University"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degree</label>
              <input
                {...register(`educations.${index}.degree`)}
                placeholder="e.g. Bachelor of Science"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Field of Study</label>
              <input
                {...register(`educations.${index}.field`)}
                placeholder="e.g. Computer Science"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                {...register(`educations.${index}.startDate`)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date (or Expected)</label>
              <input
                type="date"
                {...register(`educations.${index}.endDate`)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register(`educations.${index}.description`)}
              placeholder="Activities, societies, etc..."
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive/90 text-sm font-medium"
            >
              Remove Education
            </button>
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          Add your education history to verify credentials.
        </div>
      )}
    </div>
  );
}

// Static fallback
const STATIC_SUGGESTIONS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Python", "Java", "C++", "AWS", "System Design",
  "SQL", "NoSQL", "Docker", "Kubernetes", "GraphQL",
  "Tailwind CSS", "Leadership", "Communication", "Agile"
];

function SkillsSectionReal() {
  const { register, getValues, setValue, watch, control } = useFormContext();
  const skills = watch('skills') || [];

  // Watch fields to trigger updates (optional, for now explicit refresh is safer/cheaper)
  const experiences = watch('experiences');
  const educations = watch('educations');
  const projects = watch('projects');

  const [input, setInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initial load of static, or could fetch immediately
  useEffect(() => {
    // Determine suggested skills based on simple static logic or just show static initially
    if (aiSuggestions.length === 0) {
      setAiSuggestions(STATIC_SUGGESTIONS);
    }
  }, []);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const profile = {
        experiences: getValues('experiences'),
        educations: getValues('educations'),
        projects: getValues('projects'),
        skills: getValues('skills')
      };

      const res = await fetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("Failed to generate skills", err);
      // Fallback or toast
    } finally {
      setIsGenerating(false);
    }
  };

  const addSkill = (skillToAdd: string) => {
    const skill = skillToAdd.trim();
    if (!skill) return;
    if (skills.includes(skill)) return;

    const newSkills = [...skills];
    setValue('skills', newSkills, { shouldDirty: true });
    setInput('');
  };

  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setValue('skills', newSkills, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Add Skill</label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(input);
              }
            }}
            placeholder="e.g. TypeScript"
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
          />
          <button
            type="button"
            onClick={() => addSkill(input)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill: string, index: number) => (
          <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="hover:text-destructive"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground">No skills added yet.</p>
      )}

      <div className="space-y-2 pt-4 border-t">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Ai Suggestions
            {isGenerating && <span className="animate-pulse text-primary">✨ Generating...</span>}
          </label>
          <button
            type="button"
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            Refresh Suggestions
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {aiSuggestions.filter(s => !skills.includes(s)).slice(0, 15).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              disabled={isGenerating}
              className="px-3 py-1 rounded-full text-xs border border-dashed border-muted-foreground/50 hover:bg-secondary hover:border-secondary transition-colors text-muted-foreground hover:text-secondary-foreground text-left"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsSection() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projects</h3>
        <button
          type="button"
          onClick={() => append({
            name: '',
            description: '',
            technologies: [],
            url: ''
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Add Project
        </button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="border p-6 rounded-lg space-y-4 bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <input
                {...register(`projects.${index}.name`)}
                placeholder="e.g. Job Search Platform"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <input
                {...register(`projects.${index}.url`)}
                placeholder="https://github.com/..."
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Technologies (Comma separated)</label>
            <input
              {...register(`projects.${index}.technologies`)}
              placeholder="React, Node.js, Prisma"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            />
            <p className="text-xs text-muted-foreground">Enter as comma-separated values</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              {...register(`projects.${index}.description`)}
              placeholder="What did you build? What problem did it solve?"
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive/90 text-sm font-medium"
            >
              Remove Project
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificationsSection() {
  const { register, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications'
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Certifications</h3>
        <button
          type="button"
          onClick={() => append({
            name: '',
            issuer: '',
            date: '',
            url: ''
          })}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Add Certification
        </button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="border p-6 rounded-lg space-y-4 bg-card text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                {...register(`certifications.${index}.name`)}
                placeholder="e.g. AWS Solutions Architect"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issuer</label>
              <input
                {...register(`certifications.${index}.issuer`)}
                placeholder="e.g. Amazon Web Services"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                {...register(`certifications.${index}.date`)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <input
                {...register(`certifications.${index}.url`)}
                placeholder="https://..."
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-destructive hover:text-destructive/90 text-sm font-medium"
            >
              Remove Certification
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileBuilder() {
  const [activeSection, setActiveSection] = useState('contact');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<Profile>({
    defaultValues: {
      contactInfo: {},
      workHistory: [], // legacy
      experiences: [],
      education: [], // legacy
      educations: [],
      skills: [],
      projects: [],
      certifications: []
    }
  });

  // Load initial data
  React.useEffect(() => {
    // Add timestamp to prevent caching
    fetch('/api/profile?t=' + Date.now(), {
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          // Pre-process dates for inputs (YYYY-MM-DD)
          const processed = {
            ...data,
            experiences: data.experiences?.map((e: any) => ({
              ...e,
              startDate: e.startDate ? e.startDate.split('T')[0] : '',
              endDate: e.endDate ? e.endDate.split('T')[0] : ''
            })) || [],
            educations: data.educations?.map((e: any) => ({
              ...e,
              startDate: e.startDate ? e.startDate.split('T')[0] : '',
              endDate: e.endDate ? e.endDate.split('T')[0] : ''
            })) || [],
            projects: data.projects?.map((p: any) => ({
              ...p,
              technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies
            })) || []
          };

          // Force reset with new data
          methods.reset(processed);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile', err);
        setIsLoading(false);
      });
  }, [methods]); // methods is stable, so this runs on mount. Add manual refresh trigger if needed.



  const handleSave = async (data: Profile) => {
    setSaveStatus('Saving...');
    try {
      // Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1];

      // Transform projects data to split technologies string to array if needed
      const processedData = {
        ...data,
        projects: (data.projects || []).map((project: any) => ({
          ...project,
          // technologies might be a string from the input, split it
          technologies: typeof project.technologies === 'string'
            ? project.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
            : project.technologies
        }))
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify(processedData)
      });
      if (res.ok) {
        setSaveStatus('Saved');
      } else {
        console.error('Server returned:', res.status, res.statusText);
        try {
          const err = await res.json();
          setSaveStatus(`Error: ${err.error || res.statusText}`);
        } catch {
          setSaveStatus(`Error: ${res.status} ${res.statusText}`);
        }
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error: Network Failed');
    }
  };

  const { isDirty } = methods.formState;
  const values = methods.watch();
  const progress = calculateCompleteness(values);

  // Only auto-save if the form has been modified by the user AND is not loading
  useAutoSave(!isLoading && isDirty ? values : null, (v) => {
    if (v) handleSave(v);
  }, 2000);

  if (isLoading) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <FormProvider {...methods}>
      <div className="flex h-full flex-col">
        <div className="bg-background border-b p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Profile Builder</h1>
            <span className="text-sm text-muted-foreground">{saveStatus}</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
        <div className="flex flex-1">
          <div className="w-64 bg-muted/30 p-4 border-r">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                    }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-8 overflow-y-auto bg-background">
            <h2 className="text-2xl font-bold mb-6">
              {sections.find(s => s.id === activeSection)?.title}
            </h2>
            {activeSection === 'contact' && <ContactSection />}
            {activeSection === 'work' && <WorkHistorySection />}
            {activeSection === 'education' && <EducationSection />}
            {activeSection === 'skills' && <SkillsSectionReal />}
            {activeSection === 'projects' && <ProjectsSection />}
            {activeSection === 'certifications' && <CertificationsSection />}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
