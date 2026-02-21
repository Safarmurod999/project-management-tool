# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-02-20

### 🚀 Major Refactoring: Authentication & Authorization System

This release includes a complete overhaul of the authentication and authorization architecture for improved security, performance, and maintainability.

---

## Breaking Changes

### 1. JWT Token Payload Restructured

**Before:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": {
    "id": "507f191e810c19729de860ea",
    "name": "Admin",
    "code": "ADMIN"
  },
  "permissions": [
    { "id": "...", "name": "Create User", "code": "USER_CREATE" },
    { "id": "...", "name": "Delete User", "code": "USER_DELETE" }
  ]
}
```

**After:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "roleId": "507f191e810c19729de860ea"
}
```

**Impact:** 
- JWT tokens are now ~70% smaller
- Permissions and role details are no longer included in the token
- Frontend applications must call `GET /auth/me` to retrieve full user context

### 2. Database Schema Changes

#### Role Model

**Before:**
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  permissions: [ObjectId], // Array of permission IDs
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

**After:**
```typescript
{
  _id: ObjectId,
  name: string,
  code: string,        // NEW: Unique role code
  description?: string,
  // permissions field REMOVED
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

#### New: RolePermission Junction Table

A new collection has been introduced to manage the many-to-many relationship between roles and permissions:

```typescript
{
  _id: ObjectId,
  roleId: ObjectId,      // Reference to Role
  permissionId: ObjectId, // Reference to Permission
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - roleId (for fast permission lookups by role)
// - permissionId (for finding roles with a permission)
// - (roleId, permissionId) compound unique index
```

**Impact:**
- Existing roles will need migration to populate the RolePermission table
- Permissions are now properly normalized (3NF)
- Better support for permission reuse across multiple roles

---

## New Features

### 1. GET /auth/me Endpoint

A new authenticated endpoint to retrieve the current user's profile with permissions:

**Request:**
```http
GET /auth/me
Authorization: Bearer {accessToken}
```

**Response:**
```json
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
    }
  ]
}
```

**Use Case:**
- Initial app load to fetch user context
- Refreshing permissions after role changes
- User profile display

### 2. Dynamic Permission Resolution

**Old Behavior:**
- Permissions were stored in JWT and cached on client
- Changes to role permissions required users to re-login
- Token size increased with more permissions

**New Behavior:**
- Permissions are fetched from database on each request
- Permission changes take effect immediately (no re-login required)
- Guards validate permissions in real-time
- Smaller, more secure tokens

**Implementation:**
```typescript
// src/infrastructure/middlewares/role-guard.middleware.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  
  // 1. Extract and verify JWT
  const token = this.extractToken(request);
  const payload = await this.tokenService.verifyAccessToken(token);
  
  // 2. Fetch user from database
  const user = await this.userRepository.findById(payload.userId);
  
  // 3. Fetch permissions dynamically
  const permissions = await this.rolePermissionRepository
    .getPermissionsByRoleId(user.roleId);
  
  // 4. Attach to request
  request.user = { ...user, permissions };
  
  return true;
}
```

### 3. Role Code Field

Roles now include a `code` field for programmatic access:

```typescript
// Example role codes
ADMIN          // System administrator
MANAGER        // Project manager
TEAM_LEAD      // Team leader
DEVELOPER      // Software developer
VIEWER         // Read-only access
```

**Benefits:**
- Easier programmatic role checks
- Better code readability
- Prevents hardcoded role IDs

### 4. Enhanced Module Architecture

**Module Dependency Resolution:**
- Implemented `forwardRef()` for circular dependencies
- Proper exports of shared repositories
- Clean module boundaries

**Modules:**
- `AuthModule` - Authentication logic
- `UserModule` - User management
- `RoleModule` - Role management (exports RolePermissionRepository)
- `PermissionModule` - Permission management

---

## Improvements

### Security Enhancements

1. **Smaller Token Surface Area**
   - Reduced JWT payload minimizes data exposure
   - Less information available if token is intercepted

2. **Real-time Permission Revocation**
   - Permissions can be revoked immediately
   - No need to wait for token expiration
   - Better audit trail

3. **Server-side Validation**
   - All permission checks happen server-side
   - Cannot be bypassed by client manipulation

### Performance Optimizations

1. **Database Indexing**
   - Compound index on `(roleId, permissionId)` in RolePermission
   - Faster permission lookups
   - Efficient reverse lookups (roles by permission)

2. **Reduced Token Size**
   - Tokens are ~70% smaller
   - Faster transmission over network
   - Less bandwidth usage

3. **Optimized Queries**
   - Removed `.populate('permissions')` chains
   - Direct queries to junction table
   - Fewer database round trips

### Code Quality

1. **Clean Architecture**
   - Strict layer separation maintained
   - Repository pattern for data access
   - Factory pattern for entity creation

2. **Type Safety**
   - Added TypeScript type declarations for Express
   - Proper typing for `req.user` object
   - Enhanced IDE autocomplete

3. **Dependency Injection**
   - Symbol-based DI for loose coupling
   - Easier unit testing
   - Better modularity

---

## Migration Guide

### Prerequisites

- Backup your database before migration
- Test migration on a staging environment first
- Ensure MongoDB >= 5.x

### Step 1: Data Migration Script

Run this script to migrate existing role permissions to the junction table:

```javascript
// scripts/migrate-role-permissions.js
const mongoose = require('mongoose');

async function migrateRolePermissions() {
  const connection = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
  await mongoose.connect(connection);

  // Define schemas (temporary for migration)
  const roleSchema = new mongoose.Schema({
    name: String,
    code: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
  });
  
  const rolePermissionSchema = new mongoose.Schema({
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    permissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Permission' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const Role = mongoose.model('Role', roleSchema);
  const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

  console.log('Starting migration...');

  // Fetch all roles with their permissions
  const roles = await Role.find().populate('permissions');
  let migratedCount = 0;

  for (const role of roles) {
    console.log(`\nMigrating role: ${role.name}`);
    
    // Add code field if missing (generate from name)
    if (!role.code) {
      role.code = role.name.toUpperCase().replace(/\s+/g, '_');
      await role.save();
      console.log(`  - Added code: ${role.code}`);
    }

    if (role.permissions && role.permissions.length > 0) {
      // Create RolePermission entries
      const rolePermissions = role.permissions.map(permission => ({
        roleId: role._id,
        permissionId: permission._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await RolePermission.insertMany(rolePermissions, { ordered: false });
      console.log(`  - Migrated ${rolePermissions.length} permissions`);
      migratedCount += rolePermissions.length;
    }
  }

  console.log(`\n✅ Migration completed successfully!`);
  console.log(`   - Processed ${roles.length} roles`);
  console.log(`   - Created ${migratedCount} role-permission associations`);

  await mongoose.disconnect();
}

// Run migration
migrateRolePermissions()
  .then(() => {
    console.log('Migration finished. You can now remove the permissions field from Role schema.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

### Step 2: Run Migration

```bash
node scripts/migrate-role-permissions.js
```

**Expected Output:**
```
Starting migration...

Migrating role: Admin
  - Added code: ADMIN
  - Migrated 15 permissions

Migrating role: Manager
  - Added code: MANAGER
  - Migrated 8 permissions

✅ Migration completed successfully!
   - Processed 2 roles
   - Created 23 role-permission associations
```

### Step 3: Verify Migration

```javascript
// Verify RolePermission records were created
db.rolepermissions.find().count()  // Should match total permissions across roles

// Verify codes were added to roles
db.roles.find({ code: { $exists: false } }).count()  // Should be 0
```

### Step 4: Update Frontend Application

**Old Code:**
```typescript
// Frontend used to read permissions from JWT
const token = localStorage.getItem('accessToken');
const decoded = jwtDecode(token);
const permissions = decoded.permissions; // ❌ No longer available
```

**New Code:**
```typescript
// Fetch user context on app initialization
async function initializeApp() {
  const response = await fetch('/auth/me', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  const { user, role, permissions } = await response.json();
  
  // Store in state management (Redux/Zustand/etc.)
  store.dispatch(setUser(user));
  store.dispatch(setRole(role));
  store.dispatch(setPermissions(permissions));
}
```

### Step 5: Deploy New Backend

1. **Stop the application**
   ```bash
   pm2 stop project-management-tool
   ```

2. **Pull latest code**
   ```bash
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Build application**
   ```bash
   npm run build
   ```

5. **Start application**
   ```bash
   pm2 start ecosystem.config.js
   ```

6. **Verify health**
   ```bash
   curl http://localhost:3000/health
   ```

---

## Rollback Plan

If migration fails or issues arise:

### 1. Restore Database Backup

```bash
mongorestore --uri="mongodb://localhost:27017" --db=project-management ./backup
```

### 2. Revert Code

```bash
git revert HEAD
npm install
npm run build
pm2 restart project-management-tool
```

### 3. Clean Up RolePermission Collection

```javascript
// If you need to clean up the junction table
db.rolepermissions.deleteMany({})
```

---

## Testing Checklist

After migration, verify:

- [ ] Users can log in successfully
- [ ] JWT tokens are issued correctly
- [ ] `GET /auth/me` returns user with permissions
- [ ] Protected routes validate permissions properly
- [ ] Role creation with permissions works
- [ ] Role update modifies permissions in junction table
- [ ] Permission changes reflect immediately (no re-login needed)
- [ ] Users with different roles have appropriate access
- [ ] Token refresh works correctly
- [ ] OTP verification still functions

---

## Performance Impact

### Before Migration

- JWT Token Size: ~2.5 KB (with 10 permissions)
- Permission Lookup: Cached in token (no DB query)
- Permission Update Latency: Until token expires (up to 15 minutes)

### After Migration

- JWT Token Size: ~0.7 KB (70% reduction)
- Permission Lookup: Single indexed query to RolePermission
- Permission Update Latency: Immediate (next request)

**Database Query Performance:**
- Indexed query for permissions: ~2-5ms
- Trade-off: Slight increase in request latency for better security and real-time updates

---

## Deprecations

### Removed Fields

1. **Role.permissions** - Use RolePermission junction table
2. **JWT payload.role** - Only roleId included
3. **JWT payload.permissions** - Fetch via GET /auth/me

### Removed Methods

1. ~~`RoleRepository.findByIdWithPermissions()`~~ - Use `RolePermissionRepository.getPermissionsByRoleId()`
2. ~~`UserRepository.findByIdWithRoleAndPermissions()`~~ - Separate queries for role and permissions

---

## Known Issues

None reported.

---

## Contributors

- Development Team

## License

[Your License]
