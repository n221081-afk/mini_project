import { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import { Toaster } from 'react-hot-toast';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const AddEmployeePage = lazy(() => import('./pages/AddEmployeePage'));
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage'));
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const LeavePage = lazy(() => import('./pages/LeavePage'));
const PayrollPage = lazy(() => import('./pages/PayrollPage'));
const RecruitmentPage = lazy(() => import('./pages/RecruitmentPage'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DocumentRequestsPage = lazy(() => import('./pages/DocumentRequestsPage'));

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>}>
              {children}
            </Suspense>
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
        <LanguageProvider>
          <Routes>
          <Route path="/login" element={<Suspense fallback={<div>Loading...</div>}><LoginPage /></Suspense>} />
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
          <Route
            path="/document-requests"
            element={
              <PrivateRoute>
                <Layout>
                  <DocumentRequestsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
