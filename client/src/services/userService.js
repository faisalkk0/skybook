import api from './api';

export const userService = {
  updateProfile: (payload) => api.patch('/users/me', payload),
  changePassword: (payload) => api.patch('/users/me/password', payload),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
