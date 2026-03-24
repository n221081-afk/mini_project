# EnterpriseHR – Setup Instructions

## Prerequisites

- **Node.js** (v16 or later)
- **MongoDB** (local or Atlas) – backend uses MongoDB
- **npm** (comes with Node.js)

## Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   - Copy `backend/.env.example` to `backend/.env` if you need to change defaults.
   - Default `.env` already has:
     - `PORT=5000`
     - `CORS_ORIGIN=http://localhost:3000`
     - `MONGO_URI=mongodb://localhost:27017/enterprisehr`
     - `JWT_SECRET=enterprisehr_secret`
   - For **MongoDB Atlas**, set `MONGO_URI` to your connection string.

4. **Start MongoDB** (if local)
   - Ensure MongoDB is running on `localhost:27017`, or update `MONGO_URI` in `.env`.

5. **Seed the database** (optional, for demo data and admin user)
   ```bash
   npm run seed
   ```
   This creates an admin user: **admin@enterprisehr.com** / **password123**.

6. **Run the backend**
   ```bash
   npm run dev
   ```
   API will be available at **http://localhost:5000**.

   - Health: `GET http://localhost:5000/api/health`
   - Login: `POST http://localhost:5000/api/auth/login` with body `{ "email", "password" }`

---

## Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   - `frontend/.env` is already set with:
     - `VITE_API_URL=http://localhost:5000/api`
   - If your API runs on another host/port, update this.

4. **Run the frontend**
   ```bash
   npm start
   ```
   Or: `npm run dev`

   App will open at **http://localhost:3000**.

---

## Running the Full Stack

1. **Terminal 1 – Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Terminal 2 – Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Login**
   - Open http://localhost:3000
   - Use **admin@enterprisehr.com** / **password123** (after running seed)
   - Or use the demo fallback on the login page if the API is unreachable.

---

## API Base URL

- All frontend API calls use: **http://localhost:5000/api**
- Configured in `frontend/src/services/api.js` via `VITE_API_URL`.
- JWT is sent in the `Authorization: Bearer <token>` header by the Axios interceptor.

---

## Role-Based Access

- **Admin** – Full access to all modules.
- **HR Manager** – Employees, Departments, Attendance, Leave, Payroll, Recruitment, Performance, Reports.
- **Employee** – Dashboard, Attendance, Leave, Payroll (own), Settings.

Sidebar and routes are restricted by role; unauthorized routes redirect to the dashboard.
