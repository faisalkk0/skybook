import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skybook_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/')) {
      original._retry = true;
      try {
        const refresh = await api.post('/auth/refresh');
        const token = refresh.data?.data?.accessToken;
        if (token) {
          localStorage.setItem('skybook_token', token);
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch (_err) {
        localStorage.removeItem('skybook_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
