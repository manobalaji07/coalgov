@echo off
title CoalGov AI - Launcher
echo =======================================================================
echo          CoalGov AI: Smart Coal Governance & Compliance Platform
echo         Smart India Hackathon 2026 | PS SIH26024 | Ministry of Coal
echo =======================================================================
echo.

echo [1/2] Seeding demo database...
call .\venv\Scripts\python.exe backend\scripts\seed_demo.py

echo.
echo [2/2] Starting CoalGov AI Platform Server on http://localhost:8000 ...
echo.
start "CoalGov AI Server" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend"

echo.
echo =======================================================================
echo Application launched! Opening http://localhost:8000 in your browser...
echo.
echo  - Web Dashboard:    http://localhost:8000
echo  - Mobile PWA App:   http://localhost:8000/mobile
echo  - Backend API Docs: http://localhost:8000/docs
echo =======================================================================
echo.
timeout /t 3 >nul
start http://localhost:8000
