@echo off
REM Production Build Script for Netlify Deployment

echo Starting production build optimization...

REM Clean previous builds
echo Cleaning previous builds...
if exist .next rmdir /s /q .next

REM Install dependencies
echo Installing dependencies...
npm ci

REM Run database migrations
echo Running database migrations...
npm run db:init

REM Build the application
echo Building the application...
npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
  echo Build completed successfully!
  echo Ready for deployment to Netlify
) else (
  echo Build failed!
  exit /b 1
)