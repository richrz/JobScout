# Implementation Plan - Task 19: Kanban Application Pipeline Tracker

## Objective
Build a Trello-like Kanban board to track job applications through various stages (Discovered, Applied, Interview, Offer, etc.) using `dnd-kit` for drag-and-drop functionality.

## Features
1.  **Kanban Board**: Horizontal scrolling board with columns for each application status.
2.  **Drag-and-Drop**: Move applications between stages.
3.  **Application Cards**: Display job title, company, and quick actions.
4.  **Status History**: Track when applications move between stages.
5.  **Notes & Attachments**: Add notes and files to applications.

## Technical Stack
-   **Frontend**: React, Tailwind CSS, `@dnd-kit/core`, `@dnd-kit/sortable`.
-   **Backend**: Next.js Server Actions (or API routes) for status updates.
-   **Database**: Prisma `Application` model.

## Steps

### 1. Setup & Dependencies
-   [x] Verify `@dnd-kit` dependencies (Core and Sortable installed).
-   [ ] Install `@dnd-kit/utilities` if needed.

### 2. Components
-   **`ApplicationCard.tsx`**: Individual card component.
    -   Props: `application` object.
    -   Features: Job details, "Generate Resume" button, "Archive" button.
-   **`PipelineColumn.tsx`**: Column component for a specific status.
    -   Props: `status`, `applications`.
    -   Features: Sortable context for drag-and-drop.
-   **`KanbanBoard.tsx`**: Main board component.
    -   Features: `DndContext`, state management, drag handlers (`onDragEnd`).

### 3. Data Integration
-   Create Server Action `updateApplicationStatus(id, newStatus)` in `src/app/actions/application.ts`.
-   Fetch applications grouped by status.

### 4. UI/UX
-   Responsive design (horizontal scroll on mobile).
-   Visual feedback during drag (DragOverlay).
-   Animations for moving cards.

## Verification
-   Drag a card from "Discovered" to "Applied".
-   Verify status update in database.
-   Check status history log.
