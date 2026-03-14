# EnterpriseHR Frontend

Employee Management and Payroll System - React frontend similar to OrangeHRM.

## Tech Stack

- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Chart.js** - Charts and graphs
- **React Router** - Routing
- **Axios** - API client
- **Vite** - Build tool

## Setup Instructions

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure API (optional)

Create `.env` in the frontend folder to point to your backend:

```env
VITE_API_URL=http://localhost:5001/api
```

If not set, the dev server proxies `/api` to `http://localhost:5001` (see `vite.config.js`).

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Demo login (without backend)

Use these credentials to explore the UI with dummy data:

- **Email:** `admin@enterprisehr.com`
- **Password:** `password123`

### 5. Build for production

```bash
npm run build
```

Output is in `dist/`. Preview with `npm run preview`.

## Backend Integration

The frontend expects the backend to expose these API routes:

- `POST /api/auth/login` - Login
- `GET /api/employees` - List employees (paginated)
- `GET /api/employees/:id` - Get employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/departments` - List departments
- `GET /api/attendance/clock-in`, `POST /api/attendance/clock-out`
- `GET /api/attendance/monthly-report`
- `GET /api/leave`, `POST /api/leave/apply`, etc.
- `GET /api/payroll`, `POST /api/payroll/generate`
- `GET /api/recruitment`, `GET /api/performance`, `GET /api/reports/*`

When the backend is unavailable, the app falls back to dummy data for most pages.

## Features

- **Dashboard** - Stats cards, department distribution, attendance & payroll charts
- **Employees** - Directory, search, filter, add/edit, profile view
- **Departments** - List departments
- **Attendance** - Clock in/out, monthly report, stats
- **Leaves** - Apply leave, approval dashboard, history
- **Payroll** - List, generate, download payslip
- **Recruitment** - Job postings, candidate tracking, stage updates
- **Performance** - Reviews, ratings, goal tracking
- **Reports** - Employee by dept, attendance, leave, payroll summaries; CSV/PDF export
- **Settings** - Profile settings
