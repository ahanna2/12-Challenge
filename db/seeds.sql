INSERT INTO department(department_name)
VALUES("Engineering"), 
("Sales"), 
("Finance"), 
("Legal"), 
("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 80000, 1), 
("Senior Engineer", 100000, 1), 
("chief financial officer", 200000, 3), 
("Chief Counsel", 240000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Waleed', 'Russell', 1, 2), 
('Zeeshan', 'Curran', 1, null), 
('Seb', 'Savage', 1, 2), 
('Becky', 'North', 2, 2), 
('Mai', 'Jones', 4, null);

