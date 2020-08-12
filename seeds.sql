INSERT INTO department (name) VALUES ('Engineering');
INSERT INTO department (name) VALUES ('Sales');
INSERT INTO department (name) VALUES ('Finance');
INSERT INTO department (name) VALUES ('Legal');

INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Software Engineer', 100000, 1);
INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Lead Engineer', 140000, 1);
INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Salesperson', 85000, 2);
INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Sales Lead', 95000, 2);
INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Accountant', 120000, 3);
INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Accountant Manager', 150000, 3);
INSERT INTO employee_db.role (title, salary, department_id) VALUES ('Lawyer', 180000, 4);

INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Smith', 1, 2);
INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('Andrew', 'McDonald', 2, null);
INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('Melinda', 'Croft', 3, 4);
INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('Sarah', 'Kim', 4, null);
INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('Lisa', 'Gowan', 5, 6);
INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('Alexia', 'Chan', 6, null);
INSERT INTO employee_db.employee (first_name, last_name, role_id, manager_id) VALUES ('Kevin', 'Brown', 7, null);