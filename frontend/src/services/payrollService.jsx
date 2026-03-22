import api from './api';

export const getAll = (params) => api.get('/payroll', { params }).then(res => res.data.data);
export const getById = (id) => api.get(`/payroll/${id}`).then(res => res.data.data);
export const generate = (month) => api.post('/payroll/generate', { month }).then(res => res.data.data);
export const downloadPayslip = (id) =>
  api.get(`/payroll/${id}/download-payslip`, { responseType: 'blob' });
