import api from './api';

export const getAll = () => api.get('/departments').then(res => res.data.data);
export const getById = (id) => api.get(`/departments/${id}`).then(res => res.data.data);
export const getWithEmployees = (id) => api.get(`/departments/${id}/employees`).then(res => res.data.data);
export const create = (data) => api.post('/departments', data).then(res => res.data.data);
export const update = (id, data) => api.put(`/departments/${id}`, data).then(res => res.data.data);
export const remove = (id) => api.delete(`/departments/${id}`).then(res => res.data.data);
