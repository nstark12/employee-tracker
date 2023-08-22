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
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']
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

            else if (actions === 'Exit') {
                connection.end()
                console.log('Connection ended')
            }
        })
}

// ---------------- POSSIBLE FUNCTIONS ---------------- //

// function to view all employees
viewEmployees = () => {
    connection.query(`SELECT employee.id,
                             employee.first_name,
                             employee.last_name,
                             role.title,
                             department.name AS department,
                             role.salary,
                             CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee
                             LEFT JOIN role ON employee.role_id = role.id
                             LEFT JOIN department ON role.department_id = department.id
                             LEFT JOIN employee manager ON employee.manager_id = manager.id`, (err, result) => {
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
                                    VALUES (?)`, [choices], (err, result) => {
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

// function to add role
addRole = () => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'role',
                message: 'Enter role',
                validate: validateRole => {
                    if (validateRole) {
                        return true
                    } else {
                        console.log('Please enter valid role')
                        return false
                    }
                }
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter salary for this role',
                validate: validateSalary => {
                    if (validateSalary) {
                        return true
                    } else {
                        console.log('Please enter valid salary')
                        return false
                    }
                }
            }
        ])
            .then((answer) => {
                const choices = [answer.role, answer.salary]

                // get department
                connection.query(`SELECT name, id FROM department`, (err, result) => {
                    if (err) throw err
                    const department = result.map(({ name, id }) => ({ name: name, value: id }))

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'department',
                            message: 'Please select the department for this role',
                            choices: department
                        }
                    ])
                        .then(departmentChoice => {
                            const department = departmentChoice.department
                            choices.push(department)

                            connection.query(`INSERT INTO role (title, salary, department_id) VALUES (?)`, [choices], (err, result) => {
                                if (err) throw err
                                console.log(`Successfully added ${answer.role} to roles!`)

                                viewRoles()
                            })
                        })
                })
            })
}

// function to add department
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Please enter department name',
            validate: validateDepartment => {
                if (validateDepartment) {
                    return true
                } else {
                    console.log('Please add valid department')
                    return false
                }
            }
        }
    ])
        .then((answer) => {
            connection.query(`INSERT INTO department (name) VALUES (?)`, [answer.department], (err, result) => {
                if (err) throw err
                console.log(`Added ${answer.department} to departments!`)

                viewDepartments()
            })
        })
}

// function to update employee role
updateEmployeeRole = () => {
    connection.query(`SELECT * FROM employee`, (err, result) => {
        if (err) throw err
        const employees = result.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }))

        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Please select employee to update',
                choices: employees
            }
        ])
            .then(employeeChoice => {
                const employee = employeeChoice.name
                const choices = []
                choices.push(employee)

                connection.query(`SELECT * FROM role`, (err, result) => {
                    if (err) throw err
                    const roles = result.map(({ id, title }) => ({ name: title, value: id }))

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'role',
                            message: 'Please select new employee role',
                            choices: roles
                        }
                    ])
                        .then(roleChoice => {
                            const role = roleChoice.role
                            choices.push(role)

                            let employee = choices[0]
                            choices[0] = role
                            choices[1] = employee

                            connection.query(`UPDATE employee SET role_id = ? WHERE id = ?`, choices, (err, result) => {
                                if (err) throw err
                                console.log('Employee successfully updated!')

                                viewEmployees()
                            })
                        })
                })
            })
    })
}

