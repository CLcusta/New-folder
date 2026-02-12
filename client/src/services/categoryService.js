import api from './api';

export const categoryService = {
  // Get all categories
  getAll: async (activeOnly = true) => {
    const params = activeOnly ? '?active=true' : '';
    const response = await api.get(`/categories${params}`);
    return response.data;
  },

  // Get category by ID or slug
  getById: async (identifier) => {
    const response = await api.get(`/categories/${identifier}`);
    return response.data;
  },

  // Admin: Create category
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Update category
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Delete category
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
