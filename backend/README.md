# EnterpriseHR - Backend

Employee Management and Payroll System - Node.js + Express + MongoDB

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` - MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/enterprise_hr`)
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Server port (default: 5000)

For MongoDB Atlas (cloud), use:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/enterprise_hr?retryWrites=true&w=majority
```

### 3. Seed Dummy Data

```bash
npm run seed
```

Creates: 30 employees, 5 departments, 3 months attendance, 2 months payroll, sample leaves, recruitment candidates, performance reviews.

**Login credentials:** admin@enterprisehr.com / hr@enterprisehr.com / emp1@enterprisehr.com - password: `password123`

### 4. Start Server

```bash
npm start
```

API runs on http://localhost:5000 (or PORT from .env)

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Employees
- `GET /api/employees` - List (pagination, search, filter)
- `GET /api/employees/profile` - Current user's profile
- `GET /api/employees/:id` - Get by ID
- `POST /api/employees` - Create (Admin/HR)
- `PUT /api/employees/:id` - Update (Admin/HR)
- `DELETE /api/employees/:id` - Delete (Admin)

### Departments
- `GET /api/departments` - List all
- `GET /api/departments/:id` - Get by ID
- `GET /api/departments/:id/employees` - Get with employees
- `POST /api/departments` - Create (Admin/HR)
- `PUT /api/departments/:id` - Update (Admin/HR)
- `DELETE /api/departments/:id` - Delete (Admin)

### Attendance
- `POST /api/attendance/clock-in` - Clock in
- `POST /api/attendance/clock-out` - Clock out
- `GET /api/attendance/employee/:employeeId?` - Get records
- `GET /api/attendance/monthly-report` - Monthly report (Admin/HR)
- `POST /api/attendance/admin-correction` - Admin correction (Admin/HR)

### Leaves
- `GET /api/leaves` - List (filtered by role)
- `GET /api/leaves/stats` - Leave statistics (Admin/HR)
- `GET /api/leaves/:id` - Get by ID
- `POST /api/leaves/apply` - Apply leave
- `PUT /api/leaves/:id/approve` - Approve (Admin/HR)
- `PUT /api/leaves/:id/reject` - Reject (Admin/HR)
- `PUT /api/leaves/:id/cancel` - Cancel

### Payroll
- `GET /api/payroll` - List (filtered by role)
- `GET /api/payroll/:id` - Get by ID
- `GET /api/payroll/:id/download-payslip` - Download PDF
- `POST /api/payroll/generate` - Generate monthly payroll (Admin/HR)

### Recruitment
- `GET /api/recruitment` - List candidates (Admin/HR)
- `GET /api/recruitment/:id` - Get by ID
- `POST /api/recruitment` - Create (Admin/HR)
- `PUT /api/recruitment/:id` - Update
- `PUT /api/recruitment/:id/stage` - Update stage
- `DELETE /api/recruitment/:id` - Delete

### Performance
- `GET /api/performance` - List reviews
- `GET /api/performance/:id` - Get by ID
- `POST /api/performance` - Create (Admin/HR)
- `PUT /api/performance/:id` - Update (Admin/HR)

### Reports
- `GET /api/reports/employees-by-department` - Employee count by dept
- `GET /api/reports/monthly-attendance` - Monthly attendance
- `GET /api/reports/leave-report` - Leave report
- `GET /api/reports/payroll-summary` - Payroll summary
- `GET /api/reports/export?report_type=...` - Export CSV

## Authentication

Include JWT in header: `Authorization: Bearer <token>`

Roles: `admin`, `hr_manager`, `employee`
