# Task Management API

Backend for the Mayfair Worktops Full Stack Developer take-home assignment.

The API provides JWT-based authentication, protected task CRUD operations, filtering and sorting, dashboard statistics, validation, centralized error handling, rate limiting, automated integration tests, seed data, and Swagger/OpenAPI documentation.

> **AI assistance used:** ChatGPT was used during development for architecture discussion, implementation guidance, and code review. All implementation decisions and code should be understood and explainable by the developer.

## Tech Stack

- **Runtime:** Node.js 22
- **Language:** TypeScript
- **Framework:** Express 5
- **Database:** MongoDB
- **ODM:** Mongoose 9
- **Validation:** Zod
- **Authentication:** JWT using `jose`
- **Password hashing:** bcrypt
- **Security:** Helmet, CORS, express-rate-limit
- **Testing:** Vitest, Supertest, mongodb-memory-server
- **API documentation:** OpenAPI 3.1 + Swagger UI
- **Code quality:** ESLint + Prettier

## Features

- User registration and login
- JWT-based authentication
- Protected task routes
- Create, read, update, and delete tasks
- Filter tasks by status and priority
- Sort tasks by due date or creation date
- Dashboard statistics:
  - total task count
  - task counts grouped by status
  - overdue task count
- Task ownership enforcement
- Standardized API response structure
- Centralized error handling
- Zod request validation
- Global and authentication-specific rate limiting
- MongoDB indexes for common task query patterns
- Seed script for demo data
- Integration tests against an isolated in-memory MongoDB instance
- Interactive Swagger documentation

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── swagger.ts
│   ├── constants/
│   │   └── task.constants.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── middlewares/
│   │   ├── authenticate.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validate.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── tasks/
│   │   └── users/
│   ├── scripts/
│   │   └── seed.ts
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── auth.test.ts
│   ├── tasks.test.ts
│   ├── global-setup.ts
│   └── setup.ts
├── .env.example
├── eslint.config.js
├── .prettierrc.json
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

The backend uses a **feature-based layered architecture**.

```text
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
Mongoose
  ↓
MongoDB
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the design rationale.

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- MongoDB locally, or a MongoDB Atlas connection string

### Install dependencies

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Example:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task_management
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=1h
```

| Variable | Description |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | HTTP server port |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS |
| `JWT_SECRET` | Secret used to sign and verify JWT access tokens |
| `JWT_EXPIRES_IN` | JWT lifetime, e.g. `1h` |

The project uses Node's native `--env-file` support instead of the `dotenv` package.

## Running the API

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Health check:

```http
GET /api/health
```

Default local URL:

```text
http://localhost:5000
```

## API Response Contract

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

Validation failures may also include `error.details`.

## Authentication

Protected endpoints require:

```http
Authorization: Bearer <access_token>
```

The token is returned by successful registration and login.

### Auth Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive an access token |

Example body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

## Task Endpoints

All Task endpoints require authentication.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks` | Get the authenticated user's tasks |
| `GET` | `/api/tasks/:task_id` | Get one owned task |
| `PATCH` | `/api/tasks/:task_id` | Partially update an owned task |
| `DELETE` | `/api/tasks/:task_id` | Delete an owned task |
| `GET` | `/api/tasks/dashboard` | Get dashboard statistics |

### Create Task Example

```json
{
  "title": "Finish frontend",
  "description": "Complete dashboard UI",
  "priority": "high",
  "due_date": "2026-08-15",
  "status": "in_progress"
}
```

Allowed values:

```text
priority: low | medium | high
status:   to_do | in_progress | done
```

`due_date` may be a valid ISO date/date-time or `null`.

### Filtering and Sorting

```http
GET /api/tasks?status=in_progress
GET /api/tasks?priority=high
GET /api/tasks?status=to_do&priority=high
GET /api/tasks?sort_by=due_date&sort_order=asc
GET /api/tasks?sort_by=created_at&sort_order=desc
```

Allowed sorting fields:

```text
due_date
created_at
```

Allowed order:

```text
asc
desc
```

## Dashboard

```http
GET /api/tasks/dashboard
```

Example response data:

```json
{
  "total_tasks": 5,
  "by_status": {
    "to_do": 2,
    "in_progress": 2,
    "done": 1
  },
  "overdue_tasks": 1
}
```

A task is overdue when:

- `due_date` is not `null`
- `due_date` is before the current time
- `status` is not `done`

## Swagger / OpenAPI

With the backend running, interactive API documentation is available at:

```text
http://localhost:5000/api/docs
```

Use the **Authorize** button to provide a JWT and test protected endpoints.

The OpenAPI definition uses a relative server URL, so the same documentation can work locally and after deployment.

## Database Design

### User

```text
_id
email
password_hash
created_at
updated_at
```

- `email` is trimmed and normalized to lowercase.
- `email` has a unique index.
- `password_hash` is excluded from normal queries by default.
- Plain-text passwords are never stored.

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

Persisted application fields use **snake_case**.

`due_date` is stored as either a `Date` or `null` for a predictable document shape.

### Indexes

Task compound indexes support the actual query patterns:

```text
user_id + status
user_id + priority
user_id + due_date
user_id + created_at
```

`user_id` is first because all task access is scoped to the authenticated user.

## Security

Implemented protections include:

- bcrypt password hashing
- JWT signature and expiration validation
- JWT issuer and audience validation
- Bearer-token authentication middleware
- task ownership checks at the database-query level
- password hashes excluded from API responses
- strict Zod request validation
- unknown request fields rejected
- CORS origin restriction
- Helmet security headers
- request-body size limit
- global API rate limiting
- stricter login and registration rate limiting
- centralized application/database error handling
- MongoDB unique index for email
- bcrypt input-length validation

The frontend never supplies trusted task ownership. The authenticated `user_id` comes from the verified JWT.

## Seed Data

Run:

```bash
npm run seed
```

Demo account:

```text
Email:    demo@example.com
Password: DemoPassword123!
```

The seed script creates example tasks covering multiple priorities, statuses, due dates, and an overdue case.

It is disabled in production and only resets Tasks belonging to the demo user.

## Testing

Run all tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

The suite uses Vitest, Supertest, and `mongodb-memory-server`.

Coverage includes:

- registration
- duplicate registration
- login
- invalid credentials
- validation errors
- authentication protection
- task creation
- task ownership isolation
- filtering
- sorting
- partial updates
- deletion
- dashboard statistics
- overdue calculation

## Code Quality

Type checking:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Auto-fix:

```bash
npm run lint:fix
```

Format:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

Full backend verification:

```bash
npm run verify
```

The `verify` script runs type checking, linting, formatting checks, tests, and the production build.

## Architecture Highlights

- Feature-based organization
- Thin controllers
- Business logic in services
- Persistence isolated in repositories
- Constructor-based dependency injection
- Zod validation at the HTTP boundary
- Mongoose validation at the persistence boundary
- Centralized error handling
- DTO-style response mapping
- Task ownership enforced in repository queries
- MongoDB aggregation for dashboard statistics
- Express 5 async error forwarding, so no custom `handleTryCatch` wrapper is required

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Deployment Notes

For deployment:

1. Use MongoDB Atlas or another reachable MongoDB instance.
2. Set production environment variables.
3. Set `CLIENT_ORIGIN` to the deployed frontend URL.
4. Configure proxy/trust settings according to the deployment platform if required for client-IP rate limiting.
5. Run `npm run build`.
6. Start with `npm start`.

Never commit `.env` or real secrets.
