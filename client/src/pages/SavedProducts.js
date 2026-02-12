import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/ProductList';
import './SavedProducts.css';

const SavedProducts = () => {
  const { user } = useAuth();
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedProducts();
  }, []);

  const fetchSavedProducts = async () => {
    try {
      setLoading(true);
      if (user && user.savedProducts && user.savedProducts.length > 0) {
        // Fetch details for all saved products
        const productPromises = user.savedProducts.map(id =>
          productService.getById(id).catch(() => null)
        );
        const results = await Promise.all(productPromises);
        const products = results.filter(r => r !== null).map(r => r.product);
        setSavedProducts(products);
      }
    } catch (error) {
      console.error('Failed to fetch saved products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saved-products">
      <div className="container">
        <h1>Saved Products</h1>
        <ProductList
          products={savedProducts}
          loading={loading}
          emptyMessage="You haven't saved any products yet"
        />
      </div>
    </div>
  );
};

export default SavedProducts;
