#!/bin/bash
# Production Build Script for Netlify Deployment

echo "Starting production build optimization..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf .next

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run database migrations
echo "Running database migrations..."
npm run db:init

# Build the application
echo "Building the application..."
npm run build

# Copy public assets to standalone output
echo "Copying public assets..."
cp -r public .next/standalone/

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
  echo "Ready for deployment to Netlify"
else
  echo "Build failed!"
  exit 1
fi