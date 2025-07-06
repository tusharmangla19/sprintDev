# SprintDev - Full Stack Project Management Platform

A modern, full-stack project management application built with Next.js, React, Tailwind CSS, Prisma, Neon, Clerk, and Shadcn UI.

## Features

- **Modern UI/UX**: Beautiful, responsive design with dark/light mode support
- **Project Management**: Create and manage projects with intuitive Kanban boards
- **Sprint Planning**: Robust sprint planning tools for agile teams
- **Team Collaboration**: Real-time collaboration features
- **Authentication**: Secure authentication with Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Deployment Ready**: Optimized for production deployment

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Clerk
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS with custom theme system

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utility functions
├── prisma/             # Database schema and migrations
├── public/             # Static assets
└── data/               # Static data files
```

Built with ❤️ for modern development teams.

### Make sure to create a `.env` file with following variables -

```
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```
