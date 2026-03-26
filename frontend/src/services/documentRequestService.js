import api from './api';

export const create = async (data) => {
  return api.post('/document-requests', data);
};

export const getAll = async () => {
  return api.get('/document-requests');
};

export const accept = async (id) => {
  return api.put(`/document-requests/${id}/accept`);
};

export const reject = async (id) => {
  return api.put(`/document-requests/${id}/reject`);
};

export const downloadDocument = async (id) => {
  return api.get(`/document-requests/${id}/download`, { responseType: 'blob' });
};
