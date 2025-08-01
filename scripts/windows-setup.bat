@echo off
setlocal enabledelayedexpansion

echo ========================================
echo      EDRAC Windows Setup Script
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo [INFO] Node.js version: %NODE_VERSION%

:: Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [INFO] PostgreSQL is available

:: Check if .env file exists
if not exist ".env" (
    echo [INFO] Creating .env file from template...
    copy ".env.example" ".env" >nul 2>nul
    if not exist ".env.example" (
        call :create_env_file
    )
    echo [WARNING] Please update the .env file with your database credentials and API keys
    echo [INFO] Opening .env file for editing...
    notepad .env
    echo.
    echo Press any key after you've updated the .env file...
    pause >nul
)

:: Load environment variables from .env file
echo [INFO] Loading environment variables...
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set "%%a=%%b"
    )
)

:: Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo [ERROR] DATABASE_URL is not set in .env file
    pause
    exit /b 1
)

echo [INFO] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [INFO] Setting up database...
call npm run db:push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to setup database
    pause
    exit /b 1
)

echo [INFO] Seeding demo data...
call scripts\run-seed.bat
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to seed demo data
    pause
    exit /b 1
)

echo.
echo ========================================
echo        Setup Complete!
echo ========================================
echo.
echo Demo accounts created:
echo - Admin: admin@edrac.com (password: admin)
echo - Institution: institution@edrac.com (password: institution)
echo - Student: student@edrac.com (password: student)
echo.
echo To start the application, run: npm run dev
echo.
pause
goto :eof

:create_env_file
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
echo.
echo # SendGrid API Key ^(Optional^)
echo SENDGRID_API_KEY=your-sendgrid-api-key
echo SENDGRID_FROM_EMAIL=noreply@edrac.com
) > .env
goto :eof