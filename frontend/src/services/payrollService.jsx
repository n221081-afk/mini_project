import api from './api';

export const getAll = (params) => api.get('/payroll', { params });
export const getById = (id) => api.get(`/payroll/${id}`);
export const generate = (month) => api.post('/payroll/generate', { month });
export const downloadPayslip = (id) =>
  api.get(`/payroll/${id}/download-payslip`, { responseType: 'blob' });
