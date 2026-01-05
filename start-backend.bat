@echo off
echo ===================================
echo SMP Muhammadiyah 35 Backend Setup
echo ===================================
echo.

cd server

if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

if not exist .env (
    echo Creating .env from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit server/.env and add your RECAPTCHA_SECRET_KEY
    echo Get your key from: https://www.google.com/recaptcha/admin
    echo.
    pause
)

echo Starting backend server...
echo.
call npm start
