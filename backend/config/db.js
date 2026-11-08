const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',        
    database: 'mrhungry' 
});

const db = pool.promise();

console.log('Connected to XAMPP MySQL!');

module.exports = db;