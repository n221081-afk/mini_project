import api from './api';

export const clockIn = () => api.post('/attendance/clock-in');
export const clockOut = () => api.post('/attendance/clock-out');
export const getByEmployee = (employeeId) =>
  api.get(`/attendance/employee/${employeeId || ''}`);
export const getMonthlyReport = (month) =>
  api.get('/attendance/monthly-report', { params: { month } });
