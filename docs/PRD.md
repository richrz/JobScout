
### **Draft: Project Requirements Document (PRD)**

*   **Project Name:** (Working Title) "AI Job Search Navigator"
*   **Executive Summary:** The AI Job Search Navigator is a web application designed to combat the overwhelming and disorganized nature of modern job seeking. It provides a centralized, map-based dashboard for users to manage their job search, leveraging AI to automatically tailor a comprehensive personal profile into unique resumes for each job application. The goal is to give users a sense of control, save significant time, and increase the effectiveness of their applications.
*   **Target Audience (MVP):** The initial user is you, Richard.
*   **Target Audience (Future):** Any professional who applies to multiple jobs and feels overwhelmed by the process of tailoring and tracking resumes. The system is designed to be modular to eventually support a wide range of users.
*   **Problem Solved:**
    *   **Resume Fatigue:** Eliminates the tedious, time-consuming process of manually tailoring resumes for every job.
    *   **Tracking Chaos:** Replaces messy spreadsheets and forgotten applications with a clear, visual system ("interested" vs. "applied").
    *   **Feeling of Powerlessness:** The map-centric view and powerful AI tools provide a sense of control and strategy over the job search.

### **Draft: Core Feature Set (Functional Requirements)**

1.  **Comprehensive User Profile:** A section where a user can input exhaustive detail about their entire career: every job, skill, project, education, and accomplishment. This will serve as the "single source of truth" for the AI.
2.  **AI Resume Tailoring Engine:**
    *   Accepts a user-provided job description (via manual copy-paste).
    *   Uses the data from the Comprehensive User Profile to generate a tailored resume.
    *   Includes an "Exaggeration" setting (e.g., Level 1: Factual & Direct, Level 2: Emphasized & Professional, Level 3: Highly Persuasive & Bold) that functions like an LLM's temperature setting.
    *   Allows the user to review, edit, and save the final AI-generated resume.
3.  **Job Application Tracker:**
    *   A primary dashboard view centered around a map to visualize job locations.
    *   A system to categorize jobs as either "Interested" or "Applied."
    *   Each tracked job will store the job description and the specific resume version that was created for it.
4.  **User Authentication:** Secure sign-up and login, initially with Google OAuth2 for simplicity and security.

### **Draft: UI/UX & Design Guidelines**

*   **Visual Inspiration:** The design will be heavily based on the "Dashdark X" Figma image provided.
*   **Color Palette:** A dark mode theme with a deep navy/charcoal base, accented by vibrant purples, blues, and teals for interactive elements and data visualizations.
*   **Look & Feel:** The interface should feel modern, clean, and data-rich, like a professional SaaS tool.
*   **User Experience Vibe:** Users should feel like they are using **"Next-gen AI tech"** that is also **"fun"** and empowering to use.
*   **Animations & Components:** The app should feel slick and responsive, incorporating "Framer-style" animations for transitions and interactions. It will utilize a modern component library like **Shadcn** to ensure a high-quality, consistent look.
*   **Platform:** The application must be **mobile-first and fully responsive**, ensuring a seamless experience on both desktop and mobile devices like a Pixel phone.

### **Draft: Technical & Non-Functional Notes**

*   **Performance:** Speed is a secondary concern for the MVP. The priority is on functionality and user experience.
*   **Modularity:** The system architecture must be designed from the ground up to be modular, allowing for the easy addition of new users and features in the future.
*   **AI Integration:** The core resume tailoring feature will rely on an API call to a powerful Large Language Model (LLM). The "exaggeration" level will be implemented by adjusting the `temperature` parameter in the API call.

---

### **Excellent! What Are Your Next Steps?**

You have successfully turned the ideas in your head into a concrete and actionable plan. This is the most critical step. Now, you can take these structured requirements and use them to guide the development process.

Here are the questions you should ask me (or an AI developer like Task-Master-AI) next, based on this plan:

1.  **"Can you create a step-by-step user flow based on these requirements? I want to see the journey from a user signing up for the first time to successfully applying for a job."**
2.  **"Based on the 'Dashdark X' design, can you create a simple wireframe or layout for the main dashboard screen, showing the map and the key stats?"**
3.  **"Let's define the AI prompt. What information should we send to the AI to generate the tailored resume, and what instructions should we give it to handle the different 'exaggeration' levels?"**

Which of these questions would you like to tackle first?