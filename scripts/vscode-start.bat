@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo     Starting Edrac in VS Code
echo ==========================================
echo.

:: Check if we're in the correct directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the Edrac root directory
    pause
    exit /b 1
)

:: Load environment variables
if exist ".env" (
    echo [INFO] Loading environment variables...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
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

:: Start VS Code with the current directory
echo [INFO] Opening VS Code...
if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
    start "" "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" .
) else if exist "%PROGRAMFILES%\Microsoft VS Code\Code.exe" (
    start "" "%PROGRAMFILES%\Microsoft VS Code\Code.exe" .
) else (
    echo [INFO] VS Code executable not found in default locations.
    echo [INFO] Please open VS Code manually and open this folder.
    echo [INFO] Then use Ctrl+Shift+P and run "Tasks: Run Task" → "Start Development Server"
    pause
    exit /b 0
)

echo.
echo ==========================================
echo       VS Code Development Ready!
echo ==========================================
echo.
echo VS Code should now be opening with the Edrac project.
echo.
echo To start the development server:
echo 1. In VS Code, press Ctrl+Shift+P
echo 2. Type "Tasks: Run Task"
echo 3. Select "Start Development Server"
echo.
echo Or use the VS Code debugger:
echo 1. Go to Run and Debug view (Ctrl+Shift+D)
echo 2. Select "Launch Edrac Development Server"
echo 3. Press F5 to start debugging
echo.
echo The application will be available at:
echo http://localhost:5000
echo.
echo Demo accounts:
echo   Admin: admin@edrac.com / admin
echo   Institution: institution@edrac.com / institution
echo   Student: student@edrac.com / student
echo.
pause