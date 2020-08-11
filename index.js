// npm libraries
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
        // // "View all employees by manager",
        // "Add employee",
        // // // "Remove employee",
        "Update employee role",
        // // // "Update employee manger",
        "View all roles",
        // "Add role",
        // // "Remove role",
        // "Add department",
        // // "Remove department",
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

        // case "Add employee":
        //   addEmployee();
        //   break;

        case "Update employee role":
          updateRole();
          break;

        case "View all roles":
          viewRoles();
          break;

        case "Add role":
          addRole();
          break;

        // case "Add department":
        //   addDepartment();
        // break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

// View options in database
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

// Update information in database
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
          SELECT id
          FROM role
          WHERE title = ?
        `
        connection.query(getRoleIdQuery,[
          results.newRole,
        ],
          (err, data) => {
            if (err) throw err;
            else {
              const setRoleIdQuery = `
                UPDATE employee
                SET employee.role_id = ?
                WHERE employee.first_name = ?
                AND employee.last_name = ?
              `
              connection.query(setRoleIdQuery,[
                data[0].id,
                results.employee.split(" ")[0],
                results.employee.split(" ")[1]
              ],
                (err, data) => {
                  if (err) throw err;
                  startApp();
              })
            }
        })
      })
    })
  })
}

// Add new information to database
// addRole = () => {
//   inquirer
//     .prompt(
//       {
//         name: "name",
//         type: "input",
//         message: "What is the name of the role?"
//       },
//       {
//         name: "salary",
//         type: "input",
//         message: "What is the salary of the role?"
//       },
//       {
//         name: "department",
//         type: "list",
//         message: "Which department does the role belong to?",
//         choices: []
//       }
//     ).then((results) => {
//       const query = "INSERT INTO role (title, salary) VALUES (?, ?)"
//       connection.query(query, [results.name, results.salary], (err, data) => {
//         if (err) throw err;

//       })
//     })
// }

// addEmployee = () => {
//   inquirer
//     .prompt(
//       {
//         name: "firstName",
//         type: "input",
//         message: "What is the employee's first name?"
//       },
//       {
//         name: "lastName",
//         type: "input",
//         message: "What is the employee's last name?"
//       },
//       {
//         name: "role",
//         type: "input",
//         message: "What is the employee's role?"
//       },
//       {
//         name: "department",
//         type: "input",
//         message: "What department does the employee work in?"
//       }
//     ).then(answer => {
//       const query = "INSERT INTO employee SET ?"
//       connection.query(query,
//         {
//           first_name: answer.firstName,
//           last_name: answer.lastName,
//           role_id: answer.role
//         },
//         (err, data) => {
//           if (err) throw err;
//         })
//     })

// }

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