const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_db"
});

connection.connect(err => {
  if (err) throw err;
  startApp();
});

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
        // "Update employee role",
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

        // case "Update employee role":
        //   updateRole();
        //   break;

        case "View all roles":
          viewRoles();
          break;

        // case "Add role":
        //   addRole();
        //   break;

        // case "Add department":
        //   addDepartment();
        // break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

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
  const query = `SELECT first_name, last_name, name AS department, salary 
  FROM employee AS e 
  LEFT JOIN role AS r ON e.role_id = r.id 
  LEFT JOIN department AS d ON d.id = r.department_id 
  ORDER BY department`
  connection.query(query, (err, data) => {
    if (err) throw err;

    console.table(data);
    startApp();
  })
}

viewRoles = () => {
  const query = "SELECT id, title, salary FROM employee_db.role"
  connection.query(query, (err, data) => {
    if (err) throw err;

    console.table(data);
    startApp();
  })
}