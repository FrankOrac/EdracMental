# Edrac VS Code Quick Start

Get Edrac running in VS Code for development in 3 simple steps!

## Step 1: Prerequisites
Install these before running Edrac:

1. **VS Code** → [Download from code.visualstudio.com](https://code.visualstudio.com/)
2. **Node.js 18+** → [Download from nodejs.org](https://nodejs.org/)
3. **PostgreSQL** → [Download from postgresql.org](https://www.postgresql.org/download/windows/)

## Step 2: Setup
1. Extract/clone the Edrac project folder
2. Double-click `scripts\vscode-setup.bat`
3. Follow prompts to configure your database
4. Wait for setup to complete (installs dependencies, creates VS Code config, seeds demo data)

## Step 3: Start Development
1. Double-click `scripts\vscode-start.bat` (opens VS Code automatically)
2. In VS Code, press `Ctrl+Shift+P`
3. Type "Tasks: Run Task" and select "Start Development Server"
4. Open your browser to `http://localhost:5000`

## Demo Accounts Ready to Use
- **Admin**: admin@edrac.com / admin
- **Institution**: institution@edrac.com / institution  
- **Student**: student@edrac.com / student

## VS Code Features Configured
- ✅ Debug configuration for server debugging
- ✅ Tasks for starting server, checking database, seeding data
- ✅ Recommended extensions for React/TypeScript development
- ✅ Auto-formatting and linting setup
- ✅ Integrated terminal and Git support

## Alternative: Use VS Code Debugger
1. Go to Run and Debug view (`Ctrl+Shift+D`)
2. Select "Launch Edrac Development Server"
3. Press `F5` to start with full debugging support
4. Set breakpoints in your code!

## Development Ready!
You now have a complete VS Code development environment with:
- Hot reload for instant code changes
- Full TypeScript IntelliSense and error checking
- Integrated debugging for both frontend and backend
- Database management tools
- Pre-configured code formatting and linting

## Need Help?
- Check `README-VSCODE.md` for detailed development guide
- Run `scripts\run-db-check.bat` to verify database connection
- Install recommended extensions when VS Code prompts

---
**Edrac** - VS Code development made easy! 🚀