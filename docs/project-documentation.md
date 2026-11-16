# 📘 Skillora – Project Documentation

**Project Name:** Skillora – Student Development Hub  
**Tagline:** *Learn • Practice • Grow*  
**Repository:** [https://github.com/Mahadharshini-M/Skillora-Student-Development-Hub](https://github.com/Mahadharshini-M/Skillora-Student-Development-Hub)  
**Author:** Mahadharshini M  
**Technologies:** HTML5, CSS3, Vanilla JavaScript (ES6+), LocalStorage, IndexedDB

---

## 1. Project Overview

Skillora is an all-in-one web platform created to help students systematically track their learning journey, manage practical engineering projects, organize academic certifications, and build a recruiter-ready portfolio in one unified space.

College students routinely acquire new technical skills, build course projects, earn certifications, and achieve competition milestones. However, these accomplishments are almost always fragmented across scattered folders, email threads, and resumes. Skillora consolidates these records into a modern, centralized student portfolio platform.

---

## 2. Architecture & File Structure

```text
Skillora/
│
├── index.html               # Landing page with hero & platform overview
├── login.html               # Student login portal (split-screen layout)
├── register.html            # New student registration portal
├── dashboard.html           # Central student mission control
├── profile.html             # Profile editor, personal bio, and links
├── skills.html              # Interactive skills matrix with progress sliders
├── projects.html            # Portfolio project tracker with status filters
├── certificates.html        # Academic & professional credentials vault
├── achievements.html        # Milestones, hackathon wins & awards hub
├── students.html            # Searchable student directory & peer roster
├── public-profile.html      # Publicly shareable student portfolio
├── resume.html              # Printable / exportable resume layout
│
├── assets/
│   ├── css/
│   │   ├── style.css        # Base layout, typography, and responsive rules
│   │   └── skillora.css     # Purple-Indigo design tokens, cards & overlays
│   │
│   ├── js/
│   │   └── app.js           # Client-side state, route guards, CRUD operations
│   │
│   └── images/
│       ├── skillora-icon.svg # Official brand vector logo
│       ├── favicon.svg      # Browser tab icon
│       ├── skillora-logo.jpg # Reference logo asset
│       ├── backgrounds/     # 11 optimized page backdrops (WebP)
│       └── certificates/    # Sample credential previews
│
├── docs/
│   └── project-documentation.md # Technical documentation (this file)
│
├── README.md                # Project README & user guide
└── .gitignore               # Standard Git ignore rules
```

---

## 3. The 12 Functional Modules

1. **Landing Page (`index.html`):** The primary public introduction showcasing platform capabilities, student statistics, and direct navigation into registration and directory browsing.
2. **Student Registration (`register.html`):** Onboards students with name, department, email, and password. Seeds initial demo skills and weekly learning missions upon account creation.
3. **Student Login (`login.html`):** Authenticates existing accounts against stored credentials and creates the active session token (`ssh_demo_current_user`).
4. **Student Dashboard (`dashboard.html`):** Central command center displaying personalized greeting, real-time metrics (skills count, average proficiency, mission ratio), and interactive weekly missions.
5. **Profile Management (`profile.html`):** Allows students to customize their bio, contact email, department, college, and social links (GitHub, LinkedIn).
6. **Skills Matrix (`skills.html`):** Interactive skill tracker categorized by tech domain (Frontend, Backend, Database, Cloud, AI). Features interactive percentage range sliders (0–100%) and automatic proficiency badges (`Beginner`, `Intermediate`, `Advanced`).
7. **Projects Portfolio (`projects.html`):** Organizes hands-on projects with status tags (`Planned`, `In Progress`, `Completed`), tech stack pills, and direct repository/demo URLs.
8. **Certificates Vault (`certificates.html`):** Structured repository for academic and professional credentials, recording issuing entity, credential IDs, and issue dates.
9. **Achievements Hub (`achievements.html`):** Records extracurricular honors, hackathon podiums, research publications, and student leadership roles.
10. **Student Directory (`students.html`):** Search and discovery engine allowing peers to find collaborators by name, department, or technical skill keywords.
11. **Public Profile (`public-profile.html`):** Standalone, shareable portfolio view that functions without requiring login, designed for recruiters and mentors.
12. **Resume Management (`resume.html`):** Compiles student records into a print-optimized, clean A4 resume view with `@media print` support and IndexedDB PDF storage.

---

## 4. State Management & Data Flow

Skillora utilizes browser-native client storage for complete independence from external server dependencies:

- **`localStorage` Key: `ssh_demo_students`:** Holds an array of all registered student profiles and their associated skills, projects, certificates, and missions.
- **`localStorage` Key: `ssh_demo_current_user`:** Stores the active session object of the currently logged-in student.
- **Authentication Guard:** A client-side route guard in `assets/js/app.js` checks for `ssh_demo_current_user` on protected pages (`dashboard.html`, `skills.html`, `projects.html`, etc.) and redirects unauthenticated visits to `login.html`.
- **Data Isolation:** All CRUD actions (adding a skill, toggling a mission, updating a project) mutate only the active student's record, preventing cross-account data conflicts.
- **`IndexedDB`:** Utilized on the resume page for persistent local caching of uploaded resume PDF files.

---

## 5. Design System

- **Primary Purple (`#7049EE`):** Primary actions, active navigation states, and brand highlights.
- **Deep Indigo (`#382B91`):** Headers, authority accents, and gradient endpoints.
- **Lavender Surface (`#F2EFFF`):** Soft tints for badges, active states, and pills.
- **Canvas (`#FBFAFF`):** High-luminance, distraction-free content background.
- **Dark Slate Text (`#211D35`):** High contrast typography ensuring WCAG compliance.
- **Glassmorphism:** Card surfaces use `rgba(255, 255, 255, 0.94)` with `backdrop-filter: blur(12px)` and subtle border styling, ensuring text legibility over photo backgrounds.

---

## 6. How to Run Locally

### VS Code Live Server:
1. Open the repository root folder in Visual Studio Code.
2. Ensure the **Live Server** extension is installed.
3. Right-click `index.html` and click **"Open with Live Server"**.

### Python HTTP Server:
```bash
python -m http.server 5501
```
Open `http://localhost:5501/index.html` in your browser.

---

## 7. Future Production Roadmap

- **Backend API:** Migration to Node.js & Express.js REST API.
- **Database:** PostgreSQL or MySQL database integration with Prisma ORM.
- **Security:** HTTP-Only cookie-based JWT authentication with bcrypt password hashing.
- **Cloud Storage:** Direct certificate and resume PDF uploads to AWS S3.
- **Institutional Access:** Role-based access control (RBAC) for college administrators and faculty verification.
