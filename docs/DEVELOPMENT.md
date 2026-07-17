# Development Workflow

Follow this step-by-step workflow when implementing a new feature in this repository.

## 1. Analyze Existing Code
- Read the relevant `docs/` and `src/domain/` contracts to understand the feature's boundaries.
- Identify if the feature requires a new module or extends an existing one.
- Review existing abstractions (Base Repositories, Exceptions, Mappers) to reuse logic.

## 2. Design the Domain (Inner Layer)
- Define or update the Entity structure in `src/domain/{module}/entity.ts`.
- Define or update Domain Exceptions in `src/domain/{module}/exception.ts`.
- Define or update the Repository Interface in `src/domain/{module}/repository.ts`.
- Ensure NO external libraries are imported into the Domain layer.

## 3. Implement the Application (Use Cases)
- Create a new Use Case interface and implementation in `src/application/usecases/{module}/{feature}/`.
- Write the business logic, orchestrating Domain factories and Repositories.
- Export the new Use Case via `index.ts`.

## 4. Implement Infrastructure (Database & Framework)
- Create or update the Mongoose Schema/Model in `src/infrastructure/database/mongodb/schemas/` and `models/`.
- Update the Mapper to map the Mongoose Document to the Domain Entity in `src/infrastructure/database/mongodb/mappers/`.
- Implement the concrete Repository class.
- Define the new DI Symbol in `src/infrastructure/dependency-injection/usecases/symbol.ts`.

## 5. Implement Adapters (Controllers & Presenters)
- Create the Presenter to map the Use Case output to an API response format in `src/adapters/presenters/{module}/`.
- Define Request DTOs (if applicable).
- Create or update the Controller in `src/adapters/controllers/{module}.controller.ts`.
- Inject the Use Case and Presenter using their DI Symbols.
- Decorate the endpoint with `@Roles()` and `@Permissions()`.

## 6. Wire the Module
- Open `src/infrastructure/modules/{module}/{module}.module.ts`.
- Provide the new Use Case and Presenter inside the `providers` array, mapping them to their DI Symbols.

## 7. Write Tests
- Create a `{usecase}.spec.ts` file alongside the Use Case implementation.
- Mock the Repositories and verify business logic handles success and exception paths.
- Run tests via `npm run test`.

## 8. Update Documentation
- Ensure `docs/API.md` is updated with the new endpoint request/response payloads.
- Update `postman-collection.json` if applicable.

## 9. Perform Self-Review
- Compile the code (`npm run build`).
- Verify Clean Architecture boundaries (Domain does not import NestJS).
- Check for circular dependencies (avoid `forwardRef` if possible).
