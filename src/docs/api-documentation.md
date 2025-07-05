
# API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints used in the Shasun Honesty Shop Portal.

## Base URL
```
https://vkuagjkrpbagrchsqmsf.supabase.co/functions/v1/
```

## Authentication
All API requests require authentication using Bearer token:
```
Authorization: Bearer <your-supabase-jwt-token>
```

## Endpoints

### Dashboard Data
**GET** `/dashboard-data`

Retrieves optimized dashboard data including orders, revenue, and rankings.

**Response:**
```json
{
  "stats": {
    "todayOrders": 42,
    "revenue": 2580.50,
    "pendingOrders": 8,
    "lowStockItems": 3,
    "topDepartments": [
      {
        "department": "Computer Science",
        "points": 1250,
        "rank": 1
      }
    ]
  },
  "topStudents": [
    {
      "id": "CS001",
      "name": "John Doe",
      "department": "Computer Science",
      "points": 500,
      "rank": 1
    }
  ],
  "userRank": 15,
  "stockData": [
    {
      "product": "Notebook",
      "current": 25,
      "opening": 100,
      "status": "Good"
    }
  ]
}
```

### User Management
**POST** `/user-management`

Manages user operations including creation, updates, and role assignments.

**Request Body:**
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

### Order Management
**POST** `/order-management`

Handles order operations including creation, updates, and status changes.

**Request Body:**
```json
{
  "action": "create_order",
  "orderData": {
    "products": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 25.50
      }
    ],
    "total_amount": 51.00,
    "payment_method": "upi"
  }
}
```

### Badge System
**POST** `/award-badges`

Awards badges to users based on achievements.

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "badge_type": "achievement",
  "criteria": "first_purchase"
}
```

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

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per IP address

## Webhooks
Webhook endpoints for real-time notifications:
- Order status updates
- Stock level alerts
- Badge achievements
