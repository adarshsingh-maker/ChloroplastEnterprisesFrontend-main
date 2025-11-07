var express = require('express');
var router = express.Router();
var pool = require('./pool');

/* POST - Create new company */
router.post('/create', function (req, res, next) {
  const { company_name } = req.body;

  if (!company_name || !company_name.trim()) {
    return res.status(200).json({ 
      status: false, 
      message: 'Company name is required' 
    });
  }

  pool.query(
    "INSERT INTO expensemanagement.companies (company_name) VALUES ($1) RETURNING id",
    [company_name.trim()],
    function (error, result) {
      if (error) {
        console.error('Company Creation Error:', error);
        
        // Check for duplicate company name error (PostgreSQL error code 23505)
        if (error.code === '23505') {
          res.status(200).json({ 
            status: false, 
            message: 'Company name already exists' 
          });
        } else {
          res.status(200).json({ 
            status: false, 
            message: 'Failed to create company: ' + error.message 
          });
        }
      } else {
        res.status(200).json({ 
          status: true, 
          message: 'Company created successfully',
          companyId: result.rows[0].id
        });
      }
    }
  );
});

/* GET - Fetch all companies */
router.get('/list', function (req, res, next) {
  pool.query(
    "SELECT * FROM expensemanagement.companies ORDER BY company_name",
    function (error, result) {
      if (error) {
        console.error('Fetch Companies Error:', error);
        res.status(200).json({ 
          status: false, 
          message: 'Failed to fetch companies' 
        });
      } else {
        res.status(200).json({ 
          status: true, 
          data: result.rows 
        });
      }
    }
  );
});

module.exports = router;
