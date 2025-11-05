# 🚀 Expense Management System - Deployment Guide

## 📋 Prerequisites

### Required Software:
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git
- A hosting platform (Heroku, Vercel, Netlify, AWS, etc.)

### Required Accounts:
- Database hosting (MySQL): PlanetScale, AWS RDS, or local MySQL
- Frontend hosting: Vercel, Netlify, or similar
- Backend hosting: Heroku, Railway, or similar

## 🗄️ Database Setup

### Option 1: Local MySQL
```bash
# Install MySQL
# Create database
mysql -u root -p
CREATE DATABASE expense_management;
USE expense_management;
SOURCE ChloroplastEnterprisesBackend-main/database_setup.sql;
```

### Option 2: Cloud Database (Recommended)
1. **PlanetScale** (Free tier available):
   - Sign up at https://planetscale.com
   - Create a new database
   - Run the SQL script from `database_setup.sql`

2. **AWS RDS**:
   - Create MySQL instance
   - Configure security groups
   - Run the SQL script

## 🖥️ Backend Deployment

### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
cd ChloroplastEnterprisesBackend-main
heroku create your-expense-backend

# Set environment variables
heroku config:set DB_HOST=your_db_host
heroku config:set DB_USER=your_db_user
heroku config:set DB_PASSWORD=your_db_password
heroku config:set DB_NAME=expense_management
heroku config:set JWT_SECRET=your_super_secret_key
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option 2: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 3: VPS/Server
```bash
# Upload files to server
scp -r ChloroplastEnterprisesBackend-main user@your-server:/var/www/

# Install dependencies
cd /var/www/ChloroplastEnterprisesBackend-main
npm install --production

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start bin/www --name "expense-backend"
pm2 startup
pm2 save
```

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
REACT_APP_API_URL=https://your-backend-url.com
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

### Option 3: GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"homepage": "https://yourusername.github.io/expense-management",
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

## ⚙️ Environment Configuration

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_ENVIRONMENT=production
```

### Backend Environment Variables
```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=expense_management
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔧 Configuration Updates

### Update Frontend API URL
Edit `src/services/FetchNodeServices.js`:
```javascript
const serverURL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com';
```

### Update Backend CORS
Edit `ChloroplastEnterprisesBackend-main/app.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://your-frontend-domain.com',
  credentials: true
}));
```

## 🧪 Testing Deployment

### Test Backend Endpoints:
```bash
# Test login
curl -X POST https://your-backend-url.com/gmail/gmaillogin \
  -H "Content-Type: application/json" \
  -d '{"emailid":"hr@company.com","password":"hr123"}'

# Test expense creation
curl -X POST https://your-backend-url.com/gmail/expensecreate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"expensetitle":"Test Expense","amount":100,"category":"Office Supplies","expensetype":"OPERATIONAL","expensedate":"2024-01-01","department":"HR","emailid":"hr@company.com","submittedBy":"hr@company.com"}'
```

### Test Frontend:
1. Visit your frontend URL
2. Try logging in with test credentials
3. Submit a test expense
4. Verify data appears in database

## 🔐 Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Use environment variables for secrets
- [ ] Enable database SSL if using cloud database

## 📊 Monitoring & Maintenance

### Logs:
```bash
# Heroku logs
heroku logs --tail

# PM2 logs
pm2 logs expense-backend

# Railway logs
railway logs
```

### Database Backup:
```bash
# MySQL backup
mysqldump -u username -p expense_management > backup.sql

# Restore
mysql -u username -p expense_management < backup.sql
```

## 🆘 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Database Connection**: Verify database credentials and host
3. **JWT Errors**: Ensure JWT_SECRET is set correctly
4. **Build Failures**: Check Node.js version compatibility

### Support:
- Check application logs
- Verify environment variables
- Test database connectivity
- Check network/firewall settings

## 📈 Performance Optimization

1. **Database Indexing**: Already included in setup script
2. **Caching**: Consider Redis for session management
3. **CDN**: Use CloudFlare or similar for static assets
4. **Monitoring**: Set up application monitoring (New Relic, DataDog)

## 🎯 Go-Live Checklist

- [ ] Database setup complete
- [ ] Backend deployed and tested
- [ ] Frontend deployed and tested
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] User accounts created
- [ ] Documentation updated


