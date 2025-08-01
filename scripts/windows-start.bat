@echo off
setlocal enabledelayedexpansion

echo ========================================
echo      EDRAC Application Launcher
echo ========================================
echo.

:: Check if setup has been run
if not exist "node_modules" (
    echo [ERROR] Dependencies not installed. Please run windows-setup.bat first.
    pause
    exit /b 1
)

if not exist ".env" (
    echo [ERROR] Environment file not found. Please run windows-setup.bat first.
    pause
    exit /b 1
)

:: Load environment variables
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set "%%a=%%b"
    )
)

:: Check database connection
echo [INFO] Checking database connection...
call scripts\run-db-check.bat 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database connection failed. Attempting to setup database...
    call npm run db:push
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to setup database. Please check your DATABASE_URL in .env
        pause
        exit /b 1
    )
)

echo [INFO] Starting Edrac application...
echo [INFO] The application will be available at: http://localhost:%PORT%
echo [INFO] Press Ctrl+C to stop the application
echo.

:: Start the application
call npm run dev

pause