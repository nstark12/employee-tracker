const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection({
    socketPath: '/tmp/mysql/sock',
    user: process.env.user,
    password: process.env.password,
    database: 'employee_db'
})

module.exports = connection