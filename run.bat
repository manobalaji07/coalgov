@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title CoalGov AI - Launcher

echo =======================================================================
echo          CoalGov AI: Smart Coal Governance and Compliance Platform
echo         Smart India Hackathon 2026 - PS SIH26024 - Ministry of Coal
echo =======================================================================
echo.

echo [1/2] Seeding demo database...
call .\venv\Scripts\python.exe backend\scripts\seed_demo.py
if errorlevel 1 (
    echo [ERROR] Seeding script failed! Please check if python venv is set up.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting CoalGov AI Platform Server on http://localhost:8000 ...
echo.
start "CoalGov AI Server" cmd /k "cd /d "%~dp0" && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend"

echo.
echo =======================================================================
echo Application launched successfully! Opening http://localhost:8000 ...
echo.
echo  - Web Dashboard:    http://localhost:8000
echo  - Mobile PWA App:   http://localhost:8000/mobile
echo  - Backend API Docs: http://localhost:8000/docs
echo =======================================================================
echo.
timeout /t 3 >nul
start http://localhost:8000
echo Press any key to exit launcher window...
pause >nul
