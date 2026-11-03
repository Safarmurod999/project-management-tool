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

## Why project-scoped Statuses separate from Columns?
Columns used to double as workflow states, and cards carried a hard-coded `CardStatus` enum. Teams need different workflows and several statuses per lane (e.g. "In Progress" showing `in_progress`, `pending`, `testing`). Statuses are therefore records owned by a Project and reused by all its Boards; Columns are purely visual and display the statuses mapped to them via `ColumnStatus`. `BoardStatus` keeps describing only the board lifecycle.

## Why is `boardId` stored on ColumnStatus?
The rule "a status belongs to only one column per board" spans two collections (column -> board). Copying `boardId` onto the mapping lets MongoDB enforce it with a unique `{ boardId, statusId }` index instead of relying on application checks that can race. It is persistence-only and not part of the domain entity; columns with mappings cannot change board.

## Why a TransactionManager with implicit sessions?
Several operations write related records together (project + statuses, board + columns + mappings, column delete + mappings, card reorder). `TransactionManager.run()` wraps them in a MongoDB transaction, and Mongoose's `transactionAsyncLocalStorage` binds every repository call inside it to the session, so repository signatures did not need a session parameter. Transactions require a replica set: on a standalone `mongod` (typical local setup) the work runs non-transactionally and a warning is logged once.

## Why does the project's default Workflow govern cards (and not a per-board workflow)?
Workflows belong to a project. Cards find their workflow through column -> board -> project -> default workflow, so neither Board nor Card stores a workflow reference and no Board change or data migration was needed. A project may keep several workflows (e.g. to prepare a new one) but only the default is enforced. Per-board workflows can be added later with a `workflowId` on Board that falls back to the default.

## Why are projects without a workflow unrestricted?
Existing projects have no workflow. Enforcing an empty workflow would block every status change, and seeding one would have to guess the allowed transitions. Enforcement therefore starts when a project's first workflow is created, which makes it the default.

## Why is a transition a one-way rule?
"Two-way" is two independent permissions that teams often want to remove separately (e.g. allow `testing -> done` but not back). Storing one record per direction keeps the check a single indexed lookup on `{ workflowId, fromStatusId, toStatusId }`; the API offers `bidirectional` only as a shortcut for creating both.

## Why is the card transition written through the reorder flow?
A status decides the card's column (a status sits in one column per board), so a transition is a move. `TransitionCardUsecase` validates the rule and delegates to `ReorderCardUsecase`, which re-validates and writes inside a transaction. The repository re-checks the card's status inside that write (`expectedStatusId`) so a concurrent change cannot slip in between validation and update.

## Why Mappers?
Mongoose Documents carry heavy framework-specific methods (`.save()`, `.populate()`). By mapping them to pure TypeScript objects (Domain Entities/Structs) via `Mappers`, we ensure the Application layer remains completely ignorant of the fact that MongoDB is being used.
