import React, { useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ProductList from '../components/ProductList';
import { useProducts } from '../context/ProductContext';
import './Home.css';

const Home = () => {
  const {
    products,
    loading,
    filters,
    pagination,
    fetchProducts,
    searchProducts,
    filterProducts,
    clearFilters,
  } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (newPage) => {
    fetchProducts({ page: newPage });
    window.scrollTo(0, 0);
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Find Amazing Products from Local Vendors</h1>
          <p>Discover electronics, fashion, food, services, and more</p>
          <SearchBar onSearch={searchProducts} />
        </div>
      </section>

      <div className="container">
        <div className="content-wrapper">
          <aside className="sidebar">
            <FilterBar
              filters={filters}
              onFilterChange={filterProducts}
              onClearFilters={clearFilters}
            />
          </aside>

          <main className="main">
            <div className="products-header">
              <h2>Products</h2>
              {pagination.total > 0 && (
                <p className="results-count">
                  Showing {products.length} of {pagination.total} products
                </p>
              )}
            </div>

            <ProductList products={products} loading={loading} />

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>

                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
