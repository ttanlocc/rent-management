---
phase: 04-payment-tracking
plan: 02
subsystem: payments
tags: [api, hooks, crud, multipart, storage]

dependency-graph:
  requires:
    - 04-01 (payment validation schemas and storage utilities)
    - lib/utils/api-error.ts (error handling patterns)
    - lib/supabase/server.ts (server-side database client)
  provides:
    - Payment CRUD API endpoints with filtering
    - TanStack Query hooks for payment data management
    - Multipart form data handling for receipt uploads
  affects:
    - Future payment UI components (will consume these hooks)
    - Storage bucket (payment-receipts) usage

tech-stack:
  added:
    - FormData API for multipart file uploads
    - TanStack Query mutations with cache invalidation
  patterns:
    - RESTful API routes with auth and ownership verification
    - Query key factory pattern for cache management
    - Optimistic UI updates via query invalidation

key-files:
  created:
    - app/api/payments/route.ts (GET list, POST create)
    - app/api/payments/[id]/route.ts (GET detail, PUT update, DELETE with cleanup)
    - hooks/usePayments.ts (5 hooks + query keys + FormData helper)
  modified: []

decisions:
  - Receipt upload uses temporary UUID, then gets replaced with actual payment ID in storage path via storage utility
  - DELETE endpoint cleans up receipts from storage but doesn't fail if cleanup fails (logged as error)
  - POST accepts FormData with 'data' field (JSON string) and optional 'receipt' field (File)
  - Update endpoint does NOT support changing receipts (would require separate receipt management endpoint)
  - Overdue filtering uses payment_status != paid_in_full AND payment_date < now()

metrics:
  duration: 2m 21s
  completed: 2026-02-24
---

# Phase 4 Plan 2: Payment CRUD API & Hooks Summary

Payment CRUD API with multipart receipt upload and TanStack Query hooks following existing tenant patterns.

## What Was Built

### Task 1: Payment API Routes
Created RESTful API endpoints for payment CRUD operations:

**GET /api/payments** (list with filtering):
- Query params: tenant_id, payment_status, start_date, end_date, overdue_only, page, limit
- Returns payments with tenant relation (full_name, room name)
- Pagination with count
- Overdue filter: `payment_status != 'paid_in_full' AND payment_date < now()`

**POST /api/payments** (create with receipt):
- Accepts multipart form data (not JSON)
- FormData fields: 'data' (JSON string), 'receipt' (File, optional)
- Verifies tenant ownership via tenant -> room -> property -> user_id
- Uploads receipt to storage using temporary UUID
- If insert fails, cleans up uploaded receipt
- Returns 201 with created payment

**GET /api/payments/[id]** (detail):
- Returns payment with full tenant relation chain
- Ownership verification via deep relation

**PUT /api/payments/[id]** (update):
- Validates data with updatePaymentSchema
- Verifies ownership before update
- Does NOT support changing receipt (future enhancement)

**DELETE /api/payments/[id]** (delete with cleanup):
- Fetches payment with receipt_url
- Verifies ownership
- Deletes receipt from storage (non-blocking error if fails)
- Deletes payment record
- Returns {deleted: true}

### Task 2: TanStack Query Hooks
Created 5 hooks + utilities following useTenants.ts pattern:

**Hooks:**
- `usePayments(params)`: Query hook for filtered payment list
- `usePayment(id)`: Query hook for payment detail (enabled: !!id)
- `useCreatePayment()`: Mutation with cache invalidation on lists
- `useUpdatePayment()`: Mutation with invalidation on lists + detail
- `useDeletePayment()`: Mutation with invalidation on lists

**Utilities:**
- `paymentKeys`: Query key factory (all, lists, list(params), details, detail(id))
- `buildPaymentFormData()`: Helper to construct FormData from payment data + optional receipt file

**Features:**
- All mutations show Vietnamese toast messages
- Cache invalidation ensures UI stays in sync
- Error handling with user-friendly messages
- FormData handling for multipart uploads

## Technical Decisions

### Receipt Upload Flow
1. Client calls `buildPaymentFormData(data, file)` to create FormData
2. POST handler extracts 'data' (JSON) and 'receipt' (File) from FormData
3. If receipt exists, uploads to storage with temporary UUID
4. Inserts payment record with receipt_url
5. If insert fails, cleans up uploaded receipt (deviation Rule 1 - auto-fix)

### Storage Cleanup Pattern
DELETE endpoint uses server-side Supabase client to remove files:
```typescript
const urlParts = receipt_url.split('/receipts/')
const filePath = `receipts/${urlParts[1]}`
await supabase.storage.from('payment-receipts').remove([filePath]).catch(console.error)
```
Non-blocking error ensures payment deletion succeeds even if storage cleanup fails.

### Ownership Verification
All endpoints verify user owns the property via chain:
`payment -> tenant -> room -> property -> user_id === auth.uid()`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Inline storage deletion instead of importing client utility**
- **Found during:** Task 1 (POST and DELETE handlers)
- **Issue:** Plan suggested importing `deleteReceipt` from storage.ts, but that uses browser client (createClient) which doesn't work in server-side API routes
- **Fix:** Inlined storage deletion logic using server Supabase client (`createServer()`) directly in API routes
- **Files modified:** app/api/payments/route.ts, app/api/payments/[id]/route.ts
- **Commit:** 829a543

## Verification Results

### Files Created
- app/api/payments/route.ts (218 lines) - ✓ Exists
- app/api/payments/[id]/route.ts (179 lines) - ✓ Exists
- hooks/usePayments.ts (203 lines) - ✓ Exists

### API Endpoint Exports
- route.ts exports: GET, POST - ✓ Correct
- [id]/route.ts exports: GET, PUT, DELETE - ✓ Correct

### Hook Exports
- usePayments, usePayment, useCreatePayment, useUpdatePayment, useDeletePayment - ✓ All exported
- paymentKeys factory - ✓ Exported
- buildPaymentFormData helper - ✓ Exported

### Pattern Compliance
- Auth checks: ✓ All endpoints verify user authentication
- Ownership verification: ✓ All endpoints check property ownership via relation chain
- Error handling: ✓ Uses handleZodError, handleSupabaseError, errors.* helpers
- Pagination: ✓ GET /api/payments includes pagination metadata
- Cache invalidation: ✓ All mutations invalidate relevant query keys

## Integration Points

### Consumed By (Future)
- Payment form components (will use useCreatePayment + buildPaymentFormData)
- Payment list/table components (will use usePayments with filters)
- Payment detail/edit dialogs (will use usePayment, useUpdatePayment, useDeletePayment)

### Consumes
- lib/validations/payment.ts (schemas for validation)
- lib/utils/api-error.ts (error response helpers)
- lib/utils/storage.ts (uploadReceipt function - used in POST)
- lib/supabase/server.ts (server-side database client)

### Storage Impact
- POST creates files in payment-receipts/receipts/ bucket
- DELETE removes files from payment-receipts/receipts/ bucket
- Storage path format: `receipts/{tempUUID}_{timestamp}.{ext}`

## Next Steps

Plan 04-03 (Payment UI Components) will:
1. Build payment form with React Hook Form + Zod validation
2. Implement payment list/table with filtering UI
3. Add payment detail/edit dialogs
4. Integrate receipt preview/download
5. Use hooks from this plan: usePayments, useCreatePayment, useUpdatePayment, useDeletePayment

## Self-Check: PASSED

### Files Exist
```
FOUND: app/api/payments/route.ts
FOUND: app/api/payments/[id]/route.ts
FOUND: hooks/usePayments.ts
```

### Commits Exist
```
FOUND: 829a543 (Task 1: Payment API routes)
FOUND: b0f0e23 (Task 2: Payment hooks)
```

### Exports Verified
- API routes export correct HTTP methods (GET, POST, PUT, DELETE)
- Hooks file exports 5 hooks + paymentKeys + buildPaymentFormData
- All TypeScript interfaces defined correctly

All verification checks passed. Ready for UI component development in plan 04-03.
