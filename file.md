# Next.js File Organization Guide

## Core Principle: Feature-Based Colocation

Organize all files related to a single feature in one place. This is the most critical concept. Instead of grouping by file type (e.g., a global `/components` folder, a global `/hooks` folder), group by feature. This makes the codebase scalable and understandable. An AI or a new developer can look at a single directory and understand the entire feature.

## Example Complex Feature: "Project Analytics Dashboard"

To illustrate, we'll use a complex feature: a "Project Analytics Dashboard".

**This feature includes:**

- A main dashboard page showing multiple projects (`/projects`).
- A detailed view for each project with nested tabs for different analytics (`/projects/[projectId]/analytics`).
- The "Analytics" tab has sub-pages for "Traffic" and "User Engagement" (`/projects/[projectId]/analytics/traffic`).
- It fetches project data from our own database (Postgres/Supabase).
- It pulls in external data from a third-party analytics service (e.g., Google Analytics API).
- It requires user authentication to see projects.
- Users can generate and download PDF reports of the analytics.

---

## Directory Structure for the "Project Analytics Dashboard" Feature

This is how the `src/app/` directory would be structured for this feature. Note the absence of generic names. Every file and folder name describes its specific purpose.

```

src/
└── app/
└── (authenticated)/
└── projects/
├── \_components/
│   ├── project-list.tsx
│   ├── project-card.tsx
│   └── project-list-skeleton.tsx
├── \_hooks/
│   └── use-user-projects.ts
├── \_actions/
│   └── fetch-user-projects.ts
├── page.tsx
└── loading.tsx
└── [projectId]/
├── \_components/
│   ├── project-header.tsx
│   └── analytics-navigation.tsx
├── layout.tsx
└── page.tsx
└── analytics/
├── \_components/
│   ├── traffic-chart.tsx
│   ├── engagement-scorecard.tsx
│   └── date-range-picker.tsx
├── \_hooks/
│   └── use-project-analytics.ts
├── \_actions/
│   ├── fetch-internal-analytics.ts
│   └── fetch-google-analytics-data.ts
├── \_generators/
│   └── generate-analytics-pdf.ts
├── \_parsers/
│   └── parse-google-analytics-response.ts
├── \_validators/
│   └── validate-date-range.ts
├── layout.tsx
└── traffic/
├── page.tsx
└── error.tsx
└── user-engagement/
└── page.tsx

```

---

## Breakdown of the Structure

#### 1. Route Groups: `(authenticated)`

- **Purpose:** To apply a shared layout or logic to a group of routes without affecting the URL.
- **Example:** The `(authenticated)` group can have a `layout.tsx` that checks for a valid user session. All routes inside this folder (`/projects`, `/settings`, etc.) are now protected.

#### 2. Feature Root: `projects/`

- This is the entry point for the "projects" feature.
- `page.tsx`: The main page component that lists all user projects. It will use the `use-user-projects` hook to fetch data.
- `loading.tsx`: A React Suspense boundary that shows a loading UI (e.g., `project-list-skeleton.tsx`) while data is being fetched.
- `_components/`: Contains React components _only_ used by the `/projects` page and its direct children. Underscore indicates the folder does not create a URL segment.
- `_hooks/`: Contains React hooks specific to this part of the feature.
- `_actions/`: Contains Server Actions. These are server-side functions that can be called directly from client or server components.

#### 3. Nested Feature Route: `[projectId]/analytics/`

- This directory contains everything related to the analytics for a _single_ project.
- `layout.tsx`: A shared layout for all analytics pages (Traffic, User Engagement). It would contain the `project-header.tsx` and `analytics-navigation.tsx` components.
- `_components/`: Contains components like `traffic-chart.tsx`.
- `_hooks/`: Contains hooks like `use-project-analytics.ts`.
- **Purpose-Specific Subdirectories (The Anti-Generic Naming Rule in action):**
  - `_actions/`: `fetch-internal-analytics.ts`, `fetch-google-analytics-data.ts`
  - `_generators/`: `generate-analytics-pdf.ts`
  - `_parsers/`: `parse-google-analytics-response.ts`
  - `_validators/`: `validate-date-range.ts`

#### 4. Deeply Nested Pages: `traffic/` and `user-engagement/`

- `page.tsx`: The actual page component that arranges the specific components for that view.
- `error.tsx`: A file that defines a UI boundary for errors. If data fetching for the traffic page fails, this component will be rendered instead of crashing the entire application.

## Integrating the Critical Rules

- **No file > 150 lines:** This structure forces you to create small, focused files.
- **Anti-Generic Naming:** This is the core of the structure. There are no `utils` or `services`. The name of the directory (`_parsers`, `_generators`) and the file (`parse-google-analytics-response.ts`) tells you exactly what it does.
- **Separation of Concerns:** Client components are for UI. Server Actions are for data fetching and business logic. This is a clean separation.
- **API Guidelines:** The API _is_ the Server Actions. They are the secure endpoints. They must use proper error handling and return consistent, structured responses or throw custom errors.
- **Database Schema:** Actions will interact with your database models, which must be linked to a `User` for data isolation and filtered by `userId`.
- **Security:** API keys and sensitive logic are only used in server-side files (`_actions/`), never exposed to the client.
