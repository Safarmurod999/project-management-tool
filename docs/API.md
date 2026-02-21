# API Documentation

This document provides detailed request/response examples for all API endpoints.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Authentication Endpoints

### 1. Register User

Create a new user account. An OTP will be sent to the provided email for verification.

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "roleId": "507f191e810c19729de860ea"
}
```

**Response:** `201 Created`
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "message": "User registered successfully. Please verify your email."
}
```

**Validation Rules:**
- `email`: Must be a valid email address (unique)
- `password`: Minimum 8 characters
- `name`: Required, minimum 2 characters
- `roleId`: Valid MongoDB ObjectId

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "statusCode": 400,
  "message": ["email must be a valid email address"],
  "error": "Bad Request"
}
```

`409 Conflict` - Email already exists
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

---

### 2. Verify OTP

Verify the OTP code sent to user's email and activate the account.

**Endpoint:** `POST /auth/verify`

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZUlkIjoiNTA3ZjE5MWU4MTBjMTk3MjlkZTg2MGVhIiwiaWF0IjoxNzQwNDg3MjAwLCJleHAiOjE3NDA0ODgxMDB9.abcd1234...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc0MDQ4NzIwMCwiZXhwIjoxNzQxMDkyMDAwfQ.xyz9876..."
}
```

**Error Responses:**

`400 Bad Request` - Invalid or expired OTP
```json
{
  "statusCode": 400,
  "message": "Invalid or expired OTP code",
  "error": "Bad Request"
}
```

`404 Not Found` - User not found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### 3. Login

Authenticate user with email and password.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

`401 Unauthorized` - Invalid credentials
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

`403 Forbidden` - Account not verified
```json
{
  "statusCode": 403,
  "message": "Please verify your email before logging in",
  "error": "Forbidden"
}
```

---

### 4. Refresh Token

Get a new access token using a valid refresh token.

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

`401 Unauthorized` - Invalid or expired refresh token
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

---

### 5. Get Current User (Me)

Get authenticated user's profile with role and permissions.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "status": "active",
    "createdAt": "2026-02-20T10:00:00.000Z",
    "updatedAt": "2026-02-20T10:00:00.000Z"
  },
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "Admin",
    "code": "ADMIN",
    "description": "Administrator with full access",
    "status": "active"
  },
  "permissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Create User",
      "code": "USER_CREATE",
      "description": "Permission to create users",
      "status": "active"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Delete User",
      "code": "USER_DELETE",
      "description": "Permission to delete users",
      "status": "active"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "Update User",
      "code": "USER_UPDATE",
      "description": "Permission to update users",
      "status": "active"
    }
  ]
}
```

**Error Responses:**

`401 Unauthorized` - Invalid or missing token
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## 👥 User Management

### 1. Get All Users

Retrieve a list of all users.

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (`active` or `inactive`)

**Example:** `GET /users?page=1&limit=10&status=active`

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": {
        "id": "507f191e810c19729de860ea",
        "name": "Admin",
        "code": "ADMIN"
      },
      "team": {
        "id": "507f1f77bcf86cd799439015",
        "name": "Development Team"
      },
      "status": "active",
      "createdAt": "2026-02-20T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

### 2. Get User by ID

Retrieve a specific user by their ID.

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "Admin",
    "code": "ADMIN",
    "status": "active"
  },
  "team": {
    "id": "507f1f77bcf86cd799439015",
    "name": "Development Team",
    "status": "active"
  },
  "status": "active",
  "createdAt": "2026-02-20T10:00:00.000Z",
  "updatedAt": "2026-02-20T10:00:00.000Z"
}
```

**Error Responses:**

`404 Not Found` - User not found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

### 3. Create User

Create a new user (admin endpoint).

**Endpoint:** `POST /users`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "email": "jane.smith@example.com",
  "password": "SecurePass456!",
  "name": "Jane Smith",
  "roleId": "507f191e810c19729de860ea",
  "teamId": "507f1f77bcf86cd799439015"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439016",
  "email": "jane.smith@example.com",
  "name": "Jane Smith",
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "Admin"
  },
  "team": {
    "id": "507f1f77bcf86cd799439015",
    "name": "Development Team"
  },
  "status": "active",
  "createdAt": "2026-02-20T11:00:00.000Z"
}
```

---

### 4. Update User

Update an existing user.

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Jane Doe",
  "roleId": "507f191e810c19729de860eb",
  "teamId": "507f1f77bcf86cd799439015",
  "status": "inactive"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439016",
  "email": "jane.smith@example.com",
  "name": "Jane Doe",
  "status": "inactive",
  "updatedAt": "2026-02-20T12:00:00.000Z"
}
```

---

### 5. Delete User

Delete a user by ID.

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`

**Error Responses:**

`404 Not Found`
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

---

## 🎭 Role Management

### 1. Get All Roles

Retrieve all roles in the system.

**Endpoint:** `GET /roles`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "roles": [
    {
      "id": "507f191e810c19729de860ea",
      "name": "Admin",
      "code": "ADMIN",
      "description": "Administrator with full access",
      "status": "active",
      "createdAt": "2026-02-01T00:00:00.000Z"
    },
    {
      "id": "507f191e810c19729de860eb",
      "name": "Manager",
      "code": "MANAGER",
      "description": "Project manager role",
      "status": "active",
      "createdAt": "2026-02-15T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Role by ID

Retrieve a specific role with its permissions.

**Endpoint:** `GET /roles/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "id": "507f191e810c19729de860ea",
  "name": "Admin",
  "code": "ADMIN",
  "description": "Administrator with full access",
  "status": "active",
  "createdAt": "2026-02-01T00:00:00.000Z",
  "updatedAt": "2026-02-01T00:00:00.000Z"
}
```

---

### 3. Create Role

Create a new role with associated permissions.

**Endpoint:** `POST /roles`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Team Lead",
  "code": "TEAM_LEAD",
  "description": "Team leadership role",
  "permissionIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "507f191e810c19729de860ec",
  "name": "Team Lead",
  "code": "TEAM_LEAD",
  "description": "Team leadership role",
  "status": "active",
  "createdAt": "2026-02-20T13:00:00.000Z"
}
```

**Validation:**
- `name`: Required, unique, 2-50 characters
- `code`: Required, unique, uppercase with underscores
- `permissionIds`: Array of valid permission IDs

---

### 4. Update Role

Update an existing role and its permissions.

**Endpoint:** `PUT /roles/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Senior Team Lead",
  "code": "SENIOR_TEAM_LEAD",
  "description": "Senior team leadership role",
  "permissionIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439014"
  ],
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f191e810c19729de860ec",
  "name": "Senior Team Lead",
  "code": "SENIOR_TEAM_LEAD",
  "description": "Senior team leadership role",
  "status": "active",
  "updatedAt": "2026-02-20T14:00:00.000Z"
}
```

---

### 5. Delete Role

Delete a role (only if no users are assigned to it).

**Endpoint:** `DELETE /roles/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`

**Error Responses:**

`400 Bad Request` - Role is assigned to users
```json
{
  "statusCode": 400,
  "message": "Cannot delete role. Users are assigned to this role.",
  "error": "Bad Request"
}
```

---

## 🔑 Permission Management

### 1. Get All Permissions

Retrieve all available permissions.

**Endpoint:** `GET /permissions`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "permissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Create User",
      "code": "USER_CREATE",
      "description": "Permission to create users",
      "status": "active",
      "createdAt": "2026-02-01T00:00:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Delete User",
      "code": "USER_DELETE",
      "description": "Permission to delete users",
      "status": "active",
      "createdAt": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Permission by ID

Retrieve a specific permission.

**Endpoint:** `GET /permissions/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Create User",
  "code": "USER_CREATE",
  "description": "Permission to create users",
  "status": "active",
  "createdAt": "2026-02-01T00:00:00.000Z",
  "updatedAt": "2026-02-01T00:00:00.000Z"
}
```

---

### 3. Create Permission

Create a new permission.

**Endpoint:** `POST /permissions`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "View Reports",
  "code": "REPORT_VIEW",
  "description": "Permission to view reports"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439017",
  "name": "View Reports",
  "code": "REPORT_VIEW",
  "description": "Permission to view reports",
  "status": "active",
  "createdAt": "2026-02-20T15:00:00.000Z"
}
```

**Validation:**
- `name`: Required, unique, 3-100 characters
- `code`: Required, unique, uppercase with underscores
- `description`: Optional, max 255 characters

---

### 4. Update Permission

Update an existing permission.

**Endpoint:** `PUT /permissions/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "View All Reports",
  "code": "REPORT_VIEW_ALL",
  "description": "Permission to view all reports",
  "status": "active"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439017",
  "name": "View All Reports",
  "code": "REPORT_VIEW_ALL",
  "description": "Permission to view all reports",
  "status": "active",
  "updatedAt": "2026-02-20T16:00:00.000Z"
}
```

---

### 5. Delete Permission

Delete a permission (only if not assigned to any role).

**Endpoint:** `DELETE /permissions/:id`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `204 No Content`

**Error Responses:**

`400 Bad Request` - Permission is assigned to roles
```json
{
  "statusCode": 400,
  "message": "Cannot delete permission. It is assigned to one or more roles.",
  "error": "Bad Request"
}
```

---

## ❗ Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

## Common Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Error Type"
}
```

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production:

- Authentication endpoints: 5 requests per minute
- Regular endpoints: 100 requests per minute

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```
