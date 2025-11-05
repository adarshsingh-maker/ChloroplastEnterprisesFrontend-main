// Test setup file
const mysql = require('mysql2/promise');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'expense_management_test';
process.env.JWT_SECRET = 'test-secret-key';

// Global test timeout
jest.setTimeout(30000);

// Setup test database
beforeAll(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'expense_management_test'
    });

    // Create test tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gmaillogin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emailid VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'IT', 'MARKETING', 'SALES', 'OPERATIONS') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS expense (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expensetitle VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        expensetype ENUM('OPERATIONAL', 'CAPITAL', 'MAINTENANCE', 'EMERGENCY') NOT NULL,
        expensedate DATE NOT NULL,
        receiptnumber VARCHAR(100),
        vendor VARCHAR(255),
        description TEXT,
        department ENUM('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'IT', 'MARKETING', 'SALES', 'OPERATIONS') NOT NULL,
        emailid VARCHAR(255) NOT NULL,
        submittedBy VARCHAR(255) NOT NULL,
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS superadmin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emailid VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        superadminname VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emailid VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        restaurantname VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.end();
  } catch (error) {
    console.warn('Test database setup failed:', error.message);
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'expense_management_test'
    });

    // Clean up test data
    await connection.execute('DELETE FROM expense WHERE emailid LIKE "test%"');
    await connection.execute('DELETE FROM gmaillogin WHERE emailid LIKE "test%"');
    await connection.execute('DELETE FROM superadmin WHERE emailid LIKE "test%"');
    await connection.execute('DELETE FROM restaurants WHERE emailid LIKE "test%"');

    await connection.end();
  } catch (error) {
    console.warn('Test database cleanup failed:', error.message);
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});


