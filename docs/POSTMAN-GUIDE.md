# Postman Collection Guide

This guide explains how to use the Postman collection for testing the Project Management Tool API.

## 📥 Import Collection

1. Open Postman
2. Click **Import** button
3. Select the `postman-collection.json` file from the project root
4. The collection will be imported with all endpoints and environment variables

## 🔧 Collection Variables

The collection uses the following variables that are automatically managed:

| Variable | Description | Auto-set |
|----------|-------------|----------|
| `baseUrl` | API base URL (default: `http://localhost:3000`) | Manual |
| `accessToken` | JWT access token | ✅ Auto |
| `refreshToken` | JWT refresh token | ✅ Auto |
| `userId` | Current user ID | ✅ Auto |
| `roleId` | Current role ID | ✅ Auto |
| `teamId` | Current team ID | ✅ Auto |
| `projectId` | Current project ID | ✅ Auto |

### Setting Base URL

1. Click on the collection name
2. Go to **Variables** tab
3. Update `baseUrl` to your API endpoint
4. Save changes

## 🚀 Getting Started Workflow

### 1. Register & Authenticate

```
Authentication/
├── Register User
├── Verify OTP
└── Login
```

**Steps:**
1. Run **Register User** - Creates new account and sends OTP email
2. Check email for verification token
3. Run **Verify OTP** - Use the token from email to verify account
4. Alternatively, run **Login** if already registered

The `accessToken` and `refreshToken` are automatically saved to collection variables.

### 2. Create Initial Data

```
Roles/
└── Create Role

Users/
└── Create User
```

**Steps:**
1. Create a role using **Create Role**
2. Create additional users with **Create User**

### 3. Setup Teams & Projects

```
Teams/
├── Create Team
├── Get All Teams
└── Get Team by ID

Projects/
├── Create Project
├── Get All Projects
└── Get Project by ID
```

**Steps:**
1. Create a team using **Create Team**
2. Create projects within teams using **Create Project**
3. List and view teams/projects as needed

### 4. Manage Memberships

```
Memberships/
├── Create Membership
├── Get All Memberships
└── Update Membership
```

**Steps:**
1. Assign users to teams/projects with specific roles
2. Filter memberships by `userId`, `scopeType`, or `scopeId`
3. Update or delete memberships as needed

## 📋 Request Examples

### Authentication

```http
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

### Create Team

```http
POST {{baseUrl}}/teams
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Engineering Team",
  "description": "Main engineering team",
  "members": ["{{userId}}"],
  "ownerId": "{{userId}}",
  "status": "active"
}
```

### Create Membership

```http
POST {{baseUrl}}/memberships
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "userId": "{{userId}}",
  "scopeType": "project",
  "scopeId": "{{projectId}}",
  "roleId": "{{roleId}}"
}
```

## 🔐 Authorization

All endpoints (except authentication) require a valid Bearer token:

```
Authorization: Bearer {{accessToken}}
```

The token is automatically included when set in collection variables.

### Token Refresh

When access token expires:

1. Run **Authentication/Refresh Token**
2. New `accessToken` is automatically saved
3. Continue making requests

## 🎯 Testing Scenarios

### Scenario 1: Create Team with Members

1. **Register User** → Save `userId` as team owner
2. **Create Role** → Save `roleId` for team members
3. **Create Team** → Use `userId` as owner and in members array
4. **Get Team by ID** → Verify team creation with populated members

### Scenario 2: Project Management

1. **Create Team** → Save `teamId`
2. **Create Project** → Link project to `teamId`
3. **Get All Projects** → Filter by `name` if needed
4. **Update Project** → Change status or description
5. **Delete Project** → Clean up

### Scenario 3: Scope-Based Permissions

1. **Create Team** → Save `teamId`
2. **Create Project** → Save `projectId`
3. **Create Membership** (Team scope):
   ```json
   {
     "userId": "{{userId}}",
     "scopeType": "team",
     "scopeId": "{{teamId}}",
     "roleId": "{{roleId}}"
   }
   ```
4. **Create Membership** (Project scope):
   ```json
   {
     "userId": "{{userId}}",
     "scopeType": "project",
     "scopeId": "{{projectId}}",
     "roleId": "{{roleId}}"
   }
   ```
5. **Get All Memberships** → Filter by scope type

## 📊 Query Parameters

### Pagination

Most list endpoints support pagination:

```
GET {{baseUrl}}/users?page=1&limit=10
GET {{baseUrl}}/teams?page=2&limit=20
GET {{baseUrl}}/projects?page=1&limit=5
```

### Filtering

**Users:**
- `status` - Filter by user status (active/inactive)

**Memberships:**
- `userId` - Filter by user
- `scopeType` - Filter by scope (team/project/board)
- `scopeId` - Filter by specific scope
- `roleId` - Filter by role

```
GET {{baseUrl}}/memberships?userId={{userId}}&scopeType=project
```

## 🐛 Troubleshooting

### 401 Unauthorized

**Issue:** `Authorization header is missing` or `Invalid token`

**Solution:**
1. Check `accessToken` variable is set
2. Run **Login** or **Refresh Token**
3. Ensure Bearer token format in request header

### 403 Forbidden

**Issue:** `Insufficient permissions`

**Solution:**
1. Check user role has required permissions
2. Verify role assignments in database
3. Use admin/super_admin role for testing

### 404 Not Found

**Issue:** `Resource not found`

**Solution:**
1. Verify ID in collection variables (`userId`, `teamId`, etc.)
2. Check resource exists by calling GET endpoints first
3. Ensure correct variable is used in URL path

### 409 Conflict

**Issue:** `Duplicate resource`

**Solution:**
1. Check email/code uniqueness for users/roles/permissions
2. Verify compound uniqueness for memberships (userId + scopeType + scopeId)

## 📝 Notes

- **Auto-saved Variables:** Successful create operations automatically save IDs to variables
- **Token Management:** Tokens are auto-refreshed when using the Refresh Token endpoint
- **Environment:** Consider creating separate environments for dev/staging/production
- **Test Scripts:** The collection includes test scripts that auto-extract response values

## 🔗 Related Documentation

- [API Documentation](API.md) - Full API reference
- [Architecture Documentation](ARCHITECTURE.md) - System design
- [README](../README.md) - Project overview
