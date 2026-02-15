# Codebase Structure

**Analysis Date:** 2026-02-15

## Directory Layout

```
rent-management/
├── app/                                # Next.js App Router - routes and API handlers
│   ├── (auth)/                        # Auth route group - public routes
│   │   ├── login/page.tsx            # Login page
│   │   ├── signup/                   # Signup page (planned)
│   │   ├── actions.ts                # Server actions for auth (login, signup)
│   │   └── layout.tsx                # Auth layout wrapper (centered card)
│   ├── (dashboard)/                   # Dashboard route group - protected routes
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard home page
│   │   │   ├── rooms/page.tsx        # Rooms management page
│   │   │   └── tenants/page.tsx      # Tenants management page
│   │   └── layout.tsx                # Dashboard layout (sidebar, header, auth check)
│   ├── api/                           # API routes
│   │   ├── rooms/
│   │   │   ├── route.ts              # GET list, POST create rooms
│   │   │   └── [id]/route.ts         # GET detail, PUT update, DELETE room
│   │   ├── tenants/
│   │   │   ├── route.ts              # GET list, POST create tenants
│   │   │   └── [id]/route.ts         # GET detail, PUT update, DELETE tenant
│   │   └── properties/
│   │       └── route.ts              # GET list, POST create properties
│   ├── page.tsx                       # Home/landing page
│   ├── layout.tsx                     # Root layout with providers
│   └── globals.css                    # Global styles
│
├── components/                        # React components organized by feature
│   ├── layout/                        # Layout components
│   │   ├── Header.tsx                # Top header bar with user menu
│   │   ├── Sidebar.tsx               # Desktop navigation sidebar
│   │   └── BottomNav.tsx             # Mobile bottom navigation
│   ├── rooms/                         # Room feature components
│   │   ├── RoomList.tsx              # Grid of room cards with loading skeletons
│   │   ├── RoomCard.tsx              # Individual room card component
│   │   ├── RoomForm.tsx              # Create/edit room form
│   │   └── RoomEmptyState.tsx        # Empty state when no rooms exist
│   ├── tenants/                       # Tenant feature components
│   │   ├── TenantList.tsx            # Grid of tenant cards with loading skeletons
│   │   ├── TenantCard.tsx            # Individual tenant card component
│   │   ├── TenantForm.tsx            # Create/edit tenant form
│   │   └── TenantEmptyState.tsx      # Empty state when no tenants exist
│   ├── ui/                            # UI primitives from shadcn/ui
│   │   ├── button.tsx                # Button with variants
│   │   ├── card.tsx                  # Card container
│   │   ├── input.tsx                 # Text input
│   │   ├── label.tsx                 # Form label
│   │   ├── select.tsx                # Dropdown select
│   │   ├── form.tsx                  # React Hook Form wrapper
│   │   ├── badge.tsx                 # Status badge
│   │   ├── dropdown-menu.tsx         # Dropdown menu
│   │   ├── skeleton.tsx              # Loading skeleton
│   │   └── sonner.tsx                # Toast notifications provider
│   └── providers.tsx                  # Root context providers (QueryClientProvider)
│
├── hooks/                             # Custom React hooks for data fetching
│   ├── useRooms.ts                   # Query and mutation hooks for rooms (useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom)
│   ├── useTenants.ts                 # Query and mutation hooks for tenants
│   └── useProperties.ts              # Query and mutation hooks for properties
│
├── lib/                               # Utilities and shared logic
│   ├── env.ts                        # Environment variable validation using t3-oss/env-nextjs
│   ├── utils.ts                      # General utility functions
│   ├── supabase/                     # Supabase client initialization
│   │   ├── server.ts                 # Server-side Supabase client (createServer)
│   │   ├── client.ts                 # Client-side Supabase client
│   │   └── middleware.ts             # Session update for middleware
│   ├── types/
│   │   └── database.ts               # TypeScript types from Supabase schema + aliases
│   ├── validations/                  # Zod validation schemas
│   │   ├── room.ts                   # Room schemas (create, update, query, form)
│   │   ├── tenant.ts                 # Tenant schemas (create, update, query)
│   │   └── property.ts               # Property schemas
│   └── utils/
│       ├── api-error.ts              # Error handling and standardized response formats
│       └── formatters.ts             # Data formatting utilities
│
├── public/                            # Static assets (images, icons, fonts)
├── supabase/                          # Supabase configuration and migrations
├── docs/                              # Project documentation
├── .planning/                         # GSD planning artifacts
│   └── codebase/                     # Codebase analysis documents
├── middleware.ts                      # Next.js middleware for session management
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies and scripts
├── next.config.ts                     # Next.js configuration
├── components.json                    # shadcn/ui configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── postcss.config.mjs                 # PostCSS configuration
└── .gitignore                         # Git ignore rules
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router file system routing structure
- Contains: Route groups, page components, API handlers, layouts, middleware
- Key files: `layout.tsx` (root), `page.tsx` (routes), `route.ts` (API endpoints), `actions.ts` (server actions)

**components/:**
- Purpose: Reusable React components organized by feature and UI primitives
- Contains: Feature-specific components (rooms, tenants), layout components, shadcn/ui primitives
- Key files: All `.tsx` files, organized with index.ts barrel files optional but not used

**hooks/:**
- Purpose: Custom React hooks encapsulating data fetching logic with TanStack Query
- Contains: useQuery hooks for fetching, useMutation hooks for create/update/delete operations
- Key files: One file per entity (useRooms.ts, useTenants.ts, useProperties.ts)

**lib/:**
- Purpose: Shared utilities, types, and configuration
- Contains: Database types, validation schemas, Supabase client initialization, error utilities
- Key files: `env.ts` (config), `types/database.ts` (types), `validations/*.ts` (schemas), `utils/api-error.ts` (error handling)

**lib/supabase/:**
- Purpose: Supabase client initialization and session management
- Contains: Server client (server.ts), client-side client (client.ts), middleware integration (middleware.ts)
- Key files: `server.ts` (used in API routes and server components), `client.ts` (client-side usage)

**lib/validations/:**
- Purpose: Zod validation schemas for all entities and API operations
- Contains: Input validation for create/update operations, query parameter validation, form schemas
- Key files: One file per entity matching database tables

**lib/utils/:**
- Purpose: Utility functions for common operations
- Contains: API error handling, data formatting, type utilities
- Key files: `api-error.ts` (error response builders), `formatters.ts` (date/currency formatting)

**public/:**
- Purpose: Static assets served by Next.js
- Contains: Images, icons, fonts used in application
- Key files: Organized in subdirectories by asset type

**supabase/:**
- Purpose: Supabase project configuration and database migrations
- Contains: Database schema migration files, Supabase configuration
- Key files: SQL migration files for schema setup

**docs/:**
- Purpose: Project documentation
- Contains: Technical requirements, product requirements, API documentation
- Key files: README.md files describing setup and features

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Landing/home page (public, no auth required)
- `app/layout.tsx`: Root layout with Providers
- `app/(auth)/login/page.tsx`: Login page
- `app/(dashboard)/dashboard/page.tsx`: Main dashboard
- `middleware.ts`: Runs on every request, handles session refresh

**Configuration:**
- `lib/env.ts`: Environment variable schema and validation
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript compiler configuration
- `next.config.ts`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `components.json`: shadcn/ui component registry

**Core Logic:**
- `app/api/rooms/route.ts`: Room CRUD endpoints
- `app/api/tenants/route.ts`: Tenant CRUD endpoints
- `app/api/properties/route.ts`: Property CRUD endpoints
- `hooks/useRooms.ts`: Room data fetching and mutations
- `hooks/useTenants.ts`: Tenant data fetching and mutations

**Database & Types:**
- `lib/types/database.ts`: TypeScript types from Supabase schema
- `lib/validations/room.ts`: Room validation schemas
- `lib/validations/tenant.ts`: Tenant validation schemas
- `lib/supabase/server.ts`: Server-side Supabase client initialization

**Error Handling:**
- `lib/utils/api-error.ts`: Standardized error responses, error mappers, success response builder

**Features:**
- `app/(dashboard)/dashboard/rooms/page.tsx`: Rooms management page
- `app/(dashboard)/dashboard/tenants/page.tsx`: Tenants management page
- `components/rooms/RoomList.tsx`: Room list with grid/loading/empty state
- `components/tenants/TenantList.tsx`: Tenant list with grid/loading/empty state

## Naming Conventions

**Files:**
- Component files: PascalCase, e.g., `RoomList.tsx`, `TenantCard.tsx`
- Hook files: camelCase with `use` prefix, e.g., `useRooms.ts`, `useTenants.ts`
- Utility files: camelCase, e.g., `api-error.ts`, `formatters.ts`
- Page files: `page.tsx` (Next.js convention)
- API route files: `route.ts` (Next.js convention)
- Layout files: `layout.tsx` (Next.js convention)
- Middleware: `middleware.ts` (Next.js convention)

**Directories:**
- Feature directories: plural nouns, lowercase, e.g., `components/rooms/`, `components/tenants/`, `hooks/`
- Route groups: parentheses, e.g., `app/(auth)/`, `app/(dashboard)/`
- Utility directories: plural nouns, lowercase, e.g., `lib/utils/`, `lib/supabase/`, `lib/validations/`

**TypeScript:**
- Interface names: PascalCase, e.g., `RoomWithTenant`, `ApiErrorResponse`
- Type aliases: PascalCase, e.g., `RoomStatus = 'vacant' | 'occupied'`
- Function names: camelCase, e.g., `createRoom()`, `fetchRooms()`, `handleZodError()`
- Variable names: camelCase, e.g., `roomId`, `isLoading`, `selectedRoom`

## Where to Add New Code

**New Feature (e.g., Bills Management):**
1. **Database Types:** Add to `lib/types/database.ts` (imported from Supabase schema or create custom types)
2. **Validation Schema:** Create `lib/validations/bill.ts` with create/update/query schemas
3. **API Routes:** Create `app/api/bills/route.ts` for GET/POST list/create, `app/api/bills/[id]/route.ts` for GET/PUT/DELETE detail
4. **Hooks:** Create `hooks/useBills.ts` with useQuery and useMutation hooks following useRooms.ts pattern
5. **Components:** Create `components/bills/BillList.tsx`, `components/bills/BillCard.tsx`, `components/bills/BillForm.tsx`
6. **Pages:** Create `app/(dashboard)/dashboard/bills/page.tsx` orchestrating data fetching and component composition
7. **Tests:** Create `app/api/bills/__tests__/route.test.ts` and `hooks/__tests__/useBills.test.ts` (testing structure not yet established)

**New API Endpoint:**
- Create file `app/api/[resource]/route.ts` for collection endpoint (GET list, POST create)
- Create file `app/api/[resource]/[id]/route.ts` for detail endpoint (GET, PUT update, DELETE)
- Follow error handling pattern from `app/api/rooms/route.ts` (try-catch, ZodError, Supabase error)
- Use validation schema from `lib/validations/[resource].ts`
- Check authentication with `supabase.auth.getUser()`
- Check authorization explicitly (user owns property, room belongs to property, etc.)

**New Component:**
- Create file in `components/[feature]/[Component].tsx` following PascalCase naming
- If component is a UI primitive, create in `components/ui/`
- If component is feature-specific, create in `components/[feature]/`
- Export from component, import in parent component
- Use shadcn/ui components from `components/ui/` for UI elements
- Use Tailwind classes for styling

**New Utility Function:**
- Add to `lib/utils/[category].ts` or create new file if different category
- Export function with clear name and JSDoc comment
- Import and use in relevant files

**New Server Action:**
- Create in `app/(group)/actions.ts` in the relevant route group
- Mark with `'use server'` directive at top of file
- Use server-side Supabase client with `createServer()`
- Return serializable data (no functions, no Date objects without conversion)

## Special Directories

**app/api/:**
- Purpose: API route handlers
- Generated: No
- Committed: Yes
- Pattern: Each entity has a `route.ts` for collection and `[id]/route.ts` for detail endpoints

**lib/types/:**
- Purpose: TypeScript type definitions
- Generated: Yes (database.ts auto-generated from Supabase schema changes)
- Committed: Yes
- Pattern: One file per concern (database.ts for database types)

**.next/:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No
- Pattern: Auto-generated during build process, gitignored

**node_modules/:**
- Purpose: Package dependencies
- Generated: Yes
- Committed: No
- Pattern: Auto-installed from package-lock.json, gitignored

**supabase/:**
- Purpose: Supabase migrations and configuration
- Generated: Partially (migrations created by CLI)
- Committed: Yes
- Pattern: SQL migration files for schema changes

**.env files:**
- Purpose: Environment configuration
- Generated: No
- Committed: No (.env excluded, .env.example included as template)
- Pattern: Loaded by Next.js and validated by `lib/env.ts`

---

*Structure analysis: 2026-02-15*
