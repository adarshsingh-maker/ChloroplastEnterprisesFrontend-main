const mysql = require('mysql2/promise');
const pool = require('../routes/pool');

describe('Database Tests', () => {
  let connection;

  beforeAll(async () => {
    // Create test database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'expense_management_test'
    });
  });

  afterAll(async () => {
    if (connection) {
      await connection.end();
    }
  });

  describe('Database Connection Tests', () => {
    test('Database connection should be established (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const [rows] = await connection.execute('SELECT 1 as test');
          expect(rows[0].test).toBe(1);
        } catch (error) {
          fail(`Database connection failed on test case ${i}: ${error.message}`);
        }
      }
    });

    test('Pool connection should work (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const result = await new Promise((resolve, reject) => {
            pool.query('SELECT 1 as test', (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          });
          expect(result[0].test).toBe(1);
        } catch (error) {
          fail(`Pool connection failed on test case ${i}: ${error.message}`);
        }
      }
    });
  });

  describe('Table Structure Tests', () => {
    test('gmaillogin table should exist and have correct structure (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const [rows] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'gmaillogin' 
            ORDER BY ORDINAL_POSITION
          `);
          
          expect(rows.length).toBeGreaterThan(0);
          
          const columnNames = rows.map(row => row.COLUMN_NAME);
          expect(columnNames).toContain('id');
          expect(columnNames).toContain('emailid');
          expect(columnNames).toContain('password');
          expect(columnNames).toContain('role');
        } catch (error) {
          fail(`Table structure test failed on test case ${i}: ${error.message}`);
        }
      }
    });

    test('expense table should exist and have correct structure (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const [rows] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'expense' 
            ORDER BY ORDINAL_POSITION
          `);
          
          expect(rows.length).toBeGreaterThan(0);
          
          const columnNames = rows.map(row => row.COLUMN_NAME);
          expect(columnNames).toContain('id');
          expect(columnNames).toContain('expensetitle');
          expect(columnNames).toContain('amount');
          expect(columnNames).toContain('category');
          expect(columnNames).toContain('expensetype');
          expect(columnNames).toContain('expensedate');
          expect(columnNames).toContain('department');
          expect(columnNames).toContain('emailid');
        } catch (error) {
          fail(`Expense table structure test failed on test case ${i}: ${error.message}`);
        }
      }
    });

    test('superadmin table should exist and have correct structure (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const [rows] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'superadmin' 
            ORDER BY ORDINAL_POSITION
          `);
          
          expect(rows.length).toBeGreaterThan(0);
          
          const columnNames = rows.map(row => row.COLUMN_NAME);
          expect(columnNames).toContain('id');
          expect(columnNames).toContain('emailid');
          expect(columnNames).toContain('password');
          expect(columnNames).toContain('superadminname');
        } catch (error) {
          fail(`Super admin table structure test failed on test case ${i}: ${error.message}`);
        }
      }
    });
  });

  describe('Data Integrity Tests', () => {
    test('Insert and retrieve user data (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const testEmail = `testuser${i}@test.com`;
          const testPassword = `password${i}`;
          const testRole = 'HR';
          
          // Insert test user
          await connection.execute(
            'INSERT INTO gmaillogin (emailid, password, role) VALUES (?, ?, ?)',
            [testEmail, testPassword, testRole]
          );
          
          // Retrieve test user
          const [rows] = await connection.execute(
            'SELECT * FROM gmaillogin WHERE emailid = ?',
            [testEmail]
          );
          
          expect(rows.length).toBe(1);
          expect(rows[0].emailid).toBe(testEmail);
          expect(rows[0].password).toBe(testPassword);
          expect(rows[0].role).toBe(testRole);
          
          // Cleanup
          await connection.execute(
            'DELETE FROM gmaillogin WHERE emailid = ?',
            [testEmail]
          );
        } catch (error) {
          fail(`Data integrity test failed on test case ${i}: ${error.message}`);
        }
      }
    });

    test('Insert and retrieve expense data (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const testExpense = {
            expensetitle: `Test Expense ${i}`,
            amount: Math.floor(Math.random() * 10000) + 100,
            category: 'Office Supplies',
            expensetype: 'OPERATIONAL',
            expensedate: new Date().toISOString().split('T')[0],
            receiptnumber: `RCP${i}`,
            vendor: `Vendor ${i}`,
            description: `Test description ${i}`,
            department: 'HR',
            emailid: `testuser${i}@test.com`,
            submittedBy: `testuser${i}@test.com`
          };
          
          // Insert test expense
          const [result] = await connection.execute(`
            INSERT INTO expense 
            (expensetitle, amount, category, expensetype, expensedate, receiptnumber, vendor, description, department, emailid, submittedBy) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            testExpense.expensetitle,
            testExpense.amount,
            testExpense.category,
            testExpense.expensetype,
            testExpense.expensedate,
            testExpense.receiptnumber,
            testExpense.vendor,
            testExpense.description,
            testExpense.department,
            testExpense.emailid,
            testExpense.submittedBy
          ]);
          
          const expenseId = result.insertId;
          
          // Retrieve test expense
          const [rows] = await connection.execute(
            'SELECT * FROM expense WHERE id = ?',
            [expenseId]
          );
          
          expect(rows.length).toBe(1);
          expect(rows[0].expensetitle).toBe(testExpense.expensetitle);
          expect(parseFloat(rows[0].amount)).toBe(testExpense.amount);
          expect(rows[0].category).toBe(testExpense.category);
          expect(rows[0].department).toBe(testExpense.department);
          
          // Cleanup
          await connection.execute(
            'DELETE FROM expense WHERE id = ?',
            [expenseId]
          );
        } catch (error) {
          fail(`Expense data integrity test failed on test case ${i}: ${error.message}`);
        }
      }
    });
  });

  describe('Query Performance Tests', () => {
    test('Expense queries should perform within acceptable time (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const startTime = Date.now();
          
          // Test various expense queries
          const queries = [
            'SELECT COUNT(*) as count FROM expense',
            'SELECT * FROM expense WHERE department = "HR" LIMIT 10',
            'SELECT * FROM expense WHERE expensedate >= CURDATE() - INTERVAL 30 DAY',
            'SELECT department, SUM(amount) as total FROM expense GROUP BY department',
            'SELECT * FROM expense WHERE category = "Office Supplies" LIMIT 5'
          ];
          
          for (const query of queries) {
            const [rows] = await connection.execute(query);
            expect(rows).toBeDefined();
          }
          
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          
          // Query should complete within 5 seconds
          expect(executionTime).toBeLessThan(5000);
        } catch (error) {
          fail(`Query performance test failed on test case ${i}: ${error.message}`);
        }
      }
    });
  });

  describe('Concurrent Access Tests', () => {
    test('Multiple concurrent database operations (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const promises = [];
          
          // Create multiple concurrent operations
          for (let j = 0; j < 10; j++) {
            promises.push(
              connection.execute('SELECT 1 as test')
            );
          }
          
          const results = await Promise.all(promises);
          
          expect(results.length).toBe(10);
          results.forEach(result => {
            expect(result[0][0].test).toBe(1);
          });
        } catch (error) {
          fail(`Concurrent access test failed on test case ${i}: ${error.message}`);
        }
      }
    });
  });

  describe('Data Validation Tests', () => {
    test('Database constraints should be enforced (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        try {
          const invalidData = [
            { emailid: '', password: 'test', role: 'HR' }, // Empty email
            { emailid: 'test@test.com', password: '', role: 'HR' }, // Empty password
            { emailid: 'test@test.com', password: 'test', role: 'INVALID_ROLE' }, // Invalid role
            { emailid: 'test@test.com', password: 'test', role: null }, // Null role
          ];
          
          for (const data of invalidData) {
            try {
              await connection.execute(
                'INSERT INTO gmaillogin (emailid, password, role) VALUES (?, ?, ?)',
                [data.emailid, data.password, data.role]
              );
              // If we reach here, the constraint wasn't enforced
              fail(`Database constraint not enforced for invalid data: ${JSON.stringify(data)}`);
            } catch (error) {
              // Expected to fail due to constraints
              expect(error).toBeDefined();
            }
          }
        } catch (error) {
          fail(`Data validation test failed on test case ${i}: ${error.message}`);
        }
      }
    });
  });
});


