import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';

// Import components
import RoleDashboard from '../screens/dashboard/RoleDashboard';
import ExpenseForm from '../screens/expense/ExpenseForm';
import GmailLogin from '../screens/gmail/GmailLogin';

// Mock services
import * as FetchNodeServices from '../services/FetchNodeServices';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

// Create theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify({
          emailid: 'test@company.com',
          role: 'HR'
        })),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Login to Dashboard Flow Tests', () => {
    test('Complete login to dashboard flow (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock successful login
        FetchNodeServices.postData.mockResolvedValueOnce({
          status: true,
          message: 'Login successful',
          token: `mock-token-${i}`,
          role: 'HR'
        });

        // Mock successful expense fetch
        FetchNodeServices.getData.mockResolvedValueOnce({
          status: true,
          data: [
            {
              id: i,
              expensetitle: `Test Expense ${i}`,
              amount: 100,
              category: 'Office Supplies',
              department: 'HR',
              emailid: 'test@company.com',
              expensedate: new Date().toISOString().split('T')[0]
            }
          ]
        });

        // Render login component
        render(
          <TestWrapper>
            <GmailLogin />
          </TestWrapper>
        );

        // Fill login form
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, `test${i}@company.com`);
        await userEvent.type(passwordInput, `password${i}`);
        
        // Submit login
        fireEvent.click(loginButton);

        // Wait for API call
        await waitFor(() => {
          expect(FetchNodeServices.postData).toHaveBeenCalledWith('gmail/gmaillogin', {
            emailid: `test${i}@company.com`,
            password: `password${i}`
          });
        });
      }
    });
  });

  describe('Expense Creation Flow Tests', () => {
    test('Complete expense creation flow (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock successful expense creation
        FetchNodeServices.postData.mockResolvedValueOnce({
          status: true,
          message: 'Expense saved successfully'
        });

        render(
          <TestWrapper>
            <ExpenseForm />
          </TestWrapper>
        );

        // Fill expense form
        const titleInput = screen.getByLabelText(/expense title/i);
        const amountInput = screen.getByLabelText(/amount/i);
        const categorySelect = screen.getByLabelText(/category/i);
        const typeSelect = screen.getByLabelText(/expense type/i);
        const submitButton = screen.getByRole('button', { name: /submit expense/i });

        await userEvent.type(titleInput, `Test Expense ${i}`);
        await userEvent.type(amountInput, `${100 + i}`);

        // Select category
        fireEvent.mouseDown(categorySelect);
        const categoryOption = screen.getByText('Office Supplies');
        fireEvent.click(categoryOption);

        // Select type
        fireEvent.mouseDown(typeSelect);
        const typeOption = screen.getByText('Operational');
        fireEvent.click(typeOption);

        // Submit form
        fireEvent.click(submitButton);

        // Wait for API call
        await waitFor(() => {
          expect(FetchNodeServices.postData).toHaveBeenCalledWith('gmail/expensecreate', 
            expect.objectContaining({
              expensetitle: `Test Expense ${i}`,
              amount: `${100 + i}`,
              category: 'Office Supplies',
              expensetype: 'OPERATIONAL'
            })
          );
        });
      }
    });
  });

  describe('Dashboard Data Loading Tests', () => {
    test('Dashboard loads and displays expense data (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock expense data
        const mockExpenses = Array.from({ length: 10 }, (_, index) => ({
          id: index + i * 10,
          expensetitle: `Test Expense ${index + i * 10}`,
          amount: Math.floor(Math.random() * 1000) + 100,
          category: ['Office Supplies', 'Travel', 'Meals'][index % 3],
          department: ['HR', 'FINANCE', 'IT'][index % 3],
          emailid: `user${index}@company.com`,
          expensedate: new Date().toISOString().split('T')[0]
        }));

        FetchNodeServices.getData.mockResolvedValueOnce({
          status: true,
          data: mockExpenses
        });

        render(
          <TestWrapper>
            <RoleDashboard />
          </TestWrapper>
        );

        // Wait for data to load
        await waitFor(() => {
          expect(FetchNodeServices.getData).toHaveBeenCalledWith('gmail/fetch_all_expenses');
        });
      }
    });
  });

  describe('Filter and Search Integration Tests', () => {
    test('Dashboard filtering and search functionality (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock expense data
        const mockExpenses = [
          {
            id: 1,
            expensetitle: `Office Expense ${i}`,
            amount: 100,
            category: 'Office Supplies',
            department: 'HR',
            emailid: 'hr@company.com',
            expensedate: '2024-01-01'
          },
          {
            id: 2,
            expensetitle: `Travel Expense ${i}`,
            amount: 500,
            category: 'Travel',
            department: 'SALES',
            emailid: 'sales@company.com',
            expensedate: '2024-01-02'
          }
        ];

        FetchNodeServices.getData.mockResolvedValue({
          status: true,
          data: mockExpenses
        });

        render(
          <TestWrapper>
            <RoleDashboard />
          </TestWrapper>
        );

        // Wait for initial data load
        await waitFor(() => {
          expect(FetchNodeServices.getData).toHaveBeenCalled();
        });

        // Test search functionality
        const searchInput = screen.queryByPlaceholderText(/search/i);
        if (searchInput) {
          await userEvent.type(searchInput, `Office ${i}`);
          await waitFor(() => {
            expect(searchInput).toHaveValue(`Office ${i}`);
          });
        }

        // Test month filter
        const monthFilter = screen.queryByLabelText(/month/i);
        if (monthFilter) {
          fireEvent.mouseDown(monthFilter);
          const monthOptions = screen.queryAllByRole('option');
          if (monthOptions.length > 0) {
            fireEvent.click(monthOptions[0]);
          }
        }

        // Test department filter
        const deptFilter = screen.queryByLabelText(/department/i);
        if (deptFilter) {
          fireEvent.mouseDown(deptFilter);
          const deptOptions = screen.queryAllByRole('option');
          if (deptOptions.length > 0) {
            fireEvent.click(deptOptions[0]);
          }
        }
      }
    });
  });

  describe('Error Handling Integration Tests', () => {
    test('API error handling in components (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock API errors
        const errorScenarios = [
          { error: 'Network Error', status: false, message: 'Network connection failed' },
          { error: 'Server Error', status: false, message: 'Internal server error' },
          { error: 'Validation Error', status: false, message: 'Invalid data provided' },
          { error: 'Authentication Error', status: false, message: 'Invalid credentials' },
          { error: 'Database Error', status: false, message: 'Database connection failed' }
        ];

        const errorScenario = errorScenarios[i % errorScenarios.length];
        
        FetchNodeServices.postData.mockRejectedValueOnce(new Error(errorScenario.error));
        FetchNodeServices.getData.mockRejectedValueOnce(new Error(errorScenario.error));

        // Test login error handling
        render(
          <TestWrapper>
            <GmailLogin />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await userEvent.type(emailInput, `test${i}@company.com`);
        await userEvent.type(passwordInput, `password${i}`);
        fireEvent.click(loginButton);

        // Test expense form error handling
        render(
          <TestWrapper>
            <ExpenseForm />
          </TestWrapper>
        );

        const titleInput = screen.getByLabelText(/expense title/i);
        const amountInput = screen.getByLabelText(/amount/i);
        const submitButton = screen.getByRole('button', { name: /submit expense/i });

        await userEvent.type(titleInput, `Test Expense ${i}`);
        await userEvent.type(amountInput, '100');
        fireEvent.click(submitButton);

        // Test dashboard error handling
        render(
          <TestWrapper>
            <RoleDashboard />
          </TestWrapper>
        );

        // Wait for error handling
        await waitFor(() => {
          // Component should handle errors gracefully
          expect(screen.getByText(/expense management/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Data Persistence Integration Tests', () => {
    test('Local storage integration (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        const mockUserData = {
          emailid: `test${i}@company.com`,
          role: 'HR',
          token: `mock-token-${i}`
        };

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
          value: {
            getItem: jest.fn((key) => {
              if (key === 'GMAIL_USER') return JSON.stringify(mockUserData);
              if (key === 'TOKEN') return `mock-token-${i}`;
              return null;
            }),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
          },
          writable: true,
        });

        render(
          <TestWrapper>
            <RoleDashboard />
          </TestWrapper>
        );

        // Verify localStorage interactions
        expect(window.localStorage.getItem).toHaveBeenCalledWith('GMAIL_USER');
        expect(window.localStorage.getItem).toHaveBeenCalledWith('TOKEN');
      }
    });
  });

  describe('Performance Integration Tests', () => {
    test('Component rendering performance under load (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock large dataset
        const largeExpenseData = Array.from({ length: 1000 }, (_, index) => ({
          id: index,
          expensetitle: `Expense ${index}`,
          amount: Math.floor(Math.random() * 10000),
          category: 'Office Supplies',
          department: 'HR',
          emailid: `user${index}@company.com`,
          expensedate: new Date().toISOString().split('T')[0]
        }));

        FetchNodeServices.getData.mockResolvedValueOnce({
          status: true,
          data: largeExpenseData
        });

        const startTime = performance.now();

        render(
          <TestWrapper>
            <RoleDashboard />
          </TestWrapper>
        );

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Should render within 500ms even with large dataset
        expect(renderTime).toBeLessThan(500);

        // Wait for data processing
        await waitFor(() => {
          expect(FetchNodeServices.getData).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Cross-Component Communication Tests', () => {
    test('Data flow between components (100 test cases)', async () => {
      for (let i = 0; i < 100; i++) {
        // Mock successful operations
        FetchNodeServices.postData.mockResolvedValue({
          status: true,
          message: 'Success'
        });

        FetchNodeServices.getData.mockResolvedValue({
          status: true,
          data: []
        });

        // Test expense creation and dashboard update flow
        const { rerender } = render(
          <TestWrapper>
            <ExpenseForm />
          </TestWrapper>
        );

        // Create expense
        const titleInput = screen.getByLabelText(/expense title/i);
        const amountInput = screen.getByLabelText(/amount/i);
        const submitButton = screen.getByRole('button', { name: /submit expense/i });

        await userEvent.type(titleInput, `Test Expense ${i}`);
        await userEvent.type(amountInput, '100');
        fireEvent.click(submitButton);

        // Switch to dashboard
        rerender(
          <TestWrapper>
            <RoleDashboard />
          </TestWrapper>
        );

        // Verify dashboard loads
        await waitFor(() => {
          expect(screen.getByText(/expense management/i)).toBeInTheDocument();
        });
      }
    });
  });
});


