import React from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import './ProductCard.css';

const ProductCard = ({ product, showVendor = true }) => {
  const handleClick = async () => {
    try {
      await productService.trackClick(product._id);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} onClick={handleClick}>
        {product.isPromoted && <span className="badge-promoted">Featured</span>}
        
        <div className="product-image">
          <img
            src={product.images[0]?.url || '/placeholder-image.png'}
            alt={product.name}
          />
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          {showVendor && product.vendor && (
            <p className="product-vendor">{product.vendor.businessName}</p>
          )}

          <div className="product-footer">
            <span className="product-price">{formatPrice(product.price)}</span>
            
            {product.category && (
              <span className="product-category">{product.category.name}</span>
            )}
          </div>

          <div className="product-meta">
            <span className={`availability ${product.availability}`}>
              {product.availability === 'available' ? '✓ Available' : 'Out of Stock'}
            </span>
            
            {product.analytics && (
              <span className="views">👁 {product.analytics.views}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
