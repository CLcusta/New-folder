# API Endpoints Reference

## Overview
Complete API endpoint documentation for the Vendor Advertising Platform.

**Base URL:** `http://localhost:5000/api`

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer|vendor",
  "vendorInfo": {
    "businessName": "John's Shop",
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
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
    "token": "eyJhbGc..."
  }
}
```

### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
    "token": "eyJhbGc..."
  }
}
```

### GET /auth/me
Get current authenticated user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "vendor": { ... }
  }
}
```

### PUT /auth/profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "+0987654321"
}
```

**Response:** `200 OK`

### PUT /auth/password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`

### POST /auth/logout
Logout user (invalidates token on client side).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Vendor Endpoints

### GET /vendors
Get all vendors with optional filters.

**Query Parameters:**
- `city` - Filter by city
- `status` - Filter by status (pending, approved, blocked)
- `search` - Search by business name
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "vendors": [ ... ],
    "pagination": { "page": 1, "limit": 10, "total": 45, "pages": 5 }
  }
}
```

### GET /vendors/:id
Get vendor profile (public view).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "vendor": { ... },
    "products": [ ... ]
  }
}
```

### GET /vendors/profile/me
Get current vendor's profile (requires vendor role).

**Headers:** `Authorization: Bearer <vendor-token>`

**Response:** `200 OK`

### POST /vendors/profile
Create or update vendor profile.

**Headers:** 
- `Authorization: Bearer <vendor-token>`
- `Content-Type: multipart/form-data`

**Request:**
```
Form Data:
- businessName: string
- description: string
- location: JSON object
- contactInfo: JSON object
- logo: file
```

**Response:** `200 OK`

### GET /vendors/analytics/me
Get vendor analytics (requires vendor role).

**Headers:** `Authorization: Bearer <vendor-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "analytics": {
      "vendor": {
        "profileViews": 150,
        "totalClicks": 500,
        "totalProducts": 25,
        "totalSales": 5000,
        "rating": { "average": 4.5, "count": 20 }
      },
      "products": {
        "total": 25,
        "active": 23,
        "promoted": 5,
        "totalViews": 1200,
        "totalClicks": 450,
        "totalSaves": 80
      }
    }
  }
}
```

---

## Product Endpoints

### GET /products
Get all products with advanced filtering.

**Query Parameters:**
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `city` - Filter by vendor location
- `search` - Full-text search
- `availability` - Filter by availability
- `promoted` - Show only promoted products (true/false)
- `page` - Page number
- `limit` - Results per page (default: 12)
- `sort` - Sort field (e.g., -createdAt, price)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 12, "total": 100, "pages": 9 }
}
```

### GET /products/:id
Get product details with analytics.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "...",
      "name": "iPhone 15 Pro",
      "price": 999,
      "description": "...",
      "images": [ ... ],
      "category": { "_id": "...", "name": "Electronics" },
      "vendor": { "_id": "...", "businessName": "...", "location": "..." },
      "analytics": {
        "views": 150,
        "clicks": 45,
        "saves": 12
      }
    }
  }
}
```

### POST /products
Create new product (requires vendor role and approved status).

**Headers:**
- `Authorization: Bearer <vendor-token>`
- `Content-Type: multipart/form-data`

**Request:**
```
Form Data:
- name: string (required)
- description: string (required)
- price: number (required)
- category: ObjectId (required)
- stock: number
- tags: comma-separated string
- specifications: JSON object
- images: files (max 5)
```

**Response:** `201 Created`

### PUT /products/:id
Update product (vendor only, must own product).

**Headers:**
- `Authorization: Bearer <vendor-token>`
- `Content-Type: multipart/form-data`

**Response:** `200 OK`

### DELETE /products/:id
Delete product (vendor only, must own product).

**Headers:** `Authorization: Bearer <vendor-token>`

**Response:** `200 OK`

### GET /products/vendor/my-products
Get current vendor's products.

**Headers:** `Authorization: Bearer <vendor-token>`

**Query Parameters:**
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

### POST /products/:id/click
Track product click (analytics).

**Response:** `200 OK`

### POST /products/:id/save
Save/unsave product for user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "isSaved": true }
}
```

---

## Category Endpoints

### GET /categories
Get all active categories.

**Query Parameters:**
- `active` - Filter by active status (default: true)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "categories": [ ... ]
  }
}
```

### GET /categories/:identifier
Get category by ID or slug with products.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "category": { ... },
    "products": [ ... ]
  }
}
```

### POST /categories
Create category (admin only).

**Headers:**
- `Authorization: Bearer <admin-token>`
- `Content-Type: multipart/form-data`

**Request:**
```
Form Data:
- name: string (required)
- description: string
- icon: string
- parent: ObjectId
- image: file
```

**Response:** `201 Created`

### PUT /categories/:id
Update category (admin only).

**Headers:**
- `Authorization: Bearer <admin-token>`
- `Content-Type: multipart/form-data`

**Response:** `200 OK`

### DELETE /categories/:id
Delete category (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

---

## Admin Endpoints

### GET /admin/stats
Get dashboard statistics (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "stats": {
      "users": {
        "total": 500,
        "customers": 400,
        "vendors": 90,
        "admins": 10,
        "active": 480
      },
      "vendors": {
        "total": 90,
        "approved": 75,
        "pending": 10,
        "blocked": 5
      },
      "products": {
        "total": 2500,
        "active": 2300,
        "promoted": 150,
        "outOfStock": 200
      },
      "promotions": {
        "total": 200,
        "active": 150,
        "expired": 50
      }
    }
  }
}
```

### GET /admin/vendors
Get all vendors with filtering (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

### PUT /admin/vendors/:id/status
Update vendor status (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Request:**
```json
{
  "status": "approved|blocked|pending"
}
```

**Response:** `200 OK`

### GET /admin/products
Get all products (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `isActive` - Filter by active status
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

### DELETE /admin/products/:id
Delete product (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### PUT /admin/products/:id/toggle-active
Toggle product active status (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### GET /admin/users
Get all users (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `role` - Filter by role
- `isActive` - Filter by active status
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

### PUT /admin/users/:id/toggle-active
Deactivate/activate user (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### GET /admin/promotions
Get all promotions (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `limit` - Results per page

**Response:** `200 OK`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional, for validation errors
}
```

### Common Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt-token>
```

Token obtained from login/register endpoints and stored in localStorage by the frontend.

---

## Rate Limiting

(Recommended for production)
- 100 requests per 15 minutes per IP
- More restrictive for auth endpoints

---

## Testing

Use tools like Postman, Insomnia, or cURL to test these endpoints.

Example cURL request:
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```
