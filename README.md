# Project Management Tool

A scalable, role-based project management system built with **NestJS** and **Clean Architecture** principles.

## 🚀 Features

- ✅ **JWT Authentication** - Secure access & refresh token system
- ✅ **Role-Based Access Control (RBAC)** - Granular permission management
- ✅ **Clean Architecture** - Separation of concerns with domain-driven design
- ✅ **MongoDB + Redis** - NoSQL database with caching layer
- ✅ **OTP Verification** - Email-based user verification
- ✅ **Dynamic Permission Resolution** - Server-side permission validation
- ✅ **TypeScript** - Fully typed codebase

## 📚 Documentation

- **[Architecture Documentation](docs/ARCHITECTURE.md)** - Comprehensive technical documentation
- **[Real-time Guide](docs/REALTIME.md)** - Socket.IO usage
- **[Component Diagram](docs/component-diagram.puml)** - System architecture visualization
- **[Sequence Diagram](docs/sequence-diagram.puml)** - Authentication flow diagrams

## 🏗️ Architecture

```
┌──────────────┐
│  Adapters    │ ← Controllers, Presenters, Clients
└──────────────┘
       ↓
┌──────────────┐
│ Application  │ ← Use Cases, Business Logic
└──────────────┘
       ↓
┌──────────────┐
│   Domain     │ ← Entities, Repositories, Factories
└──────────────┘
       ↓
┌──────────────┐
│Infrastructure│ ← Database, Cache, Guards, Modules
└──────────────┘
```

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | NestJS |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| Authentication | JWT (jsonwebtoken) |
| Validation | class-validator |
| Documentation | PlantUML |

## 📋 Prerequisites

- Node.js >= 18.x
- MongoDB >= 5.x
- Redis >= 6.x
- npm or yarn

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
# Application
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/project-management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your-password

# OTP
OTP_EXPIRATION_MINUTES=10
```

### 3. Start Services

Using Docker Compose:
```bash
cd dev
docker-compose up -d
```

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/verify` | Verify OTP code |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Get current user with permissions |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| POST | `/users` | Create user | ✅ |
| PUT | `/users/:id` | Update user | ✅ |
| DELETE | `/users/:id` | Delete user | ✅ |

### Roles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/roles` | Get all roles | ✅ |
| GET | `/roles/:id` | Get role by ID | ✅ |
| POST | `/roles` | Create role with permissions | ✅ |
| PUT | `/roles/:id` | Update role | ✅ |
| DELETE | `/roles/:id` | Delete role | ✅ |

### Permissions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/permissions` | Get all permissions | ✅ |
| GET | `/permissions/:id` | Get permission by ID | ✅ |
| POST | `/permissions` | Create permission | ✅ |
| PUT | `/permissions/:id` | Update permission | ✅ |
| DELETE | `/permissions/:id` | Delete permission | ✅ |

> See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed API specifications.

## 🔑 Key Concepts

### Authentication Flow

1. **Register** → User signs up with email/password
2. **OTP Verification** → Email sent with verification code
3. **Verify** → User confirms OTP, receives JWT tokens
4. **Login** → Returns access + refresh tokens
5. **Access Protected Routes** → Use Bearer token

### Authorization

- **Minimal JWT**: Tokens contain only `userId`, `email`, `roleId`
- **Dynamic Permissions**: Fetched from database on each request
- **Real-time Updates**: Permission changes take effect immediately
- **Junction Table**: Normalized many-to-many role-permission relationship

### Database Schema

```
User ──┬──> Role ──> RolePermission ──> Permission
       │
       └──> Team
```

## 🗂️ Project Structure

```
src/
├── adapters/           # External interfaces (controllers, presenters)
├── application/        # Use cases (business logic)
├── domain/             # Entities & repository contracts
├── infrastructure/     # Technical implementations
│   ├── database/       # MongoDB schemas & models
│   ├── cache/          # Redis cache
│   ├── modules/        # NestJS DI modules
│   ├── middlewares/    # Guards & middleware
│   └── helpers/        # Utilities
├── config/             # Configuration files
└── types/              # TypeScript definitions
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Token expiration & refresh mechanism
- ✅ OTP verification for new accounts
- ✅ Server-side permission validation
- ✅ Role-based access control

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t project-management-tool .

# Run container
docker run -p 3000:3000 --env-file .env project-management-tool
```

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production MongoDB URI
- [ ] Set up Redis with password
- [ ] Configure email service (SMTP)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS whitelist
- [ ] Set up logging/monitoring

## 📝 Migration Guide

If migrating from an older version with embedded permissions in roles:

```javascript
// See docs/ARCHITECTURE.md for migration script
```

## 🤝 Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Update documentation
4. Use conventional commits
5. Ensure all tests pass

## 📄 License

[Your License Here]

---

**Built with ❤️ using NestJS**


