# EnterpriseHR - Human Resource Management System

EnterpriseHR is a modern, responsive, and fully-featured Human Resource Management System (HRMS) built with a **React (Vite) + TailwindCSS** frontend and a robust **Node.js, Express, and MongoDB** backend.

## ✨ Features

- **Dashboard & Analytics:** Comprehensive statistical overview using `Chart.js`, highlighting employee distributions, attendance tracking, and monthly payroll costs. Fallbacks gracefully route to dummy values if the database has not been populated.
- **Dark/Light Theme:** Built-in seamless theme switching perfectly unified across Sidebars, Dashboard Cards, Modals, and all components via Tailwind Dark classes natively injected with minimal DOM repaints.
- **Leave Management Workflow:**
  - Modern interactive Leave Calendar dynamically color-codes Approved (Green), Pending (Yellow), and Rejected (Red) dates.
  - Quick Appy modal available right off the employee dashboard.
  - Admin inline "Approve/Reject" feature for rapid, refresh-less leave processing.
- **Automated Email Notifications:** NodeMailer handles HR query dispatches, Support contacts via the newly designed frontend "Contact HR" modal, and automated alerts for leave stage updates.
- **Role-Based Access Control:** Secure routing differentiating `employee`, `hr`, and `admin` routes.
- **Performance Optimized:** Component routes strictly lazy-loaded utilizing `React.Suspense` for virtually instantaneous initial load times. Zero Webpack/Vite chunking warnings natively out-of-the-box.

## 🚀 Technology Stack

### Frontend
- **Framework:** React 18, React Router v6, Vite.js
- **Styling:** TailwindCSS (Complete Dark Mode Utility mapping without hardcoded overrides)
- **State/Notifications:** React Hot Toast
- **Charting:** Chart.js with react-chartjs-2
- **Components:** React-Calendar

### Backend
- **Framework:** Node.js, Express.js
- **Database:** MongoDB via Mongoose
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Services:** NodeMailer (SMTP Email dispatching), Multer (File uploads for profile pictures), PDFKit (for processing payroll PDFs).

---

## 💻 Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16.x or newer)
- npm or yarn

### 2. Backend Configuration
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory ensuring the following variables are present:
   ```env
   PORT=5000
   CORS_ORIGIN=http://localhost:3000
   MONGO_URI=mongodb+srv://<your-cluster-url>
   JWT_SECRET=your_jwt_secret_key
   
   # SMTP Emailing Config
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   EMAIL_FROM="EnterpriseHR <your_email@gmail.com>"
   COMPANY_NAME=EnterpriseHR
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🛠 Project Structure

- `frontend/src/`
  - `/components` - Reusable UI widgets (Navbar, Sidebar, Tables, Modals, Charts).
  - `/pages` - Core feature routes (Dashboard, Employees Directory, Settings, etc.).
  - `/services` - Axios wrappers talking to backend APIs.
- `backend/`
  - `/controllers` - Logic for resolving routes (Leave, Employee, Auth).
  - `/models` - MongoDB schema architecture templates.
  - `/routes` - Express endpoint structures.
  - `/utils` - Mail templates, generator services. 

## ✉️ Support
If you encounter any issues while setting up SMTP or migrating MongoDB, inspect the console logs to see explicit fallback behaviors natively baked into the catch parameters.