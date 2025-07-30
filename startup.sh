#!/bin/bash

# Azure App Service Startup Script
# This script ensures the Next.js application starts correctly

set -e

echo "Starting Azure App Service startup script..."

# Set default port if not provided
if [ -z "$PORT" ]; then
    export PORT=8080
fi

echo "Using port: $PORT"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Current directory: $(pwd)"
    ls -la
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --only=production
fi

# Check if .next directory exists (build output)
if [ ! -d ".next" ]; then
    echo "Building application..."
    npm run build
fi

# Verify the build was successful
if [ ! -d ".next" ]; then
    echo "Error: Build failed - .next directory not found"
    exit 1
fi

echo "Build verification passed. Starting Next.js application..."

# Start the application
exec npm start 