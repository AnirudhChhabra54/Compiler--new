#!/bin/bash

# Kill any process using port 8000 (if exists)
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing main dependencies..."
    npm install
fi

if [ ! -d "src/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd src && npm install && cd ..
fi

# Start the backend server
echo "Starting backend server..."
node server.js &

# Wait a bit for the backend to start
sleep 2

# Start the frontend development server
echo "Starting frontend development server..."
cd src && npm start

# Cleanup on exit
trap 'kill $(jobs -p)' EXIT
