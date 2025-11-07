var express = require('express');
var router = express.Router();
var pool = require('./pool');
var jwt = require("jsonwebtoken");

const SECRET_KEY = "your-secret-key-12345"; // Should be in .env file

/* POST - Admin Login */
router.post('/checklogin', function (req, res, next) {
  const { emailid, password } = req.body;

  pool.query(
    "SELECT * FROM expensemanagement.restaurants WHERE emailid=$1 AND password=$2", 
    [emailid, password], 
    function (error, result) {
      if (error) {
        console.error('PostgreSQL Error:', error);
        res.status(500).json({ 
          status: false, 
          message: 'Database error occurred' 
        });
      } else {
        if (result.rows.length === 1) {
          // Generate JWT token
          const token = jwt.sign(
            { 
              id: result.rows[0].id,
              emailid: result.rows[0].emailid,
              restaurantname: result.rows[0].restaurantname,
              role: 'ADMIN'
            },
            SECRET_KEY,
            { expiresIn: '24h' }
          );

          res.status(200).json({ 
            status: true, 
            message: 'Login successful',
            data: result.rows[0],
            token: token
          });
        } else {
          res.status(200).json({ 
            status: false, 
            message: 'Invalid email or password' 
          });
        }
      }
    }
  );
});

module.exports = router;

