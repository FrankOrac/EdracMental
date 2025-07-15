# Overview

Edrac is an AI-powered Computer-Based Testing (CBT) and smart learning platform designed to serve students, institutions, and corporate bodies across Nigeria and West Africa. The platform provides comprehensive examination preparation, AI-driven tutoring, and custom exam creation capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints under `/api` prefix

## Database Architecture
- **ORM**: Drizzle with type-safe schema definitions
- **Migration Strategy**: Schema-first approach with migrations in `./migrations`
- **Connection**: Neon serverless PostgreSQL with connection pooling

# Key Components

## Authentication System
- **Provider**: Replit Auth integration with passport.js
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Role-based access control (student, institution, admin)
- **Security**: HTTP-only cookies, secure session handling

## AI Integration
- **Provider**: OpenAI GPT-4o for question generation and tutoring
- **Services**: 
  - Question generation based on subject, topic, and difficulty
  - Real-time explanation of exam questions
  - 24/7 AI tutoring capabilities
- **Implementation**: Centralized OpenAI service with structured prompts

## Exam Engine
- **CBT Features**: Timed exams, question randomization, auto-submit
- **Anti-Cheating**: Tab switch detection, focus monitoring, optional webcam integration
- **Question Types**: Multiple choice with explanations
- **Exam Formats**: JAMB, WAEC, NECO, GCE, custom institutional exams

## Payment Integration
- **Provider**: Paystack for Nigerian market
- **Features**: Subscription management, one-time payments, institutional billing
- **Security**: Server-side payment verification and webhook handling

## UI/UX System
- **Design System**: shadcn/ui with custom Edrac branding
- **Theme Support**: Light/dark mode with CSS custom properties
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: Radix UI primitives ensure ARIA compliance

# Data Flow

## User Journey
1. **Authentication**: Users sign in via Replit Auth
2. **Dashboard Routing**: Role-based dashboard assignment (student/institution/admin)
3. **Exam Flow**: Subject selection → Topic selection → Exam configuration → CBT interface
4. **AI Interaction**: Real-time question explanations and tutoring during practice
5. **Analytics**: Performance tracking and progress reporting

## State Management
- **Client State**: React state for UI interactions
- **Server State**: TanStack Query for API data caching and synchronization
- **Session State**: Express sessions for authentication persistence
- **Real-time Updates**: Polling-based updates for exam sessions

## API Structure
- **Authentication**: `/api/auth/*` - User management and session handling
- **Content**: `/api/subjects/*`, `/api/topics/*` - Curriculum data
- **Exams**: `/api/exams/*` - Exam creation, sessions, and results
- **AI Services**: `/api/ai/*` - Question generation and tutoring
- **Analytics**: `/api/analytics/*` - Performance and usage statistics
- **Payments**: `/api/payments/*` - Subscription and billing management

# External Dependencies

## Core Services
- **Database**: Neon PostgreSQL for primary data storage
- **AI**: OpenAI API for question generation and tutoring
- **Authentication**: Replit Auth for user management
- **Payments**: Paystack for payment processing

## Development Tools
- **TypeScript**: Type safety across full stack
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development builds and HMR
- **Drizzle Kit**: Database schema management and migrations

## UI Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Consistent iconography
- **Date-fns**: Date manipulation utilities

# Deployment Strategy

## Build Process
- **Client**: Vite builds React app to `dist/public`
- **Server**: esbuild bundles Express server to `dist/index.js`
- **Assets**: Static files served from build directory

## Environment Configuration
- **Development**: Local development with Vite dev server proxy
- **Production**: Express serves static files and API routes
- **Database**: Environment-based connection strings
- **Secrets**: Environment variables for API keys and session secrets

## Performance Considerations
- **Database**: Connection pooling with Neon serverless
- **Caching**: TanStack Query for client-side data caching
- **Bundle Optimization**: Code splitting and tree shaking via Vite
- **CDN**: Static asset optimization for production deployment

## Monitoring and Analytics
- **Error Handling**: Centralized error boundaries and API error handling
- **Logging**: Request/response logging for API endpoints
- **Performance**: Built-in analytics for user engagement and exam performance
- **Security**: Session monitoring and authentication logging

# Recent Implementation Progress

## July 15, 2025 - Complete Platform Implementation
- ✅ Comprehensive database seeding with realistic Nigerian exam content
- ✅ Added 10 subjects (Mathematics, English, Physics, Chemistry, Biology, etc.)
- ✅ Created 17 topics across subjects with varied difficulty levels
- ✅ Populated 7+ sample questions with proper explanations
- ✅ Built 3 functional sample exams (JAMB Math, English Mock, Science Quiz)
- ✅ Created default user accounts for all roles (Admin, Student, Institution)
- ✅ Integrated Google OAuth authentication alongside Replit Auth
- ✅ All API endpoints working correctly (subjects, topics, questions, exams)
- ✅ Role-based dashboards functional for different user types
- ✅ AI tutoring system ready with OpenAI integration
- ✅ Payment integration configured with Paystack
- ✅ Anti-cheating features implemented in exam engine
- ✅ Mobile-responsive design with dark/light theme support

## July 15, 2025 - Authentication Enhancement
- ✅ Enhanced login page with comprehensive form validation
- ✅ Added traditional username/password login alongside OAuth
- ✅ Implemented functional forgot password modal with email reset
- ✅ Created demo account validation system with proper credentials
- ✅ Added toast notifications for better user feedback
- ✅ Improved OAuth flow with user-friendly redirect messages
- ✅ Fixed login form submission to handle both demo and OAuth flows
- ✅ Enhanced landing page with separate Login/Sign Up navigation

## Current Status
The Edrac CBT platform is fully functional with comprehensive features for Nigerian education sector. All core components are working, database is populated with realistic content, and multiple authentication methods are available. The login system now supports both traditional form-based login for demo accounts and OAuth for secure authentication.