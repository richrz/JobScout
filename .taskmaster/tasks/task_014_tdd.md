# Task ID: 14

**Title:** Build Multi-Step Configuration Wizard with Form Validation

**Status:** pending

**Dependencies:** 13 ✓

**Priority:** high

**Description:** Create the 6-step onboarding wizard UI with React Hook Form and Zod validation, implementing all configuration steps (cities, job titles, keywords, salary, recency) with progress tracking, data persistence, and a dedicated /onboarding route verified by E2E tests.

**Details:**

1. Create Zod schemas for each step:
   ```typescript
   // src/lib/validations/config.ts
   import { z } from 'zod';

   export const citySchema = z.object({
     name: z.string().min(1, 'City name required'),
     radius_miles: z.number().min(5).max(100),
     weight: z.number().min(0).max(100)
   });

   export const step1Schema = z.object({
     cities: z.array(citySchema).min(1, 'At least one city required')
   });

   export const step2Schema = z.object({
     categories: z.array(z.string()).min(1, 'At least one job title required')
   });

   export const configSchema = z.object({
     cities: z.array(citySchema),
     categories: z.array(z.string()),
     include_keywords: z.array(z.string()),
     exclude_keywords: z.array(z.string()),
     salary_usd: z.object({
       min: z.number().optional(),
       max: z.number().optional()
     }),
     posted_within_hours: z.number()
   });
   ```

2. Build wizard component with shadcn/ui:
   ```typescript
   // src/components/onboarding/ConfigWizard.tsx
   import { useState } from 'react';
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';

   const steps = [
     { id: 1, title: 'Target Cities', component: Step1Cities },
     { id: 2, title: 'Job Titles', component: Step2Titles },
     { id: 3, title: 'Include Keywords', component: Step3Include },
     { id: 4, title: 'Exclude Keywords', component: Step4Exclude },
     { id: 5, title: 'Salary Range', component: Step5Salary },
     { id: 6, title: 'Job Freshness', component: Step6Recency }
   ];
   ```

3. Implement auto-save every 30 seconds using useEffect
4. Create progress indicator component (0-100%)
5. Build each step component with appropriate inputs:
   - Step 1: City autocomplete + radius slider + weight slider
   - Step 2: Tag input for job titles
   - Step 3: Keyword tag input with OR logic explanation
   - Step 4: Exclusion keyword tag input
   - Step 5: Min/max salary inputs with checkbox for undisclosed
   - Step 6: Radio buttons for recency options
6. Add navigation (Back/Next/Skip buttons)
7. Implement data persistence to Config model
8. Create JSON export/import functionality
9. Create /onboarding route to host the wizard
10. Wire up API integration for saving data to database
11. Implement E2E tests using Playwright/Cypress

**Test Strategy:**

1. Test form validation for each step (invalid inputs rejected)
2. Verify progress indicator updates correctly (0% → 100%)
3. Test auto-save functionality (check DB after 30s)
4. Validate navigation (Back/Next/Skip work correctly)
5. Test city autocomplete with real geocoding API
6. Verify weight sliders sum to 100% validation
7. Test JSON export/import round-trip
8. Confirm data persists to Config table
9. Test wizard completion creates valid config.json
10. Verify tooltips and help text display correctly
11. E2E: Verify full wizard flow loads at /onboarding
12. E2E: Confirm data is saved to DB upon completion

## Subtasks

### 14.7. Implement /onboarding route and API integration

**Status:** pending  
**Dependencies:** 14.6  

Create the page route and ensure the wizard communicates with the backend database

**Details:**

Create the `/onboarding` route (e.g., `src/app/onboarding/page.tsx`) and wrap the `ConfigWizard` component. Wire up the `useAutoSave` hook and manual save actions to call the backend API endpoints that utilize the service layer created in subtask 6. Ensure proper error handling and loading states during data persistence.

### 14.8. Create E2E tests for Onboarding Wizard

**Status:** pending  
**Dependencies:** 14.7  

Implement end-to-end tests covering the full user journey through the configuration wizard

**Details:**

Develop E2E tests using Playwright or Cypress. Scenarios should include: navigating to `/onboarding`, completing all 6 steps with valid data, verifying progress bar updates, testing validation errors, checking auto-save behavior, and confirming final submission results in a database record.

### 14.1. Design and implement Zod validation schemas for all configuration steps

**Status:** done  
**Dependencies:** None  

Create comprehensive validation schemas for each wizard step with proper error messages and interdependent validation rules

**Details:**

Implement citySchema with radius and weight constraints, step1Schema for cities array, step2Schema for job titles, and complete configSchema. Add custom validation for weight sliders summing to 100% and handle conditional validation for salary ranges.
<info added on 2025-11-19T22:13:20.314Z>
Plan:
1. Create `job-search-platform/tests/unit/validations/config.test.ts`.
2. Write unit tests using `zod` to verify:
    - `citySchema` rejects empty names, invalid radius (<5), invalid weights (<0 or >100).
    - `step1Schema` requires non-empty cities array.
    - `step2Schema` requires non-empty categories array.
    - `configSchema` validates the full object structure.
3. Run `npm test` (expect failure as files don't exist).
4. Create `job-search-platform/src/lib/validations/config.ts` with the Zod schemas.
5. Run `npm test` (expect success).
</info added on 2025-11-19T22:13:20.314Z>

### 14.2. Build wizard state management architecture with React Hook Form

**Status:** done  
**Dependencies:** 14.1  

Implement the core wizard structure using React Hook Form with proper state management across navigation

**Details:**

Create ConfigWizard component with useForm and zodResolver. Implement step navigation logic with useWizard hook pattern. Manage form state persistence between steps and handle validation triggers during navigation. Integrate with shadcn/ui components for consistent styling.
<info added on 2025-11-19T22:15:09.927Z>
Plan:
1. Create `job-search-platform/tests/unit/components/ConfigWizard.test.tsx`.
2. Write test: Render `ConfigWizard` and check for "Target Cities" (Step 1) heading.
3. Run `npm test` (Expect Fail).
4. Create `job-search-platform/src/components/onboarding/ConfigWizard.tsx`.
5. Implement the basic wizard shell (useForm, useState for steps).
6. Run `npm test` (Expect Pass).
</info added on 2025-11-19T22:15:09.927Z>

### 14.3. Develop individual step components with specialized UI elements

**Status:** done  
**Dependencies:** 14.1, 14.2  

Build all six configuration step components with appropriate inputs and validation feedback

**Details:**

Implement Step1Cities with Mapbox autocomplete and dual sliders, Step2Titles with tag input, Step3Include/Step4Exclude with keyword tag inputs, Step5Salary with min/max inputs and undisclosed checkbox, and Step6Recency with radio buttons. Ensure each component connects properly to form state.
<info added on 2025-11-19T22:17:20.059Z>
Plan:
1. Create `job-search-platform/tests/unit/components/steps/Step1Cities.test.tsx`.
2. Write test: Verify it renders a city input and radius slider.
3. Run `npm test` (Expect Fail).
4. Create `job-search-platform/src/components/onboarding/steps/Step1Cities.tsx`.
5. Implement the component using `react-hook-form` context.
6. Run `npm test` (Expect Pass).
</info added on 2025-11-19T22:17:20.059Z>

### 14.4. Implement auto-save functionality with debounce mechanism

**Status:** done  
**Dependencies:** 14.2, 14.3  

Create auto-save system that persists form data every 30 seconds with proper state management

**Details:**

Set up useEffect hook with 30-second debounce timer. Implement save handler that stores current form values in localStorage and syncs with backend API. Add visual feedback for save status. Handle edge cases like form submission during auto-save.
<info added on 2025-11-19T22:19:50.895Z>
Plan:
1. Create `job-search-platform/tests/unit/hooks/useAutoSave.test.ts`.
2. Write test: Verify hook calls save callback after 30 seconds of inactivity (debounce).
3. Run `npm test` (Expect Fail).
4. Create `job-search-platform/src/hooks/useAutoSave.ts`.
5. Implement `useAutoSave` hook using `useEffect` and `setTimeout`.
6. Run `npm test` (Expect Pass).
</info added on 2025-11-19T22:19:50.895Z>

### 14.5. Develop progress calculation and visualization system

**Status:** done  
**Dependencies:** 14.2, 14.3  

Create progress indicator that accurately reflects completion percentage across all wizard steps

**Details:**

Implement calculateProgress function that evaluates required fields per step. Build ProgressIndicator component showing 0-100% with visual feedback. Integrate with wizard state to update in real-time as users complete steps. Add tooltips showing incomplete sections.
<info added on 2025-11-19T22:21:04.668Z>
Plan:
1. Create `job-search-platform/tests/unit/components/ProgressBar.test.tsx`.
2. Write test: Verify progress bar width is calculated correctly (e.g., Step 1/6 = ~16%).
3. Run `npm test` (Expect Fail).
4. Create `job-search-platform/src/components/ui/ProgressBar.tsx`.
5. Implement component.
6. Run `npm test` (Expect Pass).
</info added on 2025-11-19T22:21:04.668Z>

### 14.6. Implement data persistence and JSON export/import functionality

**Status:** done  
**Dependencies:** 14.2, 14.3, 14.4, 14.5  

Create mechanisms to persist configuration data to Config model and enable JSON export/import

**Details:**

Build service layer connecting form data to Prisma Config model. Implement exportConfig function generating JSON structure matching configSchema. Create importConfig function with validation. Add UI controls for export/import operations with error handling for invalid JSON.
<info added on 2025-11-19T22:22:07.621Z>
Plan:
1. Create `job-search-platform/tests/unit/components/ConfigActions.test.tsx`.
2. Write test: Verify Export button exists and triggers file download simulation. Verify Import button exists.
3. Run `npm test` (Expect Fail).
4. Create `job-search-platform/src/components/onboarding/ConfigActions.tsx`.
5. Implement Export (JSON.stringify + Blob) and Import (FileReader) logic.
6. Run `npm test` (Expect Pass).
</info added on 2025-11-19T22:22:07.621Z>
