import api from './api';

export const vendorService = {
  // Get all vendors
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/vendors?${queryString}`);
    return response;
  },

  // Get vendor by ID (public view)
  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Get vendor profile (own)
  getProfile: async () => {
    const response = await api.get('/vendors/profile/me');
    return response.data;
  },

  // Update vendor profile
  updateProfile: async (profileData) => {
    const response = await api.post('/vendors/profile', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get vendor analytics
  getAnalytics: async () => {
    const response = await api.get('/vendors/analytics/me');
    return response.data;
  },
};
