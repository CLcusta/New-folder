import React, { useState, useEffect } from 'react';
import { vendorService } from '../services/vendorService';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductList from '../components/ProductList';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    tags: '',
    images: [], // For file objects
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [vendorRes, productsRes, analyticsRes, categoriesRes] = await Promise.all([
        vendorService.getProfile(),
        productService.getMyProducts(),
        vendorService.getAnalytics(),
        categoryService.getAll(),
      ]);

      setVendor(vendorRes.vendor);
      setProducts(productsRes.data || []);
      setAnalytics(analyticsRes.analytics);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append regular fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
             formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append images
      if (formData.images && formData.images.length > 0) {
          for (let i = 0; i < formData.images.length; i++) {
              formDataToSend.append('images', formData.images[i]);
          }
      }

      if (editingProduct) {
        await productService.update(editingProduct._id, formDataToSend);
      } else {
        await productService.create(formDataToSend);
      }

      setShowProductForm(false);
      setEditingProduct(null);
      // Reset with empty strings to avoid uncontrolled inputs warn
      setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          stock: '',
          tags: '',
          images: []
      });
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert('Failed to save product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        fetchDashboardData();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category?._id || '',
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
    });
    setShowProductForm(true);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="vendor-dashboard">
      <div className="container">
        <h1>Vendor Dashboard</h1>

        {vendor?.status === 'pending' && (
          <div className="alert alert-warning">
            Your vendor account is pending approval. You'll be able to add products once approved.
          </div>
        )}

        {vendor?.status === 'blocked' && (
          <div className="alert alert-danger">
            Your vendor account has been blocked. Please contact support.
          </div>
        )}

        <div className="dashboard-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && analytics && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{analytics.products.total}</h3>
                  <p>Total Products</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics.products.active}</h3>
                  <p>Active Products</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics.vendor.profileViews}</h3>
                  <p>Profile Views</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics.products.totalViews}</h3>
                  <p>Product Views</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics.products.totalClicks}</h3>
                  <p>Total Clicks</p>
                </div>
                <div className="stat-card">
                  <h3>{analytics.products.totalSaves}</h3>
                  <p>Product Saves</p>
                </div>
              </div>

              <div className="recent-products">
                <h2>Recent Products</h2>
                <ProductList products={products.slice(0, 6)} loading={false} showVendor={false} />
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-tab">
              <div className="products-header">
                <h2>My Products</h2>
                <button
                  onClick={() => {
                    setShowProductForm(true);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      stock: '',
                      tags: '',
                      images: []
                    });
                  }}
                  className="btn btn-primary"
                  disabled={vendor?.status !== 'approved'}
                >
                  + Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="product-form-modal">
                  <div className="modal-content">
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleProductSubmit}>
                      <div className="form-group">
                        <label>Product Name</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={formData.category || ''}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        >
                          <option value="">Select a Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          rows="4"
                        />
                      </div>

                      <div className="form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="form-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={formData.stock || ''}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          min="0"
                        />
                      </div>

                      <div className="form-group">
                          <label>Images</label>
                          <input 
                            type="file" 
                            multiple
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, images: e.target.files})}
                          />
                      </div>

                      <div className="form-group">
                        <label>Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={formData.tags || ''}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="electronics, smartphone, sale"
                        />
                      </div>

                      <div className="form-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          min="0"
                        />
                      </div>

                      <div className="form-group">
                        <label>Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="electronics, smartphone, sale"
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          {editingProduct ? 'Update' : 'Create'} Product
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                          }}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="products-table">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>
                          <div className="product-cell">
                            <img src={product.images[0]?.url} alt={product.name} />
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td>${product.price}</td>
                        <td>{product.stock}</td>
                        <td>
                          <span className={`status-badge ${product.availability}`}>
                            {product.availability}
                          </span>
                        </td>
                        <td>{product.analytics.views}</td>
                        <td>
                          <button onClick={() => handleEditProduct(product)} className="btn-icon">
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="btn-icon">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="analytics-tab">
              <h2>Analytics Overview</h2>
              
              <div className="analytics-section">
                <h3>Vendor Performance</h3>
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Profile Views:</span>
                    <strong>{analytics.vendor.profileViews}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Clicks:</span>
                    <strong>{analytics.vendor.totalClicks}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Products:</span>
                    <strong>{analytics.vendor.totalProducts}</strong>
                  </div>
                </div>
              </div>

              <div className="analytics-section">
                <h3>Product Performance</h3>
                <div className="stats-list">
                  <div className="stat-item">
                    <span>Total Products:</span>
                    <strong>{analytics.products.total}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Active Products:</span>
                    <strong>{analytics.products.active}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Promoted Products:</span>
                    <strong>{analytics.products.promoted}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Views:</span>
                    <strong>{analytics.products.totalViews}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Clicks:</span>
                    <strong>{analytics.products.totalClicks}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Total Saves:</span>
                    <strong>{analytics.products.totalSaves}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && vendor && (
            <div className="profile-tab">
              <h2>Vendor Profile</h2>
              <div className="profile-info">
                <p><strong>Business Name:</strong> {vendor.businessName}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${vendor.status}`}>{vendor.status}</span></p>
                <p><strong>Location:</strong> {vendor.location.city}, {vendor.location.country}</p>
                <p><strong>Phone:</strong> {vendor.contactInfo.phone}</p>
                <p><strong>Email:</strong> {vendor.contactInfo.email}</p>
                {vendor.description && (
                  <p><strong>Description:</strong> {vendor.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
