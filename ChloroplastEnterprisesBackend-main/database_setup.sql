-- Expense Management System Database Setup
-- Run this script to create the required tables

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS expense_management;
-- USE expense_management;

-- Gmail Login Table
CREATE TABLE IF NOT EXISTS gmaillogin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'IT', 'MARKETING', 'SALES', 'OPERATIONS') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Super Admin Table
CREATE TABLE IF NOT EXISTS superadmin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    superadminname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Restaurants Table (for admin login)
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    restaurantname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Expense Table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_department (department),
    INDEX idx_emailid (emailid),
    INDEX idx_expensedate (expensedate),
    INDEX idx_category (category)
);

-- Insert default super admin (password: admin123)
INSERT IGNORE INTO superadmin (emailid, password, superadminname) 
VALUES ('admin@expense.com', 'admin123', 'System Administrator');

-- Insert sample admin (password: admin123)
INSERT IGNORE INTO restaurants (emailid, password, restaurantname) 
VALUES ('admin@company.com', 'admin123', 'Company Admin');

-- Insert sample users for testing
INSERT IGNORE INTO gmaillogin (emailid, password, role) VALUES
('hr@company.com', 'hr123', 'HR'),
('finance@company.com', 'finance123', 'FINANCE'),
('it@company.com', 'it123', 'IT'),
('marketing@company.com', 'marketing123', 'MARKETING'),
('sales@company.com', 'sales123', 'SALES'),
('operations@company.com', 'ops123', 'OPERATIONS');


