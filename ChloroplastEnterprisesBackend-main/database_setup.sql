-- Expense Management System Database Setup for PostgreSQL
-- Database: futurecraft
-- Schema: expensemanagement

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS expensemanagement;

-- Set search path to use the schema
SET search_path TO expensemanagement, public;

-- Gmail Login Table
CREATE TABLE IF NOT EXISTS expensemanagement.gmaillogin (
    id SERIAL PRIMARY KEY,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'IT', 'MARKETING', 'SALES', 'OPERATIONS')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super Admin Table
CREATE TABLE IF NOT EXISTS expensemanagement.superadmin (
    id SERIAL PRIMARY KEY,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    superadminname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants Table (for admin login)
CREATE TABLE IF NOT EXISTS expensemanagement.restaurants (
    id SERIAL PRIMARY KEY,
    emailid VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    restaurantname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense Table
CREATE TABLE IF NOT EXISTS expensemanagement.expense (
    id SERIAL PRIMARY KEY,
    expensetitle VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expensetype VARCHAR(50) NOT NULL CHECK (expensetype IN ('OPERATIONAL', 'CAPITAL', 'MAINTENANCE', 'EMERGENCY')),
    expensedate DATE NOT NULL,
    receiptnumber VARCHAR(100),
    vendor VARCHAR(255),
    description TEXT,
    department VARCHAR(50) NOT NULL CHECK (department IN ('SUPER_ADMIN', 'ADMIN', 'HR', 'FINANCE', 'IT', 'MARKETING', 'SALES', 'OPERATIONS')),
    emailid VARCHAR(255) NOT NULL,
    submittedBy VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_department ON expensemanagement.expense(department);
CREATE INDEX IF NOT EXISTS idx_emailid ON expensemanagement.expense(emailid);
CREATE INDEX IF NOT EXISTS idx_expensedate ON expensemanagement.expense(expensedate);
CREATE INDEX IF NOT EXISTS idx_category ON expensemanagement.expense(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION expensemanagement.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_gmaillogin_updated_at BEFORE UPDATE ON expensemanagement.gmaillogin
    FOR EACH ROW EXECUTE FUNCTION expensemanagement.update_updated_at_column();

CREATE TRIGGER update_superadmin_updated_at BEFORE UPDATE ON expensemanagement.superadmin
    FOR EACH ROW EXECUTE FUNCTION expensemanagement.update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON expensemanagement.restaurants
    FOR EACH ROW EXECUTE FUNCTION expensemanagement.update_updated_at_column();

CREATE TRIGGER update_expense_updated_at BEFORE UPDATE ON expensemanagement.expense
    FOR EACH ROW EXECUTE FUNCTION expensemanagement.update_updated_at_column();

-- Insert default super admin (password: admin123)
INSERT INTO expensemanagement.superadmin (emailid, password, superadminname) 
VALUES ('admin@expense.com', 'admin123', 'System Administrator')
ON CONFLICT (emailid) DO NOTHING;

-- Insert sample admin (password: admin123)
INSERT INTO expensemanagement.restaurants (emailid, password, restaurantname) 
VALUES ('admin@company.com', 'admin123', 'Company Admin')
ON CONFLICT (emailid) DO NOTHING;

-- Insert sample users for testing
INSERT INTO expensemanagement.gmaillogin (emailid, password, role) VALUES
('hr@company.com', 'hr123', 'HR'),
('finance@company.com', 'finance123', 'FINANCE'),
('it@company.com', 'it123', 'IT'),
('marketing@company.com', 'marketing123', 'MARKETING'),
('sales@company.com', 'sales123', 'SALES'),
('operations@company.com', 'ops123', 'OPERATIONS')
ON CONFLICT (emailid) DO NOTHING;
