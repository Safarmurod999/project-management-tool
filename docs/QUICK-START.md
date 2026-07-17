# Quick Start Guide

Get started with the Project Management Tool API in 5 minutes.

## 🚀 Prerequisites

- Node.js >= 18.x
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379`

## ⚡ Quick Setup

### 1. Install & Configure

```bash
# Clone and install dependencies
git clone <repository-url>
cd project-management-tool
npm install

# Create environment file
cp .env.example .env
```

### 2. Start Services

```bash
# Start MongoDB & Redis (using Docker)
cd dev
docker-compose up -d

# Or manually
# mongod --dbpath /path/to/data
# redis-server

# Start the application
cd ..
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 📮 Test the API

### Using Postman (Recommended)

1. Import [postman-collection.json](../postman-collection.json) into Postman
2. Follow the [Postman Guide](POSTMAN-GUIDE.md) for detailed instructions
3. Run requests in the **Authentication** folder first

### Using cURL

#### 1. Register User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "userId": "65abc123def456789..."
}
```

#### 2. Verify Email

Check your email for the verification token, then:

```bash
curl -X PATCH http://localhost:3000/auth/65abc123def456789... \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token-from-email"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 3. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4. Get Current User

```bash
export TOKEN="your-access-token-here"

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "user": {
    "id": "65abc123...",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "active"
  },
  "role": {
    "id": "65def456...",
    "name": "User",
    "code": "USER"
  },
  "permissions": [
    {
      "id": "65ghi789...",
      "name": "View Projects",
      "code": "PROJECT_GET"
    }
  ]
}
```

## 🎯 Common Workflows

### Create a Team

```bash
curl -X POST http://localhost:3000/teams \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering Team",
    "description": "Main engineering team",
    "members": ["65abc123..."],
    "ownerId": "65abc123...",
    "status": "active"
  }'
```

### Create a Project

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Portal",
    "description": "New customer portal",
    "teamId": "65team123...",
    "status": "active"
  }'
```

### Assign Role to User in Project

```bash
curl -X POST http://localhost:3000/memberships \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65abc123...",
    "scopeType": "project",
    "scopeId": "65project456...",
    "roleId": "65role789..."
  }'
```

## 🔑 Key Concepts

### Authentication Flow

```
Register → Verify Email → Login → Get Access Token → Make Requests
```

### Authorization

- **JWT Bearer Token** required in `Authorization` header
- **Role-Based** access control (SUPER_ADMIN, ADMIN, MANAGER, USER)
- **Permission-Based** fine-grained access (USER_CREATE, PROJECT_EDIT, etc.)
- **Scope-Based** memberships for context-specific roles

### Resource Hierarchy

```
User
 ├── Role (global)
 │    └── Permissions
 │
 ├── Team
 │    ├── Members
 │    ├── Owner
 │    └── Projects
 │
 └── Membership (scope-based)
      ├── Team scope
      ├── Project scope
      └── Board scope
```

## 📊 Database Structure

### Core Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| users | User accounts | email, name, roleId, status |
| roles | User roles | name, code, status |
| permissions | Access permissions | name, code, status |
| role_permissions | Role-permission mapping | roleId, permissionId |
| teams | Team management | name, members, ownerId, status |
| projects | Project management | name, teamId, status |
| memberships | Scope-based roles | userId, scopeType, scopeId, roleId |
| otps | Email verification | userId, code, expiresAt |

## 🛠️ Available Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register user
- `PATCH /auth/:id` - Verify email
- `POST /auth/login` - Login
- `POST /auth/refresh-token` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Users (`/users`)
- `POST /users` - Create user
- `GET /users` - List users
- `GET /users/:id` - Get user
- `GET /users/email/:email` - Get by email
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Roles (`/roles`)
- Standard CRUD operations
- Manage role-permission assignments

### Permissions (`/permissions`)
- Standard CRUD operations
- Define access controls

### Teams (`/teams`)
- Standard CRUD operations
- Manage team members and ownership

### Projects (`/projects`)
- Standard CRUD operations
- Link projects to teams

### Memberships (`/memberships`)
- Standard CRUD operations
- Assign scope-based roles

## 🔐 Default Roles

| Role | Code | Description | Permissions |
|------|------|-------------|-------------|
| Super Admin | `SUPER_ADMIN` | Full system access | All permissions |
| Admin | `ADMIN` | Administrative access | Most operations |
| Manager | `MANAGER` | Team/project management | CRUD teams/projects |
| User | `USER` | Basic user access | View resources |

## 📖 Next Steps

- **API Reference**: See [API.md](API.md) for detailed endpoint documentation
- **Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- **Postman**: Import collection and follow [POSTMAN-GUIDE.md](POSTMAN-GUIDE.md)
- **Changelog**: Check [CHANGELOG.md](CHANGELOG.md) for version updates

## ⚠️ Common Issues

### MongoDB Connection Error

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
```bash
# Check MongoDB is running
mongosh
# or
docker ps | grep mongo
```

### Redis Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### 401 Unauthorized

**Error:** `Unauthorized`

**Solution:**
- Ensure you're sending `Authorization: Bearer <token>` header
- Token might be expired - login again or refresh
- Verify token is correctly formatted

### 403 Forbidden

**Error:** `Forbidden`

**Solution:**
- User lacks required role or permission
- Check user's role has necessary permissions
- For testing, use SUPER_ADMIN role

## 💡 Tips

1. **Use Postman** - Auto-manages tokens and variables
2. **Check Logs** - Application logs show detailed error information
3. **Test Incremental** - Start with auth, then build up to complex operations
4. **Read API Docs** - Full examples available in [API.md](API.md)
5. **Environment Variables** - Never commit secrets to git

## 🔗 Resources

- [Full API Documentation](API.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Postman Collection Guide](POSTMAN-GUIDE.md)
- [Project README](../README.md)
