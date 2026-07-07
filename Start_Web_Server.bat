@echo off
title Smart Driver Assistant - WEB MODE
color 0A
cd /d "%~dp0"

echo ===================================================
echo   SDA - WEB MODE STARTUP
echo ===================================================
echo.
echo [1/3] Launching Auth API Server (Port 5000)...
cd backend
start "SDA Auth API" cmd /k "python api_server.py"
timeout /t 3 /nobreak > nul

echo [2/3] Launching AI Core Server (Port 5002)...
start "SDA AI Core" cmd /k "python web_main.py"
timeout /t 3 /nobreak > nul

echo [3/3] Launching React Frontend...
cd ../frontend
start "SDA Frontend" cmd /k "npm run dev"

echo.
echo ===================================================
echo   SYSTEM RUNNING!
echo   Open http://localhost:5173 in your browser.
echo ===================================================
pause