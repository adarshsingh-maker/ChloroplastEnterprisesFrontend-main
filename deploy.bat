@echo off
echo 🚀 Starting Expense Management System Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Node.js and npm are installed ✓

REM Frontend deployment
echo [INFO] Building frontend for production...
call npm run build

if %errorlevel% equ 0 (
    echo [INFO] Frontend build successful ✓
) else (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

REM Backend setup
echo [INFO] Setting up backend...
cd ChloroplastEnterprisesBackend-main

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
call npm install

if %errorlevel% equ 0 (
    echo [INFO] Backend dependencies installed ✓
) else (
    echo [ERROR] Backend dependency installation failed
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=expense_management
        echo.
        echo # JWT Secret
        echo JWT_SECRET=your_super_secret_jwt_key_here
        echo.
        echo # Server Configuration
        echo PORT=3001
        echo NODE_ENV=production
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:3000
    ) > .env
    echo [WARNING] Please update the .env file with your actual database credentials
)

echo [INFO] Backend setup complete ✓

echo [INFO] Database setup required:
echo 1. Create MySQL database named 'expense_management'
echo 2. Run the SQL script: ChloroplastEnterprisesBackend-main/database_setup.sql
echo 3. Update .env file with your database credentials

echo [INFO] Deployment options:
echo 1. Local deployment: npm start (in backend directory)
echo 2. Heroku: Follow instructions in DEPLOYMENT_GUIDE.md
echo 3. Vercel: Follow instructions in DEPLOYMENT_GUIDE.md
echo 4. VPS: Follow instructions in DEPLOYMENT_GUIDE.md

echo [INFO] Deployment preparation complete! 🎉
echo [WARNING] Please read DEPLOYMENT_GUIDE.md for detailed deployment instructions
pause


