
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calculateCompleteness, Profile } from '@/lib/profile-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, RefreshCw, Sparkles, Briefcase, GraduationCap, FolderGit2 } from 'lucide-react';

const sections = [
  { id: 'contact', title: 'Contact Information' },
  { id: 'work', title: 'Work History' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'projects', title: 'Projects' },
  { id: 'certifications', title: 'Certifications' }
];

function ContactSection() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="contactInfo.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="San Francisco, CA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn URL</FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.portfolio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio URL</FormLabel>
              <FormControl>
                <Input placeholder="https://johndoe.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="contactInfo.summary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Summary</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief overview of your professional background..."
                className="min-h-[150px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function WorkHistorySection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences'
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Button
          type="button"
          onClick={() => append({
            position: '',
            company: '',
            startDate: '',
            current: false,
            description: '',
            technologies: []
          })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Position
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="group relative border border-border/50 bg-card/50 p-6 rounded-xl space-y-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name={`experiences.${index}.position`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Frontend Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`experiences.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`experiences.${index}.startDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormField
                  control={control}
                  name={`experiences.${index}.endDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <div className="flex gap-4 items-center">
                        <FormControl>
                          <Input
                            type="date"
                            disabled={control._formValues.experiences?.[index]?.current}
                            {...field}
                          />
                        </FormControl>
                        <FormField
                          control={control}
                          name={`experiences.${index}.current`}
                          render={({ field: checkboxField }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={checkboxField.value}
                                  onCheckedChange={checkboxField.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal cursor-pointer">
                                  Current
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={control}
              name={`experiences.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description & Key Achievements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your responsibilities, achievements, and tech stack..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No work history added yet"
          description="Add your professional experience to generate better resumes."
          action={{
            label: "Add Your First Position",
            onClick: () => append({
              position: '',
              company: '',
              startDate: '',
              current: false,
              description: '',
              technologies: []
            })
          }}
        />
      )}
    </div>
  );
}

function EducationSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'educations'
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Education</h3>
        <Button
          type="button"
          onClick={() => append({
            school: '',
            degree: '',
            field: '',
            startDate: '',
            description: ''
          })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Education
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="group relative border border-border/50 bg-card/50 p-6 rounded-xl space-y-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name={`educations.${index}.school`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School / University</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Stanford University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`educations.${index}.degree`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor of Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`educations.${index}.field`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`educations.${index}.startDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`educations.${index}.endDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={control}
              name={`educations.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Activities, societies, achievements..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No education history added yet"
          description="Add your educational background to verify your credentials."
          action={{
            label: "Add Education",
            onClick: () => append({
              school: '',
              degree: '',
              field: '',
              startDate: '',
              description: ''
            })
          }}
        />
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
  const { setValue, watch, getValues } = useFormContext();
  const skills = watch('skills') || [];

  const [input, setInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
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
    } finally {
      setIsGenerating(false);
    }
  };

  const addSkill = (skillToAdd: string) => {
    const skill = skillToAdd.trim();
    if (!skill) return;
    if (skills.includes(skill)) return;

    const newSkills = [...skills, skill];
    setValue('skills', newSkills, { shouldDirty: true });
    setInput('');
  };

  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setValue('skills', newSkills, { shouldDirty: true });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <FormLabel>Add Skill</FormLabel>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(input);
              }
            }}
            placeholder="e.g. TypeScript"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => addSkill(input)}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-4 bg-muted/20 border border-border/50 rounded-xl min-h-[100px] content-start">
        {skills.map((skill: string, index: number) => (
          <div key={index} className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-sm animate-in zoom-in duration-300">
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              &times;
            </button>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-sm italic py-8">
            <p>No skills added yet</p>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <FormLabel className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            AI Suggestions
            {isGenerating && <span className="animate-pulse text-xs text-primary font-normal">Generating...</span>}
          </FormLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="text-primary hover:text-primary/80 h-auto p-0 hover:bg-transparent font-normal"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {aiSuggestions.filter(s => !skills.includes(s)).slice(0, 15).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-muted-foreground"
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
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects'
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projects</h3>
        <Button
          type="button"
          onClick={() => append({
            name: '',
            description: '',
            technologies: [],
            url: ''
          })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="group relative border border-border/50 bg-card/50 p-6 rounded-xl space-y-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name={`projects.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Job Search Platform" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`projects.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`projects.${index}.technologies`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="React, Node.js, Prisma"
                      {...field}
                    // Handle array to string conversion if needed, but react-hook-form usually handles string inputs fine, 
                    // we just split it on submit as done in the main component.
                    />
                  </FormControl>
                  <FormDescription>Comma-separated (e.g. React, Node.js)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`projects.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you build? What problem did it solve?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No projects added yet"
          description="Showcase your best work to stand out to recruiters."
          action={{
            label: "Add Project",
            onClick: () => append({
              name: '',
              description: '',
              technologies: [],
              url: ''
            })
          }}
        />
      )}
    </div>
  );
}

function CertificationsSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications'
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Certifications</h3>
        <Button
          type="button"
          onClick={() => append({
            name: '',
            issuer: '',
            date: '',
            url: ''
          })}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Add Certification
        </Button>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="group relative border border-border/50 bg-card/50 p-6 rounded-xl space-y-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name={`certifications.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. AWS Solutions Architect" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`certifications.${index}.issuer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Amazon Web Services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`certifications.${index}.date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`certifications.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
          <p className="text-body-sm mb-4">No certifications added yet</p>
          <Button variant="outline" onClick={() => append({
            name: '',
            issuer: '',
            date: '',
            url: ''
          })}>
            Add Certification
          </Button>
        </div>
      )}
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
      workHistory: [],
      experiences: [],
      education: [],
      educations: [],
      skills: [],
      projects: [],
      certifications: []
    }
  });

  React.useEffect(() => {
    fetch('/api/profile?t=' + Date.now(), {
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
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
          methods.reset(processed);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load profile', err);
        setIsLoading(false);
      });
  }, [methods]);

  const handleSave = async (data: Profile) => {
    setSaveStatus('Saving...');
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf-token='))
        ?.split('=')[1];

      const processedData = {
        ...data,
        projects: (data.projects || []).map((project: any) => ({
          ...project,
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
        setSaveStatus('Error saving');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('Error: Network Failed');
    }
  };

  const { isDirty } = methods.formState;
  const values = methods.watch();
  const progress = calculateCompleteness(values);

  useAutoSave(!isLoading && isDirty ? values : null, (v) => {
    if (v) handleSave(v);
  }, 2000);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <Form {...methods}>
      <div className="flex h-full flex-col">
        <div className="bg-background/80 backdrop-blur border-b p-4 space-y-4 z-10 sticky top-0">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Profile Builder</h1>
            <span className={`text-sm font-medium ${saveStatus === 'Saved' ? 'text-green-500' :
              saveStatus === 'Saving...' ? 'text-amber-500' : 'text-red-500'
              }`}>{saveStatus}</span>
          </div>
          <ProgressBar progress={progress} />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-slate-50/50 dark:bg-slate-900/20 p-4 border-r overflow-y-auto hidden md:block">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium ${activeSection === section.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/50">
            <div className="max-w-4xl mx-auto pb-20">
              <div className="mb-8 border-b pb-4">
                <h2 className="text-2xl font-bold tracking-tight">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
              </div>
              {activeSection === 'contact' && <ContactSection />}
              {activeSection === 'work' && <WorkHistorySection />}
              {activeSection === 'education' && <EducationSection />}
              {activeSection === 'skills' && <SkillsSectionReal />}
              {activeSection === 'projects' && <ProjectsSection />}
              {activeSection === 'certifications' && <CertificationsSection />}
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}
