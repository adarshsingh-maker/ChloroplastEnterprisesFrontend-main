var mysql=require("mysql2")

var pool=mysql.createPool({
    host:'localhost',
    port:3306,
    user:'root',
    password:'Futurecraft@123',
    database:'futurecraft',
    multipleStatements:true,
    connectionLimit:100
})
module.exports=pool