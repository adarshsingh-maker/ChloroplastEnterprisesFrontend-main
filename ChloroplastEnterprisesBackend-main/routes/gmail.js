var express = require('express');
var router = express.Router();
var pool=require("./pool")
var upload=require("./multer")
var jwt = require("jsonwebtoken");

/* GET home page. */

router.post('/gmailsubmit', function (req, res, next) {
    const { emailid, password, role } = req.body;
  
    pool.query(
      "INSERT INTO gmaillogin (emailid, password, role) VALUES (?, ?, ?)",
      [emailid, password, role],
      function (error, result) {
        if (error) {
          console.log(error);
          res.status(200).json({ status: false, message: 'This Mail is Already Registered' });
        } else {
          // Generate JWT token for new user
          const token = jwt.sign(
            { emailid: emailid, role: role },
            'shhhhh',
            { expiresIn: '24h' }
          );
          
          res.status(200).json({ 
            status: true, 
            message: 'Gmail Login Saved Successfully',
            token: token
          });
        }
      }
    );
  });

  router.post('/gmaillogin', function (req, res, next) {
    const { emailid, password } = req.body;
  
    pool.query(
      "SELECT * FROM gmaillogin WHERE emailid = ? AND password = ?",
      [emailid, password],
      function (error, result) {
        if (error) {
          console.log(error);
          res.status(200).json({ status: false, message: 'Database error' });
        } else if (result.length > 0) {
          const user = result[0];
          
          // Generate JWT token for existing user
          const token = jwt.sign(
            { emailid: emailid, role: user.role },
            'shhhhh',
            { expiresIn: '24h' }
          );
          
          res.status(200).json({ 
            status: true, 
            message: 'Login successful',
            role: user.role,
            token: token
          });
        } else {
          res.status(200).json({ status: false, message: 'Invalid email or password' });
        }
      }
    );
  });

  // JWT Middleware to protect expense routes
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ status: false, message: 'Access token required' });
    }

    jwt.verify(token, 'shhhhh', (err, decoded) => {
      if (err) {
        return res.status(403).json({ status: false, message: 'Invalid or expired token' });
      }
      req.user = decoded;
      next();
    });
  };

  router.post('/expensecreate', authenticateToken, function (req, res, next) {
    const { 
      expensetitle, 
      amount, 
      category, 
      expensetype, 
      expensedate, 
      receiptnumber, 
      vendor, 
      description,
      department,
      emailid,
      submittedBy
    } = req.body;
  
    // ✅ Debug log – see if data is coming correctly
    console.log("📥 Incoming Expense Data:", req.body);
    console.log("📧 Email ID for bifurcation:", emailid);
    console.log("🏢 Department:", department);
  
    pool.query(
      `INSERT INTO expense 
      (expensetitle, amount, category, expensetype, expensedate, receiptnumber, vendor, description, department, emailid, submittedBy) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [expensetitle, amount, category, expensetype, expensedate, receiptnumber, vendor, description, department, emailid, submittedBy],
      function (error, result) {
        if (error) {
          console.error("❌ MySQL Error:", error); // log database error clearly
          res.status(200).json({ status: false, message: 'Failed to save expense' });
        } else {
          console.log("✅ Expense Inserted:", result); // confirm insert
          console.log("📊 Expense bifurcated by email:", emailid, "for department:", department);
          res.status(200).json({ status: true, message: 'Expense Saved Successfully' });
        }
      }
    );
  });



  router.get('/fetch_all_expenses', authenticateToken, function (req, res, next) {
    try {
      // Simple query to get all expenses without ordering
      pool.query("SELECT * FROM expense", function (error, result) {
        if (error) {
          console.log("❌ Database Error:", error);
          res.status(200).json({
            status: false,
            message: 'Database Error...',
            data: []
          });
        } else {
          if (result.length > 0) {
            console.log("✅ Expense Data Fetched Successfully:", result.length, "expenses");
            // Log department bifurcation
            const departmentCounts = {};
            result.forEach(expense => {
              const dept = expense.department || 'Unknown';
              departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
            });
            console.log("📊 Department Bifurcation:", departmentCounts);
          } else {
            console.log("⚠️ No expense data found in table.");
          }
  
          res.status(200).json({
            status: true,
            message: 'Success...',
            data: result
          });
        }
      });
    } catch (e) {
      console.log("❌ Server Error:", e);
      res.status(200).json({
        status: false,
        message: 'Server Error...',
        data: []
      });
    }
  });
  
  
  
  








 

  router.post('/delete_expense/:id', authenticateToken, function (req, res, next) {
    const { id } = req.params;
    
    pool.query(
      "DELETE FROM expense WHERE id = ?",
      [id],
      function (error, result) {
        if (error) {
          console.error("❌ MySQL Error:", error);
          res.status(200).json({ status: false, message: 'Failed to delete expense' });
        } else {
          console.log("✅ Expense Deleted:", result);
          res.status(200).json({ status: true, message: 'Expense deleted successfully' });
        }
      }
    );
  });

module.exports = router;
