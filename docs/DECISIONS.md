# Architectural Decision Records (ADRs)

This document captures the architectural decisions made for the Project Management Tool.

## Why Clean Architecture?
To decouple the core business logic (Domain) from the framework and external services (Infrastructure). This allows for highly testable code, easy swapping of underlying technologies (e.g., changing the database), and prevents framework lock-in.

## Why NestJS?
NestJS provides a robust, opinionated structure out of the box. Its heavy reliance on decorators and Dependency Injection aligns perfectly with Clean Architecture paradigms, allowing us to build scalable enterprise applications with strict boundaries.

## Why MongoDB?
MongoDB provides schema flexibility, which is highly beneficial for a fast-evolving project management tool where entities like Tasks or Boards might require dynamic, user-defined fields in the future.

## Why BullMQ & Redis?
Email sending (via OTP registration) and other background tasks block the main Node.js event loop. BullMQ, backed by Redis, provides a robust, concurrent queueing system with automatic retries, ensuring immediate API responses while guaranteeing background task execution.

## Why Symbol-based Dependency Injection?
Using raw strings for DI tokens leads to typo-driven bugs. Using class references directly couples layers. Symbol-based DI (`Symbol.for('UserRepository')`) guarantees uniqueness and enforces loose coupling between the Domain/Application layers and the Infrastructure layer.

## Why Junction Tables for Role-Permissions?
Instead of embedding permissions directly into the Role document (which causes duplication and limits flexibility), the `role_permissions` junction table is used. This allows permissions to be shared across multiple roles and modified system-wide without updating massive arrays inside user or role documents.

## Why dynamic Permission resolution instead of JWT storage?
Storing permissions in the JWT means a user's permissions cannot be revoked until the token expires. By querying the database dynamically in the `RolesPermissionsGuard` for every request, the system guarantees real-time security revocation at the cost of a slight performance overhead.

## Why Mappers?
Mongoose Documents carry heavy framework-specific methods (`.save()`, `.populate()`). By mapping them to pure TypeScript objects (Domain Entities/Structs) via `Mappers`, we ensure the Application layer remains completely ignorant of the fact that MongoDB is being used.
