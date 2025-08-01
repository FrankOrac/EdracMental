# Edrac - Windows Setup Guide

Welcome to Edrac, Africa's first comprehensive AI-powered Computer-Based Testing (CBT) and smart learning platform.

## Prerequisites

Before running Edrac on Windows, ensure you have the following installed:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Git** (optional) - For cloning the repository

## Quick Start

### Option 1: Automated Setup (Recommended)

1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory
3. Run the setup script:
   ```bat
   scripts\windows-setup.bat
   ```
4. Follow the prompts to configure your database and API keys
5. Once setup is complete, start the application:
   ```bat
   scripts\windows-start.bat
   ```

### Option 2: Manual Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/your-repo/edrac.git
   cd edrac
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Update the database connection string and other settings

4. **Setup database**:
   ```bash
   npm run db:push
   ```

5. **Seed demo data**:
   ```bash
   npm run seed:demo
   ```

6. **Start the application**:
   ```bash
   npm run dev
   ```

## Database Setup

### PostgreSQL Configuration

1. Install PostgreSQL and create a database:
   ```sql
   CREATE DATABASE edrac;
   CREATE USER edrac_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE edrac TO edrac_user;
   ```

2. Update your `.env` file:
   ```env
   DATABASE_URL=postgresql://edrac_user:your_password@localhost:5432/edrac
   ```

## Demo Accounts

After running the seed script, you can use these demo accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@edrac.com | admin | Full system administration |
| Institution | institution@edrac.com | institution | School/institution management |
| Student | student@edrac.com | student | Student learning interface |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push database schema changes |
| `npm run db:check` | Check database connection and status |
| `npm run seed:demo` | Seed database with demo data |
| `npm run clean` | Clean temporary files and caches |

## Features Overview

### For Students
- **AI-Powered Tutoring**: 24/7 intelligent explanations and guidance
- **Exam Practice**: Authentic JAMB, WAEC, NECO, GCE simulation
- **Material Upload**: Transform your notes/ebooks into interactive lessons
- **Voice Interaction**: Learn through voice commands and responses
- **Performance Tracking**: Detailed analytics and progress monitoring

### For Institutions
- **Student Management**: Enrollment, progress tracking, bulk operations
- **Custom Exams**: Create and manage institutional examinations
- **Proctoring System**: Advanced anti-cheating with webcam monitoring
- **Analytics Dashboard**: Comprehensive performance insights
- **Branding**: Custom institutional branding and settings

### For Administrators
- **System Management**: User and institution administration
- **Content Management**: Question banks, subjects, curriculum
- **Security Controls**: User permissions and access management
- **Platform Analytics**: System-wide performance and usage metrics

## API Keys (Optional but Recommended)

To enable full functionality, configure these optional services:

### OpenAI API (for AI tutoring)
1. Get API key from [platform.openai.com](https://platform.openai.com/)
2. Add to `.env`: `OPENAI_API_KEY=your-key-here`

### Paystack (for payments)
1. Get keys from [paystack.com](https://paystack.com/)
2. Add to `.env`:
   ```env
   PAYSTACK_SECRET_KEY=your-secret-key
   PAYSTACK_PUBLIC_KEY=your-public-key
   ```

### SendGrid (for emails)
1. Get API key from [sendgrid.com](https://sendgrid.com/)
2. Add to `.env`:
   ```env
   SENDGRID_API_KEY=your-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in `.env` file
   - Verify database exists and user has permissions

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Or stop the service using port 5000

3. **Node.js Version Issues**
   - Ensure Node.js 18+ is installed
   - Run `node --version` to check

4. **Permission Errors**
   - Run Command Prompt as Administrator
   - Check file permissions in project directory

### Getting Help

- Check the console output for detailed error messages
- Review the `.env` configuration
- Ensure all prerequisites are properly installed
- Run `npm run db:check` to verify database connectivity

## Development

### Project Structure
```
edrac/
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared TypeScript schemas
├── scripts/         # Setup and utility scripts
├── docs/           # Documentation
└── README.md       # Main documentation
```

### Available Commands
- `npm run check` - Type check the codebase
- `npm run clean` - Clean build artifacts and temporary files

## Production Deployment

For production deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment:
   ```env
   NODE_ENV=production
   ```

3. Start production server:
   ```bash
   npm start
   ```

## Security Notes

- Change default session secret in production
- Use strong database passwords
- Keep API keys secure and never commit them to version control
- Enable HTTPS in production environments
- Regularly update dependencies for security patches

## Support

For technical support or questions:
- Check this documentation first
- Review error logs and console output
- Ensure all prerequisites are met
- Verify environment configuration

---

**Edrac** - Redefining how Africa learns and succeeds through AI-powered education technology.