@echo off
title CoalGov AI - Seed Database
echo Seeding CoalGov AI synthetic demo database...
call .\venv\Scripts\python.exe backend\scripts\seed_demo.py
pause
