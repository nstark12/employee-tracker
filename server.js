// require in inquirer and connection
const inquirer = require('inquirer')
const connection = require('./db/connection')

connection.connect(err => {
    if (err) throw (err)
    console.log('Connection successful!')
    employeeTracker()
})

const employeeTracker = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Departmnet']
        }
    ])
    .then(answers => {
        // View All Employees
        if (answers.prompt === 'View All Employees') {
            connection.query(`SELECT * FROM employee`, (err, result) => {
                if (err) throw err
                console.table(result)
                employeeTracker()
            })
            
        // View All Roles 
        } else if (answers.prompt === 'View All Roles') {
            connection.query(`SELECT * FROM role`, (err, result) => {
                if (err) throw err
                console.table(result)
                employeeTracker
            })

        }
    })
}
