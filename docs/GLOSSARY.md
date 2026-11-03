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
| **Column** | A visual lane inside a Board (e.g., To Do, In Progress, Done). It has no workflow state of its own; it displays the Statuses mapped to it. |
| **Status** | A project-scoped workflow state (e.g., `todo`, `testing`, `done`) with a name, code, color and order. Shared by every Board of the Project; one Status per Project is the default for new Cards. |
| **ColumnStatus** | The mapping of a Status onto a Column. A Column can hold many Statuses; a Status belongs to at most one Column per Board. |
| **Workflow** | Project-scoped set of allowed Statuses plus the transitions between them. The project's default Workflow governs all its Cards; projects without one are unrestricted. |
| **Workflow Transition** | A one-way rule `fromStatusId -> toStatusId` inside a Workflow. A two-way transition is two rules. |
| **Board Status** | The lifecycle of a Board itself (`active` / `archived`), unrelated to card workflow. |
| **Card** | A single actionable task or work item contained within a Column on a Board. It always has one Status, which must be mapped to its Column. It can include an assignee, assigner, and story-point estimate. |
| **Assignee** | The user currently responsible for completing a task or card. |
| **Assigner** | The user who assigned or delegated a task to another team member. |
| **Story Points** | A relative estimate of the effort or complexity required to complete a task. |
| **OTP** | One-Time Password. A temporary, 6-digit code sent via email to verify user ownership during registration. |
| **Symbol-based DI** | The practice of using `Symbol.for('Token')` to wire up interfaces to their concrete implementations inside NestJS modules, preventing hard-coupling. |
| **Mapper** | A utility class in the Infrastructure layer that converts Mongoose Documents into pure Domain Entities, and vice versa. |
