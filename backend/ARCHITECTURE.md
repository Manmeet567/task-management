# Backend Architecture

## Overview

The backend uses **Node.js 22, TypeScript, Express 5, MongoDB, and Mongoose**. The architecture is intentionally clean and layered without adding enterprise-level abstractions that are unnecessary for a focused take-home project.

The main goal is to separate HTTP handling, business logic, persistence, validation, authentication, and infrastructure while keeping related feature files close together.

The project therefore uses a **feature-based layered architecture**.

```text
Request
  ↓
Route
  ↓
Middleware / Validation
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Mongoose Model
  ↓
MongoDB
```

The main modules are:

```text
auth
users
tasks
```

Shared concerns such as environment configuration, error handling, authentication middleware, validation middleware, rate limiting, types, and utilities live outside the feature modules.

## Folder Structure Rationale

```text
src/
├── config/
├── constants/
├── errors/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── tasks/
│   └── users/
├── scripts/
├── types/
├── utils/
├── app.ts
└── server.ts
```

### Feature-based organization

Instead of placing every controller in a global `controllers/` folder and every service in a global `services/` folder, related files are grouped by feature.

For example:

```text
tasks/
├── task.controller.ts
├── task.model.ts
├── task.repository.ts
├── task.routes.ts
├── task.service.ts
└── task.validation.ts
```

This keeps feature boundaries clear and makes navigation easier as the codebase grows.

### `app.ts` and `server.ts`

`app.ts` configures the Express application:

- global middleware
- security middleware
- routes
- Swagger UI
- not-found handling
- global error handling

`server.ts` handles application startup:

- environment validation
- MongoDB connection
- HTTP server startup

The HTTP listener starts only after the database connects successfully. This is a **fail-fast startup strategy**.

Separating application configuration from server startup also lets Supertest import the Express app without opening a real network port.

## Layer Responsibilities

### Routes

Routes define HTTP methods, URLs, middleware order, and controller handlers.

They do not contain business logic.

Example:

```text
PATCH /api/tasks/:task_id
  ↓
authenticate
  ↓
validate task_id
  ↓
validate request body
  ↓
TaskController.update
```

### Controllers

Controllers are intentionally thin. They:

- read validated HTTP request data
- obtain the authenticated user ID
- call services
- return the standardized response envelope

Controllers do not hash passwords, generate JWTs, or query MongoDB directly.

### Services

Services contain application/business behavior.

Examples:

- registration and login flow
- task creation
- task lookup
- task update/delete behavior
- `TASK_NOT_FOUND` handling
- dashboard fallback when a user has zero tasks

Keeping business logic in services reduces coupling to Express and Mongoose.

### Repositories

Repositories are the persistence layer.

They contain Mongoose operations such as:

```text
findOne
findOneAndUpdate
findOneAndDelete
aggregate
```

The service instead calls domain-oriented operations such as:

```text
findByEmail
findByIdForUser
updateByIdForUser
getDashboardByUser
```

This is the **Repository Pattern**.

It keeps database-specific code out of services and controllers.

### Models

Mongoose models define document structure, defaults, validation, relationships, and indexes.

Models provide a second validation layer even though incoming HTTP data is already validated with Zod. This is **defense in depth**.

## SOLID and Clean-Code Decisions

### Single Responsibility Principle

Each layer has one primary responsibility:

```text
Controller  → HTTP handling
Service     → business logic
Repository  → persistence
Model       → database structure
Middleware  → request processing
```

### Open/Closed Principle

Features are separated enough that additional filters, routes, middleware, or service operations can be added without rewriting unrelated layers.

### Liskov Substitution Principle

The project intentionally avoids artificial inheritance hierarchies because they are unnecessary here. SOLID is applied where it improves the design rather than forcing every principle into the codebase.

### Interface Segregation Principle

Small TypeScript input/output types are used around specific operations instead of one oversized application-wide interface.

### Dependency Injection / Dependency Inversion

Controllers receive services, and services receive repositories, through constructors.

```text
TaskController
    ↓
TaskService
    ↓
TaskRepository
```

Classes do not construct all their own dependencies internally. This keeps dependencies explicit and improves testability.

## API Response Contract

All endpoints use a consistent response envelope.

Success:

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {},
  "error": null
}
```

Failure:

```json
{
  "success": false,
  "message": "Task not found",
  "data": null,
  "error": {
    "code": "TASK_NOT_FOUND"
  }
}
```

Human-readable messages are separated from machine-readable error codes so the frontend does not need to compare error-message strings.

## Validation Strategy

### Zod

Zod validates:

- request bodies
- route parameters
- query parameters
- environment variables

Strict schemas reject unknown request fields.

For example, clients cannot provide trusted Task `user_id`; ownership comes only from the verified JWT.

Zod also provides TypeScript type inference, giving one source of truth for runtime validation and compile-time types.

### Mongoose

Mongoose provides validation at the persistence boundary.

Update operations use Mongoose validators as an additional safeguard.

### MongoDB

The unique email index provides the final database-level guarantee against duplicate accounts, including concurrent-registration race conditions.

## Authentication Flow

### Registration

```text
POST /api/auth/register
    ↓
Zod validation
    ↓
check existing email
    ↓
bcrypt password hashing
    ↓
create User
    ↓
generate JWT
    ↓
return authenticated user data
```

### Login

```text
POST /api/auth/login
    ↓
Zod validation
    ↓
find User including password_hash
    ↓
bcrypt comparison
    ↓
generate JWT
    ↓
return authenticated user data
```

The API returns the same `INVALID_CREDENTIALS` error whether the email is unknown or the password is wrong, reducing account-enumeration information leakage.

### JWT design

The User ID is stored in the standard `sub` claim.

Tokens also include:

```text
iat → issued at
exp → expiration
iss → issuer
aud → audience
```

Verification checks the signature, expiration, allowed algorithm, issuer, and audience.

JWT payloads do not contain sensitive information because JWTs are signed rather than encrypted.

## Authorization and Task Ownership

Authentication answers:

> Who is making the request?

Authorization answers:

> Can this user access this Task?

The client never supplies trusted ownership information.

```text
Bearer JWT
   ↓
authentication middleware
   ↓
req.auth.user_id
```

Every owned-resource database operation includes both the Task ID and authenticated User ID.

Conceptually:

```text
_id = requested task
AND
user_id = authenticated user
```

This prevents one user from reading, updating, or deleting another user's task even if they know another Task's MongoDB ID.

A missing task and another user's task both return `TASK_NOT_FOUND`, avoiding unnecessary resource-existence disclosure.

## Database Schema Design

### User

```text
_id
email
password_hash
created_at
updated_at
```

Important decisions:

- email is trimmed and lowercased
- email has a unique index
- `password_hash` uses `select: false`
- timestamps use snake_case
- plain-text passwords are never stored

### Task

```text
_id
user_id
title
description
priority
due_date
status
created_at
updated_at
```

Application-controlled persisted fields use **snake_case**.

Allowed priorities:

```text
low
medium
high
```

Allowed statuses:

```text
to_do
in_progress
done
```

`due_date` is stored as either a `Date` or `null`, keeping Task documents predictable when no due date exists.

The relationship is one-to-many:

```text
User
 ├── Task
 ├── Task
 └── Task
```

`user_id` stores the owning User's MongoDB ObjectId.

## Indexing Strategy

Indexes were chosen from real application query patterns rather than indexing every field.

Task compound indexes include:

```text
user_id + status
user_id + priority
user_id + due_date
user_id + created_at
```

`user_id` is the leading field because every task query is scoped to an authenticated user.

These indexes support required status/priority filtering and due-date/creation-date sorting.

Indexes improve reads but increase storage and write cost, so fields without a required query pattern are deliberately not indexed.

## Dashboard Aggregation

Dashboard statistics are calculated inside MongoDB using an aggregation pipeline rather than loading every task into Node.js.

```text
$match
  ↓
$group
  ↓
$project
```

`$match` limits documents to the authenticated user.

`$group` calculates:

- total tasks
- `to_do`
- `in_progress`
- `done`
- overdue tasks

A task is overdue when:

```text
due_date != null
AND
due_date < current time
AND
status != done
```

MongoDB returns one compact statistics object to the application.

## Error Handling

Expected application errors use a custom `AppError`.

Examples:

```text
EMAIL_ALREADY_EXISTS
INVALID_CREDENTIALS
AUTHENTICATION_REQUIRED
INVALID_TOKEN
TASK_NOT_FOUND
VALIDATION_ERROR
```

A centralized Express error middleware converts errors into the standard API response shape.

It also normalizes:

- MongoDB duplicate-key errors
- Mongoose validation errors
- Mongoose cast errors
- unknown internal errors

Unexpected errors are logged, while API clients receive a generic `INTERNAL_SERVER_ERROR` rather than internal implementation details.

Express 5 automatically forwards rejected async route-handler promises to error middleware. Therefore, a separate `handleTryCatch`/async-wrapper middleware was intentionally not added.

## Security

Security is layered:

```text
Helmet
CORS
JSON body-size limit
Zod allowlist validation
bcrypt
JWT verification
issuer/audience validation
global rate limiting
stricter login/register rate limiting
unique indexes
task ownership enforcement
password_hash query exclusion
centralized error handling
```

bcrypt input length is validated to respect bcrypt's byte limit.

The current rate limiter uses an in-memory store because the assignment is designed around a single backend instance. A horizontally scaled production deployment would use a shared store such as Redis.

Proxy configuration is intentionally left deployment-specific because incorrect `trust proxy` settings can break IP-based rate limiting.

## Testing Strategy

The primary automated tests are **integration tests**.

Tools:

```text
Vitest
Supertest
mongodb-memory-server
```

Tests call the real Express application and pass through:

```text
middleware
controller
service
repository
Mongoose
temporary MongoDB
```

The in-memory MongoDB instance isolates tests from local and production data.

Collections are cleaned after each test to prevent shared state between test cases.

The suite covers authentication, CRUD, authorization, filtering, sorting, dashboard statistics, and overdue-task logic.

## Seed Strategy

The development seed script:

- is disabled in production
- creates or resets a demo account
- clears only that demo user's tasks
- creates tasks with varied statuses, priorities, and due-date scenarios

This makes the seed process safe to rerun during development without wiping unrelated data.

## API Documentation

The API is described using **OpenAPI 3.1** and exposed through Swagger UI at:

```text
/api/docs
```

The documentation covers authentication, Task CRUD, filtering/sorting, dashboard statistics, request schemas, and JWT bearer authentication.

A relative OpenAPI server URL allows the same documentation definition to work locally and after deployment.

## Trade-offs

### Repository layer

Calling Mongoose directly from services would require fewer files, but the repository layer was kept because it:

- clearly separates persistence from business logic
- centralizes Task ownership queries
- improves maintainability and testability
- demonstrates the architecture quality requested by the assignment

No generic `BaseRepository`, repository factory, or dependency-injection container was added because that would be unnecessary complexity for this project.

### JWT access tokens

The assignment requires JWT-based authentication, so the backend uses short-lived access tokens.

A larger production system might additionally implement refresh tokens, rotation, revocation, and HttpOnly-cookie storage. These were intentionally excluded to keep the take-home focused.

### In-memory rate limiting

The current store is appropriate for a single backend instance. Multiple instances would require a shared store.

### MongoDB

MongoDB fits the simple User-to-Task ownership model and does not require complex relational joins. Mongoose still provides controlled schemas, validation, indexes, and ObjectId references.

### Central OpenAPI definition

Swagger/OpenAPI configuration is kept in a centralized file instead of adding large documentation comments to each route. This preserves readable route files and keeps documentation concerns separate from request routing.

## Summary

The backend aims for a practical balance of:

```text
clean architecture
+
SOLID-oriented separation
+
strong validation
+
secure authentication/authorization
+
efficient MongoDB queries
+
automated integration testing
```

while deliberately avoiding abstractions or infrastructure that do not add clear value to the assignment.
