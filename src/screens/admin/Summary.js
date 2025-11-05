import { Grid, Paper, Typography } from "@mui/material"
import { Receipt as ReceiptIcon, TrendingUp as TrendingUpIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material'

export default function Summary(props) {
  return(
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Expense Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome to the expense management dashboard. This system allows you to track and manage all company expenses.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Expense Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Track all company expenses with detailed categorization and reporting
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Analytics & Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              View detailed analytics and generate comprehensive expense reports
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <AttachMoneyIcon sx={{ fontSize: 40, color: '#FF9800', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Budget Management
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Monitor spending patterns and manage departmental budgets effectively
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

/*
          <Grid item xs={3} style={{display:'flex',alignItems:'center',flexDirection:'column',fontFamily:'kanit',fontSize:18,fontWeight:'bold'}}>
        <div>
          Total Sales
        </div>
        <div style={{fontSize:24}}>
          &#8377;{totalAmount.totalbill}
        </div >
       </Grid>

*/
