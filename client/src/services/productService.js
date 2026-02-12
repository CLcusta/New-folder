import api from './api';

export const productService = {
  // Get all products with filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response;
  },

  // Get single product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (vendor only)
  create: async (productData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product (vendor only)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product (vendor only)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get vendor's products
  getMyProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products/vendor/my-products?${queryString}`);
    return response;
  },

  // Track product click
  trackClick: async (id) => {
    const response = await api.post(`/products/${id}/click`);
    return response.data;
  },

  // Save/unsave product
  toggleSave: async (id) => {
    const response = await api.post(`/products/${id}/save`);
    return response.data;
  },
};
