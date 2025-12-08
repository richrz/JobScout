# Task ID: 19

**Title:** Implement Kanban Application Pipeline Tracker with Drag-and-Drop

**Status:** done

**Dependencies:** 12 ✓

**Priority:** high

**Description:** Build the application tracking system using dnd-kit with customizable pipeline stages, drag-and-drop functionality, status timeline, file attachments, notes, bulk operations, and CSV export as specified in the PRD.

**Details:**

1. Install dnd-kit dependencies:
   ```bash
   npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
   ```

2. Create Kanban board component:
   ```typescript
   // src/components/pipeline/KanbanBoard.tsx
   import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
   import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

   const stages = [
     { id: 'discovered', title: 'Discovered', color: 'gray' },
     { id: 'interested', title: 'Interested', color: 'blue' },
     { id: 'applied', title: 'Applied', color: 'yellow' },
     { id: 'interview', title: 'Interview', color: 'purple' },
     { id: 'offer', title: 'Offer', color: 'green' },
     { id: 'rejected', title: 'Rejected', color: 'red' },
     { id: 'archived', title: 'Archived', color: 'gray' }
   ];

   export function KanbanBoard({ applications }) {
     const [activeId, setActiveId] = useState(null);

     function handleDragStart(event) {
       setActiveId(event.active.id);
     }

     async function handleDragEnd(event) {
       const { active, over } = event;
       if (!over) return;

       const applicationId = active.id;
       const newStatus = over.id;

       await updateApplicationStatus(applicationId, newStatus);
     }

     return (
       <DndContext
         collisionDetection={closestCorners}
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
       >
         <div className="flex gap-4 overflow-x-auto">
           {stages.map(stage => (
             <Column
               key={stage.id}
               stage={stage}
               applications={applications.filter(app => app.status === stage.id)}
             />
           ))}
         </div>
       </DndContext>
     );
   }
   ```

3. Create application card component:
   ```typescript
   function ApplicationCard({ application }) {
     return (
       <div className="bg-white p-4 rounded shadow">
         <h3>{application.job.title}</h3>
         <p>{application.job.company}</p>
         <div className="flex gap-2 mt-2">
           <button onClick={() => generateResume(application)}>Generate Resume</button>
           <button onClick={() => markAsApplied(application)}>Mark Applied</button>
           <button onClick={() => archiveApplication(application)}>Archive</button>
         </div>
         <div className="mt-2">
           <input
             type="file"
             onChange={(e) => attachFile(application, e.target.files[0])}
           />
           <textarea
             placeholder="Add notes..."
             value={application.notes}
             onChange={(e) => updateNotes(application, e.target.value)}
           />
         </div>
       </div>
     );
   }
   ```

4. Implement status change timeline:
   ```typescript
   async function updateApplicationStatus(id: string, newStatus: string) {
     const application = await prisma.application.findUnique({ where: { id } });
     const statusHistory = [
       ...application.statusHistory,
       { status: newStatus, timestamp: new Date() }
     ];
     await prisma.application.update({
       where: { id },
       data: { status: newStatus, statusHistory, updatedAt: new Date() }
     });
   }
   ```

5. Add bulk operations (select multiple → archive/delete)
6. Implement search/filter functionality
7. Create CSV export feature
8. Add daily application cap enforcement

**Test Strategy:**

1. Test drag-and-drop between all stages
2. Verify status updates persist to database
3. Test status timeline shows all changes
4. Validate file attachment upload and storage
5. Test notes auto-save functionality
6. Verify quick actions (Generate Resume, Mark Applied, Archive)
7. Test bulk operations (select multiple cards)
8. Validate search/filter updates board
9. Test CSV export contains all data
10. Verify daily cap prevents exceeding limit
11. Test mobile responsiveness (horizontal scroll)

## Subtasks

### 19.1. Implement dnd-kit core functionality for drag-and-drop

**Status:** done  
**Dependencies:** None  

Set up dnd-kit library with proper collision detection, drag handlers, and state management for the Kanban board

**Details:**

Install required dnd-kit packages, configure DndContext with collision detection strategy, implement drag start/end handlers, and set up state management for drag operations between pipeline stages

### 19.2. Develop Kanban board structure and application card components

**Status:** done  
**Dependencies:** 19.1  

Create the visual layout of the Kanban board with customizable stages and design the application card UI with all required features

**Details:**

Implement Column component for pipeline stages, ApplicationCard component with job details, action buttons, file attachment input, and notes textarea. Style components using Tailwind CSS with responsive design considerations

### 19.3. Implement application status timeline and history tracking

**Status:** done  
**Dependencies:** 19.1, 19.2  

Create functionality to track and display the complete status history of each application with timestamps

**Details:**

Design database schema for status history, implement updateApplicationStatus function that records timeline entries with proper database transactions, create UI component to display status history in a timeline format with visual indicators

### 19.4. Implement bulk operations and CSV export features

**Status:** done  
**Dependencies:** 19.2, 19.3  

Add functionality to select multiple applications for bulk actions and implement CSV export of application data

**Details:**

Create selection mechanism for multiple applications with visual feedback, implement bulk archive/delete operations with confirmation dialogs, develop CSV export functionality with proper data formatting, headers, and download handling
