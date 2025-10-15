#!/bin/bash

# D&D Map Buddy - Kill All Script
# This script kills all processes related to the D&D Map Buddy project

echo "🛑 Stopping D&D Map Buddy servers..."

# Kill tsx watch processes (backend)
echo "   Stopping backend (tsx watch)..."
pkill -f 'tsx watch' 2>/dev/null || echo "   No backend processes found"

# Kill vite processes (frontend)
echo "   Stopping frontend (vite)..."
pkill -f 'vite' 2>/dev/null || echo "   No frontend processes found"

# Kill any node processes running the project
echo "   Stopping project node processes..."
pkill -f 'dnd-map-buddy' 2>/dev/null || echo "   No project node processes found"

# Kill processes on specific ports
echo "   Checking ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "   Port 3000 is free"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "   Port 3001 is free"

# Wait a moment for processes to fully terminate
sleep 1

# Verify ports are free
echo "   Verifying ports are free..."
if lsof -i :3000 >/dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is still in use"
else
    echo "   ✅ Port 3000 is free"
fi

if lsof -i :3001 >/dev/null 2>&1; then
    echo "   ⚠️  Port 3001 is still in use"
else
    echo "   ✅ Port 3001 is free"
fi

echo "✅ All D&D Map Buddy servers stopped!"
