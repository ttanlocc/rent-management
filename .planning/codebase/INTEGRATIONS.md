# External Integrations

**Analysis Date:** 2026-02-15

## APIs & External Services

**Supabase (Primary Backend):**
- Service: PostgreSQL database + authentication + file storage API
  - SDK/Client: `@supabase/supabase-js` 2.93.1 (browser), `@supabase/ssr` 0.8.0 (Next.js SSR)
  - Auth: Environment variables (see below)

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: Via `NEXT_PUBLIC_SUPABASE_URL` (public) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
  - Service role: Via `SUPABASE_SERVICE_ROLE_KEY` (server-only, sensitive)
  - Client: `@supabase/ssr` for Server Components, `@supabase/supabase-js` for browser

**Database Schema:**
- Tables managed via `lib/types/database.ts` (generated from Supabase)
  - `profiles` - User profile data (full_name, avatar_url, phone_number, role)
  - `properties` - Rental properties (name, address, logo_url)
  - `rooms` - Individual rooms in properties (floor, area, base_rent, status)
  - `tenants` - Tenant information (full_name, phone, email, id_card, move_in/out dates)
  - `price_settings` - Pricing configuration (electricity, water, service fees)
  - `utility_readings` - Monthly meter readings (electricity, water consumption)
  - `bills` - Generated bills for tenants (rent, utilities, fees, payment status)

**File Storage:**
- Supabase file storage (implied by image URL fields):
  - `properties.logo_url` - Property logos
  - `tenants.id_card_image_url` - Tenant ID card images
  - `bills.bill_image_url` - Bill payment proofs

**Caching:**
- TanStack Query (@tanstack/react-query) - Client-side caching with automatic invalidation

## Authentication & Identity

**Auth Provider:**
- Supabase Authentication (built-in to Supabase)
  - Implementation: Email/password authentication via `supabase.auth.signInWithPassword()` and `signUp()`
  - Location: `app/(auth)/actions.ts` for auth server actions
  - Session management: Via cookies through `@supabase/ssr` middleware
  - Session middleware: `lib/supabase/middleware.ts` and `middleware.ts` (Next.js middleware)

**User Roles:**
- Enum types defined: `'landlord' | 'staff'` (stored in `profiles.role`)
- Role-Based Access Control: Not explicitly implemented in auth layer; assumes Supabase RLS policies handle authorization

**Authorization:**
- Row-Level Security (RLS): Supabase RLS policies should restrict data by user ownership
- Example from API: `app/api/tenants/route.ts` verifies room ownership by checking `room -> property -> user_id`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, LogRocket, etc.)
- Console logging only: `console.error()` in API routes and error handlers

**Logs:**
- Console-based logging to server stdout
- Example error patterns in `lib/utils/api-error.ts` with Vietnamese error messages

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `next.config.ts` and README references)

**CI Pipeline:**
- Not detected in repository

## Environment Configuration

**Required env vars:**

**Public (browser-accessible):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., `https://your-project.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous key for public API access

**Secret (server-only):**
- `SUPABASE_SERVICE_ROLE_KEY` - Full admin access to Supabase for server-side operations

**Secrets location:**
- Environment variables defined in `.env` (not committed)
- Template/example in `.env.example` (committed)
- Validation enforced at runtime via `lib/env.ts` using `@t3-oss/env-nextjs`

## Webhooks & Callbacks

**Incoming:**
- No webhook endpoints detected

**Outgoing:**
- None detected
- Future consideration: Could use Supabase edge functions for automated billing triggers

## API Architecture

**Pattern:**
- REST API via Next.js route handlers (`app/api/*/route.ts`)
- Consistent request/response format with error handling via `lib/utils/api-error.ts`

**Authentication Flow:**
- All API routes check user authentication via `supabase.auth.getUser()`
- Returns 401 UNAUTHORIZED if user not authenticated

**Error Response Format:**
```
{
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "INTERNAL_ERROR",
    message: "User-facing message",
    details?: { fieldName: ["error message"] }
  }
}
```

**Success Response Format:**
```
{
  data: { /* response payload */ }
}
```

## Data Fetching Patterns

**Client-side:**
- TanStack Query for server state management (see `hooks/useProperties.ts`, `hooks/useRooms.ts`, `hooks/useTenants.ts`)
- Automatic cache invalidation on mutations
- Toast notifications via `sonner` on success/error

**Server-side:**
- Direct Supabase client instantiation in API routes via `createServer()`
- Server actions use Supabase directly (e.g., `app/(auth)/actions.ts`)

## Current API Endpoints

**Properties:**
- `GET /api/properties` - List all properties for user
- `POST /api/properties` - Create new property

**Rooms:**
- `GET /api/rooms` - List rooms with filtering by property
- `POST /api/rooms` - Create new room
- `GET /api/rooms/[id]` - Get room details
- `PATCH /api/rooms/[id]` - Update room
- `DELETE /api/rooms/[id]` - Delete room

**Tenants:**
- `GET /api/tenants` - List tenants with filtering by room/active status/search
- `POST /api/tenants` - Create new tenant
- `GET /api/tenants/[id]` - Get tenant details
- `PATCH /api/tenants/[id]` - Update tenant
- `DELETE /api/tenants/[id]` - Delete tenant

---

*Integration audit: 2026-02-15*
