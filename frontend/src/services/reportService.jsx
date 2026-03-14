import api from './api';

export const employeesByDepartment = () =>
  api.get('/reports/employees-by-department');
export const monthlyAttendance = (month) =>
  api.get('/reports/monthly-attendance', { params: { month } });
export const leaveReport = (params) =>
  api.get('/reports/leave-report', { params });
export const payrollSummary = (month) =>
  api.get('/reports/payroll-summary', { params: { month } });
export const exportCSV = (type, params) =>
  api.get('/reports/export', { params: { type, ...params }, responseType: 'blob' });
