# Codebase Concerns

**Analysis Date:** 2026-02-15

## Tech Debt

**Type Definition Misalignment:**
- Issue: Tenant types are manually defined in `hooks/useTenants.ts` instead of being auto-generated from database schema. Comment indicates this should be automated but hasn't been implemented.
- Files: `hooks/useTenants.ts` (lines 11-33)
- Impact: Type drift risk when database schema changes. Developers must manually update interfaces, increasing chance of type mismatches between API and frontend.
- Fix approach: Implement code generation from Supabase schema (e.g., using Supabase CLI's `gen-types` command) to auto-generate TypeScript types that stay in sync with database.

**Hardcoded Statistics on Dashboard:**
- Issue: Dashboard homepage displays mock data (all zeros) instead of fetching actual aggregated stats from API.
- Files: `app/(dashboard)/dashboard/page.tsx` (lines 7-41)
- Impact: Misleading UI - users see zero values, doesn't reflect actual room/tenant counts. Creates poor user experience on first load.
- Fix approach: Implement dashboard stats API endpoint (e.g., `GET /api/stats`) that aggregates counts from rooms, tenants, bills tables. Call during page render or via React Query hook.

**Modal Dialog Implementation via DOM Manipulation:**
- Issue: Tenant page uses `.fixed inset-0` CSS-based modal overlay (DIV on document) instead of proper Modal component from shadcn/ui or Radix UI Dialog.
- Files: `app/(dashboard)/dashboard/tenants/page.tsx` (lines 145-157)
- Impact: No trap focus management, no backdrop click handling, accessibility issues (screen readers). Modal can't be easily extended with animations or keyboard nav.
- Fix approach: Import Dialog component from shadcn/ui, refactor to use proper dialog state management. Ensures WCAG compliance and consistent UX.

**Missing Room Status Cascade Logic:**
- Issue: Room status updates depend on tenant `is_active` field, but there's incomplete cascade logic when multiple tenants share a room or when queries check count.
- Files: `app/api/tenants/[id]/route.ts` (lines 150-176)
- Impact: Edge case where room status may not update correctly if multiple tenants in one room (MVP assumption is one tenant per room). Logic assumes `count() === 0` for vacant, but what if count query fails or returns undefined?
- Fix approach: Strengthen room status update logic with explicit room occupancy rules. Either enforce one-tenant-per-room in validation or redesign status to account for multiple tenants. Add integration tests for edge cases.

**Unsafe Type Casting with `as any`:**
- Issue: Multiple API routes use `as any` casts to access nested relationship data from Supabase queries.
- Files: `app/api/tenants/route.ts` (line 139), `app/api/tenants/[id]/route.ts` (lines 66, 105, 119, 211)
- Impact: Bypasses TypeScript type safety, hiding potential undefined access bugs. If Supabase schema changes, casts will silently fail at runtime.
- Fix approach: Define proper TypeScript interfaces or use Supabase's type generation to get accurate types for joined relationships. Remove `as any` and use proper type-safe access.

## Known Bugs

**Tenant Form Room Selection Bug:**
- Symptoms: When editing a tenant, if current room is occupied by another tenant, form shows warning "Phòng hiện tại không khả dụng hoặc đã có người khác?" even though user should be able to keep them in same room.
- Files: `components/tenants/TenantForm.tsx` (lines 215-219)
- Trigger: Edit a tenant in an occupied room. The filter `room.status === 'vacant' || room.id === tenant.room_id` should work, but room status might be stale or the room relation is missing.
- Workaround: Filter logic appears correct - issue is likely that room data from API doesn't include the `status` field. Ensure `useRooms()` query includes all room fields.

**Orphaned Tenants Visibility:**
- Symptoms: Tenants with `room_id = NULL` may not be visible in tenant list due to RLS policy checking `room -> property -> user_id`.
- Files: `app/api/tenants/route.ts` (lines 44-78), `supabase/migrations/20260128000001_init_schema.sql` (lines 182-189)
- Trigger: Manually insert tenant with no room assignment, or in rare data state where room is deleted but tenant isn't.
- Workaround: Current RLS policy requires room relation. For MVP, assume all tenants must have a room. If unassigned tenants needed, RLS policy must be updated to check `room_id IS NULL OR room -> property -> user_id = auth.uid()`.

## Security Considerations

**RLS Policy Complexity - Reliance on Deep Relationships:**
- Risk: Tenants table has no direct `user_id` field. Visibility is controlled via `room -> property -> user_id` chain. If any middle relation is missing/null, entire chain breaks.
- Files: `supabase/migrations/20260128000001_init_schema.sql` (lines 182-189)
- Current mitigation: Manual ownership checks in API routes (e.g., `app/api/tenants/[id]/route.ts` lines 63-69, 104-109). RLS policies exist but API provides defense-in-depth.
- Recommendations:
  1. Test RLS policies thoroughly with edge cases (null room_id, orphaned records).
  2. Add database audit logging for sensitive operations (tenant create/update/delete).
  3. Consider denormalizing `user_id` onto tenants table for simpler, faster RLS checks.
  4. Document RLS policy assumptions clearly for maintainability.

**Missing Input Sanitization on String Search:**
- Risk: Search queries use `.ilike()` pattern matching without sanitization. While Supabase parameterizes this, malformed input could cause unexpected query behavior.
- Files: `app/api/tenants/route.ts` (line 69), `app/api/rooms/route.ts` (line 64)
- Current mitigation: Zod validation requires strings to be strings (no injection), but no length limits on search param.
- Recommendations:
  1. Add max length validation to `search` param schema (suggest 100 chars).
  2. Document that `.ilike()` uses `%` wildcards - educate team on LIKE performance.

**Service Role Key Not Used:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` is loaded in env but never used in codebase. If this key is exposed, attacker can bypass all RLS policies.
- Files: `lib/env.ts` (line 6)
- Current mitigation: Key should not be exposed client-side (only server-side in theory).
- Recommendations:
  1. Audit `.env` files to confirm service role key is NOT in client bundle.
  2. If key exists but unused, either remove from env or document planned usage.
  3. Consider rotating key if this codebase was ever publicly exposed.

## Performance Bottlenecks

**N+1 Query Problem in Tenant List Expansion:**
- Problem: `useTenants()` hook fetches all tenants with room/property expansion, but then each TenantCard may refetch room data. Multiple queries for same room data.
- Files: `hooks/useTenants.ts` (lines 69-83), `components/tenants/TenantList.tsx` (uses list data), `components/tenants/TenantCard.tsx` (may re-fetch)
- Cause: Expansion in main query is correct, but no cache coordination - React Query may invalidate room cache separately.
- Improvement path:
  1. Verify TenantCard doesn't call `useRoom(tenant.room_id)` - use props instead.
  2. Use TanStack Query's `queryKey` hierarchy so room updates invalidate tenant lists correctly.
  3. Add pagination to tenant list API (already in schema but UI shows all tenants).

**Missing Indexes for Filtered Queries:**
- Problem: Dashboard and list pages filter by status, room_id, and search - some filter combinations may trigger full table scans.
- Files: `supabase/migrations/20260128000001_init_schema.sql` (lines 220-237)
- Cause: Indexes exist for common filters (status, room_id) but no composite index for `room_id + is_active` combo (used in room status checks).
- Improvement path:
  1. Add composite index: `CREATE INDEX idx_tenants_room_is_active ON tenants(room_id, is_active)`.
  2. Monitor query performance in Supabase dashboard once data grows past 10k tenants.

**Pagination Not Enforced in Tenants Hook:**
- Problem: `useTenants()` requests pagination but UI doesn't expose pagination controls. Could load unbounded data if tenant count is large.
- Files: `app/(dashboard)/dashboard/tenants/page.tsx` (lines 28-32), `hooks/useTenants.ts` (default limit 20)
- Cause: MVP assumption is small dataset, but no safeguard against loading all tenants in memory.
- Improvement path:
  1. Add pagination controls (previous/next buttons) to TenantList component.
  2. Enforce page limit in API schema to max 100 per request.
  3. Add data size warnings in console if dataset approaches memory limits.

## Fragile Areas

**Room Status Management:**
- Files: `app/api/tenants/[id]/route.ts` (lines 142-176), `app/api/tenants/route.ts` (lines 167-173)
- Why fragile: Room status (occupied/vacant) is derived from tenant.is_active count, not stored as a source of truth. Multiple code paths update status. If one path fails (network error during update), room status becomes inconsistent.
- Safe modification:
  1. Add transaction logic - ensure room status update succeeds or rolls back tenant update.
  2. Add test coverage for all state transitions: vacant -> occupied, occupied -> vacant, occupied -> occupied (multiple tenants - future feature).
  3. Consider audit table to log all room status changes for debugging.
- Test coverage: No test files found in codebase - room status transitions are untested.

**Tenant Form Date Handling:**
- Files: `components/tenants/TenantForm.tsx` (lines 69-71, 239-240)
- Why fragile: Date conversion between ISO string, Date object, and HTML date input. Multiple format conversions can cause timezone bugs. `move_in_date` defaults to `new Date()` which uses client timezone, but database stores as DATE (no timezone).
- Safe modification:
  1. Standardize on ISO date strings (YYYY-MM-DD) throughout.
  2. Store dates in UTC on backend to avoid timezone drift.
  3. Use a date library (date-fns or Day.js) for all date conversions.
- Test coverage: Date edge cases (DST, leap years, timezone changes) not tested.

**Property Context Dependency:**
- Files: `app/(dashboard)/dashboard/tenants/page.tsx` (lines 24-26)
- Why fragile: Page assumes `defaultProperty` always exists and uses `properties[0]`. If a user has multiple properties, tenant form always uses first property's rooms. No property selector in UI.
- Safe modification:
  1. Add property context/state to page or URL params.
  2. Show property selector dropdown if multiple properties exist.
  3. Add validation to block tenant creation if no properties exist.
- Test coverage: Multi-property scenario not tested.

## Scaling Limits

**Single Property Assumption:**
- Current capacity: Application hardcoded to first property (properties[0]).
- Limit: Breaks when user has >1 property. Room selection form shows rooms from only first property.
- Scaling path:
  1. Add property selector to page header.
  2. Update API queries to accept property_id filter.
  3. Update hooks to support property context.
  4. Add E2E test for multi-property workflows.

**Database RLS Policy Scalability:**
- Current capacity: RLS policies use subqueries (e.g., `room_id IN (SELECT r.id FROM rooms r JOIN properties p...)`).
- Limit: Subqueries can become slow if property/room/tenant counts exceed 10k+ per user. Policy check happens on every row access.
- Scaling path:
  1. Monitor RLS policy performance using Supabase query logs.
  2. Consider denormalizing `user_id` to rooms and tenants tables for direct equality checks (faster RLS).
  3. Add row-level security audit logging to catch performance issues.

**API Response Payload Size:**
- Current capacity: Tenant list API includes nested room and property data in single query.
- Limit: If property has 1000+ rooms and 10k+ tenants, response could exceed network MTU or timeout.
- Scaling path:
  1. Paginate tenant list (already in API, UI doesn't use).
  2. Use API query parameters to control expansion depth (e.g., `?expand=room` vs `?expand=room.property`).
  3. Implement cursor-based pagination for better perf than offset.

## Dependencies at Risk

**Supabase Type Generation Gap:**
- Risk: No automated type generation from database schema. Types are manually maintained. Risk of drift increases with each schema change.
- Impact: Type errors silent at build time, surface as runtime 404s or 500s.
- Migration plan:
  1. Set up Supabase CLI `gen-types` in build pipeline.
  2. Commit generated types to repo.
  3. Use generated types in API routes and hooks.

**TanStack Query Configuration Simplicity:**
- Risk: Minimal query configuration (no retry, no stale-time, no error boundaries). Network failures cause unhandled errors.
- Impact: Transient network errors crash the app instead of retrying gracefully.
- Migration plan:
  1. Add `queryClient.setDefaultOptions()` to set global retry: 3, staleTime: 5min.
  2. Wrap pages with `<ErrorBoundary>` from React Error Boundary or Sentry.
  3. Add error boundary fallback UI for failed queries.

## Missing Critical Features

**No Audit Logging:**
- Problem: No record of who deleted a tenant, updated a room, etc. Needed for compliance and debugging.
- Blocks: Cannot investigate data inconsistencies or user disputes.

**No Data Validation on Tenant Move-Out:**
- Problem: Setting `is_active = false` doesn't validate move_out_date is set. Incomplete data.
- Blocks: Cannot generate accurate reports of occupancy history.

**No Bulk Operations:**
- Problem: Cannot bulk update tenant status or delete multiple tenants at once.
- Blocks: Scaling to manage properties with 100+ tenants becomes tedious.

## Test Coverage Gaps

**API Route Tests:**
- What's not tested:
  - Room status transitions (vacant/occupied)
  - Tenant assignment to room (permission checks)
  - Cascading deletes (delete room should handle tenants)
- Files: `app/api/**/*.ts` (all routes)
- Risk: Refactoring room status logic could introduce bugs silently.
- Priority: High

**Tenant Form Edge Cases:**
- What's not tested:
  - Date input timezone handling
  - Phone regex validation for all Vietnam number formats
  - Room selection when tenant has no current room (null room_id)
- Files: `components/tenants/TenantForm.tsx`
- Risk: Form could accept invalid data or crash on edge case inputs.
- Priority: Medium

**RLS Policy Validation:**
- What's not tested:
  - User cannot access another user's tenants
  - Orphaned tenants (room_id = null) are not visible
  - Permission check for room ownership during tenant assignment
- Files: `supabase/migrations/20260128000001_init_schema.sql`
- Risk: Security breach if policy check is bypassed.
- Priority: Critical

**React Query Cache Behavior:**
- What's not tested:
  - Cache invalidation on tenant create/update (does room list refresh?)
  - Stale data after network failure and recovery
- Files: `hooks/useTenants.ts`, `hooks/useRooms.ts`
- Risk: UI shows stale data confusing users, or fails to refresh after operations.
- Priority: Medium

---

*Concerns audit: 2026-02-15*
