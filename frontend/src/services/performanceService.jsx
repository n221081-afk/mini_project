import api from './api';

export const getAll = (params) => api.get('/performance', { params });
export const getById = (id) => api.get(`/performance/${id}`);
export const create = (data) => api.post('/performance', data);
export const update = (id, data) => api.put(`/performance/${id}`, data);
