@echo off
title MediKiosk - Stopping Services...
color 0C

echo ======================================================================
echo           MediKiosk - Stopping All Services
echo ======================================================================
echo.

echo Stopping backend service on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":8000\>" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo Killing process PID %%a on port 8000...
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

echo Stopping frontend service on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":5173\>" ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo Killing process PID %%a on port 5173...
        taskkill /F /T /PID %%a >nul 2>&1
    )
)

echo Stopping any lingering uvicorn processes...
taskkill /F /IM uvicorn.exe /T >nul 2>&1

echo.
echo ======================================================================
echo [DONE] MediKiosk backend and frontend services have been stopped.
echo ======================================================================
echo.
pause
