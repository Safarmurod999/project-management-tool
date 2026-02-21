# Project Management Tool - Architecture Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Development Setup](#development-setup)

## Overview

A role-based project management system built with NestJS, implementing Clean Architecture principles with MongoDB as the primary database and Redis for caching.

### Tech Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT (Access + Refresh Tokens)
- **Authorization**: Role-Based Access Control (RBAC)

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     Adapters Layer                       │
│  (Controllers, Presenters, External Clients)            │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                       │
│              (Use Cases, Business Logic)                │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
│     (Entities, Repositories, Factories, Exceptions)     │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│               Infrastructure Layer                       │
│  (Database, Cache, Modules, Guards, Middleware, DI)     │
└─────────────────────────────────────────────────────────┘
```

#### 1. Domain Layer (`src/domain/`)
Contains core business entities and contracts:
- **Entities**: Pure business objects (User, Role, Permission, Team, OTP)
- **Repositories**: Interface definitions for data access
- **Factories**: Entity construction logic
- **Exceptions**: Domain-specific errors

#### 2. Application Layer (`src/application/`)
Implements business use cases:
- **Use Cases**: Application-specific business rules
- Each feature has dedicated use cases (create, update, delete, find)

#### 3. Infrastructure Layer (`src/infrastructure/`)
Technical implementation details:
- **Database**: MongoDB schemas and models
- **Cache**: Redis implementation
- **Modules**: NestJS dependency injection configuration
- **Guards**: Authorization middleware
- **Helpers**: Token services, utilities

#### 4. Adapters Layer (`src/adapters/`)
External interface implementations:
- **Controllers**: HTTP request handlers
- **Presenters**: Response formatting
- **Clients**: External service integrations (email, etc.)

### Dependency Injection

Uses symbol-based dependency injection for loose coupling:

```typescript
// src/infrastructure/dependency-injection/
RepositorySymbols.UserRepository
UsecaseSymbols.User.CreateUserUsecase
PresenterSymbols.User.CreateUserPresenter
```

## Authentication & Authorization

### Authentication Flow

#### 1. User Registration
```
POST /auth/register
  ↓
RegisterUserUsecase
  ↓
Creates User + OTP → Sends verification email
  ↓
Returns userId (unverified)
```

#### 2. OTP Verification
```
POST /auth/verify
  ↓
VerifyUserUsecase
  ↓
Validates OTP → Activates user
  ↓
Returns access + refresh tokens
```

#### 3. Login
```
POST /auth/login
  ↓
LoginUserUsecase
  ↓
Validates credentials
  ↓
Returns JWT tokens (access + refresh)
```

#### 4. Token Refresh
```
POST /auth/refresh
  ↓
RefreshTokenUsecase
  ↓
Validates refresh token
  ↓
Issues new access token
```

### JWT Token Structure

**Access Token Payload** (Minimal):
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "roleId": "507f191e810c19729de860ea"
}
```

**Refresh Token Payload**:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "refresh"
}
```

> **Note**: Permissions are NOT stored in JWT tokens. They are resolved dynamically from the database on each request for security and real-time permission updates.

### Authorization Flow

#### Permission Resolution

```
Incoming Request with JWT
  ↓
RolesPermissionsGuard extracts userId
  ↓
Fetches User from database
  ↓
Fetches Permissions via RolePermissionRepository
  ↓
Attaches user + permissions to request object
  ↓
Controller validates permissions
```

#### Getting User Profile with Permissions

```
GET /auth/me (authenticated)
  ↓
GetMeUsecase
  ↓
1. Fetch user by userId from JWT
2. Fetch permissions via user.roleId
  ↓
Returns: { user, role, permissions[] }
```

### Guards & Decorators

**RolesPermissionsGuard** (`src/infrastructure/middlewares/role-guard.middleware.ts`):
- Validates JWT token
- Fetches user from database
- Resolves permissions dynamically
- Attaches `req.user` with full context

**Usage**:
```typescript
@UseGuards(RolesPermissionsGuard)
@Get('protected-endpoint')
async getProtectedData(@Request() req) {
  // req.user contains: { id, email, role, permissions }
  return this.service.getData(req.user);
}
```

## Database Schema

### Core Models

#### User
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  name: string,
  roleId: ObjectId (ref: Role),
  teamId?: ObjectId (ref: Team),
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

#### Role
```typescript
{
  _id: ObjectId,
  name: string (unique),
  code: string (unique, indexed),
  description?: string,
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

> **Important**: The `permissions` field has been **removed** from the Role model. Permissions are now managed through the RolePermission junction table.

#### Permission
```typescript
{
  _id: ObjectId,
  name: string (unique),
  code: string (unique, indexed),
  description?: string,
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

#### RolePermission (Junction Table)
```typescript
{
  _id: ObjectId,
  roleId: ObjectId (ref: Role, indexed),
  permissionId: ObjectId (ref: Permission, indexed),
  createdAt: Date,
  updatedAt: Date
}

// Compound Unique Index: (roleId + permissionId)
```

**Why Junction Table?**
- Proper many-to-many relationship normalization
- Efficient querying with compound indexes
- Allows permissions to be shared across roles
- Eliminates data duplication
- Enables real-time permission changes

#### Team
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

#### OTP (One-Time Password)
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  code: string,
  expiresAt: Date,
  verified: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Database Indexes

**User**:
- `email` (unique)

**Role**:
- `name` (unique)
- `code` (unique)

**Permission**:
- `name` (unique)
- `code` (unique)

**RolePermission**:
- `roleId` (for finding permissions by role)
- `permissionId` (for finding roles by permission)
- `(roleId, permissionId)` compound unique (prevents duplicate assignments)

## API Reference

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "roleId": "507f191e810c19729de860ea"
}

Response: 201 Created
{
  "userId": "507f1f77bcf86cd799439011"
}
```

#### Verify OTP
```http
POST /auth/verify
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "code": "123456"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "active"
  },
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "Admin",
    "code": "ADMIN"
  },
  "permissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Create User",
      "code": "USER_CREATE"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Delete User",
      "code": "USER_DELETE"
    }
  ]
}
```

### Role Management Endpoints

#### Create Role
```http
POST /roles
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Manager",
  "code": "MANAGER",
  "description": "Project manager role",
  "permissionIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}

Response: 201 Created
{
  "id": "507f191e810c19729de860ea",
  "name": "Manager",
  "code": "MANAGER",
  "description": "Project manager role",
  "status": "active",
  "createdAt": "2026-02-20T10:00:00.000Z"
}
```

#### Get Roles
```http
GET /roles
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "roles": [
    {
      "id": "507f191e810c19729de860ea",
      "name": "Admin",
      "code": "ADMIN",
      "status": "active"
    }
  ]
}
```

#### Update Role
```http
PUT /roles/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Senior Manager",
  "code": "SENIOR_MANAGER",
  "description": "Updated description",
  "permissionIds": ["507f1f77bcf86cd799439012"]
}

Response: 200 OK
{
  "id": "507f191e810c19729de860ea",
  "name": "Senior Manager",
  "code": "SENIOR_MANAGER",
  "updatedAt": "2026-02-20T11:00:00.000Z"
}
```

#### Delete Role
```http
DELETE /roles/:id
Authorization: Bearer {accessToken}

Response: 204 No Content
```

### Permission Management Endpoints

#### Create Permission
```http
POST /permissions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Create User",
  "code": "USER_CREATE",
  "description": "Allows creating new users"
}

Response: 201 Created
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Create User",
  "code": "USER_CREATE",
  "status": "active"
}
```

#### Get Permissions
```http
GET /permissions
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "permissions": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Create User",
      "code": "USER_CREATE",
      "status": "active"
    }
  ]
}
```

### User Management Endpoints

#### Create User
```http
POST /users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "Jane Doe",
  "roleId": "507f191e810c19729de860ea",
  "teamId": "507f1f77bcf86cd799439014"
}

Response: 201 Created
```

#### Get Users
```http
GET /users
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "users": [...]
}
```

#### Update User
```http
PUT /users/:id
Authorization: Bearer {accessToken}

Response: 200 OK
```

#### Delete User
```http
DELETE /users/:id
Authorization: Bearer {accessToken}

Response: 204 No Content
```

## Development Setup

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 5.x
- Redis >= 6.x
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project-management-tool
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**

Create `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/project-management
MONGODB_DATABASE=project-management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=your-access-token-secret-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email (for OTP)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=email-password
EMAIL_FROM=noreply@example.com

# OTP
OTP_EXPIRATION_MINUTES=10
```

4. **Start MongoDB and Redis**

Using Docker Compose:
```bash
cd dev
docker-compose up -d
```

Or manually:
```bash
# MongoDB
mongod --dbpath /path/to/data

# Redis
redis-server
```

5. **Run the application**

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

### Testing

Run unit tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

### Docker Deployment

Build the Docker image:
```bash
docker build -t project-management-tool .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env project-management-tool
```

## Project Structure

```
project-management-tool/
├── src/
│   ├── adapters/              # External interfaces
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── presenters/        # Response formatters
│   │   └── clients/           # External service clients
│   │
│   ├── application/           # Use cases
│   │   └── usecases/
│   │       ├── auth/          # Authentication use cases
│   │       ├── user/          # User management
│   │       ├── roles/         # Role management
│   │       ├── permissions/   # Permission management
│   │       └── otp/           # OTP verification
│   │
│   ├── domain/                # Core business logic
│   │   ├── users/             # User entity
│   │   ├── roles/             # Role entity
│   │   ├── permissions/       # Permission entity
│   │   ├── role-permissions/  # Junction entity
│   │   ├── teams/             # Team entity
│   │   └── otp/               # OTP entity
│   │
│   ├── infrastructure/        # Technical implementations
│   │   ├── database/          # MongoDB schemas & models
│   │   ├── cache/             # Redis cache
│   │   ├── modules/           # NestJS modules
│   │   ├── middlewares/       # Guards & middleware
│   │   ├── helpers/           # Utilities
│   │   └── dependency-injection/  # DI symbols
│   │
│   ├── config/                # Configuration files
│   ├── types/                 # TypeScript type definitions
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
│
├── test/                      # E2E tests
├── docs/                      # Documentation
├── dev/                       # Development tools
│   └── docker-compose.yaml    # Local dev environment
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Key Design Decisions

### 1. Minimal JWT Payload
**Decision**: Store only `userId`, `email`, and `roleId` in JWT tokens.

**Rationale**:
- Reduces token size
- Prevents stale permissions (permissions are fetched fresh on each request)
- Improves security (permissions can be revoked immediately)
- Eliminates need to reissue tokens when permissions change

### 2. RolePermission Junction Table
**Decision**: Use a separate collection for role-permission associations.

**Rationale**:
- Proper database normalization (3NF)
- Efficient querying with compound indexes
- Supports many-to-many relationship
- Allows permission reuse across multiple roles
- Easier to audit permission changes

### 3. Server-Side Permission Resolution
**Decision**: Fetch permissions from database on each request.

**Rationale**:
- Real-time permission updates
- No cached/stale permission data
- Centralized authorization logic
- Better audit trail
- Trade-off: Slight performance overhead (mitigated by database indexing)

### 4. Clean Architecture Implementation
**Decision**: Strict layer separation with dependency inversion.

**Rationale**:
- Testability (business logic independent of frameworks)
- Maintainability (clear boundaries between layers)
- Flexibility (easy to swap implementations)
- Scalability (organized codebase)

### 5. Symbol-Based Dependency Injection
**Decision**: Use string symbols instead of class tokens.

**Rationale**:
- Decouples interface from implementation
- Easier to mock in tests
- Prevents circular dependencies
- Follows SOLID principles

## Migration Guide

### Migrating from Embedded Permissions to Junction Table

If you have existing data with permissions embedded in roles, run this migration:

```javascript
// migration-role-permissions.js
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/project-management');
  
  const Role = mongoose.model('Role');
  const Permission = mongoose.model('Permission');
  const RolePermission = mongoose.model('RolePermission');
  
  const roles = await Role.find().populate('permissions');
  
  for (const role of roles) {
    if (role.permissions && role.permissions.length > 0) {
      const rolePermissions = role.permissions.map(permission => ({
        roleId: role._id,
        permissionId: permission._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await RolePermission.insertMany(rolePermissions);
      console.log(`Migrated ${rolePermissions.length} permissions for role: ${role.name}`);
    }
  }
  
  console.log('Migration complete');
  await mongoose.disconnect();
}

migrate().catch(console.error);
```

## Security Considerations

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **JWT Secrets**: Use strong, random secrets for access and refresh tokens
3. **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
4. **Permission Validation**: All protected endpoints validate permissions server-side
5. **OTP Security**: OTPs expire after 10 minutes and are single-use
6. **Environment Variables**: Sensitive data stored in environment variables, never in code

## Performance Optimization

1. **Database Indexes**: All frequently queried fields are indexed
2. **Compound Index**: RolePermission has compound index on (roleId, permissionId)
3. **Redis Caching**: Frequently accessed data cached in Redis
4. **Minimal JWT**: Smaller tokens = faster transmission
5. **Connection Pooling**: MongoDB and Redis use connection pools

## Troubleshooting

### Common Issues

**Issue**: MongoDB connection timeout
```
Solution: Check MongoDB is running and MONGODB_URI is correct
```

**Issue**: JWT token invalid
```
Solution: Ensure JWT secrets match between token generation and validation
```

**Issue**: Permissions not loading
```
Solution: Verify RolePermission records exist in database
```

**Issue**: Circular dependency errors
```
Solution: Module dependencies use forwardRef() for circular references
```

## Contributing

1. Follow Clean Architecture principles
2. Write unit tests for use cases
3. Update documentation for API changes
4. Use conventional commits
5. Ensure all tests pass before submitting PR

## License

[Your License Here]
