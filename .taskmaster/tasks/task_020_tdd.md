# Task ID: 20

**Title:** Build Resume Generation and PDF Export System

**Status:** pending

**Dependencies:** 16, 19 ✓

**Priority:** medium

**Description:** Create the resume tailoring interface at /resume with live preview using ProseMirror editor, integrate with LLM service for generation, implement ATS-friendly PDF export with react-pdf, and add configurable file naming templates.

**Details:**

1. Install PDF generation dependencies:
   ```bash
   npm install @react-pdf/renderer react-pdf
   npm install prosemirror-state prosemirror-view prosemirror-model
   ```

2. Create resume preview component:
   ```typescript
   // src/components/resume/ResumePreview.tsx
   import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

   const styles = StyleSheet.create({
     page: { padding: 30, fontFamily: 'Helvetica' },
     section: { marginBottom: 10 },
     heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
     text: { fontSize: 11, lineHeight: 1.5 }
   });

   function ResumePDF({ content }) {
     return (
       <Document>
         <Page size="A4" style={styles.page}>
           <View style={styles.section}>
             <Text style={styles.heading}>{content.name}</Text>
             <Text style={styles.text}>{content.email} | {content.phone}</Text>
           </View>
           <View style={styles.section}>
             <Text style={styles.heading}>Professional Summary</Text>
             <Text style={styles.text}>{content.summary}</Text>
           </View>
           {/* Additional sections */}
         </Page>
       </Document>
     );
   }
   ```

3. Create ProseMirror editor for live editing:
   ```typescript
   import { EditorState } from 'prosemirror-state';
   import { EditorView } from 'prosemirror-view';
   import { Schema, DOMParser } from 'prosemirror-model';

   const schema = new Schema({
     nodes: {
       doc: { content: 'block+' },
       paragraph: { content: 'inline*', toDOM: () => ['p', 0] },
       text: { inline: true }
     },
     marks: {
       strong: { toDOM: () => ['strong', 0] },
       em: { toDOM: () => ['em', 0] }
     }
   });
   ```

4. Implement resume generation flow:
   ```typescript
   async function generateAndPreviewResume(
     jobId: string,
     exaggerationLevel: 'conservative' | 'balanced' | 'strategic'
   ) {
     const job = await prisma.job.findUnique({ where: { id: jobId } });
     const profile = await prisma.profile.findUnique({ where: { userId } });
     const config = await prisma.config.findUnique({ where: { userId } });

     const resumeContent = await generateTailoredResume(
       job.description,
       profile,
       exaggerationLevel,
       config.llmConfig
     );

     return resumeContent;
   }
   ```

5. Create file naming template engine:
   ```typescript
   function generateFileName(template: string, job: Job): string {
     const date = new Date().toISOString().split('T')[0];
     return template
       .replace('YYYY-MM-DD', date)
       .replace('{company}', job.company)
       .replace('{role}', job.title.replace(/[^a-zA-Z0-9]/g, '-'));
   }
   ```

6. Create /resume route and page layout:
   ```typescript
   // src/app/resume/page.tsx
   export default function ResumePage() {
     return (
       <div className="flex h-screen">
         <div className="w-1/2"><ResumeEditor /></div>
         <div className="w-1/2"><ResumePreview /></div>
       </div>
     );
   }
   ```

7. Wire LLM enhancement and PDF download actions.
8. Implement save to Application record.

**Test Strategy:**

1. Test resume generation with sample job + profile
2. Verify LLM produces valid markdown output
3. Test ProseMirror editor allows editing
4. Validate PDF export is ATS-friendly (no complex formatting)
5. Test file naming template with various patterns
6. Verify PDF downloads with correct filename
7. Test all exaggeration levels produce different tones
8. Validate resume saves to Application.resumePath
9. Test batch generation for multiple jobs
10. Verify PDF renders correctly on mobile
11. Test with long content (pagination works)
12. Verify /resume route is accessible and renders components correctly
13. Test full flow: Enter /resume -> Generate with LLM -> Edit -> Download

## Subtasks

### 20.6. Implement /resume Route and Page Layout

**Status:** pending  
**Dependencies:** 20.1, 20.2  

Create the main resume page route and layout structure to host the editor and preview components

**Details:**

Create `src/app/resume/page.tsx`, implement a split-pane layout (or responsive equivalent) to display `ResumeEditor` and `ResumePreview` side-by-side, ensure the route is accessible via main navigation, and set up shared state context for data synchronization.

### 20.7. Wire Editor, Preview, and LLM Integration

**Status:** pending  
**Dependencies:** 20.4, 20.6  

Connect the UI components to the backend services for a complete user flow

**Details:**

Integrate the `generateAndPreviewResume` function with the UI 'Enhance' button, ensure LLM output populates the ProseMirror editor, wire the editor's state changes to update the PDF preview in real-time, and implement the 'Download PDF' button using the file naming engine.

### 20.8. Implement Resume Persistence and Application Association

**Status:** pending  
**Dependencies:** 20.7  

Save the generated resume and associate it with the specific job application record

**Details:**

Implement the save functionality to store the final resume content (JSON/PDF path) to the database, update the `Application` record with the reference to the generated resume, and ensure the user can retrieve saved resumes later.

### 20.1. Implement PDF Generation with @react-pdf/renderer

**Status:** done  
**Dependencies:** None  

Set up PDF generation system using @react-pdf/renderer library for ATS-friendly resume output

**Details:**

Install @react-pdf/renderer dependencies, create ResumePDF component with proper styling, implement Document/Page structure with ATS-compliant formatting, integrate PDFDownloadLink functionality, and verify text extraction works correctly
<info added on 2025-12-04T00:15:38.805Z>
Plan: Create ResumePDF component with basic layout and ATS-friendly styles. Write unit test to verify rendering.
</info added on 2025-12-04T00:15:38.805Z>

### 20.2. Integrate ProseMirror Editor with React

**Status:** done  
**Dependencies:** None  

Create live resume editing interface using ProseMirror editor integrated with React

**Details:**

Set up prosemirror-state/view/model dependencies, implement react-prosemirror library for proper React integration, configure schema with resume-specific nodes/marks, create live preview component that syncs with PDF output
<info added on 2025-12-04T01:20:41.885Z>
Plan: Install prosemirror packages. Create ResumeEditor component with basic schema. Write test for editor initialization and content sync.
</info added on 2025-12-04T01:20:41.885Z>

### 20.3. Implement ATS-Friendly Formatting Rules

**Status:** done  
**Dependencies:** 20.1  

Apply specific formatting constraints to ensure resumes pass Applicant Tracking Systems

**Details:**

Configure PDF styles with simple fonts (Helvetica/Arial), implement section organization without tables, ensure proper spacing and margins, validate text is selectable/not images, add semantic structure for ATS parsing
<info added on 2025-12-04T01:22:18.399Z>
Plan: Validate ResumePDF styles meet ATS requirements - simple fonts, no tables, proper text hierarchy. Add test to verify PDF structure.
</info added on 2025-12-04T01:22:18.399Z>

### 20.4. Develop Resume Generation Workflow

**Status:** done  
**Dependencies:** 20.2  

Connect ProseMirror editor with LLM service for tailored resume generation

**Details:**

Implement generateAndPreviewResume function, integrate with LLM service API, handle job description/profile data, create exaggeration level configuration, establish content flow from generation to editor and PDF preview
<info added on 2025-12-04T01:24:03.256Z>
Plan: Create generateAndPreviewResume server action that integrates with LLM service. Accept job description and generate tailored resume content. Write test for generation workflow.
</info added on 2025-12-04T01:24:03.256Z>

### 20.5. Build File Naming Template Engine

**Status:** done  
**Dependencies:** None  

Create configurable system for generating resume filenames based on templates

**Details:**

Implement generateFileName function with variable replacement (date, company, role), add validation for template syntax, create UI for template configuration, integrate with PDF export functionality to apply naming rules
<info added on 2025-12-04T01:26:13.160Z>
Plan: Create generateFileName utility function with template variable replacement. Add test for file naming with various patterns.
</info added on 2025-12-04T01:26:13.160Z>
