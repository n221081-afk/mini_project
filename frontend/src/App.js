import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import AddEmployeePage from './pages/AddEmployeePage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import DepartmentsPage from './pages/DepartmentsPage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import PayrollPage from './pages/PayrollPage';
import RecruitmentPage from './pages/RecruitmentPage';
import PerformancePage from './pages/PerformancePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

const normalizeRole = (role) => (role === 'hr_manager' ? 'hr' : role);

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const normalizedRole = normalizeRole(user?.role);
  if (allowedRoles && normalizedRole && !allowedRoles.map(normalizeRole).includes(normalizedRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(180deg, rgba(209, 250, 229, 0.15) 0%, rgba(249, 250, 251, 1) 30%)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateRoute allowedRoles={['admin', 'hr']}>
                <Layout>
                  <EmployeesPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employees/add"
            element={
              <PrivateRoute allowedRoles={['admin', 'hr']}>
                <Layout>
                  <AddEmployeePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <EmployeeProfilePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <PrivateRoute allowedRoles={['admin', 'hr']}>
                <Layout>
                  <DepartmentsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <Layout>
                  <AttendancePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/leave"
            element={
              <PrivateRoute>
                <Layout>
                  <LeavePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <PrivateRoute>
                <Layout>
                  <PayrollPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recruitment"
            element={
              <PrivateRoute allowedRoles={['admin', 'hr']}>
                <Layout>
                  <RecruitmentPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <PrivateRoute allowedRoles={['admin', 'hr']}>
                <Layout>
                  <PerformancePage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute allowedRoles={['admin', 'hr']}>
                <Layout>
                  <ReportsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
