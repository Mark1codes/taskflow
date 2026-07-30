<p align="center">
  <img src="./public/Task%20gif.gif" alt="TaskFlow landing page preview" width="100%" />
</p>

# TaskFlow

TaskFlow is a modern task management workspace built with Next.js, React, Supabase, and Tailwind CSS. It combines a polished SaaS-style landing page with an authenticated productivity dashboard for creating tasks, tracking progress, managing schedules, and using AI-assisted planning.

**Live app:** [https://taskflowv1.vercel.app](https://taskflowv1.vercel.app)

## Features

- **SaaS landing page** with dropdown-driven product, solution, and resource detail views.
- **Authentication** with Supabase email/password and Google OAuth support.
- **Task dashboard** with productivity summaries and workspace overview.
- **Task creation** with title, description, priority, status, due date, assignee, and category fields.
- **Task list** with search, status filters, priority filters, refresh, update, and delete actions.
- **Calendar view** for tasks with due dates.
- **Kanban board** for visual workflow management.
- **AI assistant** powered through a server-side OpenRouter API route.
- **Smart suggestions** based on the user's real task data.
- **Profile settings** with editable profile details, password update, preferences, and Supabase Storage avatar uploads.
- **Dark mode support** inside the authenticated app experience.
- **SEO foundation** with Next.js metadata, `robots.txt`, and `sitemap.xml`.
- **Responsive UI** built for desktop and mobile layouts.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 |
| UI | React 19, TypeScript |
| Styling | Tailwind CSS, tailwindcss-animate |
| Components | shadcn/ui-style components, Radix UI primitives |
| Icons | Lucide React |
| Backend/API | Next.js App Router API routes |
| Auth & Database | Supabase Auth, Supabase Postgres |
| File Storage | Supabase Storage |
| AI | OpenRouter chat completions API |
| Charts | Recharts |
| Deployment | Vercel |

## Project Structure

```text
TaskFlow/
|-- app/
|   |-- api/ai-chat/route.ts    # Server-side AI assistant endpoint
|   |-- layout.tsx              # Global metadata and layout
|   |-- page.tsx                # Landing/auth/app state entry
|   |-- robots.ts               # SEO robots rules
|   `-- sitemap.ts              # Public sitemap
|-- components/
|   |-- landing-page.tsx        # Public SaaS landing page
|   |-- task-manager-app.tsx    # Authenticated app shell
|   |-- dashboard.tsx           # Dashboard overview
|   |-- add-task.tsx            # Task creation
|   |-- task-list.tsx           # Searchable task list
|   |-- calendar-view.tsx       # Calendar task view
|   |-- kanban-board.tsx        # Kanban workflow view
|   |-- ai-assistant.tsx        # AI chat interface
|   |-- ai-work-planner.tsx     # AI task analysis/suggestions
|   |-- profile-page.tsx        # Profile and avatar settings
|   `-- ui/                     # Reusable UI primitives
|-- supabase/
|   `-- migrations/             # Database schema and RLS policies
|-- utils/
|   |-- supabase.tsx            # Supabase client
|   `-- avatar.ts               # Avatar Storage helpers
`-- public/                     # Public static assets
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Supabase project
- OpenRouter API key, for AI assistant features

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
AI_RATE_LIMIT_MAX=10
```

For production on Vercel, set:

```env
NEXT_PUBLIC_APP_URL=https://taskflowv1.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

Do not expose `OPENROUTER_API_KEY` with a `NEXT_PUBLIC_` prefix.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

### Start Production Build

```bash
npm run start
```

## Supabase Setup

TaskFlow expects Supabase Auth, Postgres tables, and Storage to be configured.

Core tables are defined in `supabase/migrations/20250618054928_remote_schema.sql`:

- `users`
- `profile`
- `task`

For profile images, create a Supabase Storage bucket named:

```text
avatars
```

Avatar files are uploaded under each user's folder:

```text
avatars/{user.id}/filename
```

Use Storage policies that allow authenticated users to read and write only their own folder.

## AI Assistant

The AI assistant uses the server route:

```text
POST /api/ai-chat
```

The route forwards validated chat messages to OpenRouter using the server-only `OPENROUTER_API_KEY`. The frontend never directly receives the API key.

## SEO

TaskFlow includes a basic SEO foundation:

- Metadata in `app/layout.tsx`
- Robots rules at `/robots.txt`
- Sitemap at `/sitemap.xml`
- Canonical URL based on `NEXT_PUBLIC_APP_URL`

Public SEO currently focuses on the landing page. Authenticated dashboard content should remain private and should not be indexed.

## Security Notes

- Keep `.env.local` untracked.
- Store production secrets in Vercel Environment Variables.
- Rotate any API key that has been exposed in logs, screenshots, commits, or chat.
- Keep Supabase Row Level Security policies scoped to `auth.uid()`.
- Avoid using service-role keys in frontend code.

## Deployment

The app is deployed on Vercel:

[https://taskflowv1.vercel.app](https://taskflowv1.vercel.app)

Recommended production environment variable:

```env
NEXT_PUBLIC_APP_URL=https://taskflowv1.vercel.app
```

After changing environment variables in Vercel, redeploy the project.

## License

This project is currently private/internal unless a license is added.
