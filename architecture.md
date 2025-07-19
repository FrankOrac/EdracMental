# Edrac CBT Platform - System Architecture

## Overview
Edrac is a full-stack JavaScript application built with modern web technologies for Computer-Based Testing (CBT) and AI-powered learning. The platform follows a client-server separation pattern with React frontend and Express backend.

## Technology Stack

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (development server + build tool)
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS + shadcn/ui component library
- **State Management**: TanStack Query (React Query v5) for server state
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React icons
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion for UI animations

### Backend (Server)
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect) + Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **AI Integration**: OpenAI GPT-4 for question generation and tutoring
- **Payment Processing**: Stripe + Paystack for payment handling
- **Email**: SendGrid for email notifications

### Database & ORM
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema
- **Migrations**: Drizzle Kit for schema management
- **Connection Pooling**: Built-in with Neon serverless

## Project Structure

```
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── admin/             # Admin-specific components
│   │   │   ├── ai/                # AI tutoring components
│   │   │   ├── auth/              # Authentication components
│   │   │   ├── exam/              # Exam interface components
│   │   │   ├── institution/       # Institution management components
│   │   │   ├── layout/            # Layout and navigation components
│   │   │   ├── profile/           # User profile components
│   │   │   ├── student/           # Student dashboard components
│   │   │   ├── system/            # System-wide components
│   │   │   └── ui/                # shadcn/ui component library
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utility functions and configurations
│   │   ├── pages/                 # Page components organized by role
│   │   │   ├── admin/            # Admin dashboard pages
│   │   │   ├── institution/       # Institution management pages
│   │   │   ├── student/           # Student interface pages
│   │   │   └── system/            # System-wide pages
│   │   ├── App.tsx               # Main app component with routing
│   │   └── main.tsx              # React app entry point
├── server/                          # Backend Express application
│   ├── services/                  # Business logic services
│   │   ├── aiTutor.ts            # AI tutoring service
│   │   ├── openai.ts             # OpenAI integration
│   │   └── paystack.ts           # Payment processing
│   ├── db.ts                     # Database connection setup
│   ├── routes.ts                 # API route definitions
│   ├── storage.ts                # Data access layer
│   ├── index.ts                  # Server entry point
│   └── vite.ts                   # Vite integration for dev server
├── shared/                          # Shared code between client/server
│   └── schema.ts                 # Database schema and types
├── scripts/                         # Database seeding and utilities
└── package.json                    # Dependencies and scripts
```

## Architecture Patterns

### Client-Server Separation
- **Frontend**: Handles all UI interactions, routing, and presentation logic
- **Backend**: Provides RESTful API endpoints for data operations
- **Shared Types**: TypeScript interfaces shared between client and server
- **Authentication**: Session-based auth with HTTP-only cookies

### Data Flow Architecture
1. **Client State**: React component state for UI interactions
2. **Server State**: TanStack Query for API data caching and synchronization
3. **Database Operations**: Drizzle ORM with type-safe queries
4. **API Layer**: Express routes handle business logic and validation

### Role-Based Access Control
- **Students**: Access to exams, practice tests, AI tutoring, study groups
- **Institutions**: User management, custom exams, analytics, payments
- **Admins**: System-wide control, user management, content oversight

## API Architecture

### RESTful Endpoints
```
/api/auth/*           - Authentication and session management
/api/users/*          - User management (admin/institution)
/api/subjects/*       - Subject and curriculum data
/api/topics/*         - Topic management within subjects
/api/questions/*      - Question bank operations
/api/exams/*          - Exam creation and management
/api/analytics/*      - Performance and system analytics
/api/ai/*             - AI tutoring and question generation
/api/payments/*       - Payment processing and subscriptions
/api/institutions/*   - Institution management
/api/study-groups/*   - Collaborative learning features
```

### Request/Response Pattern
- **Authentication**: Session-based with Passport.js middleware
- **Validation**: Zod schemas for request body validation
- **Error Handling**: Centralized error responses with proper HTTP status codes
- **CORS**: Configured for same-origin requests in production

## Database Schema

### Core Entities
- **Users**: Student, institution, and admin accounts
- **Subjects**: Academic subjects (Math, English, etc.)
- **Topics**: Sub-categories within subjects
- **Questions**: Question bank with multiple choice support
- **Exams**: Exam definitions and configurations
- **Exam Sessions**: Individual exam attempts
- **Results**: Exam results and performance tracking

### Advanced Features
- **Study Groups**: Collaborative learning with AI matching
- **Learning Packages**: Subscription-based content access
- **Institution Settings**: Custom configurations per institution
- **Student Performance**: Detailed analytics per subject/topic

## Development Workflow

### Local Development
1. **Database**: PostgreSQL via Replit's managed database service
2. **Frontend**: Vite dev server with hot module replacement (HMR)
3. **Backend**: tsx watch mode for TypeScript execution
4. **Full-Stack**: Single port setup (5000) serves both client and API

### Build Process
1. **Client Build**: `vite build` → static assets in `dist/public`
2. **Server Build**: `esbuild` → bundled server in `dist/index.js`
3. **Schema Management**: `drizzle-kit push` for database updates

## Security Architecture

### Authentication & Authorization
- **Replit Auth**: OpenID Connect integration with Replit
- **Session Management**: Secure HTTP-only cookies
- **Role-Based Access**: Middleware-enforced permissions
- **CSRF Protection**: Built-in Express session security

### Data Protection
- **Environment Variables**: Secure secret management
- **Input Validation**: Zod schema validation on all endpoints
- **SQL Injection**: Prevented by Drizzle ORM parameterization
- **XSS Protection**: React's built-in escaping + CSP headers

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Vite automatic chunk splitting
- **State Management**: TanStack Query with intelligent caching
- **Bundle Size**: Tree shaking and dead code elimination
- **Asset Optimization**: Vite handles image and asset optimization

### Backend Performance
- **Database Pooling**: Neon serverless connection pooling
- **Query Optimization**: Drizzle ORM efficient query generation
- **Caching**: In-memory caching for frequently accessed data
- **Session Storage**: PostgreSQL-backed session storage

## Deployment Architecture

### Production Environment
- **Platform**: Replit deployment infrastructure
- **Process Management**: Single Node.js process serving static files and API
- **Database**: Neon PostgreSQL with connection pooling
- **CDN**: Static asset delivery through Replit's CDN

### Environment Configuration
- **Development**: Local development with Vite proxy
- **Production**: Express serves built React app + API routes
- **Environment Variables**: Managed through Replit's secret management

## Monitoring & Observability

### Error Handling
- **Client-Side**: React Error Boundaries with user-friendly fallbacks
- **Server-Side**: Express error middleware with logging
- **Database**: Drizzle query error handling and rollback support

### Analytics
- **User Analytics**: Built-in performance tracking per user/institution
- **System Metrics**: Real-time dashboard with usage statistics
- **Exam Analytics**: Detailed performance reporting and insights

## Scalability Considerations

### Current Architecture
- **Single-Node**: Express server handles all requests
- **Session-Based Auth**: PostgreSQL session storage
- **File-Based Routing**: Wouter client-side routing

### Future Scaling Options
- **Microservices**: AI services could be separated
- **Load Balancing**: Multiple server instances with shared session store
- **CDN Integration**: Static asset optimization
- **Database Sharding**: Subject/institution-based data partitioning

## Integration Points

### External Services
- **OpenAI API**: Question generation and AI tutoring
- **Replit Auth**: User authentication and identity management
- **Paystack/Stripe**: Payment processing for subscriptions
- **SendGrid**: Email notifications and communications
- **Neon Database**: Managed PostgreSQL hosting

### Third-Party Libraries
- **UI Framework**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form + Zod validation
- **Charts/Analytics**: Recharts for data visualization
- **Date/Time**: date-fns for date manipulation

This architecture provides a solid foundation for the Edrac CBT platform with clear separation of concerns, type safety, and scalable patterns for future growth.