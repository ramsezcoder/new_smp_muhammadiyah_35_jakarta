#!/bin/bash

echo "==================================="
echo "SMP Muhammadiyah 35 Backend Setup"
echo "==================================="
echo ""

cd server

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

if [ ! -f ".env" ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Edit server/.env and add your RECAPTCHA_SECRET_KEY"
    echo "Get your key from: https://www.google.com/recaptcha/admin"
    echo ""
    read -p "Press Enter to continue..."
fi

echo "Starting backend server..."
echo ""
npm start
