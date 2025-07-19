# Windows Development Setup Guide

Complete step-by-step guide to set up the Edrac CBT platform on a Windows machine.

## 🛠 Prerequisites Installation

### 1. Install Node.js (Required)

1. **Download Node.js**:
   - Go to [nodejs.org](https://nodejs.org/)
   - Download the LTS version (Long Term Support)
   - Choose "Windows Installer (.msi)" for 64-bit

2. **Install Node.js**:
   - Run the downloaded `.msi` file
   - Follow the installation wizard
   - ✅ Check "Automatically install the necessary tools" option
   - Click "Install" and wait for completion

3. **Verify Installation**:
   ```cmd
   # Open Command Prompt (cmd) and run:
   node --version
   npm --version
   
   # Should show version numbers like:
   # v20.x.x
   # 10.x.x
   ```

### 2. Install Git (Required)

1. **Download Git**:
   - Go to [git-scm.com](https://git-scm.com/)
   - Click "Download for Windows"

2. **Install Git**:
   - Run the downloaded `.exe` file
   - Keep default settings during installation
   - ✅ Select "Git from the command line and also from 3rd-party software"

3. **Verify Installation**:
   ```cmd
   git --version
   # Should show: git version 2.x.x
   ```

### 3. Choose Your Code Editor

**Option A: Visual Studio Code (Recommended)**
1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install with default settings
3. Install helpful extensions:
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets
   - Auto Rename Tag

**Option B: Other Editors**
- WebStorm (paid)
- Sublime Text
- Atom

### 4. Install Database Tool (Optional but Helpful)

**pgAdmin (for PostgreSQL management)**:
1. Download from [pgadmin.org](https://www.pgadmin.org/)
2. Install to manage your database visually

## 📁 Project Setup

### 1. Clone the Repository

```cmd
# Open Command Prompt or PowerShell
# Navigate to where you want the project
cd C:\Users\YourUsername\Documents

# Clone the repository
git clone [YOUR_REPOSITORY_URL]
cd edrac-cbt-platform
```

### 2. Install Dependencies

```cmd
# Install all project dependencies
npm install

# This will install everything listed in package.json
# Wait for completion (may take 2-5 minutes)
```

### 3. Environment Setup

1. **Create Environment File**:
   ```cmd
   # Create .env file in the root directory
   copy NUL .env
   ```

2. **Add Environment Variables**:
   Open `.env` file in your code editor and add:
   ```env
   # Database (will be provided by Replit or your database service)
   DATABASE_URL=your_database_connection_string
   
   # Optional: OpenAI API for AI features
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional: Payment processing
   PAYSTACK_SECRET_KEY=your_paystack_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   
   # Session secret (generate a random string)
   SESSION_SECRET=your_random_session_secret_here
   ```

## 🚀 Running the Application

### 1. Development Mode

```cmd
# Start the development server
npm run dev

# This will:
# 1. Start the Express server on port 5000
# 2. Start the Vite development server
# 3. Open your browser automatically
```

### 2. Access the Application

- **Main Application**: `http://localhost:5000`
- **Demo Login Credentials**:
  - Student: `student@edrac.com`
  - Institution: `institution@edrac.com`
  - Admin: `admin@edrac.com`

### 3. Database Setup

If you need to set up the database schema:

```cmd
# Push database schema to your database
npm run db:push

# Run seeding scripts to add sample data
npx tsx scripts/create-demo-user.ts
npx tsx scripts/seed.ts
```

## 🔧 Development Workflow

### Daily Development Process

1. **Start Your Day**:
   ```cmd
   # Navigate to project directory
   cd C:\path\to\edrac-cbt-platform
   
   # Pull latest changes
   git pull origin main
   
   # Install any new dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

2. **Making Changes**:
   - Edit files in your code editor
   - Save changes
   - Browser will automatically reload (Hot Module Replacement)

3. **End of Day**:
   ```cmd
   # Stage your changes
   git add .
   
   # Commit with descriptive message
   git commit -m "Add new feature: user profile management"
   
   # Push to repository
   git push origin main
   ```

## 📂 Folder Structure for Development

```
C:\Users\YourUsername\Documents\edrac-cbt-platform\
├── client/                    # Frontend React code
│   ├── src/
│   │   ├── components/       # Your UI components
│   │   ├── pages/           # Your page components
│   │   └── ...
├── server/                   # Backend Express code
│   ├── routes.ts            # API endpoints
│   ├── storage.ts           # Database operations
│   └── ...
├── shared/                   # Shared types and schemas
├── docs/                    # Documentation (this folder)
├── package.json            # Dependencies and scripts
├── .env                    # Your environment variables
└── README.md               # Project information
```

## 🐛 Common Windows Issues & Solutions

### Issue 1: "npm is not recognized"
**Solution**: 
- Restart Command Prompt after installing Node.js
- Or restart your computer

### Issue 2: Permission Errors
**Solution**:
```cmd
# Run Command Prompt as Administrator
# Right-click Command Prompt → "Run as administrator"
```

### Issue 3: Port Already in Use
**Solution**:
```cmd
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

### Issue 4: TypeScript Errors
**Solution**:
```cmd
# Check TypeScript compilation
npm run check

# Fix automatically when possible
npm run build
```

## 🔒 Security Setup

### 1. Environment Variables Security
- Never commit `.env` file to version control
- Keep API keys private
- Use different keys for development and production

### 2. Git Configuration
```cmd
# Set up your Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📱 Testing Your Setup

### 1. Frontend Test
1. Open `http://localhost:5000`
2. Should see the Edrac landing page
3. Try logging in with demo credentials

### 2. Backend Test
1. Open `http://localhost:5000/api/auth/user`
2. Should see JSON response (might be unauthorized, that's okay)

### 3. Database Test
```cmd
# Run a simple database check
npx tsx -e "import { db } from './server/db'; console.log('Database connected');"
```

## 🎯 Next Steps

After setup is complete:

1. **Read**: [codebase-overview.md](./codebase-overview.md) to understand the project
2. **Learn**: [component-development.md](./component-development.md) to start coding
3. **Follow**: [development-workflow.md](./development-workflow.md) for best practices

## 📞 Getting Help

If you encounter issues:

1. **Check Console**: Look for error messages in Command Prompt
2. **Check Browser**: Open Developer Tools (F12) for frontend errors
3. **Check Files**: Make sure all files are saved
4. **Restart**: Try restarting the development server

**Common Commands Reference**:
```cmd
# Install dependencies
npm install

# Start development
npm run dev

# Check for errors
npm run check

# Build for production
npm run build

# Database operations
npm run db:push
```

You're now ready to develop on the Edrac CBT platform! 🚀