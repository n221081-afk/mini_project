import api from './api';

export const getAll = (params) => api.get('/employees', { params }).then(res => res.data.data);
export const getById = (id) => api.get(`/employees/${id}`).then(res => res.data.data);
export const getProfile = () => api.get('/employees/profile').then(res => res.data.data);
export const create = (data, file) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v != null && v !== '') formData.append(k, v);
  });
  if (file) formData.append('profile_photo', file);
  return api.post('/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data.data);
};
export const update = (id, data, file) => {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v != null && v !== '') formData.append(k, v);
  });
  if (file) formData.append('profile_photo', file);
  return api.put(`/employees/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data.data);
};
export const remove = (id) => api.delete(`/employees/${id}`).then(res => res.data.data);
