import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  calculateCompleteness,
  normalizeContactInfo,
  type Profile,
} from '@/lib/profile-utils';
import {
  mergeImportedProfile,
  type ImportedProfile,
} from '@/lib/profile-import';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trash2,
  Plus,
  RefreshCw,
  Sparkles,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Upload,
  FileText,
  Check,
  X,
  Loader2,
} from 'lucide-react';

const sections = [
  { id: 'contact', title: 'Contact Information' },
  { id: 'work', title: 'Work History' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills' },
  { id: 'projects', title: 'Projects' },
  { id: 'certifications', title: 'Certifications' }
];

const HONORIFIC_OPTIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Other', label: 'Other' },
];

function ContactSection() {
  const { control } = useFormContext<Profile>();

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-[140px,1fr,1fr] gap-6">
        <FormField
          control={control}
          name="contactInfo.honorific"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {HONORIFIC_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Richard" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="contactInfo.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Ruiz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Input
                  placeholder="(555) 000-0000"
                  value={field.value || ''}
                  onChange={(event) => field.onChange(normalizeContactInfo({ phone: event.target.value }).phone)}
                  onBlur={(event) => field.onChange(normalizeContactInfo({ phone: event.target.value }).phone)}
                />
              </FormControl>
              <FormDescription>Format: (555) 000-0000</FormDescription>
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
                  className="min-h-[180px]"
                {...field}
              />
              </FormControl>
              <FormDescription>Keep this to 3-5 readable lines. A re-import should now replace shorter imported summaries with fuller ones.</FormDescription>
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
          <div key={field.id} className="group border border-border/50 bg-card/50 p-6 rounded-xl space-y-6 transition-all hover:border-primary/20 hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Role {index + 1}</p>
                <p className="text-xs text-muted-foreground">Keep each role separate so imports and resume tailoring stay accurate.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove work history entry ${index + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
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
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <FormLabel className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
              Suggested missing skills
            </FormLabel>
            <p className="text-xs text-muted-foreground">
              Uses your saved work history, education, projects, and current skills to suggest likely gaps.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isGenerating}
            className="text-primary hover:text-primary/80 h-auto p-0 hover:bg-transparent font-normal justify-start"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isGenerating ? 'Refreshing suggestions...' : 'Refresh suggestions'}
          </Button>
        </div>

        {isGenerating && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Scanning your profile for missing skills</p>
                <p className="text-xs text-muted-foreground">Looking through work history, education, projects, and your current skills.</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
              <div className="h-full w-1/3 rounded-full bg-primary/60 animate-pulse" />
            </div>
          </div>
        )}

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
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importReview, setImportReview] = useState<{
    filename: string;
    extractedCharacters: number;
    counts: {
      experiences: number;
      educations: number;
      skills: number;
      projects: number;
      certifications: number;
    };
    importedProfile: ImportedProfile;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

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
          const normalizedContactInfo = normalizeContactInfo(data.contactInfo || {});
          const processed = {
            ...data,
            contactInfo: normalizedContactInfo,
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
        contactInfo: normalizeContactInfo(data.contactInfo || {}),
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

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/import-resume', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Resume import failed');
      }

      setImportReview({
        ...payload.review,
        importedProfile: payload.importedProfile,
      });
      setSaveStatus('Import ready for review');
    } catch (error) {
      console.error('Failed to import resume:', error);
      setImportError(error instanceof Error ? error.message : 'Resume import failed');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  const handleApplyImport = async () => {
    if (!importReview) return;

    const mergedProfile = mergeImportedProfile(methods.getValues(), importReview.importedProfile);
    methods.reset(mergedProfile);
    setImportReview(null);
    setImportError(null);
    await handleSave(mergedProfile);
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <h1 className="text-xl font-bold">Profile Builder</h1>
              <input
                ref={importInputRef}
                type="file"
                accept=".docx,.pdf"
                className="hidden"
                onChange={handleImportFile}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleImportClick}
                disabled={isImporting}
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import Resume
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${saveStatus === 'Saved' ? 'text-green-500' :
                saveStatus === 'Saving...' ? 'text-amber-500' : saveStatus.includes('Import') ? 'text-blue-500' : 'text-red-500'
                }`}>{saveStatus}</span>
            </div>
          </div>
          <ProgressBar progress={progress} />
          {importError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {importError}
            </div>
          )}
          {importReview && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Review imported resume
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {importReview.filename} extracted {importReview.counts.experiences} roles, {importReview.counts.skills} skills, and {importReview.counts.educations} education entries.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-background px-2.5 py-1 border border-border">Experience: {importReview.counts.experiences}</span>
                    <span className="rounded-full bg-background px-2.5 py-1 border border-border">Skills: {importReview.counts.skills}</span>
                    <span className="rounded-full bg-background px-2.5 py-1 border border-border">Education: {importReview.counts.educations}</span>
                    <span className="rounded-full bg-background px-2.5 py-1 border border-border">Projects: {importReview.counts.projects}</span>
                    <span className="rounded-full bg-background px-2.5 py-1 border border-border">Certs: {importReview.counts.certifications}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nothing is saved yet. Applying this import will merge the extracted data into your master profile.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setImportReview(null)}>
                    <X className="w-4 h-4 mr-1.5" />
                    Dismiss
                  </Button>
                  <Button type="button" size="sm" onClick={handleApplyImport}>
                    <Check className="w-4 h-4 mr-1.5" />
                    Apply Import
                  </Button>
                </div>
              </div>
            </div>
          )}
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
