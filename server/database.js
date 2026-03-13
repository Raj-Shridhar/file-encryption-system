const mysql = require("mysql2");

const db = mysql.createConnection({
host:"localhost",
user:"root",
password:"Shridhar@9",
database:"secure_files"
});

db.connect(err=>{
if(err) throw err;
console.log("Database Connected");
});

module.exports = db;