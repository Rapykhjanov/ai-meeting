import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const meetingsAPI = {
  getAll: (params) => API.get('/meetings/', { params }),
  getOne: (id) => API.get(`/meetings/${id}/`),
  updateAnalysis: (id, data) => API.patch(`/meetings/${id}/update_analysis/`, data),
};

export const actionItemsAPI = {
  getAll: (params) => API.get('/action-items/', { params }),
  updateStatus: (id, status) => API.patch(`/action-items/${id}/update_status/`, { status }),
};

export default API;