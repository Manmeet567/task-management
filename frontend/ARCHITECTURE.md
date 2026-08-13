# Frontend Architecture

## 1. Overview

The TaskFlow frontend is a React + TypeScript single-page application built with Vite.

Its responsibilities include authentication UI, protected navigation, dashboard presentation, task CRUD interaction, filtering and sorting, List/Kanban views, drag-and-drop status updates, form validation, server-state caching, persistent UI preferences, theming, responsiveness, and user feedback states.

The architecture intentionally separates **server state**, **client state**, **API communication**, **form logic**, **feature components**, and **shared UI**.

## 2. Main Technology Choices

### React + TypeScript

React provides component-based UI composition. TypeScript adds static guarantees for component props, application state, API payloads, and form models.

### Vite

Vite provides the development server and production build pipeline.

### React Router

Public routes:

```text
/login
/register
```

Authenticated routes are nested under:

```text
ProtectedRoute
└── AppLayout
    ├── /
    └── /tasks
```

`ProtectedRoute` controls frontend navigation UX. Backend JWT middleware remains the actual security boundary.

### TanStack Query

TanStack Query manages **server state**:

- Task collections
- Dashboard statistics
- Mutations
- Cache invalidation
- Optimistic Kanban updates

Remote API data is not duplicated into Zustand.

### Zustand

Zustand manages small pieces of global client state:

- Authentication state
- Theme preference
- Toast state
- List / Board preference

Temporary filters, modal state, and selected-task state remain local to their owning page/components.

### React Hook Form + Zod

React Hook Form manages form state and submission.

Zod provides runtime validation.

Custom controls such as `Select` and `DatePicker` integrate through `Controller`.

## 3. Source Organization

```text
src/
├── api/
│   └── client.ts
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx
│   └── ui/
│       ├── DatePicker.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       ├── ThemeToggle.tsx
│       └── Toast.tsx
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── tasks/
│       ├── api/
│       ├── components/
│       │   ├── board/
│       │   ├── list/
│       │   ├── modals/
│       │   └── shared/
│       ├── pages/
│       ├── task.schema.ts
│       ├── task.types.ts
│       ├── task.utils.ts
│       └── task-view.store.ts
├── lib/
│   └── query-client.ts
├── routes/
│   └── ProtectedRoute.tsx
├── stores/
│   ├── auth.store.ts
│   ├── theme.store.ts
│   └── toast.store.ts
├── test/
│   ├── render.tsx
│   └── setup.ts
├── types/
│   └── api.types.ts
├── App.tsx
├── main.tsx
└── index.css
```

The rule is:

> Generic components belong in shared folders; feature-specific components stay inside their feature.

For example:

```text
Generic Modal
→ src/components/ui/

Task Detail Modal
→ src/features/tasks/components/modals/
```

## 4. API Layer

`src/api/client.ts` centralizes:

- API base URL
- JSON handling
- Bearer token attachment
- standardized API envelope parsing
- API error normalization
- unauthorized-response handling

Feature APIs build on top:

```text
TasksPage
   ↓
task.api.ts
   ↓
api/client.ts
   ↓
Express API
```

The API base URL is configured through:

```env
VITE_API_URL=
```

## 5. Server State

TanStack Query owns data fetched from the backend.

Typical query keys:

```text
["dashboard"]
["tasks", filters]
```

Task mutations invalidate:

```text
["tasks"]
["dashboard"]
```

so task views and dashboard counts stay synchronized.

## 6. Optimistic Kanban Flow

The Kanban board uses `@dnd-kit/react`.

Only task status is persisted; the backend does not store manual item positions.

Status changes follow:

```text
Drop task
   ↓
Cancel relevant in-flight query
   ↓
Snapshot current cache
   ↓
Optimistically update task status
   ↓
PATCH backend
   ↓
Success → reconcile/refetch
Failure → rollback snapshot
```

This gives immediate feedback without pretending that intra-column ordering is persisted.

## 7. State Ownership

### Authentication

Zustand stores:

- current user
- access token
- authenticated state

The API client clears auth state when the backend returns an unauthorized response.

### Theme

Theme preference is persisted and applied through a root dark-mode class.

### Task View

List / Board preference is persisted because it is a user preference.

### Toasts

Toast state is global but transient and is not persisted.

### Local State

Temporary filters, open/closed modals, and selected task remain local to the relevant route/component.

## 8. Task Form Architecture

`TaskFormModal` is reused for create and edit flows.

The form keeps UI-friendly values and converts them for the API when necessary.

Example:

```text
UI:
due_date = ""

API:
due_date = null
```

The custom date picker prevents users from newly choosing past dates while allowing an already-overdue task's existing date to remain visible during editing.

## 9. Responsive Design

The application uses responsive layouts for desktop, tablet, and mobile.

Important decisions:

- Fixed desktop sidebar
- Animated mobile drawer
- Mobile List/Board + New Task controls
- Collapsible mobile filters
- Responsive dashboard/task grids
- Horizontal Kanban scrolling on narrow screens
- Responsive modals

Kanban horizontal scrolling is intentional; page-level horizontal overflow is not.

## 10. Theme System

The frontend uses semantic design tokens such as:

```text
background
surface
surface-muted
primary
accent
text
text-muted
border
```

Components depend on semantic roles instead of hardcoded color values.

This makes light and dark themes consistent and keeps priority/status colors separate from brand colors.

## 11. Motion and Accessibility

Motion is restrained and used to communicate state changes.

Examples:

- Sidebar slide/fade
- Modal fade/scale
- Select/date-picker popup transitions
- Toast entrance/exit
- Filter expansion
- Small hover transitions

Animations primarily use `transform` and `opacity`.

A global `prefers-reduced-motion` rule reduces or removes motion for users who request it.

## 12. Code Splitting

Route-level pages are lazy loaded with React `lazy` and `Suspense`.

Conceptually:

```text
Initial bundle
   ↓
Load page chunk when route is visited
```

This reduces the amount of page code required at first load.

## 13. Error Handling

The frontend provides controlled states for:

- Loading
- Empty data
- Query failure
- Retry
- Mutation failure
- Toast feedback
- Unauthorized API responses

The goal is graceful recovery instead of crashes.

## 14. Testing

Frontend tests use:

- Vitest
- jsdom
- React Testing Library
- user-event
- jest-dom

A reusable test renderer provides:

- `MemoryRouter`
- isolated `QueryClient`
- user-event setup

Important tested behavior includes:

- protected-route redirects
- authenticated protected-route rendering
- auth validation
- successful auth-state update
- overdue-task logic
- task card interaction boundaries
- task schema validation

Browser APIs missing from jsdom, such as `matchMedia`, are stubbed in test setup.

## 15. Security Boundary

Frontend route protection is UX, not authorization.

The backend enforces security.

Frontend responsibilities include:

- attaching JWTs through the centralized API client
- clearing auth state on unauthorized responses
- keeping backend secrets out of frontend code
- validating forms before submission

The take-home implementation persists the access token in client storage. A larger production system could consider secure HttpOnly cookies depending on deployment and CSRF requirements.

## 16. Deployment

Production build:

```bash
npm run build
```

Vite outputs:

```text
dist/
```

Firebase Hosting serves the SPA.

SPA rewrites ensure direct navigation to routes such as `/tasks`, `/login`, and `/register` resolves to `index.html`, after which React Router handles routing.

Production flow:

```text
User Browser
     │
     ▼
Firebase Hosting
React SPA
     │
     │ HTTPS REST
     ▼
Render
Express API
     │
     ▼
MongoDB Atlas
```

## 17. Architectural Principles

### Single Responsibility

Each module has a narrow concern.

```text
api/client.ts
→ shared HTTP behavior

task.api.ts
→ Task API calls

TasksPage.tsx
→ route-level orchestration

TaskCard.tsx
→ card presentation and interaction
```

### Separation of Concerns

The architecture separates:

```text
server state
client state
form state
temporary UI state
API transport
presentation
```

### Reusability

Generic UI components remain independent from Task-specific business behavior.

### Clear Dependency Direction

Feature code depends on shared infrastructure, while shared infrastructure does not depend on individual features.

### Explicit State Ownership

Different state categories are assigned to the tool that best fits them rather than forcing all state into one solution.

## 18. Trade-offs and Future Improvements

With more time:

- Playwright end-to-end tests
- broader accessibility testing
- persistent Kanban ordering
- CI/CD quality gates
- visual regression tests
- secure cookie-based authentication
- error-monitoring integration
- expanded component/integration coverage
