# Overview

Edrac is Africa's first comprehensive AI-powered Computer-Based Testing (CBT) and smart learning platform, specifically designed for Nigerian students and educational institutions. It combines GPT-4 intelligence with authentic exam simulation to provide personalized learning, advanced proctoring, collaborative study groups, and complete institutional management. The platform covers all major Nigerian examinations (JAMB, WAEC, NECO, GCE, Post-UTME) and serves students, schools, training centers, and corporate bodies across Nigeria and West Africa with scalable, mobile-first technology.

## Recent Changes
- **VS Code Development Setup** (August 2025): Created comprehensive VS Code deployment scripts with automated workspace configuration, debugging setup, and development environment
- **Windows Deployment System** (August 2025): Created comprehensive Windows deployment scripts with automated setup, database seeding, and demo account creation
- **Hero Section Optimization** (August 2025): Fixed layout issues to achieve clean two-column design with metrics/features properly positioned below
- **Demo Data Infrastructure** (August 2025): Implemented complete seeding system with demo accounts, sample questions, and institutional setup

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

## Windows Deployment

### Deployment Scripts
- **windows-setup.bat**: Automated installation and configuration script
- **windows-start.bat**: Application launcher with database verification
- **run-db-check.bat**: Database connection and schema verification
- **run-seed.bat**: Demo data seeding with sample accounts
- **run-clean.bat**: Safe codebase cleanup utility

### Demo Accounts
- **Admin**: admin@edrac.com (password: admin) - Full system administration
- **Institution**: institution@edrac.com (password: institution) - School management
- **Student**: student@edrac.com (password: student) - Learning interface

### Sample Data
- 8 subjects (Mathematics, English, Physics, Chemistry, Biology, Computer Science, Literature, Geography)
- 12+ topics across different subjects with difficulty levels
- Sample multiple-choice questions with detailed explanations
- Practice and mock exams with proctoring settings
- Demo institution with complete configuration

### Prerequisites
- Windows 10/11 (64-bit recommended)
- Node.js 18+ 
- PostgreSQL 12+
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space

## VS Code Development Setup

### Development Scripts
- **vscode-setup.bat**: Automated VS Code workspace configuration and setup
- **vscode-start.bat**: Launch VS Code with Edrac project and optimal settings
- **VS Code Tasks**: Integrated tasks for starting server, database checks, and seeding
- **Debug Configuration**: Full debugging support for backend with breakpoints

### VS Code Features Configured
- TypeScript IntelliSense with import preferences and auto-formatting
- ESLint integration with code quality enforcement
- Recommended extensions for React/TypeScript development
- Integrated terminal with optimized workspace settings
- Launch configurations for debugging server-side code
- Tasks for database management, seeding, and cleanup operations

### Development Workflow
- Hot reload for instant code changes during development
- Full debugging support with breakpoints and variable inspection
- Integrated Git support with enhanced GitLens capabilities
- Database management through PostgreSQL extension
- Auto-formatting on save with Prettier integration