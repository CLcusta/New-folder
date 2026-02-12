import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(id);
      setProduct(response.product);
      
      // Check if product is saved
      if (user && user.savedProducts) {
        setIsSaved(user.savedProducts.includes(id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to save products');
      return;
    }

    try {
      await productService.toggleSave(id);
      setIsSaved(!isSaved);
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const handleContactVendor = (type) => {
    if (type === 'whatsapp' && product.vendor.contactInfo.whatsapp) {
      window.open(`https://wa.me/${product.vendor.contactInfo.whatsapp}`, '_blank');
    } else if (type === 'phone' && product.vendor.contactInfo.phone) {
      window.location.href = `tel:${product.vendor.contactInfo.phone}`;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-grid">
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images[0]?.url || '/placeholder-image.png'}
                alt={product.name}
              />
            </div>
            {product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img, index) => (
                  <img key={index} src={img.url} alt={`${product.name} ${index + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="product-info-detailed">
            <h1>{product.name}</h1>

            <div className="price-section">
              <h2 className="price">
                ${product.price.toLocaleString()}
              </h2>
              <span className={`availability ${product.availability}`}>
                {product.availability === 'available' ? '✓ In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="product-meta-section">
              <p><strong>Category:</strong> {product.category?.name}</p>
              <p><strong>Views:</strong> {product.analytics.views}</p>
              {product.isPromoted && (
                <span className="badge-featured">⭐ Featured Product</span>
              )}
            </div>

            <div className="description-section">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="specifications">
                <h3>Specifications</h3>
                <ul>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="action-buttons">
              <button onClick={handleSaveToggle} className="btn btn-secondary">
                {isSaved ? '❤️ Saved' : '🤍 Save'}
              </button>

              {product.vendor?.contactInfo?.whatsapp && (
                <button
                  onClick={() => handleContactVendor('whatsapp')}
                  className="btn btn-success"
                >
                  💬 WhatsApp
                </button>
              )}

              {product.vendor?.contactInfo?.phone && (
                <button
                  onClick={() => handleContactVendor('phone')}
                  className="btn btn-primary"
                >
                  📞 Call
                </button>
              )}
            </div>

            {product.vendor && (
              <div className="vendor-section">
                <h3>Sold by</h3>
                <Link to={`/vendors/${product.vendor._id}`} className="vendor-link">
                  <h4>{product.vendor.businessName}</h4>
                  <p>{product.vendor.location?.city}, {product.vendor.location?.country}</p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
