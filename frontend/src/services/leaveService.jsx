import api from './api';

export const getAll = (params) => api.get('/leave', { params });
export const getStats = () => api.get('/leave/stats');
export const getById = (id) => api.get(`/leave/${id}`);
export const apply = (data) => api.post('/leave/apply', data);
export const approve = (id) => api.put(`/leave/${id}/approve`);
export const reject = (id, reason) => api.put(`/leave/${id}/reject`, { reason });
export const cancel = (id) => api.put(`/leave/${id}/cancel`);
