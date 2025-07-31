#!/bin/bash

# Exit on any error
set -e

# Go to app directory (this is where Azure deploys your code).
cd /home/site/wwwroot

echo "Starting deployment process..."

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --production

# Set environment variables
export PORT=8080
export NODE_ENV=production

# Start the Next.js app
echo "Starting Next.js app on port $PORT..."
exec npm start 