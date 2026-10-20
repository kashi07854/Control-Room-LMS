@echo off
title Control Room + LMS
cd /d "%~dp0"

echo ============================================
echo   Control Room + LMS
echo ============================================
echo.

if not exist .venv\Scripts\python.exe (
    echo [1/3] Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 goto ERR
    echo [2/3] Installing dependencies...
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 goto ERR
)

echo [3/3] Starting server at http://127.0.0.1:5000
echo (Keep this window open)
echo.
.venv\Scripts\python.exe app.py

echo.
echo Server stopped.
pause
exit /b

:ERR
echo.
echo Setup failed. Please check the output above.
pause