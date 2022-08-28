const inquirer = require('inquirer');
const mysql = require('mysql2');


// Database Connect
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Password1',
  database: 'company'
});
 
connection.connect((error) => {
  if (error) throw error;
  console.log((`-----------------------------`));
  promptUser();
});

// Choices
const promptUser = () => {
  inquirer.prompt([
      {
        name: 'choices',
        type: 'list',
        message: 'Please select one of the following options:',
        choices: [
          'View All company',
          'View All Departments',
          'View All Roles', 
          'View All company By Department',
          'View Department Budgets',
          'Update Employee Manager',
          'Update Employee Role',
          'Add Employee',
          'Add Role',
          'Add Department',
          'Remove Role',
          'Remove Employee',
          'Remove Department',
          'Exit'
          ]
      }
    ])
    .then((answers) => {
      const {choices} = answers;

        if (choices === 'View All company') {
            viewAllCompany();
        }

        if (choices === 'View All Departments') {
          viewAllDepartments();
      }

        if (choices === 'View All company By Department') {
            viewCompanyByDepartment();
        }

        if (choices === 'Add Employee') {
            addEmployee();
        }

        if (choices === 'Remove Employee') {
            removeEmployee();
        }

        if (choices === 'Update Employee Role') {
            updateEmployeeRole();
        }

        if (choices === 'Update Employee Manager') {
            updateEmployeeManager();
        }

        if (choices === 'View All Roles') {
            viewAllRoles();
        }

        if (choices === 'Add Role') {
            addRole();
        }

        if (choices === 'Remove Role') {
            removeRole();
        }

        if (choices === 'Add Department') {
            addDepartment();
        }

        if (choices === 'View Department Budgets') {
            viewDepartmentBudget();
        }

        if (choices === 'Remove Department') {
            removeDepartment();
        }

        if (choices === 'Exit') {
            connection.end();
        }
  });
};

// Show All Employees
const viewAllCompany = () => {
  let sql =       `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
    console.log((`-----------------------------`));
    console.table(response);
    console.log((`-----------------------------`));
    promptUser();
  });
};

// Show all Roles
const viewAllRoles = () => {
  console.log((`-----------------------------`));
  console.log((`-----------------------------`));
  const sql =     `SELECT role.id, role.title, department.department_name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
      response.forEach((role) => {console.log(role.title);});
      console.log((`-----------------------------`));
      promptUser();
  });
};

// Show all Departments
const viewAllDepartments = () => {
  const sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
    console.log((`-----------------------------`));
    console.table(response);
    console.log((`-----------------------------`));
    promptUser();
  });
};

// Show all Employees With Department
const viewCompanyByDepartment = () => {
  const sql =     `SELECT employee.first_name, 
                  employee.last_name, 
                  department.department_name AS department
                  FROM employee 
                  LEFT JOIN role ON employee.role_id = role.id 
                  LEFT JOIN department ON role.department_id = department.id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.log((`-----------------------------`));
      console.table(response);
      console.log((`-----------------------------`));
      promptUser();
    });
};

//Show all Departments With Budget
const viewDepartmentBudget = () => {
  console.log((`-----------------------------`));
  const sql =     `SELECT department_id AS id, 
                  department.department_name AS department,
                  SUM(salary) AS budget
                  FROM  role  
                  INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
  connection.query(sql, (error, response) => {
    if (error) throw error;
      console.table(response);
      console.log((`-----------------------------`));
      promptUser();
  });
};

// Add a New Employee
const addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fistName',
      message: "What is the first name of the employee?",
      validate: addFirstName => {
        if (addFirstName) {
            return true;
        } else {
            console.log('Please enter a first name');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the last name of the employee?",
      validate: addLastName => {
        if (addLastName) {
            return true;
        } else {
            console.log('Please enter a last name');
            return false;
        }
      }
    }
  ])
    .then(answer => {
    const crit = [answer.fistName, answer.lastName]
    const roleSql = `SELECT role.id, role.title FROM role`;
    connection.promise().query(roleSql, (error, data) => {
      if (error) throw error; 
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));
      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the role of the employee?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              crit.push(role);
              const managerSql =  `SELECT * FROM employee`;
              connection.promise().query(managerSql, (error, data) => {
                if (error) throw error;
                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the manager of the employee?",
                    choices: managers
                  }
                ])
                  .then(managerChoice => {
                    const manager = managerChoice.manager;
                    crit.push(manager);
                    const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                    connection.query(sql, crit, (error) => {
                    if (error) throw error;
                    console.log("A new employee has been added!")
                    viewAllCompany();
              });
            });
          });
        });
     });
  });
};

// A New Role
const addRole = () => {
  const sql = 'SELECT * FROM department'
  connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let deptNamesArray = [];
      response.forEach((department) => {deptNamesArray.push(department.department_name);});
      deptNamesArray.push('Create Department');
      inquirer
        .prompt([
          {
            name: 'departmentName',
            type: 'list',
            message: 'What department does this new role belong to?',
            choices: deptNamesArray
          }
        ])
        .then((answer) => {
          if (answer.departmentName === 'Create Department') {
            this.addDepartment();
          } else {
            addRoleResume(answer);
          }
        });

      const addRoleResume = (departmentData) => {
        inquirer
          .prompt([
            {
              name: 'newRole',
              type: 'input',
              message: 'What is the name of your new role?',
              validate: validate.validateString
            },
            {
              name: 'salary',
              type: 'input',
              message: 'What is the salary of this new role?',
              validate: validate.validateSalary
            }
          ])
          .then((answer) => {
            let createdRole = answer.newRole;
            let departmentId;

            response.forEach((department) => {
              if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
            });

            let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
            let crit = [createdRole, answer.salary, departmentId];

            connection.promise().query(sql, crit, (error) => {
              if (error) throw error;
              console.log((`-----------------------------`));
              viewAllRoles();
            });
          });
      };
    });
  };

// A New Department
const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of the new Department?',
          validate: validate.validateString
        }
      ])
      .then((answer) => {
        let sql =     `INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log(``);
          console.log((answer.newDepartment + ` The new Department has been added!`));
          console.log(``);
          viewAllDepartments();
        });
      });
};

// Employee's Role Update
const updateEmployeeRole = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      let sql =     `SELECT role.id, role.title FROM role`;
      connection.promise().query(sql, (error, response) => {
        if (error) throw error;
        let rolesArray = [];
        response.forEach((role) => {rolesArray.push(role.title);});

        inquirer
          .prompt([
            {
              name: 'chosenEmployee',
              type: 'list',
              message: 'Which employee has a new role?',
              choices: employeeNamesArray
            },
            {
              name: 'chosenRole',
              type: 'list',
              message: 'What is their new role?',
              choices: rolesArray
            }
          ])
          .then((answer) => {
            let newTitleId, employeeId;

            response.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
              }
            });

            response.forEach((employee) => {
              if (
                answer.chosenEmployee ===
                `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
              }
            });

            let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
            connection.query(
              sqls,
              [newTitleId, employeeId],
              (error) => {
                if (error) throw error;
                console.log((`-----------------------------`));
                promptUser();
              }
            );
          });
      });
    });
  };

// Update an Employee's Manager
const updateEmployeeManager = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, employee.manager_id
                    FROM employee`;
     connection.promise().query(sql, (error, response) => {
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new manager?',
            choices: employeeNamesArray
          },
          {
            name: 'newManager',
            type: 'list',
            message: 'Who is their new manager?',
            choices: employeeNamesArray
          }
        ])
        .then((answer) => {
          let employeeId, managerId;
          response.forEach((employee) => {
            if (
              answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }

            if (
              answer.newManager === `${employee.first_name} ${employee.last_name}`
            ) {
              managerId = employee.id;
            }
          });

          if (validate.isSame(answer.chosenEmployee, answer.newManager)) {
            console.log((`-----------------------------`));
            console.log((`Invalid Manager`));
            console.log((`-----------------------------`));
            promptUser();
          } else {
            let sql = `UPDATE employee SET employee.manager_id = ? WHERE employee.id = ?`;

            connection.query(
              sql,
              [managerId, employeeId],
              (error) => {
                if (error) throw error;
                console.log((`-----------------------------`));
                promptUser();
              }
            );
          }
        });
    });
};

// Delete Employees
const removeEmployee = () => {
    let sql =     `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: employeeNamesArray
          }
        ])
        .then((answer) => {
          let employeeId;

          response.forEach((employee) => {
            if (
              answer.chosenEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });

          let sql = `DELETE FROM employee WHERE employee.id = ?`;
          connection.query(sql, [employeeId], (error) => {
            if (error) throw error;
            console.log((`-----------------------------`));
            console.log((`Employee Removed`));
            console.log((`-----------------------------`));
            viewAllCompany();
          });
        });
    });
  };

// Delete a Role
const removeRole = () => {
    let sql = `SELECT role.id, role.title FROM role`;

    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let roleNamesArray = [];
      response.forEach((role) => {roleNamesArray.push(role.title);});

      inquirer
        .prompt([
          {
            name: 'chosenRole',
            type: 'list',
            message: 'Which role would you like to remove?',
            choices: roleNamesArray
          }
        ])
        .then((answer) => {
          let roleId;

          response.forEach((role) => {
            if (answer.chosenRole === role.title) {
              roleId = role.id;
            }
          });

          let sql =   `DELETE FROM role WHERE role.id = ?`;
          connection.promise().query(sql, [roleId], (error) => {
            if (error) throw error;
            console.log((`-----------------------------`));
            console.log((`Role Removed`));
            console.log((`-----------------------------`));
            viewAllRoles();
          });
        });
    });
  };

// Delete the Departments
const removeDepartment = () => {
    let sql =   `SELECT department.id, department.department_name FROM department`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let departmentNamesArray = [];
      response.forEach((department) => {departmentNamesArray.push(department.department_name);});

      inquirer
        .prompt([
          {
            name: 'chosenDept',
            type: 'list',
            message: 'Which department would you like to remove?',
            choices: departmentNamesArray
          }
        ])
        .then((answer) => {
          let departmentId;

          response.forEach((department) => {
            if (answer.chosenDept === department.department_name) {
              departmentId = department.id;
            }
          });

          let sql =     `DELETE FROM department WHERE department.id = ?`;
          connection.promise().query(sql, [departmentId], (error) => {
            if (error) throw error;
            console.log((`-----------------------------`));
            viewAllDepartments();
          });
        });
    });
};
