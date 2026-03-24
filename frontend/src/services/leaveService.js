import api from './api';

export const getAll = (params) => api.get('/leaves', { params });
export const getStats = () => api.get('/leaves/stats');
export const getById = (id) => api.get(`/leaves/${id}`);
export const apply = (data) => api.post('/leaves/apply', data);
export const approve = (id) => api.put(`/leaves/${id}/approve`);
export const reject = (id, reason) => api.put(`/leaves/${id}/reject`, { reason });
export const cancel = (id) => api.put(`/leaves/${id}/cancel`);
