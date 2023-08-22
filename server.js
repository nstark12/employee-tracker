// require in inquirer and connection
const inquirer = require('inquirer')
const connection = require('./db/connection')

connection.connect(err => {
    if (err) throw (err)
    console.log('Connection successful!')
    userQuestions()
})

