@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    Edrac VS Code Development Setup
echo ==========================================
echo.

:: Check if we're in the correct directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the Edrac root directory
    pause
    exit /b 1
)

:: Check Node.js installation
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Display Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js version: %NODE_VERSION%

:: Check PostgreSQL installation
echo [INFO] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL not found in PATH. Please ensure PostgreSQL is installed.
    echo Download from: https://www.postgresql.org/download/windows/
)

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [INFO] .env file created. Please configure your database connection.
    ) else (
        echo [INFO] Creating default .env file...
        (
            echo # Database Configuration
            echo DATABASE_URL=postgresql://username:password@localhost:5432/edrac
            echo.
            echo # Application Configuration
            echo NODE_ENV=development
            echo PORT=5000
            echo.
            echo # Authentication
            echo SESSION_SECRET=your-super-secret-session-key-change-this-in-production
            echo.
            echo # OpenAI API Key ^(Optional^)
            echo OPENAI_API_KEY=your-openai-api-key-here
            echo.
            echo # Paystack API Keys ^(Optional^)
            echo PAYSTACK_SECRET_KEY=your-paystack-secret-key
            echo PAYSTACK_PUBLIC_KEY=your-paystack-public-key
        ) > .env
        echo [INFO] Default .env file created. Please update with your settings.
    )
    echo.
    echo [IMPORTANT] Please edit .env file with your database connection details:
    echo   DATABASE_URL=postgresql://username:password@localhost:5432/edrac
    echo.
    pause
)

:: Install dependencies
echo [INFO] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

:: Setup database schema
echo [INFO] Setting up database schema...
call npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to setup database schema
    echo Please check your DATABASE_URL in .env file
    pause
    exit /b 1
)

:: Seed demo data
echo [INFO] Seeding demo data...
call scripts\run-seed.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to seed demo data
    echo Database schema setup completed, but demo data seeding failed
    echo You can manually run: scripts\run-seed.bat
)

:: Create VS Code workspace settings
echo [INFO] Creating VS Code workspace configuration...
if not exist ".vscode" mkdir ".vscode"

echo [INFO] Creating VS Code settings...
(
    echo {
    echo   "typescript.preferences.importModuleSpecifier": "relative",
    echo   "editor.formatOnSave": true,
    echo   "editor.codeActionsOnSave": {
    echo     "source.fixAll.eslint": "explicit"
    echo   },
    echo   "eslint.workingDirectories": ["."],
    echo   "files.exclude": {
    echo     "**/node_modules": true,
    echo     "**/.git": true,
    echo     "**/dist": true,
    echo     "**/*.log": true
    echo   },
    echo   "search.exclude": {
    echo     "**/node_modules": true,
    echo     "**/dist": true
    echo   }
    echo }
) > .vscode\settings.json

echo [INFO] Creating VS Code launch configuration...
(
    echo {
    echo   "version": "0.2.0",
    echo   "configurations": [
    echo     {
    echo       "name": "Launch Edrac Development Server",
    echo       "type": "node",
    echo       "request": "launch",
    echo       "program": "${workspaceFolder}/node_modules/.bin/tsx",
    echo       "args": ["server/index.ts"],
    echo       "env": {
    echo         "NODE_ENV": "development"
    echo       },
    echo       "console": "integratedTerminal",
    echo       "restart": true,
    echo       "runtimeExecutable": "node"
    echo     }
    echo   ]
    echo }
) > .vscode\launch.json

echo [INFO] Creating VS Code tasks...
(
    echo {
    echo   "version": "2.0.0",
    echo   "tasks": [
    echo     {
    echo       "label": "Start Development Server",
    echo       "type": "npm",
    echo       "script": "dev",
    echo       "group": {
    echo         "kind": "build",
    echo         "isDefault": true
    echo       },
    echo       "presentation": {
    echo         "echo": true,
    echo         "reveal": "always",
    echo         "focus": false,
    echo         "panel": "new"
    echo       }
    echo     },
    echo     {
    echo       "label": "Check Database",
    echo       "type": "shell",
    echo       "command": "scripts\\run-db-check.bat",
    echo       "group": "test",
    echo       "presentation": {
    echo         "echo": true,
    echo         "reveal": "always",
    echo         "focus": false,
    echo         "panel": "new"
    echo       }
    echo     },
    echo     {
    echo       "label": "Seed Demo Data",
    echo       "type": "shell",
    echo       "command": "scripts\\run-seed.bat",
    echo       "group": "test",
    echo       "presentation": {
    echo         "echo": true,
    echo         "reveal": "always",
    echo         "focus": false,
    echo         "panel": "new"
    echo       }
    echo     },
    echo     {
    echo       "label": "Clean Codebase",
    echo       "type": "shell",
    echo       "command": "scripts\\run-clean.bat",
    echo       "group": "test",
    echo       "presentation": {
    echo         "echo": true,
    echo         "reveal": "always",
    echo         "focus": false,
    echo         "panel": "new"
    echo       }
    echo     }
    echo   ]
    echo }
) > .vscode\tasks.json

echo [INFO] Creating VS Code extensions recommendations...
(
    echo {
    echo   "recommendations": [
    echo     "bradlc.vscode-tailwindcss",
    echo     "esbenp.prettier-vscode",
    echo     "dbaeumer.vscode-eslint",
    echo     "ms-vscode.vscode-typescript-next",
    echo     "formulahendry.auto-rename-tag",
    echo     "christian-kohler.path-intellisense",
    echo     "ms-vscode.vscode-json",
    echo     "bradlc.vscode-tailwindcss",
    echo     "ms-vscode-remote.remote-containers",
    echo     "ckolkman.vscode-postgres"
    echo   ]
    echo }
) > .vscode\extensions.json

echo.
echo ==========================================
echo          VS Code Setup Complete!
echo ==========================================
echo.
echo ✅ Dependencies installed
echo ✅ Database schema created
echo ✅ Demo data seeded
echo ✅ VS Code workspace configured
echo.
echo Next steps:
echo 1. Open this folder in VS Code
echo 2. Install recommended extensions when prompted
echo 3. Press Ctrl+Shift+P and run "Tasks: Run Task" → "Start Development Server"
echo 4. Open http://localhost:5000 in your browser
echo.
echo Demo accounts:
echo   Admin: admin@edrac.com / admin
echo   Institution: institution@edrac.com / institution
echo   Student: student@edrac.com / student
echo.
echo Happy coding! 🚀
echo.
pause