@echo off
setlocal EnableDelayedExpansion
title Mobile Access Launcher

echo ========================================================
echo   VENDOR ADVERTISING PLATFORM - MOBILE ACCESS
echo ========================================================

:: 1. CHECK FOR NODE.JS
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: 2. DETECT IP ADDRESS
set "IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R /C:"IPv4 Address"') do (
    set "token=%%a"
    :: Remove leading space (assuming standard output format)
    set "IP=!token:~1!"
)

:: Fallback if IP detection likely failed
if "%IP%"=="" (
    echo [WARN] Could not automatically detect IP address.
) else (
    echo Detected IP: %IP%
)

echo.
echo Please confirm your Local IP address to use.
echo Use the detected one above, or type a different one.
echo (Press ENTER to use detected IP: [%IP%])
echo.
set /p USER_IP="Enter IP: "

if not "%USER_IP%"=="" set IP=%USER_IP%

if "%IP%"=="" (
    echo [ERROR] No IP address selected. Exiting.
    pause
    exit /b
)

echo.
echo ========================================================
echo   CONFIGURATION LAUNCH
echo   Host IP: %IP%
echo   API URL: http://%IP%:5000/api
echo ========================================================
echo.

:: 3. START BACKEND
echo [1/2] Starting Backend Server...
:: Using %~dp0 ensures we start from the script's directory
start "Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && echo Starting Backend... && npm start"

:: 4. START FRONTEND
echo [2/2] Starting Frontend Client...
:: Setting HOST=0.0.0.0 allows external access
:: Setting REACT_APP_API_URL points the frontend to the correct backend IP
start "Frontend Client (Port 3000)" cmd /k "cd /d "%~dp0client" && echo Starting Frontend... && set "HOST=0.0.0.0" && set "REACT_APP_API_URL=http://%IP%:5000/api" && npm start"

echo.
echo ========================================================
echo   SUCCESS!
echo.
echo   Your app should now be accessible on your phone at:
echo   http://%IP%:3000
echo.
echo   If the windows close immediately, there is an error.
echo   Check if you have run 'npm install' in both client 
echo   and server folders.
echo.
echo   Keep this window and the other two windows open.
echo ========================================================
pause
