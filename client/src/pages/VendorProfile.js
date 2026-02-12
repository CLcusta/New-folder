import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vendorService } from '../services/vendorService';
import ProductList from '../components/ProductList';
import './VendorProfile.css';

const VendorProfile = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await vendorService.getById(id);
      setVendor(response.vendor);
      setProducts(response.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (type) => {
    if (type === 'whatsapp' && vendor.contactInfo.whatsapp) {
      window.open(`https://wa.me/${vendor.contactInfo.whatsapp}`, '_blank');
    } else if (type === 'phone') {
      window.location.href = `tel:${vendor.contactInfo.phone}`;
    } else if (type === 'email') {
      window.location.href = `mailto:${vendor.contactInfo.email}`;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!vendor) return <div className="error">Vendor not found</div>;

  return (
    <div className="vendor-profile">
      <div className="container">
        <div className="vendor-header">
          <div className="vendor-logo">
            {vendor.logo?.url ? (
              <img src={vendor.logo.url} alt={vendor.businessName} />
            ) : (
              <div className="logo-placeholder">
                {vendor.businessName.charAt(0)}
              </div>
            )}
          </div>

          <div className="vendor-header-info">
            <h1>{vendor.businessName}</h1>
            <p className="vendor-location">
              📍 {vendor.location.city}, {vendor.location.country}
            </p>

            {vendor.rating && vendor.rating.count > 0 && (
              <div className="vendor-rating">
                ⭐ {vendor.rating.average.toFixed(1)} ({vendor.rating.count} reviews)
              </div>
            )}

            <div className="vendor-stats">
              <span>🏪 {vendor.totalProducts} Products</span>
              <span>👁 {vendor.analytics.profileViews} Profile Views</span>
            </div>
          </div>
        </div>

        {vendor.description && (
          <div className="vendor-description">
            <h2>About</h2>
            <p>{vendor.description}</p>
          </div>
        )}

        <div className="vendor-contact">
          <h3>Contact Information</h3>
          <div className="contact-buttons">
            <button onClick={() => handleContact('phone')} className="btn btn-primary">
              📞 {vendor.contactInfo.phone}
            </button>

            {vendor.contactInfo.whatsapp && (
              <button onClick={() => handleContact('whatsapp')} className="btn btn-success">
                💬 WhatsApp
              </button>
            )}

            {vendor.contactInfo.email && (
              <button onClick={() => handleContact('email')} className="btn btn-secondary">
                ✉️ Email
              </button>
            )}

            {vendor.contactInfo.website && (
              <a
                href={vendor.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                🌐 Website
              </a>
            )}
          </div>
        </div>

        <div className="vendor-products">
          <h2>Products from {vendor.businessName}</h2>
          <ProductList products={products} loading={false} showVendor={false} />
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
