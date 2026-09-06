import api from './api';

export const flightService = {
  search: (params) => api.get('/flights/search', { params }),
  getById: (id) => api.get(`/flights/${id}`),
  getSeats: (id) => api.get(`/flights/${id}/seats`),
  quote: (id, payload) => api.post(`/flights/${id}/quote`, payload),
  searchAirports: (q) => api.get('/airports/search', { params: { q } }),
  featuredAirlines: () => api.get('/airlines/public'),
};
