import LoginPage from "./screens/superadmin/LoginPage";
import Dashboard from "./screens/superadmin/Dashboard";
import AdminLogin from "./screens/admin/AdminLogin"
import AdminDashboard from "./screens/admin/AdminDashboard"
import GmailLogin from "./screens/gmail/GmailLogin"
import RoleDashboard from "./screens/dashboard/RoleDashboard"
import ExpenseForm from "./screens/expense/ExpenseForm"

import { BrowserRouter as Router,Route,Routes } from "react-router-dom";

function App() {
  return(
    <div>
      <Router>
        <Routes>
          {/* Super Admin Routes */}
          <Route element={<LoginPage/>} path='/loginpage' />
          <Route element={<Dashboard/>} path='/dashboard/*' />

          {/* Admin Routes */}
          <Route element={<AdminLogin/>} path='/adminlogin' />
          <Route element={<AdminDashboard/>} path='/admindashboard/*' />

          {/* Gmail Login and Expense Management Routes */}
          <Route element={<GmailLogin/>} path='/gmaillogin' />
          <Route element={<RoleDashboard/>} path='/dashboard' />
          <Route element={<ExpenseForm/>} path='/expense-form' />
        </Routes>
      </Router>
    </div>
  )
}

export default App;
