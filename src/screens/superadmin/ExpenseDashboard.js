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
  Alert,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  AttachMoney as AttachMoneyIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { getData, postData } from '../../services/FetchNodeServices';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const departmentColors = {
  'IT': '#2196F3',
  'HR': '#4CAF50',
  'FINANCE': '#FF9800',
  'OPERATIONS': '#9C27B0',
  'SALES': '#F44336'
};

const departmentLabels = {
  'IT': 'IT Department',
  'HR': 'Human Resources',
  'FINANCE': 'Finance',
  'OPERATIONS': 'Operations',
  'SALES': 'Sales'
};

export default function ExpenseDashboard() {
  const [userData, setUserData] = useState(null);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState({});
  const [overallStats, setOverallStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      loadAllExpenses();
    }
  }, [userData]);

  const loadUserData = () => {
    const user = localStorage.getItem('SUPER');
    if (user) {
      setUserData(JSON.parse(user));
    } else {
      navigate('/loginpage');
    }
  };

  const loadAllExpenses = async () => {
    try {
      setLoading(true);
      const result = await getData('gmail/fetch_all_expenses');
      if (result.status) {
        setAllExpenses(result.data || []);
        setFilteredExpenses(result.data || []);
        calculateOverallStats(result.data || []);
        calculateDepartmentStats(result.data || []);
        
        // Calculate monthly stats
        const monthlyData = calculateMonthlyStats(result.data || []);
        setMonthlyStats(monthlyData);
        
        // Set current month as default
        const currentDate = new Date();
        const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonthKey);
      } else {
        setAllExpenses([]);
        setFilteredExpenses([]);
        calculateOverallStats([]);
        setDepartmentStats({});
        setMonthlyStats({});
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

  const calculateOverallStats = (expenseData) => {
    const totalExpenses = expenseData.length;
    const totalAmount = expenseData.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const pendingExpenses = expenseData.filter(expense => expense.status === 'PENDING').length;
    const approvedExpenses = expenseData.filter(expense => expense.status === 'APPROVED').length;
    const rejectedExpenses = expenseData.filter(expense => expense.status === 'REJECTED').length;

    setOverallStats({
      totalExpenses,
      totalAmount,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses
    });
  };

  const calculateDepartmentStats = (expenseData) => {
    const deptStats = {};
    
    expenseData.forEach(expense => {
      const dept = expense.department;
      if (!deptStats[dept]) {
        deptStats[dept] = {
          totalExpenses: 0,
          totalAmount: 0,
          pendingExpenses: 0,
          approvedExpenses: 0,
          rejectedExpenses: 0
        };
      }
      
      deptStats[dept].totalExpenses += 1;
      deptStats[dept].totalAmount += parseFloat(expense.amount || 0);
      
      if (expense.status === 'PENDING') deptStats[dept].pendingExpenses += 1;
      else if (expense.status === 'APPROVED') deptStats[dept].approvedExpenses += 1;
      else if (expense.status === 'REJECTED') deptStats[dept].rejectedExpenses += 1;
    });
    
    setDepartmentStats(deptStats);
  };

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
          totalExpenses: 0,
          departments: {}
        };
      }
      
      monthlyData[monthKey].totalAmount += parseFloat(expense.amount) || 0;
      monthlyData[monthKey].totalExpenses += 1;
      
      // Department breakdown for the month
      const dept = expense.department;
      if (!monthlyData[monthKey].departments[dept]) {
        monthlyData[monthKey].departments[dept] = {
          totalAmount: 0,
          totalExpenses: 0
        };
      }
      monthlyData[monthKey].departments[dept].totalAmount += parseFloat(expense.amount) || 0;
      monthlyData[monthKey].departments[dept].totalExpenses += 1;
    });
    
    return monthlyData;
  };

  const filterExpensesByMonth = (expensesList, monthKey) => {
    if (!monthKey) return expensesList;
    
    return expensesList.filter(expense => {
      const expenseDate = new Date(expense.expensedate || expense.date);
      const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      return expenseMonthKey === monthKey;
    });
  };

  const filterExpensesByDepartment = (expensesList, department) => {
    if (department === 'ALL') return expensesList;
    return expensesList.filter(expense => expense.department === department);
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

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
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

  const handleMonthChange = (event) => {
    const monthKey = event.target.value;
    setSelectedMonth(monthKey);
    applyFilters(monthKey, selectedDepartment, searchTerm);
  };

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setSelectedDepartment(department);
    applyFilters(selectedMonth, department, searchTerm);
  };

  const handleSearchChange = (event) => {
    const searchQuery = event.target.value;
    setSearchTerm(searchQuery);
    applyFilters(selectedMonth, selectedDepartment, searchQuery);
  };

  const applyFilters = (month, department, search) => {
    let filtered = allExpenses;
    
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
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setViewDialogOpen(true);
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      const response = await postData(`gmail/approve_expense/${expenseId}`, {});
      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: 'Expense has been approved',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
        });
        loadAllExpenses();
        setApproveDialogOpen(false);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve expense',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
    }
  };

  const handleRejectExpense = async (expenseId) => {
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please provide a reason for rejection',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
      return;
    }

    try {
      const response = await postData(`gmail/reject_expense/${expenseId}`, {
        reason: rejectReason
      });
      if (response.status) {
        Swal.fire({
          icon: 'success',
          title: 'Rejected!',
          text: 'Expense has been rejected',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
        });
        loadAllExpenses();
        setRejectDialogOpen(false);
        setRejectReason('');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to reject expense',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
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
          navigate('/loginpage');
        });
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return dateString;
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getDepartmentColor = (department) => {
    return departmentColors[department] || '#9E9E9E';
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
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Super Admin - Expense Management
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {userData?.superadminname || userData?.emailid}
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
            <Typography variant="h4" component="h1">
              Expense Management Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Comprehensive view of all department expenses
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadAllExpenses}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Export functionality would go here
                Swal.fire({
                  icon: 'info',
                  title: 'Export Feature',
                  text: 'Export functionality will be implemented',
                  timer: 2000,
                  showConfirmButton: false,
                  toast: true,
                });
              }}
            >
              Export Data
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
                {Object.keys(departmentLabels).map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {departmentLabels[dept]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Department Analysis" />
            <Tab label="Monthly Analysis" />
            <Tab label="All Expenses" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Overall Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{overallStats.totalExpenses}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CurrencyRupeeIcon sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{formatCurrency(overallStats.totalAmount)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{overallStats.pendingExpenses}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Approval
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
                    <Box>
                      <Typography variant="h4">{overallStats.approvedExpenses}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={3}>
            {Object.keys(departmentStats).map((dept) => (
              <Grid item xs={12} md={6} lg={4} key={dept}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BusinessIcon sx={{ fontSize: 30, color: getDepartmentColor(dept), mr: 1 }} />
                      <Typography variant="h6">{departmentLabels[dept] || dept}</Typography>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="warning.main">Pending:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {departmentStats[dept].pendingExpenses}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="success.main">Approved:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {departmentStats[dept].approvedExpenses}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="error.main">Rejected:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {departmentStats[dept].rejectedExpenses}
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
                <Card>
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
                    {Object.keys(monthlyStats[monthKey].departments).map((dept) => (
                      <Box key={dept} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{departmentLabels[dept] || dept}:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(monthlyStats[monthKey].departments[dept].totalAmount)}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tabValue === 3 && (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">All Expenses</Typography>
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
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id || expense._id}>
                        <TableCell>{expense.expensetitle || expense.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={departmentLabels[expense.department] || expense.department}
                            size="small"
                            sx={{
                              backgroundColor: getDepartmentColor(expense.department),
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>{formatDate(expense.expensedate || expense.date)}</TableCell>
                        <TableCell>{expense.emailid || expense.submittedBy || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.status || 'PENDING'}
                            color={getStatusColor(expense.status || 'PENDING')}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewExpense(expense)}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                            {expense.status === 'PENDING' && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setApproveDialogOpen(true);
                                  }}
                                  color="success"
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setRejectDialogOpen(true);
                                  }}
                                  color="error"
                                >
                                  <CancelIcon />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                          {searchTerm.trim() ? 
                            `No expenses found matching "${searchTerm}"` :
                            selectedDepartment !== 'ALL' ? 
                              `No expenses found for ${departmentLabels[selectedDepartment] || selectedDepartment}` :
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
                  <Typography variant="body1">{departmentLabels[selectedExpense.department] || selectedExpense.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{selectedExpense.category}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{formatDate(selectedExpense.expensedate || selectedExpense.date)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedExpense.status || 'PENDING'}
                    color={getStatusColor(selectedExpense.status || 'PENDING')}
                    size="small"
                  />
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

        {/* Approve Expense Dialog */}
        <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
          <DialogTitle>Approve Expense</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to approve this expense?
            </Typography>
            {selectedExpense && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Title: {selectedExpense.expensetitle || selectedExpense.title}</Typography>
                <Typography variant="subtitle2">Amount: {formatCurrency(selectedExpense.amount)}</Typography>
                <Typography variant="subtitle2">Department: {departmentLabels[selectedExpense.department] || selectedExpense.department}</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleApproveExpense(selectedExpense?.id || selectedExpense?._id)} 
              color="success"
              variant="contained"
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Expense Dialog */}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Reject Expense</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Are you sure you want to reject this expense?
            </Typography>
            {selectedExpense && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Title: {selectedExpense.expensetitle || selectedExpense.title}</Typography>
                <Typography variant="subtitle2">Amount: {formatCurrency(selectedExpense.amount)}</Typography>
                <Typography variant="subtitle2">Department: {departmentLabels[selectedExpense.department] || selectedExpense.department}</Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label="Reason for rejection"
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleRejectExpense(selectedExpense?.id || selectedExpense?._id)} 
              color="error"
              variant="contained"
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
