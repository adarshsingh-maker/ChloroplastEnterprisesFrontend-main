var express = require('express');
var router = express.Router();
var pool=require("./pool")
var jwt=require('jsonwebtoken')


/* GET home page. */
/*
router.post('/chktoken', function(req, res, next) {
  const token = req.headers.authorization
jwt.verify(token,'shhhhh',function(err, decoded) {

res.status(200).json(decoded)
})

})
*/
//Api
router.post('/checklogin', function(req, res, next) {
  console.log(req.body)
  pool.query('SELECT * FROM expensemanagement.superadmin WHERE emailid=$1 AND password=$2',[req.body.emailid, req.body.password],function(error,result){
    if(error)
{
res.status(200).json({status:false,data:[],message:'Server Error....'})
}
else
{
    const rows = result.rows || [];
    if(rows.length==1)
    //,{expiresIn:"60s"}
    {
      var token=jwt.sign({data:rows[0]},'shhhhh...')
     console.log(token)

 res.status(200).json({status:true,data:rows[0],message:'Login Successful'})
}
else
{
    res.status(200).json({status:false,data:[],message:'Invalid UserId/Password '})
}

}

  })
});

// Create Super Admin
router.post('/createsuperadmin', function(req, res, next) {
  console.log(req.body)
  const { emailid, password, superadminname } = req.body;
  
      // Check if super admin already exists
      pool.query('SELECT * FROM expensemanagement.superadmin WHERE emailid=$1', [emailid], function(error, result) {
        if (error) {
          res.status(200).json({status: false, data: [], message: 'Server Error....'})
        } else {
          const rows = result.rows || [];
          if (rows.length > 0) {
            res.status(200).json({status: false, data: [], message: 'Super Admin with this email already exists'})
          } else {
            // Create new super admin
            pool.query('INSERT INTO expensemanagement.superadmin (emailid, password, superadminname) VALUES ($1, $2, $3) RETURNING id', 
              [emailid, password, superadminname], function(error, result) {
              if (error) {
                res.status(200).json({status: false, data: [], message: 'Server Error....'})
              } else {
                const newId = result.rows[0].id;
                const token = jwt.sign({data: {emailid, superadminname}}, 'shhhhh...')
                res.status(200).json({
                  status: true, 
                  data: {emailid, superadminname, id: newId}, 
                  token: token,
                  message: 'Super Admin created successfully'
                })
              }
            })
          }
        }
      })
});

module.exports = router;
