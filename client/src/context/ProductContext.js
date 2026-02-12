import React, { createContext, useContext, useState } from 'react';
import { productService } from '../services/productService';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    search: '',
    promoted: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const fetchProducts = async (queryParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAll({ ...filters, ...queryParams });
      setProducts(data.data);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (searchTerm) => {
    setFilters({ ...filters, search: searchTerm });
    await fetchProducts({ search: searchTerm, page: 1 });
  };

  const filterProducts = async (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    await fetchProducts({ ...newFilters, page: 1 });
  };

  const clearFilters = async () => {
    const defaultFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      search: '',
      promoted: false,
    };
    setFilters(defaultFilters);
    await fetchProducts(defaultFilters);
  };

  const value = {
    products,
    loading,
    error,
    filters,
    pagination,
    fetchProducts,
    searchProducts,
    filterProducts,
    clearFilters,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
