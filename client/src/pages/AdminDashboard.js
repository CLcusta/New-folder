import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'vendors') fetchVendors();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'promotions') fetchPromotions();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await adminService.getAllVendors();
      setVendors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminService.getAllProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await adminService.getAllPromotions();
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    }
  };

  const handleVendorStatusChange = async (vendorId, newStatus) => {
    try {
      await adminService.updateVendorStatus(vendorId, newStatus);
      fetchVendors();
    } catch (error) {
      alert('Failed to update vendor status');
    }
  };

  const handleProductToggle = async (productId) => {
    try {
      await adminService.toggleProductStatus(productId);
      fetchProducts();
    } catch (error) {
      alert('Failed to toggle product status');
    }
  };

  const handleProductDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleUserToggle = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      fetchUsers();
    } catch (error) {
      alert('Failed to toggle user status');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="dashboard-tabs">
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
          <button
            className={activeTab === 'vendors' ? 'active' : ''}
            onClick={() => setActiveTab('vendors')}
          >
            Vendors
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'promotions' ? 'active' : ''}
            onClick={() => setActiveTab('promotions')}
          >
            Promotions
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'stats' && stats && (
            <div className="stats-tab">
              <div className="stats-section">
                <h2>Users</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>{stats.users.total}</h3>
                    <p>Total Users</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.users.customers}</h3>
                    <p>Customers</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.users.vendors}</h3>
                    <p>Vendors</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.users.active}</h3>
                    <p>Active Users</p>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h2>Vendors</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>{stats.vendors.total}</h3>
                    <p>Total Vendors</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.vendors.approved}</h3>
                    <p>Approved</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.vendors.pending}</h3>
                    <p>Pending</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.vendors.blocked}</h3>
                    <p>Blocked</p>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h2>Products</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>{stats.products.total}</h3>
                    <p>Total Products</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.products.active}</h3>
                    <p>Active</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.products.promoted}</h3>
                    <p>Promoted</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.products.outOfStock}</h3>
                    <p>Out of Stock</p>
                  </div>
                </div>
              </div>

              <div className="stats-section">
                <h2>Promotions</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>{stats.promotions.total}</h3>
                    <p>Total Promotions</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.promotions.active}</h3>
                    <p>Active</p>
                  </div>
                  <div className="stat-card">
                    <h3>{stats.promotions.expired}</h3>
                    <p>Expired</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="vendors-tab">
              <h2>Vendor Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(vendor => (
                    <tr key={vendor._id}>
                      <td>{vendor.businessName}</td>
                      <td>{vendor.user?.name}</td>
                      <td>{vendor.location?.city}</td>
                      <td>{vendor.totalProducts}</td>
                      <td>
                        <span className={`status-badge ${vendor.status}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={vendor.status}
                          onChange={(e) => handleVendorStatusChange(vendor._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-tab">
              <h2>Product Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Vendor</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Status</th>
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
                      <td>{product.vendor?.businessName}</td>
                      <td>${product.price}</td>
                      <td>{product.category?.name}</td>
                      <td>
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleProductToggle(product._id)}
                          className="btn btn-sm btn-secondary"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleProductDelete(product._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <h2>User Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleUserToggle(user._id)}
                            className="btn btn-sm btn-secondary"
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="promotions-tab">
              <h2>Promotion Management</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Vendor</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.map(promo => (
                    <tr key={promo._id}>
                      <td>{promo.product?.name}</td>
                      <td>{promo.vendor?.businessName}</td>
                      <td>
                        <span className={`type-badge ${promo.type}`}>
                          {promo.type}
                        </span>
                      </td>
                      <td>{new Date(promo.startDate).toLocaleDateString()}</td>
                      <td>{new Date(promo.endDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${promo.status}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td>
                        <small>
                          👁 {promo.analytics.impressions} | 
                          🖱 {promo.analytics.clicks} | 
                          ✓ {promo.analytics.conversions}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
