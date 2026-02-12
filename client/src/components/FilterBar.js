import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  return (
    <div className="filter-bar">
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Location</label>
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => handleChange('city', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.promoted}
            onChange={(e) => handleChange('promoted', e.target.checked)}
          />
          Featured Products Only
        </label>
      </div>

      <button onClick={onClearFilters} className="btn btn-secondary">
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;
