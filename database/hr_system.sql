-- HR Management System schema and sample data
-- Generated: 2026-03-13

DROP DATABASE IF EXISTS hr_system;
CREATE DATABASE hr_system;
USE hr_system;

-- --------------------------------------------------
-- Departments
-- --------------------------------------------------
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(16) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (code,name) VALUES
  ('HR','Human Resources'),
  ('ENG','Engineering'),
  ('FIN','Finance'),
  ('SALES','Sales'),
  ('OPS','Operations');

-- --------------------------------------------------
-- Employees
-- --------------------------------------------------
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(64) NOT NULL,
  last_name VARCHAR(64) NOT NULL,
  email VARCHAR(128) NOT NULL UNIQUE,
  hire_date DATE NOT NULL,
  department_id INT NOT NULL,
  manager_id INT NULL,
  status ENUM('active','on_leave','terminated') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 30 sample employees
INSERT INTO employees (first_name,last_name,email,hire_date,department_id,manager_id) VALUES
  ('Alex','Smith','alex.smith1@example.com','2023-01-05',1,NULL),
  ('Jamie','Johnson','jamie.johnson2@example.com','2023-01-12',2,1),
  ('Taylor','Williams','taylor.williams3@example.com','2023-01-19',3,1),
  ('Jordan','Brown','jordan.brown4@example.com','2023-01-26',4,1),
  ('Morgan','Jones','morgan.jones5@example.com','2023-02-02',5,1),
  ('Casey','Garcia','casey.garcia6@example.com','2023-02-09',1,2),
  ('Skyler','Miller','skyler.miller7@example.com','2023-02-16',2,2),
  ('Riley','Davis','riley.davis8@example.com','2023-02-23',3,2),
  ('Cameron','Rodriguez','cameron.rodriguez9@example.com','2023-03-02',4,2),
  ('Quinn','Martinez','quinn.martinez10@example.com','2023-03-09',5,2),
  ('Avery','Hernandez','avery.hernandez11@example.com','2023-03-16',1,3),
  ('Peyton','Lopez','peyton.lopez12@example.com','2023-03-23',2,3),
  ('Dakota','Gonzalez','dakota.gonzalez13@example.com','2023-03-30',3,3),
  ('Reese','Wilson','reese.wilson14@example.com','2023-04-06',4,3),
  ('Kendall','Anderson','kendall.anderson15@example.com','2023-04-13',5,3),
  ('Harper','Thomas','harper.thomas16@example.com','2023-04-20',1,4),
  ('Logan','Taylor','logan.taylor17@example.com','2023-04-27',2,4),
  ('Charlie','Moore','charlie.moore18@example.com','2023-05-04',3,4),
  ('Emerson','Jackson','emerson.jackson19@example.com','2023-05-11',4,4),
  ('Rowan','Martin','rowan.martin20@example.com','2023-05-18',5,4),
  ('Sawyer','Lee','sawyer.lee21@example.com','2023-05-25',1,5),
  ('Finley','Perez','finley.perez22@example.com','2023-06-01',2,5),
  ('Marley','Thompson','marley.thompson23@example.com','2023-06-08',3,5),
  ('Reagan','White','reagan.white24@example.com','2023-06-15',4,5),
  ('Sidney','Harris','sidney.harris25@example.com','2023-06-22',5,5),
  ('Tanner','Sanchez','tanner.sanchez26@example.com','2023-06-29',1,1),
  ('Drew','Clark','drew.clark27@example.com','2023-07-06',2,1),
  ('Blake','Ramirez','blake.ramirez28@example.com','2023-07-13',3,1),
  ('Robin','Lewis','robin.lewis29@example.com','2023-07-20',4,1),
  ('Spencer','Robinson','spencer.robinson30@example.com','2023-07-27',5,1);

-- --------------------------------------------------
-- Users (login accounts)
-- --------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(128) NOT NULL,
  role ENUM('admin','hr','manager','employee') NOT NULL DEFAULT 'employee',
  employee_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

INSERT INTO users (username,password,role,employee_id) VALUES
  ('admin','password123','admin',1),
  ('hr_user','password123','hr',2),
  ('manager1','password123','manager',3),
  ('manager2','password123','manager',4),
  ('manager3','password123','manager',5);

-- Additional employee logins
INSERT INTO users (username,password,role,employee_id)
SELECT CONCAT('user',id), 'password123', 'employee', id
FROM employees
WHERE id > 5;

-- --------------------------------------------------
-- Attendance
-- --------------------------------------------------
CREATE TABLE attendance (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present','absent','sick','leave') NOT NULL DEFAULT 'present',
  check_in TIME NULL,
  check_out TIME NULL,
  notes VARCHAR(255) NULL,
  UNIQUE KEY ux_employee_date (employee_id,date),
  INDEX idx_attendance_employee_date (employee_id,date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Populate attendance for 3 months (Jan-Mar 2024) using a stored procedure
DELIMITER $$
CREATE PROCEDURE populate_attendance_for_range(
  IN start_date DATE,
  IN end_date DATE
)
BEGIN
  DECLARE cur_date DATE;
  DECLARE emp_id INT;
  SET cur_date = start_date;

  WHILE cur_date <= end_date DO
    -- Only insert on weekdays (Mon-Fri)
    IF DAYOFWEEK(cur_date) BETWEEN 2 AND 6 THEN
      SET emp_id = 1;
      WHILE emp_id <= 30 DO
        INSERT INTO attendance (employee_id,date,status,check_in,check_out,notes)
        VALUES (
          emp_id,
          cur_date,
          ELT(FLOOR(RAND() * 4) + 1, 'present','absent','sick','leave'),
          '09:00:00',
          '17:00:00',
          NULL
        );
        SET emp_id = emp_id + 1;
      END WHILE;
    END IF;
    SET cur_date = DATE_ADD(cur_date, INTERVAL 1 DAY);
  END WHILE;
END$$
DELIMITER ;

CALL populate_attendance_for_range('2024-01-01','2024-03-31');

-- --------------------------------------------------
-- Leave types + leaves
-- --------------------------------------------------
CREATE TABLE leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL,
  max_days_per_year INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leave_types (code,name,max_days_per_year) VALUES
  ('SICK','Sick Leave',10),
  ('VAC','Vacation Leave',20),
  ('PERSONAL','Personal Leave',5),
  ('MAT','Maternity/Paternity Leave',90);

CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewer_id INT NULL,
  notes VARCHAR(255) NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE SET NULL
);

INSERT INTO leaves (employee_id,leave_type_id,start_date,end_date,status,reviewer_id,notes) VALUES
  (6,1,'2024-02-14','2024-02-16','approved',2,'Flu'),
  (12,2,'2024-03-18','2024-03-22','approved',2,'Family vacation'),
  (18,3,'2024-01-25','2024-01-26','approved',4,'Personal appointment');

-- --------------------------------------------------
-- Payroll / Payslips
-- --------------------------------------------------
CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_payroll_year_month (year,month)
);

CREATE TABLE payslips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payroll_id INT NOT NULL,
  employee_id INT NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payroll_id) REFERENCES payroll(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY ux_payslip_payroll_employee (payroll_id,employee_id)
);

INSERT INTO payroll (year,month) VALUES
  (2024,1),
  (2024,2),
  (2024,3);

-- Generate payslips for all employees in each payroll period
DELIMITER $$
CREATE PROCEDURE populate_payslips()
BEGIN
  DECLARE pid INT;
  DECLARE emp INT;
  DECLARE gross DECIMAL(10,2);
  DECLARE tax DECIMAL(10,2);
  DECLARE net DECIMAL(10,2);
  SET pid = 1;
  WHILE pid <= 3 DO
    SET emp = 1;
    WHILE emp <= 30 DO
      SET gross = 4000 + FLOOR(RAND()*4000);
      SET tax = ROUND(gross * 0.20,2);
      SET net = ROUND(gross - tax,2);
      INSERT INTO payslips (payroll_id,employee_id,gross_amount,tax_amount,net_amount)
        VALUES (pid, emp, gross, tax, net);
      SET emp = emp + 1;
    END WHILE;
    SET pid = pid + 1;
  END WHILE;
END$$
DELIMITER ;

CALL populate_payslips();

-- --------------------------------------------------
-- Recruitment
-- --------------------------------------------------
CREATE TABLE recruitment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_title VARCHAR(128) NOT NULL,
  department_id INT NOT NULL,
  open_date DATE NOT NULL,
  close_date DATE NULL,
  status ENUM('open','closed','paused') NOT NULL DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE recruitment_candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruitment_id INT NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL,
  phone VARCHAR(32) NULL,
  status ENUM('applied','screening','interview','offered','rejected') NOT NULL DEFAULT 'applied',
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruitment_id) REFERENCES recruitment(id) ON DELETE CASCADE
);

INSERT INTO recruitment (job_title,department_id,open_date,status) VALUES
  ('Software Engineer',2,'2024-01-01','open'),
  ('HR Specialist',1,'2024-01-01','open'),
  ('Sales Representative',4,'2024-01-01','open'),
  ('Finance Analyst',3,'2024-01-01','open'),
  ('Operations Coordinator',5,'2024-01-01','open');

INSERT INTO recruitment_candidates (recruitment_id,full_name,email,phone,status) VALUES
  (1,'Morgan Lee','morgan.lee@example.com','555-0100','applied'),
  (2,'Jordan Smith','jordan.smith@example.com','555-0101','applied'),
  (3,'Casey Brown','casey.brown@example.com','555-0102','interview'),
  (4,'Taylor Davis','taylor.davis@example.com','555-0103','screening'),
  (5,'Riley Wilson','riley.wilson@example.com','555-0104','offered');

-- --------------------------------------------------
-- Performance reviews
-- --------------------------------------------------
CREATE TABLE performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  review_date DATE NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comments TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE SET NULL
);

INSERT INTO performance_reviews (employee_id,reviewer_id,review_date,score,comments) VALUES
  (1,3,'2024-03-01',5,'Excellent performance'),
  (2,3,'2024-03-01',4,'Strong contribution'),
  (6,4,'2024-03-01',3,'Meets expectations'),
  (12,5,'2024-03-01',4,'Good work ethic'),
  (18,1,'2024-03-01',3,'Consistent results');

-- --------------------------------------------------
-- End of hr_system.sql
-- --------------------------------------------------
