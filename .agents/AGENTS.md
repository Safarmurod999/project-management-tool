# Project Management Tool - AI Directives

This document is the primary instruction file for any AI coding assistant (GitHub Copilot Agent, Codex, Claude Code, Cursor, Gemini CLI, etc.) working on this repository. Read and follow these directives strictly.

## Project Overview
A role-based project management system implementing Clean Architecture principles with NestJS, MongoDB (Mongoose), Redis (caching and queues via BullMQ), and JWT-based authentication.

## Architecture Summary
The system adheres to Clean Architecture, separated into 4 distinct layers with strict dependency rules pointing inward:
1. **Domain Layer**: Core business entities (`*Struct`), interfaces for Repositories and Factories, and domain-specific exceptions.
2. **Application Layer**: Business Use Cases orchestrating domain logic.
3. **Adapters Layer**: Controllers (REST endpoints), Presenters (mapping Domain -> DTOs), and external clients.
4. **Infrastructure Layer**: Framework-specific setup (NestJS Modules), Database (Mongoose Models/Schemas/Mappers), Caching, Middlewares, and Dependency Injection setup using Symbol-based tokens.

## Project Conventions
- **Naming**: Use kebab-case for files/directories. 
- **Folder Structure**: Clean Architecture folders (`src/domain`, `src/application`, `src/adapters`, `src/infrastructure`). Inside each, features are grouped by module (e.g., `boards`, `projects`).

## Coding Conventions
- **Types**: Use strict TypeScript. Avoid `any`.
- **DI**: Use Symbol-based Dependency Injection (defined in `src/infrastructure/dependency-injection`). Never use string tokens.
- **Mappers**: Infrastructure models (`Mongoose Document`) MUST be mapped to Domain Entities (`Structs`) before passing to the Application layer using Mapper classes.
- **Exports**: Always use `index.ts` files (barrel exports) to expose public API of a folder.

## Dependency & Layer Rules
- **Domain Layer** MUST NOT depend on *anything* outside itself (no NestJS, no Mongoose, no external libraries).
- **Application Layer** depends ONLY on the Domain layer.
- **Adapters Layer** depends on Domain and Application layers.
- **Infrastructure Layer** depends on all other layers and contains framework-specific code.

## Business Logic Rules
- Controllers MUST NOT contain business logic. They strictly extract request payloads, call a Use Case, and pass the result to a Presenter.
- Mongoose Models/Schemas MUST NOT leak outside the Infrastructure layer.

## Validation & Error Handling
- Validations occur at the edge (DTOs with class-validator/class-transformer) and inside Domain Factories.
- Throw Domain-specific exceptions (e.g., `UserNotFoundException`) from the Domain/Application layers.
- Catch these exceptions in Controllers and return standard HTTP statuses.

## Security Rules (AI MUST NEVER BREAK)
- **Role-Based Access Control (RBAC)**: All endpoints (except public ones) MUST use `@Roles()` and `@Permissions()` decorators alongside the `RolesPermissionsGuard`.
- **Dynamic Permissions**: Permissions are resolved dynamically from the database, not hardcoded in the JWT token.
- **Password Hashing**: Passwords MUST always be hashed using `bcrypt` before storing.

## Performance Expectations
- Minimize database queries inside loops.
- Avoid circular dependency injection (`forwardRef` in NestJS is a code smell here).
- Heavy tasks (e.g., email sending) MUST be offloaded to BullMQ queues.

## AI Coding Workflow
1. Read the relevant feature folder across all 4 layers before modifying.
2. Verify DI symbols exist before injecting them.
3. Add or update the corresponding Use Case when implementing new logic.
4. Ensure all models map cleanly to Domain objects.

## AI Review Checklist
- [ ] Are the changes confined to the correct Clean Architecture layer?
- [ ] Are DI symbols correctly mapped and injected?
- [ ] Is the endpoint secured with the correct Role/Permission decorators?
- [ ] Is the codebase free of circular dependencies?
- [ ] Have DTOs and Presenters been updated to reflect domain changes?
