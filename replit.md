# Overview

Edrac is an AI-powered Computer-Based Testing (CBT) and smart learning platform designed to serve students, institutions, and corporate bodies across Nigeria and West Africa. It offers comprehensive examination preparation, AI-driven tutoring, custom exam creation, and aims to be a leading educational technology solution with significant market potential in the Nigerian EdTech sector.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: TanStack Query
- **Build Tool**: Vite
- **UI/UX**: shadcn/ui design system with custom branding, light/dark mode, mobile-first responsive design, and Radix UI for accessibility. Interactive elements include image sliders, animated cards, and 3D animated showcases.

## Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect, integrated with passport.js for session management
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints under `/api` prefix, secured with role-based access control.

## Database
- **ORM**: Drizzle with type-safe schema definitions
- **Migration Strategy**: Schema-first approach
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Key Tables**: Users, institutions, subjects, questions, exams, learning packages, AI tutor sessions, study groups, user preferences, and performance tracking.

## Core Features
- **Authentication System**: Replit Auth, role-based access (student, institution, admin), HTTP-only cookies, secure session handling.
- **AI Integration**: OpenAI GPT-4o for question generation, real-time explanations, 24/7 tutoring, and question validation. Includes intelligent fallbacks for API limitations.
- **Exam Engine**: Timed CBT exams, question randomization, auto-submit, anti-cheating measures (tab switch detection, focus monitoring, optional webcam integration), multiple-choice questions with explanations. Supports JAMB, WAEC, NECO, GCE, and custom exams.
- **Payment Integration**: Paystack for Nigerian market, supporting subscriptions and one-time payments. Includes server-side verification.
- **Role-Based Dashboards**: Tailored dashboards for students (performance tracking, study groups, inline exam viewing), institutions (student management, exam/question creation, analytics), and administrators (full system control, content management, analytics, settings).
- **Question Management**: Comprehensive CRUD operations, bulk import (CSV/Excel), AI-powered question validation.
- **Collaborative Study Groups**: AI-powered matchmaking based on preferences, real-time session management, and group creation/joining.
- **Profile Management**: User profile updates, security settings, profile picture uploads.
- **Live Chat**: Real-time messaging with AI integration, voice input/output, and FAQ system.
- **Analytics**: Advanced dashboards with real-time charts and visualizations for user engagement and exam performance.

# External Dependencies

## Core Services
- **Database**: Neon PostgreSQL
- **AI**: OpenAI API
- **Authentication**: Replit Auth
- **Payments**: Paystack

## Development Tools
- **TypeScript**: For type safety
- **ESLint/Prettier**: For code quality and formatting
- **Vite**: For fast development builds
- **Drizzle Kit**: For database schema management

## UI Dependencies
- **Radix UI**: For accessible component primitives
- **Tailwind CSS**: For utility-first styling
- **Lucide Icons**: For iconography
- **Date-fns**: For date manipulation