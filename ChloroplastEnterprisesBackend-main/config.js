// Production Configuration
module.exports = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_management',
    connectionLimit: 10
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'shhhhh',
    expiresIn: '24h'
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
};

