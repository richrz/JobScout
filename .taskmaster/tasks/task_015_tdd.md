# Task ID: 15

**Title:** Create Master Profile Builder with Rich Text Editor and Auto-Save

**Status:** pending

**Dependencies:** 13 ✓

**Priority:** high

**Description:** Implement the comprehensive profile management system with Tiptap rich text editor, multi-section form (contact, work history, education, skills, projects, certifications), progress tracking, and GPT-5.1 Vision OCR import from existing resumes. Includes integration of the /profile route, database persistence, and E2E testing.

**Details:**

1. Install Tiptap dependencies:
   ```bash
   npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
   ```

2. Create Profile form structure:
   ```typescript
   // src/components/profile/ProfileBuilder.tsx
   const sections = [
     { id: 'contact', title: 'Contact Information', weight: 10 },
     { id: 'work', title: 'Work History', weight: 40 },
     { id: 'education', title: 'Education', weight: 15 },
     { id: 'skills', title: 'Skills', weight: 15 },
     { id: 'projects', title: 'Projects', weight: 10 },
     { id: 'certifications', title: 'Certifications', weight: 10 }
   ];
   ```

3. Build Tiptap editor component for work history/project descriptions:
   ```typescript
   import { useEditor, EditorContent } from '@tiptap/react';
   import StarterKit from '@tiptap/starter-kit';

   const editor = useEditor({
     extensions: [StarterKit],
     content: initialContent,
     onUpdate: ({ editor }) => {
       // Auto-save logic
     }
   });
   ```

4. Implement progress calculation:
   ```typescript
   function calculateCompleteness(profile: Profile): number {
     let score = 0;
     if (profile.contactInfo.email) score += 10;
     if (profile.workHistory.length > 0) score += 40;
     if (profile.education.length > 0) score += 15;
     if (profile.skills.length >= 5) score += 15;
     if (profile.projects.length > 0) score += 10;
     if (profile.certifications.length > 0) score += 10;
     return score;
   }
   ```

5. Create resume import feature using GPT-4 Vision:
   ```typescript
   async function importFromResume(file: File) {
     const base64 = await fileToBase64(file);
     const response = await openai.chat.completions.create({
       model: 'gpt-5.1-vision-preview',
       messages: [{
         role: 'user',
         content: [
           { type: 'text', text: 'Extract structured profile data from this resume' },
           { type: 'image_url', image_url: { url: base64 } }
         ]
       }]
     });
     return JSON.parse(response.choices[0].message.content);
   }
   ```

6. Implement auto-save with debouncing (30 second intervals)
7. Add JSON export functionality
8. Create skill tag input with proficiency levels
9. Build dynamic work history/education entry forms
10. Create /profile route and wire ProfileBuilder component
11. Connect to database for persistent storage
12. Implement E2E tests

**Test Strategy:**

1. Test auto-save triggers after 30 seconds of inactivity
2. Verify progress calculation updates correctly (0-100%)
3. Test Tiptap editor saves rich text properly
4. Validate resume import with sample PDF (check 80%+ accuracy)
5. Test JSON export/import round-trip
6. Verify all form validations work
7. Test skill tag input (add/remove/edit)
8. Confirm data persists to Profile table
9. Test with incomplete profiles (partial data)
10. Verify proficiency level dropdowns work
11. E2E: Verify user can access /profile and save data
12. E2E: Verify data persistence across sessions

## Subtasks

### 15.6. Create /profile route and page integration

**Status:** pending  
**Dependencies:** 15.2, 15.5  

Create the /profile route and integrate the ProfileBuilder component into the page layout

**Details:**

Create the page file for /profile route; import and render ProfileBuilder; ensure proper layout wrapping and authentication checks are in place so the builder is accessible to logged-in users

### 15.7. Integrate ProfileBuilder with Database API

**Status:** pending  
**Dependencies:** 15.5, 15.6  

Wire the ProfileBuilder to the backend API to ensure data is saved to the database

**Details:**

Connect the auto-save and manual save actions to the actual backend API endpoints; ensure data structure matches database schema; handle API responses and errors

### 15.8. Develop E2E tests for Profile Builder

**Status:** pending  
**Dependencies:** 15.6, 15.7  

Create comprehensive E2E tests for the profile building flow

**Details:**

Write E2E tests using the project's testing framework (e.g., Playwright/Cypress) to simulate a user navigating to /profile, filling out the form, saving, and verifying persistence

### 15.1. Configure Tiptap Rich Text Editor with required extensions

**Status:** done  
**Dependencies:** None  

Set up Tiptap editor with StarterKit and Placeholder extensions for profile content creation

**Details:**

Install @tiptap/react, @tiptap/starter-kit, and @tiptap/extension-placeholder; create reusable editor component with proper configuration for work history and project descriptions; implement placeholder text and content management

### 15.2. Implement multi-section profile form structure

**Status:** done  
**Dependencies:** 15.1  

Create the architecture for the profile form with all required sections and dynamic entry forms

**Details:**

Build the form structure with contact, work history, education, skills, projects, and certifications sections; implement dynamic forms for work history/education entries and skill tag input with proficiency levels; create JSON export functionality

### 15.3. Develop weighted progress calculation system

**Status:** done  
**Dependencies:** 15.2  

Implement the algorithm to calculate profile completeness based on section completion

**Details:**

Create function that calculates profile completeness score based on weighted sections (contact: 10%, work history: 40%, education: 15%, skills: 15%, projects: 10%, certifications: 10%); implement UI display for progress percentage
<info added on 2025-11-20T00:26:39.290Z>
Plan:
1. Create job-search-platform/tests/unit/lib/profile-utils.test.ts.
2. Write test: Verify score calculation (Contact=10, Work=40, etc.).
3. Run npm test (Expect Fail).
4. Create job-search-platform/src/lib/profile-utils.ts.
5. Implement calculateCompleteness.
6. Run npm test (Expect Pass).
</info added on 2025-11-20T00:26:39.290Z>

### 15.4. Implement GPT-5.1 Vision resume parsing functionality

**Status:** done  
**Dependencies:** 15.2  

Create the feature to import profile data from resumes using GPT-4 Vision API

**Details:**

Build file upload handler, base64 conversion, API call to GPT-5.1 Vision with proper prompt engineering, and data mapping to profile structure; implement error handling for failed OCR attempts and validation of extracted data
<info added on 2025-11-20T00:28:37.161Z>
Plan:
1. Create `job-search-platform/tests/unit/lib/resume-parser.test.ts`.
2. Write test: `parseResume` calls OpenAI mock and returns parsed JSON.
3. Run `npm test` (Expect Fail).
4. Create `job-search-platform/src/lib/resume-parser.ts`.
5. Implement parser logic (mocked OpenAI for now).
6. Run `npm test` (Expect Pass).
</info added on 2025-11-20T00:28:37.161Z>

### 15.5. Implement auto-save functionality with debouncing

**Status:** done  
**Dependencies:** 15.1, 15.2  

Create the auto-save system that triggers after 30 seconds of inactivity

**Details:**

Set up debouncing mechanism with 30-second interval, connect to editor onUpdate and form change events, implement save to backend with proper state management and error recovery; add visual indicators for save status
<info added on 2025-11-20T00:30:35.286Z>
Plan:
1. Update `job-search-platform/tests/unit/components/profile/ProfileBuilder.test.tsx` to test for Auto-Save integration.
2. Test: Check if `useAutoSave` triggers (mock it) or check for "Saved" indicator.
3. Run `npm test` (Expect Fail).
4. Update `job-search-platform/src/components/profile/ProfileBuilder.tsx` to integrate `useForm` and `useAutoSave`.
5. Run `npm test` (Expect Pass).
</info added on 2025-11-20T00:30:35.286Z>
