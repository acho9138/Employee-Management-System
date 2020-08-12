// Node libraries
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Connection to MySQL
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_db"
});

// Start connection
connection.connect(err => {
  if (err) throw err;
  startApp();
});

// Start app with initial question
startApp = () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all employees by department",
        "Add employee",
        "Update employee role",
        "View all roles",
        "Add role",
        "Add department",
        "Exit"
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case "View all employees":
          viewEmployees();
          break;

        case "View all employees by department":
          viewEmployeeByDepartment();
          break;

        case "Add employee":
          addEmployee();
          break;

        case "Update employee role":
          updateRole();
          break;

        case "View all roles":
          viewRoles();
          break;

        case "Add role":
          addRole();
          break;

        case "Add department":
          addDepartment();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// View all employees
viewEmployees = () => {
  const query = `SELECT e.id, first_name, last_name, title, name AS department, salary, manager_id AS manager 
  FROM employee AS e
  LEFT JOIN role AS r ON e.role_id = r.id
  LEFT JOIN department AS d ON d.id = r.department_id`
  connection.query(query, (err, data) => {
    if (err) throw err;

    console.table(data);
    startApp();
  });
}

// View employees in specific department
viewEmployeeByDepartment = () => {
  renderDepartmentsInDB((departmentArray) => {
    const query = `SELECT first_name, last_name, name AS department, salary 
    FROM employee AS e 
    LEFT JOIN role AS r ON e.role_id = r.id 
    LEFT JOIN department AS d ON d.id = r.department_id 
    WHERE d.name = ?`
    const question = {
      name: "department",
      type: "list",
      message: "Which department would you like to see the employees?",
      choices: departmentArray
    }
    inquirer.prompt(question).then((result) => {
      connection.query(query, [result.department], (err, data) => {
        if (err) throw err;
        console.table(data);
        startApp();
      })
    })
  })
}

// View available roles
viewRoles = () => {
  const query = `SELECT role.id, title, name AS department, salary FROM employee_db.role 
  LEFT JOIN department
  ON department.id = role.department_id`
  connection.query(query, (err, data) => {
    if (err) throw err;

    console.table(data);
    startApp();
  })
}

// Update employee role
updateRole = () => {
  renderEmployeesInDB((employeeArray) => {
    renderRolesInDB((rolesArray) => {
      inquirer.prompt([
        {
          name: "employee",
          type: "list",
          message: "Who's role would you like to update?",
          choices: employeeArray
        },
        {
          name: "newRole",
          type: "list",
          message: "What is the employee's updated role?",
          choices: rolesArray
        }]
      ).then((results) => {
        const getRoleIdQuery = `
          SELECT id FROM role
          WHERE title = ?`
        connection.query(getRoleIdQuery, [results.newRole], (err, data) => {
          if (err) throw err;
          else {
            const setRoleIdQuery = `
                UPDATE employee
                SET employee.role_id = ?
                WHERE employee.first_name = ?
                AND employee.last_name = ?
              `
            connection.query(setRoleIdQuery, [
              data[0].id,
              results.employee.split(" ")[0],
              results.employee.split(" ")[1]
            ],
              (err, data) => {
                if (err) throw err;
                console.log("==== Successfully updated the employee's role ====");
                startApp();
              })
          }
        })
      })
    })
  })
}

// Add new department to database
addDepartment = () => {
  inquirer
    .prompt(
      {
        name: "newDepartment",
        type: "input",
        message: "What is the name of the new department?"
      }
    )
    .then((results) => {
      const query = `INSERT INTO department (name) VALUES (?)`
      connection.query(query, [results.newDepartment], (err, data) => {
        if (err) throw err;
        else {
          console.log("==== Successfully added new department ====");
          startApp();
        }
      })
    })
}

// Add a new role to database
addRole = () => {
  renderDepartmentsInDB((departmentArray) => {
    inquirer
      .prompt([
        {
          name: "roleName",
          type: "input",
          message: "What is the name of the role?"
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary of the role?"
        },
        {
          name: "department",
          type: "list",
          message: "Which department does the role belong to?",
          choices: departmentArray
        }
      ]).then((results) => {
        const getDepartmentIdQuery = `
          SELECT id FROM department
          WHERE name = ?`
        connection.query(getDepartmentIdQuery, [results.department], (err, data) => {
          if (err) throw err;
          else {
            const query = `
              INSERT INTO role (title, salary, department_id) 
              VALUES (?, ?, ?)`
            connection.query(query, [results.roleName, results.salary, data[0].id], (err, data) => {
              if (err) throw err;
              console.log("==== Successfully added a new role ====");
              startApp();
            })
          }
        })
      })
  })
}

// Add new employee to database
addEmployee = () => {
  renderRolesInDB((rolesArray) => {
    renderEmployeesInDB((employeeArray) => {
      employeeArray.push("None");
      inquirer
        .prompt([
          {
            name: "firstName",
            type: "input",
            message: "What is the employee's first name?"
          },
          {
            name: "lastName",
            type: "input",
            message: "What is the employee's last name?"
          },
          {
            name: "role",
            type: "list",
            message: "What is the employee's role?",
            choices: rolesArray
          },
          {
            name: "manager",
            type: "list",
            message: "Who is the employee's manager?",
            choices: employeeArray
          }
        ]).then(results => {
          const getRoleIdQuery = `
            SELECT id FROM role
            WHERE title = ?`
          connection.query(getRoleIdQuery, [results.role], (err, data1) => {
            if (err) throw err;
            else {
              if (results.manager !== "None") {
                const getManagerIdQuery = `
                  SELECT e.id FROM employee AS e
                  WHERE e.first_name = ?
                  AND e.last_name = ?`
                connection.query(getManagerIdQuery,
                  [
                    results.manager.split(" ")[0],
                    results.manager.split(" ")[1]
                  ],
                  (err, data2) => {
                    if (err) throw err;
                    console.log(results.firstName)
                    console.log(results.lastName)
                    const query = `
                      INSERT INTO employee
                      SET ?`
                    connection.query(query,
                      {
                        first_name: results.firstName,
                        last_name: results.lastName,
                        role_id: data1[0].id,
                        manager_id: data2[0].id
                      },
                      (err, data) => {
                        if (err) throw err;
                        console.log("==== Successfully added new employee ====");
                        startApp();
                      })
                  }
                )
              } else if (results.manager === "None") {
                const query = `
                  INSERT INTO employee
                  SET ?`
                connection.query(query,
                  {
                    first_name: results.firstName,
                    last_name: results.lastName,
                    role_id: data1[0].id
                  },
                  (err, data) => {
                    if (err) throw err;
                    console.log("==== Successfully added new employee ====");
                    startApp();
                  })
              }

            }
          })
        })
    })
  })
}

// Render information from database to generate options for questions
renderDepartmentsInDB = (callback) => {
  const query = "SELECT name FROM department"
  connection.query(query, (err, data) => {
    if (err) throw err;
    let departmentArray = [];
    for (let i = 0; i < data.length; i++) {
      departmentArray.push(data[i].name);
    }
    callback(departmentArray);
  })
}

renderEmployeesInDB = (callback) => {
  const query = "SELECT first_name, last_name FROM employee"
  connection.query(query, (err, data) => {
    if (err) throw err;
    let employeeArray = [];
    for (let i = 0; i < data.length; i++) {
      let firstName = data[i].first_name;
      let lastName = data[i].last_name;
      let name = `${firstName} ${lastName}`
      employeeArray.push(name);
    }
    callback(employeeArray);
  })
}

renderRolesInDB = (callback) => {
  const query = "SELECT title FROM role"
  connection.query(query, (err, data) => {
    if (err) throw err;
    let rolesArray = [];
    for (let i = 0; i < data.length; i++) {
      rolesArray.push(data[i].title);
    }
    callback(rolesArray);
  })
}