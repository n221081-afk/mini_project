import api from './api';

export const getAll = () => api.get('/departments');
export const getById = (id) => api.get(`/departments/${id}`);
export const getWithEmployees = (id) => api.get(`/departments/${id}/employees`);
export const create = (data) => api.post('/departments', data);
export const update = (id, data) => api.put(`/departments/${id}`, data);
export const remove = (id) => api.delete(`/departments/${id}`);
