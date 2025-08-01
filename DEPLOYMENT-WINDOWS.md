# Edrac Windows Deployment Package

This package contains everything needed to run Edrac on Windows systems.

## What's Included

- **Complete Edrac Application** - AI-powered CBT and learning platform
- **Windows Setup Scripts** - Automated installation and configuration
- **Demo Data** - Pre-configured accounts and sample content
- **Documentation** - Comprehensive setup and usage guides

## Quick Start

1. **Download and Extract** this package to your desired location
2. **Run Setup** by double-clicking `scripts\windows-setup.bat`
3. **Follow the prompts** to configure your database and API keys
4. **Start the Application** by running `scripts\windows-start.bat`

## What the Setup Does

### Automated Setup Process
- ✅ Checks for Node.js and PostgreSQL installation
- ✅ Creates environment configuration file
- ✅ Installs all required dependencies
- ✅ Sets up database schema
- ✅ Seeds demo data with sample accounts
- ✅ Verifies installation integrity

### Demo Accounts Created
| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@edrac.com | admin | Full system control |
| **Institution** | institution@edrac.com | institution | School management |
| **Student** | student@edrac.com | student | Learning interface |

### Sample Content Included
- 📚 8 subjects (Mathematics, English, Physics, etc.)
- 📖 12+ topics across different subjects
- ❓ Sample questions with explanations
- 📝 Practice and mock exams
- 🏫 Demo institution setup

## System Requirements

### Prerequisites
- **Windows 10/11** (64-bit recommended)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/windows/)
- **4GB RAM minimum** (8GB recommended)
- **2GB free disk space**

### Optional Services
- **OpenAI API Key** - For AI tutoring features
- **Paystack Account** - For payment processing
- **SendGrid Account** - For email notifications

## File Structure

```
edrac/
├── scripts/
│   ├── windows-setup.bat      # Main setup script
│   ├── windows-start.bat      # Application launcher
│   ├── run-db-check.bat       # Database verification
│   ├── run-seed.bat           # Demo data seeding
│   └── run-clean.bat          # Cleanup utility
├── client/                    # Frontend application
├── server/                    # Backend API server
├── shared/                    # Shared TypeScript schemas
├── .env.example              # Environment template
├── README-WINDOWS.md         # Detailed Windows guide
└── DEPLOYMENT-WINDOWS.md     # This file
```

## Configuration

### Database Setup
The setup script will guide you through creating a `.env` file with your database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/edrac
```

### API Keys (Optional)
Add these to your `.env` file for full functionality:

```env
# AI Features
OPENAI_API_KEY=your-openai-key

# Payment Processing  
PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Email Notifications
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

## Running the Application

### First Time Setup
1. Run `scripts\windows-setup.bat`
2. Configure your database connection when prompted
3. Wait for the setup to complete

### Regular Usage
1. Run `scripts\windows-start.bat`
2. Open your browser to `http://localhost:5000`
3. Login with one of the demo accounts

### Available Scripts

| Script | Purpose |
|--------|---------|
| `windows-setup.bat` | Full installation and setup |
| `windows-start.bat` | Start the application |
| `run-db-check.bat` | Check database connection |
| `run-seed.bat` | Reseed demo data |
| `run-clean.bat` | Clean temporary files |

## Features Overview

### For Students
- **AI Tutoring** - 24/7 intelligent explanations and guidance
- **Exam Practice** - JAMB, WAEC, NECO, GCE simulation
- **Material Processing** - Upload notes/ebooks for AI transformation
- **Voice Interaction** - Learn through voice commands
- **Progress Tracking** - Detailed performance analytics

### For Institutions
- **Student Management** - Enrollment and bulk operations
- **Custom Exams** - Create institutional tests
- **Advanced Proctoring** - Anti-cheating with webcam monitoring
- **Analytics Dashboard** - Performance insights
- **Custom Branding** - Institutional customization

### For Administrators
- **System Control** - User and institution management
- **Content Management** - Question banks and curriculum
- **Security Settings** - Access control and permissions
- **Platform Analytics** - System-wide metrics

## Troubleshooting

### Common Issues

**"Database connection failed"**
- Ensure PostgreSQL is running
- Check your DATABASE_URL in the `.env` file
- Verify the database exists and user has permissions

**"Port 5000 already in use"**
- Change the PORT setting in your `.env` file
- Or stop the service using port 5000

**"Node.js not found"**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Restart your command prompt after installation

**"Permission denied errors"**
- Run Command Prompt as Administrator
- Check that you have write permissions in the installation directory

### Getting Help

1. Check the detailed error messages in the console
2. Review your `.env` configuration
3. Run `scripts\run-db-check.bat` to verify database connectivity
4. Ensure all prerequisites are properly installed

## Security Notes

- Change the default SESSION_SECRET in production
- Use strong database passwords
- Keep API keys secure and never share them
- Enable HTTPS for production deployments
- Regularly update dependencies

## Production Deployment

For production use:
1. Set `NODE_ENV=production` in your `.env`
2. Use strong passwords and secure API keys
3. Configure proper database backups
4. Set up HTTPS with SSL certificates
5. Configure firewall rules appropriately

## Support

This deployment package includes everything needed to run Edrac on Windows. For additional support:
- Review the included documentation
- Check system requirements
- Verify environment configuration
- Ensure all prerequisites are met

---

**Edrac** - Africa's first comprehensive AI-powered Computer-Based Testing (CBT) and smart learning platform.

*Redefining how Africa learns and succeeds through AI-powered education technology.*