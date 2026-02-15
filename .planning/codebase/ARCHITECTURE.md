# Architecture

**Analysis Date:** 2026-02-15

## Pattern Overview

**Overall:** Next.js Full-Stack Web Application with Server Components, API Routes, and Client-Side State Management

**Key Characteristics:**
- Next.js 16.1 App Router with route groups for layout organization
- Server-side authentication with Supabase Server Client
- Client-side data fetching with TanStack Query for client-side caching and synchronization
- Separated concerns: server-rendered layouts, client-rendered pages with hooks, API route handlers
- Strong type safety with Zod validation schemas and TypeScript database types
- Supabase Row-Level Security (RLS) for data access control

## Layers

**UI/Presentation Layer:**
- Purpose: Render user interface components, handle user interactions, manage local component state
- Location: `components/` directory
- Contains: React components organized by feature (rooms, tenants, layout, ui)
- Depends on: React, hooks, Tailwind CSS, shadcn/ui primitives
- Used by: Page components in `app/` directory

**Page/Route Layer:**
- Purpose: Define route structure, orchestrate data fetching, control navigation flow
- Location: `app/` directory following Next.js App Router conventions
- Contains: Route groups `(auth)` and `(dashboard)`, page components, API routes
- Depends on: Next.js framework, component layer, hooks, server utilities
- Used by: Next.js router and client browsers

**Hooks/Data Layer:**
- Purpose: Encapsulate data fetching logic, manage query/mutation state with TanStack Query
- Location: `hooks/` directory
- Contains: Custom React hooks using useQuery and useMutation patterns
- Depends on: TanStack Query, fetch API, validation schemas
- Used by: Client-rendered page components and components

**API Route Layer:**
- Purpose: Handle HTTP requests, validate inputs, manage business logic, interact with database
- Location: `app/api/` directory with route groups
- Contains: Route handlers for /api/rooms, /api/tenants, /api/properties endpoints
- Depends on: Supabase server client, Zod validation schemas, error utilities
- Used by: Client-side hooks and external integrations

**Data/Database Layer:**
- Purpose: Represent data structures, provide type safety for database operations
- Location: `lib/types/database.ts` and `lib/validations/` schemas
- Contains: TypeScript types from Supabase database schema, Zod validation schemas
- Depends on: Zod for runtime validation, Supabase types
- Used by: All other layers for type safety

**Server Utilities Layer:**
- Purpose: Provide server-only utilities for authentication and database access
- Location: `lib/supabase/` directory
- Contains: Supabase client initialization for server and middleware
- Depends on: Supabase SDK, Next.js cookies API
- Used by: API routes, server components

**Configuration Layer:**
- Purpose: Environment validation, configuration management
- Location: `lib/env.ts`
- Contains: Environment variable schema and validation using t3-oss/env-nextjs
- Depends on: t3-oss/env-nextjs, process environment
- Used by: Application bootstrap and all layers requiring config

## Data Flow

**Room CRUD Flow:**

1. User interacts with `RoomList` component (presentation layer)
2. Component calls `useRooms()` hook to fetch data (hooks layer)
3. Hook makes HTTP GET request to `/api/rooms` with query parameters
4. API route handler in `app/api/rooms/route.ts` receives request
5. Handler verifies user authentication with Supabase server client
6. Handler builds dynamic query with filters (property_id, status, search)
7. Supabase RLS policies filter results to user's data only
8. Handler returns paginated rooms data with 200 status or error response
9. Hook receives response, TanStack Query caches result
10. Component subscribes to query state, re-renders with data
11. User triggers action (create/edit/delete)
12. Component calls mutation hook (useCreateRoom, useUpdateRoom, useDeleteRoom)
13. Mutation sends POST/PUT/DELETE to appropriate API route
14. API route validates payload with Zod schema
15. Handler verifies authorization (user owns property/room)
16. Handler performs database operation via Supabase client
17. Handler returns result (201 created, 200 success) or error (400, 403, 409)
18. Mutation hook displays toast notification and invalidates query cache
19. TanStack Query re-fetches data automatically, component re-renders

**Authentication Flow:**

1. Unauthenticated user visits `/dashboard` route
2. Dashboard layout (`app/(dashboard)/layout.tsx`) is a server component
3. Server component calls `createServer()` to initialize Supabase server client
4. Server component calls `supabase.auth.getUser()` to check session
5. If user not authenticated, `redirect('/login')` to auth layout
6. User fills login form on `app/(auth)/login/page.tsx`
7. Form submission calls server action `login()` from `app/(auth)/actions.ts`
8. Server action creates Supabase server client and calls `signInWithPassword()`
9. Supabase sets secure HTTP-only cookies via cookie store
10. Middleware (`middleware.ts`) runs on every request, updates session cookies
11. Next request to `/dashboard` finds valid session, allows access
12. Dashboard layout renders with header, sidebar, and page content

## Key Abstractions

**API Response Format:**
- Purpose: Standardize all API responses for consistency and error handling
- Examples: `lib/utils/api-error.ts` defines ApiErrorResponse and ApiSuccessResponse interfaces
- Pattern: Every response follows `{ data: T }` or `{ error: { code, message, details? } }` structure with appropriate HTTP status codes

**Validation Schemas:**
- Purpose: Provide runtime type checking and automatic error details at request boundaries
- Examples: `lib/validations/room.ts`, `lib/validations/tenant.ts`
- Pattern: Zod schemas defined for create, update, query parameters with translated error messages; schemas generate TypeScript types via type inference

**Query Key Factory:**
- Purpose: Centralize cache key generation for TanStack Query to prevent key mismatches
- Examples: `hooks/useRooms.ts` exports `roomKeys` object with `all`, `lists()`, `list(params)`, `details()`, `detail(id)` functions
- Pattern: Hierarchical key structure allows granular cache invalidation (e.g., invalidate all room lists without clearing detail queries)

**Database Type Aliases:**
- Purpose: Create convenient type references for database operations and provide type safety
- Examples: `Room`, `Tenant`, `Property` exported from `lib/types/database.ts` mapped from Supabase schema
- Pattern: Generated types from Supabase plus custom union types (RoomStatus, BillStatus, UserRole) and extended types with relations (RoomWithTenant, RoomWithDetails)

**Error Handler Utilities:**
- Purpose: Convert various error types (ZodError, Supabase errors) into consistent API responses
- Examples: `handleZodError()`, `handleSupabaseError()`, and pre-built `errors` object in `lib/utils/api-error.ts`
- Pattern: Centralized mapping of error codes to HTTP status, database error codes, and user-friendly Vietnamese messages

**Form Hook with React Hook Form:**
- Purpose: Manage form state, validation, and submission with minimal boilerplate
- Examples: `components/rooms/RoomForm.tsx`, `components/tenants/TenantForm.tsx` using `useForm()` and `useFormContext()`
- Pattern: Forms validated against Zod schema, errors rendered inline, submission triggers mutation hook

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Application startup, loads in all routes
- Responsibilities: Wraps entire app with providers (Providers component), imports global CSS, configures metadata

**Providers Component:**
- Location: `components/providers.tsx`
- Triggers: Loaded by root layout on every page
- Responsibilities: Initializes TanStack QueryClient, wraps with QueryClientProvider and devtools

**Dashboard Layout (Protected Route):**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: User navigation to /dashboard or nested routes
- Responsibilities: Verifies authentication, redirects to login if needed, renders dashboard shell with sidebar and header

**Auth Layout (Public Route):**
- Location: `app/(auth)/layout.tsx`
- Triggers: User navigation to /login or /signup
- Responsibilities: Renders centered card layout for login/signup forms

**Middleware:**
- Location: `middleware.ts`
- Triggers: Every incoming request
- Responsibilities: Updates Supabase session cookies, maintains authentication state across requests

**API Route Handlers:**
- Location: `app/api/rooms/route.ts`, `app/api/tenants/route.ts`, `app/api/properties/route.ts` and [id] variants
- Triggers: Client-side fetch requests from hooks
- Responsibilities: Authenticate user, validate input, authorize operation, execute database query, return response

## Error Handling

**Strategy:** Multi-layered error handling with consistent response format and user-facing messages

**Patterns:**

- **Route Handler Level:** Try-catch wraps entire handler, catches ZodError and Supabase errors separately, returns standardized ApiErrorResponse with appropriate HTTP status
- **Validation Level:** Zod schemas automatically parse and throw ZodError with field-level details, handleZodError() converts to 400 response with field messages
- **Database Level:** Supabase errors mapped to application error codes (23505 unique violation → CONFLICT 409, PGRST116 no rows → NOT_FOUND 404)
- **Authorization Level:** Explicit checks for user.id match or property/room ownership, return FORBIDDEN 403 or NOT_FOUND 404
- **Hook Level:** Mutation errors caught in onError callback, toasts.error() displays message to user
- **Component Level:** Try-catch in form submission, disabled buttons during pending state
- **Vietnamese Messages:** All error messages translated to Vietnamese for user-facing display (validation, auth, db errors)

## Cross-Cutting Concerns

**Logging:**
- Console.error() in API routes for debugging database and business logic errors
- Error stack traces logged server-side, error code and message sent to client
- No sensitive data (passwords, tokens) logged

**Validation:**
- Zod schemas at request boundaries (route handlers) validate all input
- Schema definitions live in `lib/validations/` organized by entity (room.ts, tenant.ts, property.ts)
- Form validation on client side during editing, schema validation on server side before database write

**Authentication:**
- Supabase Auth (session-based with secure HTTP-only cookies)
- Middleware refreshes session on every request
- Server components check `supabase.auth.getUser()` before rendering protected content
- All API routes check auth before processing, return 401 if missing user

**Authorization:**
- Row-level security (RLS) policies in Supabase database enforce user_id matching
- API routes perform explicit authorization checks (user owns property, room belongs to property, etc.)
- Rooms filtered by `property.user_id = user.id`, tenants filtered via room → property → user relationship

---

*Architecture analysis: 2026-02-15*
