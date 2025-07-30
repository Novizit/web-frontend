#!/bin/bash

# Azure App Service Startup Script
# This script ensures the Next.js application starts correctly in Azure

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
    echo "Error: .next directory not found. The application was not built properly."
    echo "Current directory contents:"
    ls -la
    exit 1
fi

# Check if next binary exists
if ! command -v next &> /dev/null; then
    echo "Next.js binary not found in PATH. Checking node_modules/.bin..."
    if [ -f "node_modules/.bin/next" ]; then
        echo "Found next binary in node_modules/.bin"
        export PATH="node_modules/.bin:$PATH"
    else
        echo "Error: next binary not found anywhere"
        exit 1
    fi
fi

echo "Build verification passed. Starting Next.js application..."

# Start the application
exec npm start 