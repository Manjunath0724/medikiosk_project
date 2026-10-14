@echo off
setlocal enabledelayedexpansion
title MediKiosk - Starting Services...
color 0A

echo ======================================================================
echo           MediKiosk - Smart Ayush OPD Case-Taking Platform
echo ======================================================================
echo.

:: Detect project directory (whether executed from SIH or medikiosk folder)
set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%medikiosk\backend" (
    set "PROJECT_DIR=%SCRIPT_DIR%medikiosk"
) else if exist "%SCRIPT_DIR%backend" (
    set "PROJECT_DIR=%SCRIPT_DIR%"
) else (
    echo [ERROR] Could not locate medikiosk project directory!
    echo Checked:
    echo   - %SCRIPT_DIR%medikiosk\backend
    echo   - %SCRIPT_DIR%backend
    pause
    exit /b 1
)

:: Strip trailing backslash from PROJECT_DIR if present
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:: Detect Python executable in backend virtual environment or fallback to system Python
if exist "%PROJECT_DIR%\backend\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%PROJECT_DIR%\backend\.venv\Scripts\python.exe"
    echo [OK] Using Python virtualenv: "%PROJECT_DIR%\backend\.venv"
) else (
    where python >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Python was not found in .venv or system PATH!
        echo Please ensure Python 3.10+ is installed and accessible.
        pause
        exit /b 1
    )
    set "PYTHON_EXE=python"
    echo [WARNING] .venv not found. Falling back to system Python.
)

:: Verify Node.js / npm is available
where npm >nul 2>&1
if errorlevel 1 (
    echo [WARNING] npm was not found in system PATH.
    echo If the frontend fails to launch, please verify Node.js is installed.
)

:: Ensure frontend dependencies are installed
if not exist "%PROJECT_DIR%\frontend\node_modules\" (
    echo [INFO] Frontend node_modules missing. Installing npm packages...
    cd /d "%PROJECT_DIR%\frontend" && call npm install
    if errorlevel 1 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b 1
    )
)

:: Clean up any lingering processes on ports 8000 and 5173
echo [1/4] Checking ports 8000 (Backend) and 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":8000\>" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" taskkill /F /T /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":5173\>" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" taskkill /F /T /PID %%a >nul 2>&1
)
ping 127.0.0.1 -n 2 >nul

:: Launch Backend
echo [2/4] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "MediKiosk Backend (Port 8000)" /D "%PROJECT_DIR%\backend" cmd /k "title MediKiosk Backend (Port 8000) && "%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: Launch Frontend
echo [3/4] Launching Vite Frontend on http://localhost:5173 ...
start "MediKiosk Frontend (Port 5173)" /D "%PROJECT_DIR%\frontend" cmd /k "title MediKiosk Frontend (Port 5173) && call npm run dev"

:: Wait for servers to spin up
echo [4/4] Initializing services (waiting 4 seconds)...
ping 127.0.0.1 -n 5 >nul

:: Open browser
echo Launching MediKiosk in your default browser...
start http://localhost:5173

cls
color 0B
echo ======================================================================
echo           MediKiosk is LIVE and Running Successfully!
echo ======================================================================
echo.
echo   * Main Web Application:    http://localhost:5173
echo   * Doctor OPD Workstation:  http://localhost:5173/doctor
echo   * Slide 3 Defense Guide:   http://localhost:5173/presentation_tech_approach_defense.html
echo   * Backend Swagger API:     http://127.0.0.1:8000/docs
echo.
echo ======================================================================
echo   Backend and Frontend are running in separate terminal windows.
echo   To stop all servers cleanly, double-click stop.bat or close windows.
echo ======================================================================
echo.
echo Press any key to exit this launcher window (servers will keep running)...
pause >nul
