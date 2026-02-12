# 🏪 VendorHub - Vendor Advertising Platform

A full-stack web application that enables vendors to advertise and sell mixed products (electronics, fashion, food, services, etc.) with comprehensive features for vendors, customers, and administrators.

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Configuration](#configuration)
- [Security Best Practices](#security-best-practices)
- [Project Structure](#project-structure)

---

## 🏗️ System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Context    │  │  Components  │  │    Pages     │      │
│  │  (State Mgmt)│  │   (UI Logic) │  │   (Routes)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│          │                │                  │               │
│          └────────────────┴──────────────────┘               │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │   Services  │                          │
│                    │  (API Layer)│                          │
│                    └─────────────┘                          │
└───────────────────────────┬────────────────────────────────┘
                            │
                  HTTP/REST API (JSON)
                            │
┌───────────────────────────▼────────────────────────────────┐
│                    SERVER (Node.js/Express)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                       Routes                          │  │
│  │  /api/auth  /api/products  /api/vendors  /api/admin  │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                    Controllers                        │  │
│  │  (Business Logic & Request Handling)                 │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                   Middleware                          │  │
│  │  Authentication │ Authorization │ Validation         │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                      Models                           │  │
│  │  (Mongoose Schemas & Database Logic)                 │  │
│  └────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┼────────────────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   MongoDB Atlas    │
                  │   (Database)       │
                  └────────────────────┘

┌─────────────────────────────────────┐
│       Cloudinary                    │
│    (Image Storage)                  │
└─────────────────────────────────────┘
```

### Key Design Decisions

1. **RESTful API Architecture**: Clean separation between frontend and backend allows for scalability and potential mobile app integration
2. **JWT Authentication**: Stateless authentication enables horizontal scaling
3. **Role-Based Access Control**: Three distinct user roles with granular permissions
4. **MongoDB with Mongoose**: NoSQL database for flexible schema and excellent scalability
5. **Cloudinary Integration**: External CDN for optimized image delivery
6. **Context API**: Lightweight state management suitable for the application's scope

---

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling (modular CSS)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB

### Authentication & Security
- **JWT** - JSON Web Tokens for stateless auth
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **cors** - Cross-Origin Resource Sharing
- **express-validator** - Request validation

### File Upload & Storage
- **Cloudinary** - Cloud-based image management
- **Multer** - Multipart form data handling

---

## ✨ Features

### 👥 User Roles

#### Customer Features
- ✅ Browse all products with filters (category, price, location)
- ✅ Search products by keyword
- ✅ View detailed product information
- ✅ Save/bookmark products
- ✅ View vendor profiles
- ✅ Contact vendors via phone/WhatsApp
- ✅ Share products

#### Vendor Features
- ✅ Vendor registration and approval workflow
- ✅ Create and manage vendor profile (name, logo, location, contact)
- ✅ Add, edit, delete products
- ✅ Product management (name, price, category, description, images, stock)
- ✅ Promote products (featured/boosted ads)
- ✅ View analytics (product views, clicks, profile visits)
- ✅ Dashboard with performance metrics

#### Admin Features
- ✅ View comprehensive dashboard statistics
- ✅ Manage vendors (approve, block, view all)
- ✅ Manage products (view all, delete, toggle status)
- ✅ Manage users (view all, activate/deactivate)
- ✅ Manage categories
- ✅ Monitor promoted ads and promotions

---

## 🗄️ Database Schema

### User Schema
```javascript
{
  name: String (required, max: 100),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min: 6),
  role: Enum ['customer', 'vendor', 'admin'] (default: 'customer'),
  phone: String,
  isActive: Boolean (default: true),
  isEmailVerified: Boolean (default: false),
  savedProducts: [ObjectId] (ref: Product),
  timestamps: true
}
```

### Vendor Schema
```javascript
{
  user: ObjectId (required, unique, ref: User),
  businessName: String (required, max: 200),
  description: String (max: 1000),
  logo: {
    url: String,
    publicId: String
  },
  location: {
    address: String (required),
    city: String (required),
    state: String,
    country: String (required),
    coordinates: { latitude: Number, longitude: Number }
  },
  contactInfo: {
    phone: String (required),
    whatsapp: String,
    email: String,
    website: String
  },
  status: Enum ['pending', 'approved', 'blocked'] (default: 'pending'),
  rating: {
    average: Number (0-5),
    count: Number
  },
  totalProducts: Number (default: 0),
  totalSales: Number (default: 0),
  analytics: {
    profileViews: Number (default: 0),
    totalClicks: Number (default: 0)
  },
  timestamps: true
}
```

### Product Schema
```javascript
{
  vendor: ObjectId (required, ref: Vendor),
  name: String (required, max: 200),
  description: String (required, max: 2000),
  price: Number (required, min: 0),
  category: ObjectId (required, ref: Category),
  images: [{
    url: String (required),
    publicId: String
  }],
  availability: Enum ['available', 'out-of-stock', 'discontinued'],
  stock: Number (min: 0),
  isPromoted: Boolean (default: false),
  promotionExpiry: Date,
  analytics: {
    views: Number (default: 0),
    clicks: Number (default: 0),
    saves: Number (default: 0)
  },
  tags: [String],
  specifications: Map<String, String>,
  isActive: Boolean (default: true),
  timestamps: true,
  
  // Indexes for performance
  indexes: [
    { vendor: 1 },
    { category: 1 },
    { price: 1 },
    { isPromoted: -1, createdAt: -1 },
    { text: 'name, description, tags' }
  ]
}
```

### Category Schema
```javascript
{
  name: String (required, unique, max: 100),
  slug: String (unique, lowercase, auto-generated),
  description: String (max: 500),
  icon: String,
  image: {
    url: String,
    publicId: String
  },
  parent: ObjectId (ref: Category, default: null),
  isActive: Boolean (default: true),
  productCount: Number (default: 0),
  timestamps: true
}
```

### Promotion Schema
```javascript
{
  product: ObjectId (required, ref: Product),
  vendor: ObjectId (required, ref: Vendor),
  type: Enum ['featured', 'boosted', 'premium'] (required),
  startDate: Date (required, default: now),
  endDate: Date (required),
  status: Enum ['active', 'expired', 'cancelled'] (default: 'active'),
  price: Number (required, min: 0),
  paymentStatus: Enum ['pending', 'paid', 'refunded'] (default: 'pending'),
  analytics: {
    impressions: Number (default: 0),
    clicks: Number (default: 0),
    conversions: Number (default: 0)
  },
  timestamps: true
}
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer|vendor",
  "phone": "+1234567890",
  "vendorInfo": { // Only for vendor registration
    "businessName": "John's Electronics",
    "location": {
      "address": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "contactInfo": {
      "phone": "+1234567890"
    }
  }
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Product Endpoints

#### Get All Products (with filters)
```http
GET /products?category=<id>&minPrice=100&maxPrice=1000&city=NewYork&search=phone&page=1&limit=12
Authorization: Bearer <token> (optional)

Response: 200 OK
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

#### Get Single Product
```http
GET /products/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "product": { ... }
  }
}
```

#### Create Product (Vendor Only)
```http
POST /products
Authorization: Bearer <vendor-token>
Content-Type: multipart/form-data

{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone model",
  "price": 999,
  "category": "category-id",
  "stock": 50,
  "tags": "smartphone, apple, 5G",
  "images": [<file>, <file>]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "product": { ... }
  }
}
```

#### Update Product (Vendor Only)
```http
PUT /products/:id
Authorization: Bearer <vendor-token>
Content-Type: multipart/form-data

Response: 200 OK
```

#### Delete Product (Vendor Only)
```http
DELETE /products/:id
Authorization: Bearer <vendor-token>

Response: 200 OK
```

### Vendor Endpoints

#### Get All Vendors
```http
GET /vendors?city=NewYork&page=1&limit=10

Response: 200 OK
```

#### Get Vendor Profile (Public)
```http
GET /vendors/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "vendor": { ... },
    "products": [ ... ]
  }
}
```

#### Get My Profile (Vendor Only)
```http
GET /vendors/profile/me
Authorization: Bearer <vendor-token>

Response: 200 OK
```

#### Update Profile (Vendor Only)
```http
POST /vendors/profile
Authorization: Bearer <vendor-token>
Content-Type: multipart/form-data

Response: 200 OK
```

#### Get Analytics (Vendor Only)
```http
GET /vendors/analytics/me
Authorization: Bearer <vendor-token>

Response: 200 OK
{
  "success": true,
  "data": {
    "analytics": {
      "vendor": { ... },
      "products": { ... }
    }
  }
}
```

### Admin Endpoints

#### Get Dashboard Stats (Admin Only)
```http
GET /admin/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": {
    "stats": {
      "users": { ... },
      "vendors": { ... },
      "products": { ... },
      "promotions": { ... }
    }
  }
}
```

#### Manage Vendors (Admin Only)
```http
GET /admin/vendors?status=pending&page=1
PUT /admin/vendors/:id/status { "status": "approved|blocked" }
```

#### Manage Products (Admin Only)
```http
GET /admin/products
DELETE /admin/products/:id
PUT /admin/products/:id/toggle-active
```

#### Manage Users (Admin Only)
```http
GET /admin/users?role=customer
PUT /admin/users/:id/toggle-active
```

---

## 🔧 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vendor-platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## ⚙️ Configuration

### MongoDB Setup

#### Local MongoDB
```bash
# Start MongoDB service
mongod --dbpath /path/to/data
```

#### MongoDB Atlas (Cloud)
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from dashboard
3. Update Cloudinary variables in `.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

---

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Password Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Never stored in plain text
   - Password validation (minimum 6 characters)

2. **JWT Authentication**
   - Stateless token-based authentication
   - Tokens expire after 7 days (configurable)
   - Tokens verified on protected routes

3. **Input Validation**
   - express-validator for request validation
   - Mongoose schema validation
   - Sanitization of user inputs

4. **HTTP Security Headers**
   - Helmet.js for security headers
   - XSS protection
   - CORS configuration

5. **Role-Based Access Control**
   - Middleware for role verification
   - Protected routes by role
   - Resource ownership validation

6. **Database Security**
   - Mongoose injection prevention
   - Indexed fields for performance
   - No sensitive data in responses

7. **File Upload Security**
   - File type validation
   - File size limits (5MB)
   - Cloudinary for secure storage

### Additional Recommendations for Production

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets (32+ characters)
   - Rotate secrets periodically

2. **HTTPS**
   - Always use HTTPS in production
   - Use SSL/TLS certificates

3. **Rate Limiting**
   - Implement rate limiting (express-rate-limit)
   - Prevent brute force attacks

4. **Logging & Monitoring**
   - Implement proper logging (Winston)
   - Monitor errors (Sentry)
   - Track API usage

5. **Database**
   - Regular backups
   - Connection pooling
   - Read replicas for scaling

6. **API Security**
   - API versioning
   - Request timeouts
   - Input size limits

---

## 📁 Project Structure

```
vendor-platform/
├── server/                    # Backend
│   ├── config/
│   │   ├── database.js       # MongoDB connection
│   │   ├── cloudinary.js     # Cloudinary config
│   │   └── jwt.js            # JWT utilities
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vendorController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   └── Promotion.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── vendor.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   └── admin.routes.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   └── responseHandler.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js             # Entry point
│
├── client/                    # Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductList.js
│   │   │   ├── SearchBar.js
│   │   │   └── FilterBar.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ProductContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── VendorProfile.js
│   │   │   ├── VendorDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── SavedProducts.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── vendorService.js
│   │   │   ├── categoryService.js
│   │   │   └── adminService.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Configure MongoDB Atlas
3. Deploy from Git repository

### Frontend Deployment (Vercel/Netlify)

1. Build the app: `npm run build`
2. Deploy build folder
3. Configure environment variables

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 👨‍💻 Author

Built as a production-ready scalable system demonstrating best practices in full-stack development.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show your support

Give a ⭐️ if this project helped you!
