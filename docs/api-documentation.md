
# API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL & Environment](#base-url--environment)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Dashboard Data](#dashboard-data)
  - [User Management](#user-management)
  - [Order Management](#order-management)
  - [Badge System](#badge-system)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [Extensibility & Open Source Usage](#extensibility--open-source-usage)

---

## Overview
This document provides comprehensive documentation for all API endpoints used in the College Honesty Shop Portal. All endpoints are implemented as Supabase Edge Functions and are accessible via HTTP.

---

## Base URL & Environment

Your API base URL is your Supabase project's Edge Functions endpoint:

```
https://<your-supabase-project-ref>.supabase.co/functions/v1/
```

- Replace `<your-supabase-project-ref>` with your actual Supabase project ref (see your `.env` file or Supabase dashboard).
- Example: `https://vkuagjkrpbagrchsqmsf.supabase.co/functions/v1/`

---

## Authentication

All API requests require a valid Supabase JWT access token. You can obtain this token by authenticating via the frontend (login/signup) and using the session's `access_token`.

**Include this header in all requests:**
```
Authorization: Bearer <your-supabase-jwt-token>
```

---

## Endpoints

### Dashboard Data
- **Method:** GET
- **Path:** `/dashboard-data`
- **Description:** Retrieves optimized dashboard data including orders, revenue, and rankings.

**Sample Response:**
```json
{
  "stats": {
    "todayOrders": 42,
    "revenue": 2580.50,
    "pendingOrders": 8,
    "lowStockItems": 3,
    "topDepartments": [
      { "department": "Computer Science", "points": 1250, "rank": 1 }
    ]
  },
  "topStudents": [
    { "id": "CS001", "name": "John Doe", "department": "Computer Science", "points": 500, "rank": 1 }
  ],
  "userRank": 15,
  "stockData": [
    { "product": "Notebook", "current": 25, "opening": 100, "status": "Good" }
  ]
}
```

---

### User Management
- **Method:** POST
- **Path:** `/user-management`
- **Description:** Manages user operations including creation, updates, and role assignments.

**Sample Request Body:**
```json
{
  "action": "create_user",
  "userData": {
    "name": "John Doe",
    "email": "john@example.com",
    "student_id": "CS001",
    "department": "Computer Science",
    "role": "student"
  }
}
```

---

### Order Management
- **Method:** POST
- **Path:** `/order-management`
- **Description:** Handles order operations including creation, updates, and status changes.

**Sample Request Body:**
```json
{
  "action": "create_order",
  "orderData": {
    "products": [
      { "product_id": 1, "quantity": 2, "price": 25.50 }
    ],
    "total_amount": 51.00,
    "payment_method": "upi"
  }
}
```

---

### Badge System
- **Method:** POST
- **Path:** `/award-badges`
- **Description:** Awards badges to users based on achievements.

**Sample Request Body:**
```json
{
  "user_id": "user-uuid",
  "badge_type": "achievement",
  "criteria": "first_purchase"
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Detailed error description",
    "details": {}
  }
}
```
- Error codes may include: `INVALID_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `INTERNAL_ERROR`, etc.

---

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per IP address
- Exceeding these limits will result in a `429 Too Many Requests` error

---

## Webhooks
Webhook endpoints are available for real-time notifications (if enabled in your deployment):
- Order status updates
- Stock level alerts
- Badge achievements

Contact your deployment admin or check your Supabase Edge Functions for webhook configuration.

---

## Extensibility & Open Source Usage
- This project is open source and designed for easy customization.
- You can add new Edge Functions for additional API endpoints as needed.
- All configuration is handled via `whitelabel.json` and environment variables.
- For more details, see the [Getting Started Guide](./getting-started.md).
