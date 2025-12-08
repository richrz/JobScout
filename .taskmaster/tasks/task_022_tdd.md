# Task ID: 22

**Title:** Implement Responsive UI with Tailwind CSS and shadcn/ui Components

**Status:** done

**Dependencies:** 11 ✓

**Priority:** medium

**Description:** Build the complete mobile-first responsive design system using Tailwind CSS and shadcn/ui, implement dark/light theme toggle, create mobile optimizations (touch targets, swipe gestures, bottom navigation), and ensure performance targets (FCP < 1.5s, TTI < 3s).

**Details:**

1. Install shadcn/ui and configure:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card input label select tabs dialog
   ```

2. Configure Tailwind with custom theme:
   ```typescript
   // tailwind.config.ts
   export default {
     darkMode: ['class'],
     content: ['./src/**/*.{ts,tsx}'],
     theme: {
       extend: {
         colors: {
           border: 'hsl(var(--border))',
           background: 'hsl(var(--background))',
           foreground: 'hsl(var(--foreground))',
           primary: {
             DEFAULT: 'hsl(var(--primary))',
             foreground: 'hsl(var(--primary-foreground))'
           }
         },
         spacing: {
           // 4px grid system
         }
       }
     }
   };
   ```

3. Create theme provider:
   ```typescript
   // src/components/theme-provider.tsx
   import { createContext, useContext, useEffect, useState } from 'react';

   type Theme = 'dark' | 'light' | 'system';

   export function ThemeProvider({ children }) {
     const [theme, setTheme] = useState<Theme>('dark');

     useEffect(() => {
       const root = window.document.documentElement;
       root.classList.remove('light', 'dark');
       root.classList.add(theme === 'system' ? getSystemTheme() : theme);
     }, [theme]);

     return (
       <ThemeContext.Provider value={{ theme, setTheme }}>
         {children}
       </ThemeContext.Provider>
     );
   }
   ```

4. Implement responsive breakpoints:
   ```css
   /* Mobile: < 640px (default) */
   .container { padding: 1rem; }

   /* Tablet: 640px - 1024px */
   @media (min-width: 640px) {
     .container { padding: 2rem; }
   }

   /* Desktop: > 1024px */
   @media (min-width: 1024px) {
     .container { padding: 3rem; }
   }
   ```

5. Create mobile navigation:
   ```typescript
   function MobileNav() {
     return (
       <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
         <div className="flex justify-around p-2">
           <NavButton icon={<Home />} label="Home" />
           <NavButton icon={<Map />} label="Map" />
           <NavButton icon={<Briefcase />} label="Pipeline" />
           <NavButton icon={<Settings />} label="Settings" />
         </div>
       </nav>
     );
   }
   ```

6. Implement swipe gestures:
   ```typescript
   import { useSwipeable } from 'react-swipeable';

   const handlers = useSwipeable({
     onSwipedLeft: () => markAsNotInterested(),
     onSwipedRight: () => markAsInterested(),
     trackMouse: true
   });
   ```

7. Add Framer Motion animations:
   ```typescript
   import { motion } from 'framer-motion';

   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.3 }}
   >
     {content}
   </motion.div>
   ```

8. Optimize performance:
   - Lazy load images with next/image
   - Code split routes with dynamic imports
   - Implement virtual scrolling for long lists
   - Add service worker for offline support

**Test Strategy:**

1. Test responsive design on mobile (< 640px)
2. Verify tablet layout (640px - 1024px)
3. Test desktop layout (> 1024px)
4. Validate dark/light theme toggle works
5. Test touch targets are minimum 44×44px
6. Verify swipe gestures work on mobile
7. Test bottom navigation on mobile
8. Measure FCP < 1.5s with Lighthouse
9. Measure TTI < 3s on 4G throttling
10. Verify Lighthouse score > 90
11. Test on Google Pixel and iPhone 14
12. Validate animations are smooth (60fps)

## Subtasks

### 22.1. Configure shadcn/ui Component Library

**Status:** done  
**Dependencies:** None  

Set up shadcn/ui component library with required components and proper configuration

**Details:**

Execute 'npx shadcn-ui@latest init' to initialize the library. Configure components.json with proper settings including style, rsc, tsx, tailwind configuration, and icon library. Add required components using 'npx shadcn-ui@latest add button card input label select tabs dialog'. Verify component installation by importing and rendering a test button component.
<info added on 2025-12-04T16:18:15.780Z>
Verify shadcn/ui configuration and check tailwind.config.ts theme setup. Add any missing UI components. Write tests to verify the component library is accessible.
</info added on 2025-12-04T16:18:15.780Z>

### 22.2. Implement Mobile-First Responsive Design System

**Status:** done  
**Dependencies:** 22.1  

Create responsive layout with mobile-first approach using Tailwind CSS breakpoints

**Details:**

Configure Tailwind CSS breakpoints for mobile (<640px), tablet (640px-1024px), and desktop (>1024px). Implement mobile-specific optimizations including bottom navigation bar, touch targets of minimum 44x44px, and swipe gesture handling using react-swipeable. Create responsive container classes with appropriate padding for each breakpoint. Test layouts on various device sizes.
<info added on 2025-12-04T16:23:33.250Z>
Plan: Create MobileNav component with bottom navigation. Implement responsive breakpoints. Add touch-friendly tap targets (min 44px). Write tests for mobile navigation and responsive behavior.
</info added on 2025-12-04T16:23:33.250Z>

### 22.3. Implement Dark/Light Theme Toggle System

**Status:** done  
**Dependencies:** 22.1  

Create theme provider with dark/light mode toggle functionality and consistent theming across components

**Details:**

Configure Tailwind CSS with darkMode: ['class'] setting. Implement theme provider component that manages theme state (light, dark, system) and applies appropriate CSS classes. Set up CSS variables for border, background, foreground, and primary colors. Create theme toggle button component that allows users to switch between themes. Ensure all shadcn/ui components properly respond to theme changes.

### 22.4. Optimize UI Performance to Meet Targets

**Status:** done  
**Dependencies:** 22.1, 22.2, 22.3  

Implement performance optimizations to achieve FCP < 1.5s and TTI < 3s metrics

**Details:**

Implement lazy loading for images using next/image component. Apply code splitting for routes using dynamic imports. Implement virtual scrolling for long lists using libraries like react-virtualized. Add service worker for offline support and caching. Optimize component rendering with React.memo and useCallback. Measure performance metrics using Lighthouse and implement necessary improvements to meet targets.
