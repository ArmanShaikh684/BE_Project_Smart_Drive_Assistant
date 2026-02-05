@echo off
title Smart Driver Assistant - STARTING
color 0B
cd /d "%~dp0"
echo [1/2] Launching Python Backend...
start "Backend Server" cmd /k "python login_manager.py"
timeout /t 5 /nobreak > nul
echo [2/2] Opening Ngrok...
ngrok http 5000 --url=unspecked-janee-tumular.ngrok-free.dev
pause