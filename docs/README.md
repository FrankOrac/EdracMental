# Edrac CBT Platform - Developer Documentation

This documentation folder contains comprehensive guides for understanding and developing the Edrac CBT platform.

## 📋 Documentation Files

### Core Understanding
- **[codebase-overview.md](./codebase-overview.md)** - Complete codebase explanation, file structure, and logic flow
- **[windows-setup.md](./windows-setup.md)** - Step-by-step setup guide for Windows developers

### Development Guides
- **[component-development.md](./component-development.md)** - How to create, update, and delete components
- **[api-development.md](./api-development.md)** - Backend API development and database operations
- **[ui-styling-guide.md](./ui-styling-guide.md)** - UI components and styling patterns

### Best Practices
- **[development-workflow.md](./development-workflow.md)** - Daily development workflow and best practices
- **[testing-debugging.md](./testing-debugging.md)** - Testing strategies and debugging techniques
- **[deployment-guide.md](./deployment-guide.md)** - How to deploy and manage the application

## 🚀 Quick Start for New Developers

1. **Setup Environment**: Follow [windows-setup.md](./windows-setup.md)
2. **Understand Codebase**: Read [codebase-overview.md](./codebase-overview.md)
3. **Start Developing**: Use [component-development.md](./component-development.md)
4. **Follow Best Practices**: Check [development-workflow.md](./development-workflow.md)

## 📁 Project Structure Overview

```
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components by role
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and configurations
├── server/                   # Backend Express application
│   ├── services/            # Business logic services
│   ├── routes.ts            # API endpoints
│   └── storage.ts           # Database operations
├── shared/                   # Shared types and schemas
└── docs/                    # This documentation folder
```

## 🎯 Main Features

### Core Learning Platform
- **AI-Powered Tutoring**: GPT-4 integration with 24/7 intelligent assistance and fallback responses
- **Realistic CBT Engine**: Authentic exam simulation with anti-cheating measures and precise timing
- **Nigerian Curriculum**: Complete JAMB, WAEC, NECO, GCE, and Post-UTME coverage

### Advanced Features
- **AI Question Generation**: Automated question creation and validation with curriculum alignment
- **Advanced Proctoring**: Multi-modal monitoring with webcam, audio, and behavior analysis
- **Study Groups & Collaboration**: AI-powered student matching and real-time collaborative sessions
- **Comprehensive Analytics**: Performance tracking with predictive scoring and weakness identification

### Multi-Role Dashboards
- **Student Dashboard**: Practice tests, performance tracking, AI tutoring, and study groups
- **Institution Dashboard**: Student management, custom exams, analytics, and administrative tools
- **Admin Dashboard**: System-wide analytics, content management, and platform administration

### Technical Infrastructure
- **Payment Integration**: Paystack integration with subscription management and Nigerian banking support
- **Real-time Features**: Live chat, collaborative sessions, and instant performance updates
- **Mobile-First Design**: Progressive Web App with offline capability and responsive design

## 🛠 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth + Passport.js
- **AI**: OpenAI GPT-4 integration
- **Build Tools**: Vite, esbuild

Start with the setup guide and work through the documentation in order for the best learning experience!