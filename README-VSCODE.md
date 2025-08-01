# Edrac - VS Code Development Guide

This guide will help you set up and run Edrac in Visual Studio Code for development.

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Run the VS Code setup script**:
   ```bat
   scripts\vscode-setup.bat
   ```
   
2. **Start VS Code with Edrac**:
   ```bat
   scripts\vscode-start.bat
   ```

3. **Start the development server** in VS Code:
   - Press `Ctrl+Shift+P`
   - Type "Tasks: Run Task"
   - Select "Start Development Server"

### Option 2: Manual Setup

1. **Install prerequisites**:
   - Node.js 18+ from [nodejs.org](https://nodejs.org/)
   - PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
   - VS Code from [code.visualstudio.com](https://code.visualstudio.com/)

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database connection details
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Setup database**:
   ```bash
   npm run db:push
   ```

5. **Seed demo data**:
   ```bash
   scripts\run-seed.bat
   ```

6. **Open in VS Code**:
   ```bash
   code .
   ```

## VS Code Configuration

The setup script automatically creates these VS Code configurations:

### Workspace Settings (`.vscode/settings.json`)
- TypeScript import preferences
- Auto-format on save
- ESLint integration
- File exclusions for better performance

### Launch Configuration (`.vscode/launch.json`)
- Debug configuration for the development server
- Environment variables setup
- Integrated terminal support

### Tasks (`.vscode/tasks.json`)
- **Start Development Server**: Run `npm run dev`
- **Check Database**: Verify database connection
- **Seed Demo Data**: Populate database with sample data
- **Clean Codebase**: Remove temporary files

### Recommended Extensions (`.vscode/extensions.json`)
- **Tailwind CSS IntelliSense**: For styling support
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **TypeScript**: Enhanced TypeScript support
- **Auto Rename Tag**: HTML/JSX tag renaming
- **Path Intellisense**: File path autocompletion
- **PostgreSQL**: Database management

## Development Workflow

### Starting the Application

#### Method 1: Using VS Code Tasks
1. Press `Ctrl+Shift+P` (Command Palette)
2. Type "Tasks: Run Task"
3. Select "Start Development Server"
4. The integrated terminal will show server logs

#### Method 2: Using VS Code Debugger
1. Go to Run and Debug view (`Ctrl+Shift+D`)
2. Select "Launch Edrac Development Server"
3. Press `F5` to start with debugging support
4. Set breakpoints in your TypeScript code

#### Method 3: Using Terminal
1. Open integrated terminal (`Ctrl+``)
2. Run: `npm run dev`

### Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push database schema changes |
| `npm run check` | TypeScript type checking |

### Utility Scripts

| Script | Description |
|--------|-------------|
| `scripts\run-db-check.bat` | Check database connection |
| `scripts\run-seed.bat` | Seed database with demo data |
| `scripts\run-clean.bat` | Clean temporary files |

## Demo Accounts

After setup, use these accounts to test the application:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@edrac.com | admin | Full system administration |
| **Institution** | institution@edrac.com | institution | School management |
| **Student** | student@edrac.com | student | Learning interface |

## Project Structure

```
edrac/
├── .vscode/                 # VS Code configuration
│   ├── settings.json       # Workspace settings
│   ├── launch.json         # Debug configuration
│   ├── tasks.json          # Task definitions
│   └── extensions.json     # Recommended extensions
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main app component
├── server/                 # Backend Express server
│   ├── routes.ts           # API routes
│   ├── db.ts              # Database connection
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts          # Database schema definitions
├── scripts/               # Utility scripts
│   ├── vscode-setup.bat   # VS Code setup script
│   ├── vscode-start.bat   # VS Code launcher
│   └── db-check.ts        # Database verification
└── .env                   # Environment variables
```

## Debugging

### Backend Debugging
1. Use the VS Code debugger configuration
2. Set breakpoints in TypeScript files
3. Start with `F5` or "Launch Edrac Development Server"
4. Debug API routes and server logic

### Frontend Debugging
1. Use browser developer tools
2. VS Code can debug frontend with additional configuration
3. React DevTools extension recommended

### Database Debugging
1. Use the PostgreSQL extension in VS Code
2. Connect to your database directly
3. Run `scripts\run-db-check.bat` for connection verification

## Development Tips

### Hot Reload
- The development server automatically reloads on file changes
- Frontend changes trigger browser refresh
- Backend changes restart the server

### TypeScript Support
- Full IntelliSense and type checking
- Error highlighting in the editor
- Auto-imports and refactoring support

### Database Management
- Use Drizzle ORM for type-safe database operations
- Run `npm run db:push` after schema changes
- Never manually edit migration files

### Code Quality
- ESLint integration for code quality
- Prettier for consistent formatting
- Pre-configured rules for React and TypeScript

## Common Tasks

### Adding New Features
1. Define database schema in `shared/schema.ts`
2. Create API routes in `server/routes.ts`
3. Build frontend components in `client/src/`
4. Test with demo accounts

### Database Changes
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push`
3. Reseed data if needed: `scripts\run-seed.bat`

### Environment Configuration
1. Edit `.env` file for local settings
2. Never commit sensitive data
3. Use `.env.example` as template

## Troubleshooting

### Common Issues

**VS Code not opening**
- Check if VS Code is installed in default location
- Run `code .` manually from terminal

**Database connection failed**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Run `scripts\run-db-check.bat`

**Port already in use**
- Change PORT in `.env` file
- Kill process using port 5000

**TypeScript errors**
- Run `npm run check` for type checking
- Restart TypeScript language server in VS Code

**Dependencies issues**
- Delete `node_modules` and run `npm install`
- Check Node.js version (18+ required)

### Getting Help

1. Check VS Code integrated terminal for error messages
2. Use VS Code problems panel for TypeScript issues
3. Run database check script for database issues
4. Review environment configuration

## Production Deployment

For production deployment from VS Code:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment**:
   ```env
   NODE_ENV=production
   ```

3. **Start production server**:
   ```bash
   npm start
   ```

## Extensions Recommendations

Install these VS Code extensions for the best development experience:

### Essential
- **Tailwind CSS IntelliSense**: CSS class autocompletion
- **Prettier - Code formatter**: Consistent code formatting
- **ESLint**: JavaScript/TypeScript linting
- **TypeScript Importer**: Auto import suggestions

### Helpful
- **Auto Rename Tag**: Rename HTML/JSX tags together
- **Path Intellisense**: File path autocompletion
- **GitLens**: Enhanced Git capabilities
- **Thunder Client**: API testing (alternative to Postman)

### Database
- **PostgreSQL**: Database management and queries
- **SQLTools**: Database connection and query runner

## Performance Tips

- Use VS Code's built-in terminal for better integration
- Install only necessary extensions to avoid slowdown
- Use workspace-specific settings for project consistency
- Leverage VS Code's IntelliSense for faster development

---

**Edrac** - Happy coding with VS Code! 🚀

*Redefining how Africa learns and succeeds through AI-powered education technology.*