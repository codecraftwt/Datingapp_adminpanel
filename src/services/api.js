import axios from 'axios';

const getAdminApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return `http://${hostname}:5000/api/admin`;
    }
  }
  return 'https://datingapp-backend-api.vercel.app/api/admin';
};

const api = axios.create({
  baseURL: getAdminApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginAdmin = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const fetchAdminUsers = async () => {
  const response = await api.get(`/users?all=true&t=${Date.now()}`);
  return response.data;
};

export const fetchAdminReports = async () => {
  const response = await api.get(`/reports?t=${Date.now()}`);
  return response.data;
};

export const updateReportStatus = async (reportId, status) => {
  const response = await api.put(`/reports/${reportId}`, { status });
  return response.data;
};

export const warnUser = async (warningData) => {
  const response = await api.post('/warn-user', warningData);
  return response.data;
};

export const updateUserStatus = async (userId, isActive, reason = '') => {
  const response = await api.put(`/users/${userId}/status`, { isActive, reason });
  return response.data;
};

// --- Dynamic Subscription Plans APIs ---
export const fetchPlans = async (isActive) => {
  const query = isActive !== undefined ? `?isActive=${isActive}&t=${Date.now()}` : `?t=${Date.now()}`;
  const response = await api.get(`/plans${query}`);
  return response.data;
};

export const createPlan = async (planData) => {
  const response = await api.post('/plans', planData);
  return response.data;
};

export const updatePlan = async (id, planData) => {
  const response = await api.put(`/plans/${id}`, planData);
  return response.data;
};

export const deletePlan = async (id, permanent = false) => {
  const response = await api.delete(`/plans/${id}${permanent ? '?permanent=true' : ''}`);
  return response.data;
};

// --- Dynamic Feature Catalog APIs ---
export const fetchFeatures = async () => {
  const response = await api.get(`/features?t=${Date.now()}`);
  return response.data;
};

export const createFeature = async (featureData) => {
  const response = await api.post('/features', featureData);
  return response.data;
};

export const updateFeature = async (id, featureData) => {
  const response = await api.put(`/features/${id}`, featureData);
  return response.data;
};

export const deleteFeature = async (id, permanent = false) => {
  const response = await api.delete(`/features/${id}${permanent ? '?permanent=true' : ''}`);
  return response.data;
};

// --- User Subscription Detail API ---
export const fetchUserSubscription = async (userId) => {
  const response = await api.get(`/users/${userId}/subscription?t=${Date.now()}`);
  return response.data;
};

export default api;

