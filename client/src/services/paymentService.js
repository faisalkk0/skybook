import api from './api';

export const paymentService = {
  config: () => api.get('/payments/config'),
  createIntent: (bookingId) => api.post(`/payments/${bookingId}/intent`),
  confirm: (bookingId, payload) => api.post(`/payments/${bookingId}/confirm`, payload),
};
