# Overview

Edrac is Africa's first comprehensive AI-powered Computer-Based Testing (CBT) and smart learning platform, specifically designed for Nigerian students and educational institutions. It combines GPT-4 intelligence with authentic exam simulation to provide personalized learning, advanced proctoring, collaborative study groups, and complete institutional management. The platform covers all major Nigerian examinations (JAMB, WAEC, NECO, GCE, Post-UTME) and serves students, schools, training centers, and corporate bodies across Nigeria and West Africa with scalable, mobile-first technology.

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
- **ORM**: Drizzle with type-safe schema definitions and automated migrations
- **Migration Strategy**: Schema-first approach with npm run db:push for development
- **Connection**: PostgreSQL with connection pooling (migrated from Neon to standard PostgreSQL)
- **Key Tables**: Users, institutions, subjects, questions, exams, exam sessions, AI interactions, payments, notifications, learning packages, study groups, user preferences, performance tracking, and collaborative sessions.

## Core Features

### AI-Powered Learning
- **24/7 AI Tutoring**: GPT-4 integration providing comprehensive explanations, instant tutoring, personalized learning paths, intelligent fallback responses, and offline capability through smart content caching.
- **Custom Material Processing**: Upload your own materials (class notes, ebooks, lecturer slides) and our AI transforms them into interactive lessons with voice interaction.
- **AI Question Generation**: Automated question creation with curriculum alignment, difficulty optimization, grammar validation, and bulk import from CSV/Excel.
- **Intelligent Content Validation**: Real-time typo detection, content optimization, and curriculum compliance checking.

### Authentic Exam Experience
- **Realistic CBT Engine**: Precise exam simulation matching JAMB/WAEC conditions with countdown timers, auto-submit functionality, and question randomization.
- **Advanced Proctoring**: Multi-modal security with webcam monitoring, audio analysis, tab-switch detection, focus monitoring, and real-time violation reporting.
- **Anti-Cheating Measures**: Comprehensive security protocols including behavior analysis, device fingerprinting, and session integrity verification.

### Collaborative Learning Platform
- **Study Groups & Matchmaking**: AI-powered student matching based on preferences, subjects, and performance levels with real-time collaborative sessions.
- **Peer Learning Networks**: Group creation, shared practice sessions, collaborative problem-solving, and group performance tracking.
- **Social Learning Features**: Discussion forums, question sharing, and peer tutoring capabilities.

### Comprehensive Management Systems
- **Multi-Role Dashboards**: Specialized interfaces for students (practice, performance, groups), institutions (administration, analytics, custom exams), and administrators (system control, content management).
- **Institution Management**: Complete school administration with student enrollment, bulk operations, custom branding, exam creation, and performance analytics.
- **Question Bank Management**: Advanced CRUD operations, bulk import/export, categorization, difficulty tagging, and curriculum mapping.

### Advanced Analytics & Insights
- **Performance Tracking**: Comprehensive analytics with subject-wise analysis, weakness identification, improvement recommendations, and predictive scoring models.
- **Real-time Dashboards**: Live performance monitoring, engagement tracking, and progress visualization with interactive charts and reports.
- **Institutional Analytics**: Student management insights, class performance comparisons, and administrative reporting tools.

### Technical Infrastructure
- **Authentication System**: Replit Auth with OpenID Connect, role-based access control (student, institution, admin), secure session handling with PostgreSQL storage.
- **Payment Integration**: Full Paystack integration for Nigerian market with subscription management, one-time payments, institutional billing, and server-side verification.
- **Mobile-First Design**: Progressive Web App (PWA) with offline capability, responsive design, and optimized performance for low-bandwidth connections.
- **Real-time Features**: Live chat with AI integration, voice input/output, collaborative sessions, instant notifications, and FAQ system.

# External Dependencies

## Core Services
- **Database**: PostgreSQL
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