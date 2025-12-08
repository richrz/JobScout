# Task ID: 21

**Title:** Develop Settings Management UI and Configuration Hot Reload

**Status:** done

**Dependencies:** 14

**Priority:** medium

**Description:** Create the comprehensive settings interface with tabbed layout (Search, LLM, Automation, Advanced), implement live validation, LLM connection testing, JSON Schema validation, version control for configs, and hot reload functionality without server restart.

**Details:**

1. Create tabbed settings interface:
   ```typescript
   // src/components/settings/SettingsPage.tsx
   import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

   export function SettingsPage() {
     return (
       <Tabs defaultValue="search">
         <TabsList>
           <TabsTrigger value="search">Search Parameters</TabsTrigger>
           <TabsTrigger value="llm">LLM Configuration</TabsTrigger>
           <TabsTrigger value="automation">Automation</TabsTrigger>
           <TabsTrigger value="advanced">Advanced</TabsTrigger>
         </TabsList>

         <TabsContent value="search">
           <SearchSettings />
         </TabsContent>
         <TabsContent value="llm">
           <LLMSettings />
         </TabsContent>
         <TabsContent value="automation">
           <AutomationSettings />
         </TabsContent>
         <TabsContent value="advanced">
           <AdvancedSettings />
         </TabsContent>
       </Tabs>
     );
   }
   ```

2. Implement LLM connection test:
   ```typescript
   async function testLLMConnection(config: LLMConfig) {
     try {
       const llm = getLLMClient(config);
       const response = await llm.invoke([{
         role: 'user',
         content: 'Respond with "Connection successful" if you receive this.'
       }]);
       return { success: true, message: response.content };
     } catch (error) {
       return { success: false, message: error.message };
     }
   }
   ```

3. Create JSON Schema validation:
   ```typescript
   import Ajv from 'ajv';

   const configSchema = {
     type: 'object',
     properties: {
       version: { type: 'string' },
       user_id: { type: 'string' },
       search_parameters: {
         type: 'object',
         properties: {
           cities: {
             type: 'array',
             items: {
               type: 'object',
               properties: {
                 name: { type: 'string' },
                 radius_miles: { type: 'number', minimum: 5, maximum: 100 },
                 weight: { type: 'number', minimum: 0, maximum: 100 }
               },
               required: ['name', 'radius_miles', 'weight']
             }
           }
         }
       }
     },
     required: ['version', 'search_parameters']
   };

   const ajv = new Ajv();
   const validate = ajv.compile(configSchema);
   ```

4. Implement version control:
   ```typescript
   async function saveConfigVersion(userId: string, config: Config) {
     const currentConfig = await prisma.config.findUnique({ where: { userId } });
     
     // Store previous version
     await prisma.configHistory.create({
       data: {
         userId,
         version: currentConfig.version,
         config: currentConfig,
         createdAt: new Date()
       }
     });

     // Update with new version
     await prisma.config.update({
       where: { userId },
       data: {
         ...config,
         version: incrementVersion(currentConfig.version),
         updatedAt: new Date()
       }
     });
   }
   ```

5. Create hot reload mechanism using React Context:
   ```typescript
   export const ConfigContext = createContext<Config | null>(null);

   export function ConfigProvider({ children }) {
     const [config, setConfig] = useState<Config | null>(null);

     useEffect(() => {
       // Poll for config changes every 5 seconds
       const interval = setInterval(async () => {
         const latestConfig = await fetchConfig();
         if (latestConfig.updatedAt > config?.updatedAt) {
           setConfig(latestConfig);
         }
       }, 5000);
       return () => clearInterval(interval);
     }, [config]);

     return (
       <ConfigContext.Provider value={config}>
         {children}
       </ConfigContext.Provider>
     );
   }
   ```

6. Add reset to defaults functionality
7. Create config export/import UI
8. Implement live validation with error messages

**Test Strategy:**

1. Test all tabs render correctly
2. Verify live validation shows errors immediately
3. Test LLM connection test button for each provider
4. Validate JSON Schema rejects invalid configs
5. Test version control saves previous configs
6. Verify rollback to previous version works
7. Test hot reload updates UI without refresh
8. Validate reset to defaults restores original config
9. Test export/import round-trip
10. Verify changes persist to database and config.json

## Subtasks

### 21.1. Implement Tabbed Settings Interface with Dynamic Content

**Status:** done  
**Dependencies:** None  

Create responsive tabbed interface with four sections (Search, LLM, Automation, Advanced) that dynamically renders content based on active tab selection

**Details:**

Build using React Tabs component with proper accessibility attributes (aria-selected, aria-controls). Implement keyboard navigation support with arrow keys. Create separate components for each tab section. Integrate LLM connection test button in LLM tab. Add visual indicators for validation status on each form field.
<info added on 2025-12-04T02:02:05.101Z>
Plan: Create SettingsPage component with tabbed interface using shadcn/ui Tabs. Implement Search, LLM, Automation, and Advanced tabs. Write test to verify tab navigation.
</info added on 2025-12-04T02:02:05.101Z>
<info added on 2025-12-04T15:26:58.659Z>
Plan: Implement functional SearchSettings component with form fields for cities, keywords, salary, and recency. Use React Hook Form for validation. Write tests for form submission and validation.
</info added on 2025-12-04T15:26:58.659Z>

### 21.2. Build JSON Schema Validation System with Live Feedback

**Status:** done  
**Dependencies:** None  

Implement comprehensive validation system using Ajv to validate configuration against defined schema with real-time error feedback

**Details:**

Create validation service that compiles schema and validates config objects. Implement field-specific error messages for nested structures. Integrate with form components to show live validation status. Handle complex validation rules for search parameters and LLM configurations. Add visual indicators for invalid fields with descriptive error messages.

### 21.3. Implement Configuration Version Control with History Tracking

**Status:** done  
**Dependencies:** None  

Create system to track configuration changes, store historical versions, and enable rollback functionality with proper version management

**Details:**

Build service to save config versions to database with timestamps. Implement history tracking that stores previous versions before updates. Create UI for viewing version history and selecting previous versions to restore. Add confirmation dialogs for version restoration. Ensure atomic updates to prevent data corruption during concurrent edits.

### 21.4. Design Hot Reload Mechanism for Configuration Changes

**Status:** done  
**Dependencies:** 21.3  

Implement system to detect and apply configuration changes without requiring page refresh or server restart with efficient state management

**Details:**

Create ConfigContext provider that polls for changes at regular intervals. Implement comparison logic to detect updates based on timestamp. Add event listeners for immediate updates when config is saved. Ensure state updates trigger re-renders of dependent components. Add loading states during configuration updates and handle potential race conditions.

### 21.5. Develop Configuration Export and Import Features

**Status:** done  
**Dependencies:** 21.2, 21.3  

Create UI and functionality to export current configuration as JSON file and import configurations from JSON files with validation

**Details:**

Implement export button that generates downloadable JSON file of current config. Create import UI with file picker and validation. Add preview of imported config before applying. Implement security checks to prevent malicious config imports. Add success/error notifications for import/export operations and integrate with version control system.
