import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  AttachMoney as AttachMoneyIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { getData } from '../../services/FetchNodeServices';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const roleColors = {
  'IT': '#2196F3',
  'HR': '#4CAF50',
  'FINANCE': '#FF9800',
  'OPERATIONS': '#9C27B0',
  'SALES': '#F44336'
};

const roleLabels = {
  'IT': 'IT Department',
  'HR': 'Human Resources',
  'FINANCE': 'Finance',
  'OPERATIONS': 'Operations',
  'SALES': 'Sales'
};

export default function RoleDashboard() {
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [monthlyStats, setMonthlyStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState({});
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    pendingExpenses: 0,
    approvedExpenses: 0
  });
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [usdConversionRate] = useState(83.0); // Default rate: 1 USD = 83 INR
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedMonthForSummary, setSelectedMonthForSummary] = useState(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [monthlySummaryDialogOpen, setMonthlySummaryDialogOpen] = useState(false);
  const [monthlySummarySelectedDepartment, setMonthlySummarySelectedDepartment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  // Load expenses when userData is available
  useEffect(() => {
    if (userData) {
      loadExpenses();
    }
  }, [userData]);

  const loadUserData = () => {
    const user = localStorage.getItem('GMAIL_USER');
    const token = localStorage.getItem('TOKEN');
    
    if (user && token) {
      setUserData(JSON.parse(user));
    } else {
      navigate('/gmaillogin');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          icon: 'success',
          title: 'Logged Out!',
          text: 'You have been successfully logged out',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
        }).then(() => {
          navigate('/gmaillogin');
        });
      }
    });
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const result = await getData('gmail/fetch_all_expenses');
      if (result.status) {
        let expensesToShow = result.data || [];
        
        // If user is Super Admin, show all expenses; otherwise filter by department
        if (userData?.role !== 'SUPER_ADMIN') {
          expensesToShow = result.data.filter(expense => 
          expense.department === userData?.role
        );
        }
        
        setExpenses(expensesToShow);
        setFilteredExpenses(expensesToShow);
        calculateStats(expensesToShow);
        
        // Set total expense amount (doesn't change with filters)
        const totalAmount = expensesToShow.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        setTotalExpenseAmount(totalAmount);
        
        // Calculate monthly stats
        const monthlyData = calculateMonthlyStats(expensesToShow);
        setMonthlyStats(monthlyData);
        
        // Calculate department stats for Super Admin
        if (userData?.role === 'SUPER_ADMIN') {
          calculateDepartmentStats(result.data || []);
          calculateCategoryStats(result.data || []);
        }
        
        // Set current month as default
        const currentDate = new Date();
        const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonthKey);
      } else {
        setExpenses([]);
        setFilteredExpenses([]);
        calculateStats([]);
        setTotalExpenseAmount(0);
        setMonthlyStats({});
        setDepartmentStats({});
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load expenses',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (expenseData) => {
    const totalExpenses = expenseData.length;
    const totalAmount = expenseData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

    setStats({
      totalExpenses,
      totalAmount
    });
  };

  const calculateDepartmentStats = (expenseData) => {
    const deptStats = {};
    
    expenseData.forEach(expense => {
      const dept = expense.department;
      if (!deptStats[dept]) {
        deptStats[dept] = {
          totalExpenses: 0,
          totalAmount: 0
        };
      }
      
      deptStats[dept].totalExpenses += 1;
      deptStats[dept].totalAmount += parseFloat(expense.amount || 0);
    });
    
    setDepartmentStats(deptStats);
  };

  const calculateCategoryStats = (expenseData) => {
    const catStats = {};
    const chartDataArray = [];
    
    expenseData.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!catStats[category]) {
        catStats[category] = {
          totalAmount: 0,
          count: 0,
          expenses: [],
          percentage: 0
        };
      }
      
      catStats[category].totalAmount += parseFloat(expense.amount || 0);
      catStats[category].count += 1;
      catStats[category].expenses.push(expense);
    });
    
    // Calculate percentages and prepare chart data
    const totalAmount = Object.values(catStats).reduce((sum, cat) => sum + cat.totalAmount, 0);
    Object.keys(catStats).forEach(category => {
      catStats[category].percentage = totalAmount > 0 ? (catStats[category].totalAmount / totalAmount) * 100 : 0;
      
      // Prepare data for charts
      chartDataArray.push({
        name: category,
        value: catStats[category].totalAmount,
        count: catStats[category].count,
        percentage: catStats[category].percentage,
        fill: getCategoryColor(category)
      });
    });
    
    // Sort by amount for better visualization
    chartDataArray.sort((a, b) => b.value - a.value);
    
    setCategoryStats(catStats);
    setChartData(chartDataArray);
  };

  const getCategoryColor = (category) => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
      '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff',
      '#800080', '#008000', '#ffa500', '#ff69b4', '#40e0d0'
    ];
    const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCategoryExpenses(categoryStats[category]?.expenses || []);
  };


  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setViewDialogOpen(true);
  };

  const handleMonthClick = (monthKey) => {
    setSelectedMonthForSummary(monthKey);
    // Set current department as default (ALL)
    setMonthlySummarySelectedDepartment('ALL');
    
    // Filter expenses for the selected month
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.expensedate || expense.date);
      const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      return expenseMonthKey === monthKey;
    });
    setMonthlyExpenses(monthExpenses);
    setMonthlySummaryDialogOpen(true);
  };

  const handleMonthlySummaryDepartmentChange = (event) => {
    const department = event.target.value;
    setMonthlySummarySelectedDepartment(department);
  };

  const getFilteredMonthlyExpenses = () => {
    if (monthlySummarySelectedDepartment === 'ALL') return monthlyExpenses;
    return monthlyExpenses.filter(expense => expense.department === monthlySummarySelectedDepartment);
  };

  const downloadMonthlyExpensesToExcel = async () => {
    const filteredExpenses = getFilteredMonthlyExpenses();
    
    if (filteredExpenses.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No expenses found to export',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    try {
      // Show loading alert
      Swal.fire({
        title: 'Preparing Excel File...',
        text: 'Please wait while we prepare your download',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare data for Excel
      const excelData = filteredExpenses.map((expense, index) => ({
        'S.No': index + 1,
        'Title': expense.expensetitle || expense.title || '',
        'Department': expense.department || '',
        'Category': expense.category || '',
        'Amount (INR)': parseFloat(expense.amount) || 0,
        'Amount (USD)': convertToUSD(parseFloat(expense.amount) || 0),
        'Date': formatDate(expense.expensedate || expense.date),
        'Submitted By': expense.emailid || expense.submittedBy || 'N/A',
        'Vendor': expense.vendor || '',
        'Receipt Number': expense.receiptnumber || '',
        'Description': expense.description || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 8 },   // S.No
        { wch: 25 },  // Title
        { wch: 15 },  // Department
        { wch: 20 },  // Category
        { wch: 15 },  // Amount (INR)
        { wch: 15 },  // Amount (USD)
        { wch: 12 },  // Date
        { wch: 25 },  // Submitted By
        { wch: 20 },  // Vendor
        { wch: 15 },  // Receipt Number
        { wch: 30 }   // Description
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Monthly Expenses');

      // Generate filename with month and year
      let filename = 'Monthly_Expenses';
      
      if (selectedMonthForSummary) {
        const monthData = generateMonthOptions().find(m => m.value === selectedMonthForSummary);
        if (monthData) {
          const monthYear = monthData.label.replace(' ', '_');
          filename += `_${monthYear}`;
        }
      }
      
      if (monthlySummarySelectedDepartment !== 'ALL') {
        filename += `_${monthlySummarySelectedDepartment}`;
      }
      
      filename += '.xlsx';

      // Small delay to ensure loading alert is visible
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save file
      XLSX.writeFile(wb, filename);

      // Close loading alert and show success
      await Swal.fire({
        icon: 'success',
        title: 'Download Complete!',
        text: `Monthly expenses exported to ${filename}`,
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        timerProgressBar: true
      });

    } catch (error) {
      console.error('Error downloading Excel file:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'There was an error while preparing your Excel file. Please try again.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const convertToUSD = (inrAmount) => {
    return inrAmount / usdConversionRate;
  };

  const filterExpensesBySearch = (expensesList, searchQuery) => {
    if (!searchQuery.trim()) return expensesList;
    
    const query = searchQuery.toLowerCase();
    return expensesList.filter(expense => 
      (expense.expensetitle || expense.title || '').toLowerCase().includes(query) ||
      (expense.category || '').toLowerCase().includes(query) ||
      (expense.emailid || expense.submittedBy || '').toLowerCase().includes(query) ||
      (expense.vendor || '').toLowerCase().includes(query) ||
      (expense.description || '').toLowerCase().includes(query) ||
      (expense.amount || '').toString().includes(query) ||
      (expense.department || '').toLowerCase().includes(query)
    );
  };

  const filterExpensesByDepartment = (expensesList, department) => {
    if (department === 'ALL') return expensesList;
    return expensesList.filter(expense => expense.department === department);
  };

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setSelectedDepartment(department);
    applyFilters(selectedMonth, department, searchTerm);
  };

  const applyFilters = (month, department, search) => {
    let filtered = expenses;
    
    if (month) {
      filtered = filterExpensesByMonth(filtered, month);
    }
    
    if (department !== 'ALL') {
      filtered = filterExpensesByDepartment(filtered, department);
    }
    
    if (search.trim()) {
      filtered = filterExpensesBySearch(filtered, search);
    }
    
    setFilteredExpenses(filtered);
    
    // Update stats based on filtered data
    const filteredStats = {
      totalExpenses: filtered.length,
      totalAmount: filtered.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)
    };
    setStats(filteredStats);
    
    // Update monthly stats for filtered data
    const filteredMonthlyData = calculateMonthlyStats(filtered);
    setMonthlyStats(filteredMonthlyData);
    
    // Update department stats for filtered data (for Super Admin)
    if (userData?.role === 'SUPER_ADMIN') {
      calculateDepartmentStats(filtered);
      calculateCategoryStats(filtered);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Handle different date formats
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return dateString; // Return as is if not a valid date
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString; // Return as is if formatting fails
    }
  };

  // Generate month options for the dropdown
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // Add current month and previous 11 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      months.push({ value: monthKey, label: monthLabel });
    }
    
    return months;
  };

  // Filter expenses by selected month
  const filterExpensesByMonth = (expensesList, monthKey) => {
    if (!monthKey) return expensesList;
    
    return expensesList.filter(expense => {
      const expenseDate = new Date(expense.expensedate || expense.date);
      const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      return expenseMonthKey === monthKey;
    });
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = (expensesList) => {
    const monthlyData = {};
    
    expensesList.forEach(expense => {
      const expenseDate = new Date(expense.expensedate || expense.date);
      const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = expenseDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          label: monthLabel,
          totalAmount: 0,
          totalExpenses: 0
        };
      }
      
      monthlyData[monthKey].totalAmount += parseFloat(expense.amount) || 0;
      monthlyData[monthKey].totalExpenses += 1;
    });
    
    return monthlyData;
  };

  // Handle month selection change
  const handleMonthChange = (event) => {
    const monthKey = event.target.value;
    setSelectedMonth(monthKey);
    applyFilters(monthKey, selectedDepartment, searchTerm);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    const searchQuery = event.target.value;
    setSearchTerm(searchQuery);
    applyFilters(selectedMonth, selectedDepartment, searchQuery);
  };

  // Get final filtered expenses (month + search)
  const getFinalFilteredExpenses = () => {
    return filteredExpenses;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: roleColors[userData?.role] || '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {roleLabels[userData?.role]} Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="caption" sx={{ color: 'white' }}>
                {userData?.emailid}
              </Typography>
            </Box>
            
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ padding: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" component="h1">
              Welcome, {userData?.emailid}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData?.role === 'SUPER_ADMIN' ? 'Super Admin Dashboard' : `${roleLabels[userData?.role]} Department`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={userData?.role === 'SUPER_ADMIN' ? 'Super Admin' : roleLabels[userData?.role]}
              sx={{
                backgroundColor: userData?.role === 'SUPER_ADMIN' ? '#9C27B0' : roleColors[userData?.role],
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/expense-form')}
              sx={{ backgroundColor: userData?.role === 'SUPER_ADMIN' ? '#9C27B0' : roleColors[userData?.role] }}
            >
              Add Expense
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {userData?.role === 'SUPER_ADMIN' && (
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDepartment}
                label="Department"
                onChange={handleDepartmentChange}
                startAdornment={<BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                size="small"
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {Object.keys(roleLabels).map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {roleLabels[dept]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Select Month"
              onChange={handleMonthChange}
              startAdornment={<CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              size="small"
            >
              {generateMonthOptions().map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Tabs for Super Admin */}
        {userData?.role === 'SUPER_ADMIN' && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Overview" />
              <Tab label="Department Analysis" />
              <Tab label="Monthly Analysis" />
              <Tab label="Category Analytics" />
              <Tab label="All Expenses" />
            </Tabs>
          </Box>
        )}

        {/* Tab Content */}
        {userData?.role === 'SUPER_ADMIN' ? (
          <>
            {tabValue === 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Total Expenses Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReceiptIcon sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">{filteredExpenses.length}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedDepartment !== 'ALL' || selectedMonth || searchTerm ? 'Filtered Expenses' : 'Total Expenses'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Total Amount Card (INR) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CurrencyRupeeIcon sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">{formatCurrency(filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0))}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedDepartment !== 'ALL' || selectedMonth || searchTerm ? 'Filtered Amount' : 'Total Amount'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Total Amount Card (USD) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">{formatUSD(convertToUSD(filteredExpenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0)))}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedDepartment !== 'ALL' || selectedMonth || searchTerm ? 'Filtered Amount (USD)' : 'Total Amount (USD)'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Monthly Expense Card */}
                {selectedMonth && monthlyStats[selectedMonth] && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon sx={{ fontSize: 40, color: '#9C27B0', mr: 2 }} />
                          <Box>
                            <Typography variant="h4">{formatCurrency(monthlyStats[selectedMonth].totalAmount)}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {monthlyStats[selectedMonth].label}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                {Object.keys(departmentStats).map((dept) => (
                  <Grid item xs={12} md={6} lg={4} key={dept}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <BusinessIcon sx={{ fontSize: 30, color: roleColors[dept] || '#9E9E9E', mr: 1 }} />
                          <Typography variant="h6">{roleLabels[dept] || dept}</Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" color="primary">
                            {formatCurrency(departmentStats[dept].totalAmount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Amount
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Total Expenses:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {departmentStats[dept].totalExpenses}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                {Object.keys(monthlyStats).map((monthKey) => (
                  <Grid item xs={12} md={6} key={monthKey}>
                    <Card 
                      onClick={() => handleMonthClick(monthKey)}
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {monthlyStats[monthKey].label}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" color="primary">
                            {formatCurrency(monthlyStats[monthKey].totalAmount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Amount
                          </Typography>
                        </Box>
                        <Typography variant="body2" gutterBottom>
                          Total Expenses: {monthlyStats[monthKey].totalExpenses}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Department Breakdown:
                        </Typography>
                        {Object.keys(monthlyStats[monthKey].departments || {}).map((dept) => (
                          <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{roleLabels[dept] || dept}:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(monthlyStats[monthKey].departments[dept].totalAmount)}
                            </Typography>
                          </Box>
                        ))}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Click to view department-wise expenses
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {tabValue === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <PieChartIcon sx={{ mr: 1, color: '#2196F3' }} />
                  Category Analytics & Expense Visualization
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Pie Chart */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <PieChartIcon sx={{ mr: 1, color: '#4CAF50' }} />
                          Expense Distribution by Category
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={(data) => handleCategoryClick(data.name)}
                                style={{ cursor: 'pointer' }}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name) => [
                                  formatCurrency(value), 
                                  'Amount'
                                ]}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                          Click on any segment to view detailed expenses
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Bar Chart */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <BarChartIcon sx={{ mr: 1, color: '#FF9800' }} />
                          Top Categories by Amount
                        </Typography>
                        <Box sx={{ height: 400 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.slice(0, 8)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                fontSize={12}
                              />
                              <YAxis 
                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                              />
                              <Tooltip 
                                formatter={(value, name) => [
                                  formatCurrency(value), 
                                  'Amount'
                                ]}
                                labelFormatter={(label) => `Category: ${label}`}
                              />
                              <Bar 
                                dataKey="value" 
                                fill="#8884d8"
                                onClick={(data) => handleCategoryClick(data.name)}
                                style={{ cursor: 'pointer' }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                          Click on any bar to view detailed expenses
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Category Summary */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <CategoryIcon sx={{ mr: 1, color: '#9C27B0' }} />
                          Category Summary
                        </Typography>
                        <Grid container spacing={2}>
                          {chartData.map((category, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              <Paper 
                                sx={{ 
                                  p: 2, 
                                  cursor: 'pointer',
                                  '&:hover': { 
                                    backgroundColor: 'action.hover',
                                    transform: 'scale(1.02)',
                                    transition: 'all 0.2s ease-in-out'
                                  }
                                }}
                                onClick={() => handleCategoryClick(category.name)}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Box 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      backgroundColor: category.fill,
                                      borderRadius: '50%',
                                      mr: 1
                                    }} 
                                  />
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {category.name}
                                  </Typography>
                                </Box>
                                <Typography variant="h6" color="primary">
                                  {formatCurrency(category.value)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {category.count} expenses • {category.percentage.toFixed(1)}% of total
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Drill-down Dialog */}
                <Dialog 
                  open={selectedCategory !== null} 
                  onClose={() => setSelectedCategory(null)}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1, color: '#2196F3' }} />
                      Detailed Expenses: {selectedCategory}
                    </Box>
                  </DialogTitle>
                  <DialogContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" color="primary">
                        Total Amount: {formatCurrency(categoryStats[selectedCategory]?.totalAmount || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {categoryStats[selectedCategory]?.count || 0} expenses in this category
                      </Typography>
                    </Box>
                    
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryExpenses.map((expense, index) => (
                            <TableRow key={index}>
                              <TableCell>{expense.expensetitle || expense.title}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={expense.department} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: roleColors[expense.department] || '#9E9E9E',
                                    color: 'white'
                                  }}
                                />
                              </TableCell>
                              <TableCell>{formatCurrency(expense.amount)}</TableCell>
                              <TableCell>{formatDate(expense.expensedate || expense.date)}</TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleViewExpense(expense)}
                                  color="primary"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setSelectedCategory(null)}>Close</Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}

            {tabValue === 4 && (
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">All Expenses</Typography>
                  <TextField
                    size="small"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 300 }}
                  />
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Submitted By</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFinalFilteredExpenses().length > 0 ? (
                        getFinalFilteredExpenses().map((expense) => (
                          <TableRow key={expense.id || expense._id}>
                            <TableCell>{expense.expensetitle || expense.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={roleLabels[expense.department] || expense.department}
                                size="small"
                                sx={{
                                  backgroundColor: roleColors[expense.department] || '#9E9E9E',
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{formatCurrency(expense.amount)}</TableCell>
                            <TableCell>{formatDate(expense.expensedate || expense.date)}</TableCell>
                            <TableCell>{expense.emailid || expense.submittedBy || 'N/A'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewExpense(expense)}
                                  color="primary"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                              {searchTerm.trim() ? 
                                `No expenses found matching "${searchTerm}"` :
                                selectedDepartment !== 'ALL' ? 
                                  `No expenses found for ${roleLabels[selectedDepartment] || selectedDepartment}` :
                                  'No expenses found'
                              }
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </>
        ) : (
          // Regular user view
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Selected Month Card */}
          {selectedMonth && monthlyStats[selectedMonth] && (
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 40, color: roleColors[userData?.role], mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{formatCurrency(monthlyStats[selectedMonth].totalAmount)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {monthlyStats[selectedMonth].label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Total Expenses Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 40, color: roleColors[userData?.role], mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.totalExpenses}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

            {/* Total Expense Amount Card (INR) */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CurrencyRupeeIcon sx={{ fontSize: 40, color: roleColors[userData?.role], mr: 2 }} />
                  <Box>
                      <Typography variant="h4">{formatCurrency(totalExpenseAmount)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Total Expense (INR)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Expense Amount Card (USD) */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{formatUSD(convertToUSD(totalExpenseAmount))}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expense (USD)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* Regular Expenses Table for non-Super Admin users */}
        {userData?.role !== 'SUPER_ADMIN' && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recent Expenses</Typography>
              <TextField
                size="small"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Submitted By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {getFinalFilteredExpenses().length > 0 ? (
                    getFinalFilteredExpenses().map((expense) => (
                    <TableRow key={expense.id || expense._id}>
                      <TableCell>{expense.expensetitle || expense.title}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{formatDate(expense.expensedate || expense.date)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {expense.emailid || expense.submittedBy || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                          {searchTerm.trim() ? 
                            `No expenses found matching "${searchTerm}"` :
                            selectedMonth ? 
                          `No expenses found for ${generateMonthOptions().find(m => m.value === selectedMonth)?.label} in ${userData?.role} department` :
                          `No expenses found for ${userData?.role} department`
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        )}

        {/* View Expense Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogContent>
            {selectedExpense && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1">{selectedExpense.expensetitle || selectedExpense.title}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                  <Typography variant="body1">{formatCurrency(selectedExpense.amount)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{roleLabels[selectedExpense.department] || selectedExpense.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{selectedExpense.category}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{formatDate(selectedExpense.expensedate || selectedExpense.date)}</Typography>
                </Grid>
                {selectedExpense.vendor && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Vendor</Typography>
                    <Typography variant="body1">{selectedExpense.vendor}</Typography>
                  </Grid>
                )}
                {selectedExpense.receiptnumber && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Receipt Number</Typography>
                    <Typography variant="body1">{selectedExpense.receiptnumber}</Typography>
                  </Grid>
                )}
                {selectedExpense.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{selectedExpense.description}</Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Monthly Expense Summary Dialog */}
        {selectedMonthForSummary && (
          <Dialog 
            open={monthlySummaryDialogOpen} 
            onClose={() => setMonthlySummaryDialogOpen(false)} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
              sx: {
                maxHeight: '90vh',
                margin: '20px'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonthIcon sx={{ mr: 1, color: '#2196F3' }} />
                {generateMonthOptions().find(m => m.value === selectedMonthForSummary)?.label || selectedMonthForSummary} - Expense Summary
              </Box>
            </DialogTitle>
            <DialogContent sx={{ padding: '20px 24px', overflow: 'auto' }}>
              {selectedMonthForSummary && (
                <Box>
                  {/* Department Filter and Download Button */}
                  <Box sx={{ mb: 3, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
                      <FormControl sx={{ 
                        minWidth: 200,
                        '& .MuiInputLabel-root': { 
                          transform: 'translate(14px, -9px) scale(0.75)',
                          backgroundColor: 'white',
                          padding: '0 4px'
                        },
                        '& .MuiInputBase-root': {
                          marginTop: '8px'
                        }
                      }}>
                        <InputLabel>Filter by Department</InputLabel>
                        <Select
                          value={monthlySummarySelectedDepartment}
                          label="Filter by Department"
                          onChange={handleMonthlySummaryDepartmentChange}
                          startAdornment={<BusinessIcon sx={{ mr: 1, color: 'text.secondary', marginTop: '4px' }} />}
                          size="small"
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                marginTop: 8
                              }
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                          }}
                        >
                          <MenuItem value="ALL">All Departments</MenuItem>
                          {Object.keys(roleLabels).map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {roleLabels[dept]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={downloadMonthlyExpensesToExcel}
                      sx={{ 
                        backgroundColor: '#4CAF50',
                        '&:hover': {
                          backgroundColor: '#45a049'
                        },
                        alignSelf: 'flex-start'
                      }}
                    >
                      Download Excel
                    </Button>
                  </Box>

                  {/* Summary Statistics */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: '#E3F2FD' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary">
                              {getFilteredMonthlyExpenses().length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Expenses
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: '#E8F5E8' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main">
                              {formatCurrency(getFilteredMonthlyExpenses().reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Amount (INR)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: '#FFF3E0' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main">
                              ${getFilteredMonthlyExpenses().reduce((sum, expense) => sum + convertToUSD(parseFloat(expense.amount) || 0), 0).toFixed(2)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Amount (USD)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ backgroundColor: '#F3E5F5' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="secondary.main">
                              {getFilteredMonthlyExpenses().length > 0 ? formatCurrency(getFilteredMonthlyExpenses().reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) / getFilteredMonthlyExpenses().length) : '₹0'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Average Amount
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Expenses Table */}
                  <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1, color: '#2196F3' }} />
                    Expense Details
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>S.No</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Amount (INR)</TableCell>
                          <TableCell>Amount (USD)</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Submitted By</TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Receipt Number</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredMonthlyExpenses().map((expense, index) => (
                          <TableRow key={expense.id || index} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{expense.expensetitle || expense.title || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={roleLabels[expense.department] || expense.department || 'N/A'} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: roleColors[expense.department] || '#9E9E9E',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }} 
                              />
                            </TableCell>
                            <TableCell>{expense.category || 'N/A'}</TableCell>
                            <TableCell>{formatCurrency(parseFloat(expense.amount) || 0)}</TableCell>
                            <TableCell>${convertToUSD(parseFloat(expense.amount) || 0).toFixed(2)}</TableCell>
                            <TableCell>{formatDate(expense.expensedate || expense.date)}</TableCell>
                            <TableCell>{expense.emailid || expense.submittedBy || 'N/A'}</TableCell>
                            <TableCell>{expense.vendor || 'N/A'}</TableCell>
                            <TableCell>{expense.receiptnumber || 'N/A'}</TableCell>
                            <TableCell>{expense.description || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMonthlySummaryDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

      </Box>
    </Box>
  );
}
