# AI Knowledge Base & Guide

## Business Overview
This project is a Role-Based Project Management System designed to allow organizations to manage teams, projects, and boards with granular access control. The system provides fine-grained, dynamic permissions scoped to specific resources (e.g., a user can be an Admin of a specific Project but only a Viewer of another).

## Project Goals
- Provide secure, scalable, and isolated project management capabilities.
- Ensure strict separation of concerns using Clean Architecture.
- Maintain high performance using asynchronous processing (queues) and caching.

## Architecture Explanation
The application is built on **NestJS** and structured using **Clean Architecture**:
1. **Domain**: The innermost layer containing business rules (Entities).
2. **Application**: Use Cases that execute business logic using Domain rules.
3. **Adapters**: Controllers (API endpoints) and Presenters (response mappers).
4. **Infrastructure**: External concerns like MongoDB, Redis, and NestJS Modules.

## Module Interactions
- `AuthModule` orchestrates `UserModule`, `OtpModule`, and `RolesModule` for authentication.
- `BoardsModule` interacts with `ProjectsModule` to validate parent project constraints.
- `MembershipsModule` acts as the pivot for cross-cutting access control (assigning Roles to Users for specific Scopes like Teams or Projects).

## Authentication & Authorization
- **Auth**: JWT-based (Access + Refresh tokens). Tokens carry the `userId` and `roleId`.
- **Authorization**: Managed via a junction table (`RolePermission`). Permissions are dynamically resolved per request by the `RolesPermissionsGuard` using the database, meaning they are NOT statically stored in JWTs. This allows immediate revocation of privileges.
- **Decorators**: `@Roles(RoleCode...)` and `@Permissions(PermissionCode...)` are used on controller endpoints.

## Request Lifecycle
1. HTTP Request enters NestJS.
2. `RolesPermissionsGuard` validates JWT, fetches User, and resolves Permissions.
3. Controller extracts payload and invokes the relevant Application Use Case.
4. Use Case retrieves Entities via Repositories (Infrastructure).
5. Repository queries MongoDB, maps the Document to a Domain Entity, and returns it.
6. Use Case applies logic, saves via Repository, and returns to Controller.
7. Controller formats response via Presenter.

## Database & Caching
- **Database**: MongoDB (Mongoose ODM). Collections include `users`, `roles`, `permissions`, `role_permissions`, `teams`, `projects`, `boards`, `memberships`, `otps`.
- **Caching**: Redis is used to reduce DB load (e.g., caching frequently accessed permissions).

## Background Processing (Events & Realtime)
- **Queues (BullMQ)**: Offloads heavy tasks. Example: Email sending during user registration.
- **Realtime (Socket.io)**: Facilitates instant updates across connected clients (module is stubbed in `realtime.module.ts`).

## Current Project Limitations
- Circular dependencies exist in some module DI configurations (e.g., `UserModule` and `AuthModule`), currently bypassed using `forwardRef`.
- `RolesPermissionsGuard` performs multiple DB queries per request, which can become a performance bottleneck under high load.

## Future Extension Points
- Implementing robust caching mechanisms within the `RolesPermissionsGuard`.
- Fully fleshing out the `RealtimeModule` to push board/task updates to clients.
- Expanding the domain hierarchy downward (e.g., adding `Tasks`, `Columns`, `Comments` inside Boards).
