#!/bin/bash

# Expense Management System - Quick Deployment Script
echo "🚀 Starting Expense Management System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are installed ✓"

# Frontend deployment
print_status "Building frontend for production..."
cd "$(dirname "$0")"
npm run build

if [ $? -eq 0 ]; then
    print_status "Frontend build successful ✓"
else
    print_error "Frontend build failed"
    exit 1
fi

# Backend setup
print_status "Setting up backend..."
cd ChloroplastEnterprisesBackend-main

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Backend dependencies installed ✓"
else
    print_error "Backend dependency installation failed"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expense_management

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
EOF
    print_warning "Please update the .env file with your actual database credentials"
fi

print_status "Backend setup complete ✓"

# Database setup instructions
print_status "Database setup required:"
echo "1. Create MySQL database named 'expense_management'"
echo "2. Run the SQL script: ChloroplastEnterprisesBackend-main/database_setup.sql"
echo "3. Update .env file with your database credentials"

# Deployment options
print_status "Deployment options:"
echo "1. Local deployment: npm start (in backend directory)"
echo "2. Heroku: Follow instructions in DEPLOYMENT_GUIDE.md"
echo "3. Vercel: Follow instructions in DEPLOYMENT_GUIDE.md"
echo "4. VPS: Follow instructions in DEPLOYMENT_GUIDE.md"

print_status "Deployment preparation complete! 🎉"
print_warning "Please read DEPLOYMENT_GUIDE.md for detailed deployment instructions"


