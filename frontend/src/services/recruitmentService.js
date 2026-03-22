import api from './api';

export const getAll = () => api.get('/recruitment');
export const getById = (id) => api.get(`/recruitment/${id}`);
export const create = (data) => api.post('/recruitment', data);
export const update = (id, data) => api.put(`/recruitment/${id}`, data);
export const updateStage = (id, stage) =>
  api.put(`/recruitment/${id}/stage`, { stage });
export const remove = (id) => api.delete(`/recruitment/${id}`);
