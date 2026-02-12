import api from './api';

export const adminService = {
  // Get dashboard stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Vendor management
  getAllVendors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/vendors?${queryString}`);
    return response;
  },

  updateVendorStatus: async (id, status) => {
    const response = await api.put(`/admin/vendors/${id}/status`, { status });
    return response.data;
  },

  // Product management
  getAllProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/products?${queryString}`);
    return response;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  toggleProductStatus: async (id) => {
    const response = await api.put(`/admin/products/${id}/toggle-active`);
    return response.data;
  },

  // User management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users?${queryString}`);
    return response;
  },

  toggleUserStatus: async (id) => {
    const response = await api.put(`/admin/users/${id}/toggle-active`);
    return response.data;
  },

  // Promotion management
  getAllPromotions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/promotions?${queryString}`);
    return response;
  },
};
