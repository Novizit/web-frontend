#!/bin/bash

# Go to app directory (this is where Azure deploys your code).
cd /home/site/wwwroot

# Install dependencies
echo "Installing Node.js dependencies..."
npm install --omit=dev

# Start the Next.js app
echo "Starting Next.js app..."
npm start 