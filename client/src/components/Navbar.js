import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>VendorHub</h1>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Browse Products
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">
                  Admin Panel
                </Link>
              )}

              <Link to="/saved" className="nav-link">
                Saved
              </Link>

              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
