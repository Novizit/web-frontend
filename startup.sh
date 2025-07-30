#!/bin/bash

# Go to app directory (this is where Azure deploys your code).
cd /home/site/wwwroot

# Make sure the script is executable
chmod +x startup.sh

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --omit=dev

# Build the application if .next directory doesn't exist
if [ ! -d ".next" ]; then
    echo "Building Next.js application..."
    npm run build
fi

# Start the Next.js app
echo "Starting Next.js app..."
npm start 