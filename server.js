// require in inquirer and connection
const inquirer = require('inquirer')
const connection = require('./db/connection')

connection.connect(err => {
    if (err) throw (err)
    console.log('Connection successful!')
    questions()
})

// Inquirer prompt and if block to select correct function to run
const questions = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'actions',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department']
        }
    ])
        .then((answers) => {
            const { actions } = answers

            if (actions === 'View All Employees') {
                viewEmployees()
            }

            else if (actions === 'Add Employee') {
                addEmployee()
            }

            else if (actions === 'Update Employee Role') {
                updateEmployeeRole()
            }

            else if (actions === 'View All Roles') {
                viewRoles()
            }

            else if (actions === 'Add Role') {
                addRole()
            }

            else if (actions === 'View All Departments') {
                viewDepartments()
            }

            else if (actions === 'Add Department') {
                addDepartment()
            }
        })
}

// ---------------- POSSIBLE FUNCTIONS ---------------- //

// function to view all employees
viewEmployees = () => {
    connection.query(`SELECT * FROM employee`, (err, result) => {
        if (err) throw err
        console.table(result)
        questions()
    })
}

// function to view all roles
viewRoles = () => {
    connection.query(`SELECT * FROM role`, (err, result) => {
        if (err) throw err
        console.table(result)
        questions()
    })
}

// function to view all departments
viewDepartments = () => {
    connection.query(`SELECT * FROM department`, (err, result) => {
        if (err) throw err
        console.table(result)
        questions()
    })
}

// function to add employee
addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'Please enter employee first name',
            validate: firstNameValidate => {
                if (firstNameValidate) {
                    return true
                } else {
                    console.log('Please enter a valid name')
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Please enter employee last name',
            validate: lastNameValidate => {
                if (lastNameValidate) {
                    return true
                } else {
                    console.log('Please enter a valid name')
                    return false;
                }
             }
        }
    ])
        .then((answer) => {
            const choices = [answer.firstName, answer.lastName]

            // get roles
            connection.query(`SELECT role.id, role.title FROM role`, (err, result) => {
                if (err) throw err
                const roles = result.map(({ id, title }) => ({ name: title, value: id }))

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'Please select employee role',
                        choices: roles
                    }
                ])
                    .then(roleChoice => {
                        const role = roleChoice.role
                        choices.push(role)

                        // get manager
                        connection.query(`SELECT * FROM EMPLOYEE`, (err, result) => {
                            if (err) throw err
                            const managers = result.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }))

                            inquirer.prompt([
                                {
                                    type: 'list',
                                    name: 'manager',
                                    message: 'Please enter employee manager',
                                    choices: managers
                                }
                            ])
                                .then(managerChoice => {
                                    const manager = managerChoice.manager
                                    choices.push(manager)

                                    connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`, [answer.firstName, answer.lastName, roleChoice.role, managerChoice.manager], (err, result) => {
                                        if (err) throw err
                                        console.log('Employee successfully added!')

                                        viewEmployees()
                                    })
                                })
                            })
                     })
                })
            
        })
    }


