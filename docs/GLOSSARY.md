# Project Glossary

| Term | Definition (Project Context) |
|------|-------------------------------|
| **Clean Architecture** | A software design philosophy that separates concerns into layers (Domain, Application, Adapters, Infrastructure), ensuring business logic is independent of external agencies. |
| **Domain Entity** | A pure TypeScript class/object representing core business logic and rules, entirely stripped of database or framework decorators. |
| **Use Case** | A class inside the Application layer that orchestrates a specific business action (e.g., `CreateUserUsecase`). |
| **Presenter** | A class in the Adapters layer responsible for taking domain data and formatting it into a clean, safe DTO/Response format for API consumers. |
| **Role** | A global classification of a user's access level (e.g., `SUPER_ADMIN`, `MANAGER`). |
| **Permission** | A granular, specific action that a role allows (e.g., `BOARD_GET`, `USER_CREATE`). |
| **Membership (Scope-Based Role)** | A junction that assigns a specific User to a specific Role within a confined scope (Team, Project, or Board). This allows a user to be an Admin in one project but a standard Viewer in another. |
| **Team** | A grouping of Users working together. Owns one or multiple Projects. |
| **Project** | A high-level container for work, belonging to a Team. Owns one or multiple Boards. |
| **Board** | A specific workspace within a Project (e.g., a Kanban board or Sprint board). |
| **OTP** | One-Time Password. A temporary, 6-digit code sent via email to verify user ownership during registration. |
| **Symbol-based DI** | The practice of using `Symbol.for('Token')` to wire up interfaces to their concrete implementations inside NestJS modules, preventing hard-coupling. |
| **Mapper** | A utility class in the Infrastructure layer that converts Mongoose Documents into pure Domain Entities, and vice versa. |
