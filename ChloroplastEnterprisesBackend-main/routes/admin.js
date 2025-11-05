var express = require('express');
var router = express.Router();
var pool = require("./pool")
var jwt=require('jsonwebtoken')

/* GET home page. */
router.post('/checklogin', function (req, res, next) {
  pool.query('select *from restaurants where emailid=? and password=?', [req.body.emailid, req.body.password], function (error, result) {
    if (error) {
      console.log(error)
      res.status(500).json({ status: false, data: [], message: 'Server Error....' })
    }
    else {
      if (result.length == 1) {
        var token=jwt.sign({data:result[0]},'shhhhh...')
        res.status(200).json({ status: true, data: result[0], message: 'Login Successful' })
      }
      else {
        res.status(200).json({ status: false, data: [], message: 'Invalid UserId/Password ' })
      }

    }

  })
});

module.exports = router;
