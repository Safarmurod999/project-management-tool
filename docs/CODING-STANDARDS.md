# Coding Standards & Conventions

## Folder & File Naming
- **Folders**: Use `kebab-case` (e.g., `role-permissions`, `dependency-injection`).
- **Files**: Use `kebab-case` with descriptive suffixes based on their layer (e.g., `user.controller.ts`, `create-user.usecase.ts`, `user.model.ts`).

## Type Naming Conventions
- **Classes**: `PascalCase` (e.g., `CreateUserUsecaseImpl`).
- **Interfaces**: `PascalCase`. Do NOT use the `I` prefix (e.g., `UserRepository`, not `IUserRepository`).
- **DTOs**: Suffix with `Dto` (e.g., `CreateUserDto`).
- **Domain Entities**: Suffix with `Struct` for the pure data interface (e.g., `UserStruct`) and use the base name for the Domain class (e.g., `User`).

## Architectural Implementations
- **Repositories**: Interface defined in `domain`, implementation in `infrastructure/database/mongodb`. Implementations MUST map Mongoose models back to Domain Entities using Mapper classes.
- **Services**: Use Application Use Cases instead of monolithic services. E.g., `CreateUserUsecase`, `FindUserByIdUsecase`.
- **Controllers**: Keep thin. Inject Use Cases and Presenters. Use `@Res()` and standard HTTP statuses for responses.
- **Mappers**: `Infrastructure -> Domain` and `Domain -> Infrastructure` mapping logic lives in `infrastructure/database/mongodb/mappers/`.

## Dependency Injection (DI)
- **DO NOT** inject using raw strings or class references across layers.
- **DO** use Symbol-based DI. Symbols are defined in `src/infrastructure/dependency-injection/`.
- Example: `@Inject(UsecaseSymbols.User.CreateUserUsecase) private readonly createUserUsecase: CreateUserUsecase`

## Validation
- Apply validation at the boundaries using `class-validator` and `class-transformer` on DTOs.
- Always apply internal business rule validation within Domain Factories (e.g., `UserFactory`).

## Exception Handling
- Throw specific custom exceptions extending `GlobalException` from the domain/application layers (e.g., `UserNotFoundException`).
- Catch these exceptions in Controllers. Return structured JSON responses explicitly mapping `error.statusCode` to HTTP status codes.

## Logging & Configuration
- **Logging**: Use the internal Logger abstraction (`winston` adapter). Avoid `console.log`.
- **Config**: Strict validation of environment variables via `src/config/`.

## Imports
- Use path mapping configured in `tsconfig.json` (e.g., `import { User } from 'src/domain'`).
- Export related files via `index.ts` (barrel files) to keep imports clean.

## Comments & Documentation
- **JSDoc**: Required for complex domain logic, public interfaces, and configuration classes.
- Do not state the obvious (e.g., `// Creates a user` above a `createUser` method). Document *why* something is done if it is a non-standard approach.
