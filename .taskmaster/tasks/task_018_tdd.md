# Task ID: 18

**Title:** Create Interactive Map Visualization with Mapbox GL JS

**Status:** pending

**Dependencies:** 17

**Priority:** high

**Description:** Build the geographic job visualization using Mapbox GL JS with color-coded markers, radius circles, density heatmap, clustering, popups, and mobile-optimized touch controls. Integrate into the application via the /map route, displaying real job data from the database and accessible via main navigation.

**Details:**

1. Install Mapbox dependencies:
   ```bash
   npm install mapbox-gl react-map-gl
   npm install -D @types/mapbox-gl
   ```

2. Create Map component:
   ```typescript
   // src/components/map/JobMap.tsx
   import Map, { Marker, Source, Layer, Popup } from 'react-map-gl';
   import 'mapbox-gl/dist/mapbox-gl.css';

   export function JobMap({ jobs, cities, filters }) {
     // ... implementation details
   }
   ```

3. Implement marker color coding based on composite score.
4. Add clustering for nearby jobs.
5. Create heatmap layer (toggleable).
6. Implement mobile touch gestures.
7. Add filter controls (status, date range, score threshold).
8. Create dark/light theme toggle.

9. Create Page Route:
   ```typescript
   // src/app/map/page.tsx
   import { JobMap } from '@/components/map/JobMap';
   import { getJobs } from '@/lib/api/jobs';

   export default async function MapPage() {
     const jobs = await getJobs();
     return <JobMap jobs={jobs} ... />;
   }
   ```

10. Update Navigation: Add link to /map in Navbar component.

**Test Strategy:**

1. Verify map loads with correct initial view
2. Test marker rendering for all jobs
3. Validate color coding (green/yellow/red by score)
4. Test radius circles display correctly
5. Verify clustering works (groups nearby markers)
6. Test popup opens on marker click
7. Validate heatmap toggle functionality
8. Test mobile touch gestures (pinch/zoom)
9. Verify filters update map in real-time
10. Test theme toggle (dark/light mode)
11. Check performance with 500+ markers
12. Verify /map route is accessible
13. Validate real data loads from database
14. Test navigation link works

## Subtasks

### 18.6. Create /map route and page wrapper

**Status:** pending  
**Dependencies:** 18.1  

Implement the /map route using the application router and wrap the JobMap component for display.

**Details:**

Create src/app/map/page.tsx (or equivalent), import the JobMap component, ensure proper layout wrapping, and verify route accessibility.

### 18.7. Integrate real job data from database

**Status:** pending  
**Dependencies:** 18.6  

Connect the map visualization to the actual job database instead of mock data.

**Details:**

Fetch job data using server actions or API hooks, transform database records to GeoJSON format required by Mapbox, handle loading states and empty data scenarios.

### 18.8. Add Map to main navigation

**Status:** pending  
**Dependencies:** 18.6  

Update the global navigation menu to include a link to the Map visualization.

**Details:**

Add 'Map' item to the main Navbar/Sidebar, ensure active state highlighting when on the /map route, and verify navigation links work.

### 18.9. Implement advanced map controls (Heatmap, Filters, Theme)

**Status:** pending  
**Dependencies:** 18.2, 18.7  

Add the remaining interactive controls including heatmap toggle, job filters, and theme switching.

**Details:**

Implement heatmap layer toggling, add filter UI for status/date/score, and implement dark/light mode switching for the map style.

### 18.1. Set up Mapbox GL JS integration and base map configuration

**Status:** done  
**Dependencies:** None  

Install dependencies, configure Mapbox token, and initialize the base map component with proper styling and view state management

**Details:**

Install mapbox-gl and react-map-gl packages, create JobMap component with TypeScript typing, configure dark-v11 map style, implement viewState management with useState, and ensure proper CSS imports

### 18.2. Implement color-coded job markers with clustering functionality

**Status:** done  
**Dependencies:** 18.1  

Create color-coded markers based on job scores and implement clustering for dense job locations with proper visual representation

**Details:**

Implement getMarkerColor function for score-based coloring, create marker components with proper styling, configure clustering with clusterMaxZoom=14 and clusterRadius=50, implement cluster layers for both cluster points and counts

### 18.3. Develop city radius circle visualization with proper styling

**Status:** done  
**Dependencies:** 18.1  

Create and render radius circles around configured cities with appropriate fill and border styling as specified in requirements

**Details:**

Implement createCircle utility function to generate GeoJSON for city radii, add Source and Layer components for both fill and line representations, apply proper styling with blue color (#3b82f6) and appropriate opacity/width values

### 18.4. Implement mobile-optimized touch controls and responsive design

**Status:** done  
**Dependencies:** 18.1  

Add support for mobile touch gestures including pinch/zoom, swipe navigation, and ensure proper responsive behavior across device sizes

**Details:**

Configure Map component with touchZoomRotate and dragPan enabled, implement responsive breakpoints for different screen sizes, add mobile-specific UI adjustments for markers and popups, ensure proper touch event handling

### 18.5. Optimize map performance for large job datasets (500+ markers)

**Status:** done  
**Dependencies:** 18.1, 18.2, 18.3  

Implement performance optimizations to ensure smooth rendering and interaction with large datasets of job locations

**Details:**

Implement data filtering based on current viewport, optimize GeoJSON data structure, use Mapbox's feature filtering capabilities, implement lazy loading for markers outside current view, optimize React component rendering with memoization
