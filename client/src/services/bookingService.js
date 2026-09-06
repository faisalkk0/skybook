import api from './api';

export const bookingService = {
  create: (payload) => api.post('/bookings', payload),
  list: () => api.get('/bookings'),
  get: (id) => api.get(`/bookings/${id}`),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  dashboard: () => api.get('/bookings/dashboard'),
  emailTicket: (id) => api.post(`/bookings/${id}/email-ticket`),
  ticketUrl: (id) => `${api.defaults.baseURL}/bookings/${id}/ticket`,
};

export async function downloadTicket(id) {
  const response = await api.get(`/bookings/${id}/ticket`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `skybook-ticket.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
}
