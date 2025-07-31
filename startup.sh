#!/bin/bash

# Go to app directory (this is where Azure deploys your code).
cd /home/site/wwwroot

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Start the Next.js app
echo "Starting Next.js app..."
npm start 