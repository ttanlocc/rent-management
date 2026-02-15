# Rent Management System

## What This Is

A web-based rent management system for property owners to track rooms, tenants, lease terms, payments, and financial performance. Built for Vietnamese landlords managing rental properties with comprehensive payment tracking and financial reporting.

## Core Value

Landlords can see their property's financial status at a glance and track every payment without manual spreadsheets.

## Requirements

### Validated

<!-- Shipped and confirmed working (from existing codebase) -->

- ✓ User can sign up and log in with email/password — Phase 1
- ✓ User session persists across browser refresh — Phase 1
- ✓ User can create, view, edit, and delete rooms — Phase 2
- ✓ Rooms have status (vacant/occupied), name, floor, rent price — Phase 2
- ✓ User can create, view, edit, and delete tenants — Phase 3
- ✓ Tenants linked to rooms with move-in date, contact info — Phase 3
- ✓ Room status updates automatically based on tenant assignment — Phase 3
- ✓ Multi-tenant support with property-level data isolation — Phase 1-3

### Active

<!-- Current scope being built -->

**Payment Tracking:**
- [ ] Landlord can record payment with date, amount, payment method
- [ ] Track payment status (paid in full, partial payment, late fees applied)
- [ ] Upload receipt images or transaction references for payments
- [ ] Lease automatically generates expected monthly payment schedule
- [ ] Visual indicators show overdue payments (red highlights, badges)
- [ ] View payment history per tenant with filtering

**Lease Management:**
- [ ] Create lease with start date, end date, monthly rent, deposit amount
- [ ] Link lease to tenant and room assignment
- [ ] Track lease renewal status (active, expiring soon, expired)
- [ ] View lease terms in tenant detail view
- [ ] Auto-calculate expected payments from lease terms

**Financial Reporting:**
- [ ] Dashboard widget: Total income this month (collected rent)
- [ ] Dashboard widget: Pending payments (expected but not received)
- [ ] Dashboard widget: Overdue amounts with tenant count
- [ ] Dashboard widget: Expense tracking (maintenance, utilities, costs)
- [ ] Dashboard widget: Occupancy rate (occupied vs vacant rooms)
- [ ] Historical trends: Month-over-month income/expense comparison
- [ ] Custom date range filter for all financial reports
- [ ] Export financial data to CSV

### Out of Scope

- Tenant self-service portal (landlord-only system) — tenants don't log in
- Automated payment reminders/notifications — manual follow-up only
- Online payment processing integration — track offline payments only
- Document generation (lease contracts, receipts) — record-keeping focus
- Tax preparation reports — landlord handles taxes separately
- Mobile native app — responsive web app sufficient for v1

## Context

**Existing Codebase:**
- Next.js 15 with App Router, React 19, TypeScript
- Supabase for auth, database, and Row-Level Security
- shadcn/ui components with Tailwind CSS
- TanStack Query for client-side data fetching and caching
- Zod validation schemas for API input validation

**Current Architecture:**
- Server components for layouts and authentication
- Client components for interactive pages with React Query hooks
- API routes for CRUD operations with RLS authorization
- Vietnamese language UI throughout

**Known Technical Debt:**
- Dashboard shows hardcoded zero statistics (needs real aggregation)
- Manual type definitions instead of auto-generated from Supabase schema
- Single property assumption (needs property selector for multi-property users)
- Room status management has edge cases with multiple tenant scenarios
- Missing test coverage for API routes and RLS policies

**User Workflow:**
- Landlord manages one or more rental properties
- Each property has multiple rooms with different rent prices
- Tenants assigned to rooms when they move in
- Monthly rent due, landlord records payments manually
- Need visibility into cash flow: what's owed, what's collected, what's overdue

## Constraints

- **Tech Stack:** Must use existing Next.js + Supabase stack — no framework changes
- **Language:** Vietnamese UI throughout — all labels, errors, messages in Vietnamese
- **Data Isolation:** Must maintain RLS policies — users only see their own properties/tenants/payments
- **Timeline:** Prioritize payment tracking → lease management → reporting (in that order)
- **Performance:** Dashboard must load in <2 seconds with 100+ tenants
- **Browser Support:** Modern browsers only (Chrome, Firefox, Safari last 2 versions)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual payment entry (no online payments) | Focus on record-keeping for landlords who collect cash/bank transfers offline | — Pending |
| Visual overdue indicators only (no automated reminders) | Landlord handles tenant communication directly, system provides data visibility | — Pending |
| Dashboard widgets for reports (not separate page) | At-a-glance financial status more valuable than deep drill-down reports | — Pending |
| Lease auto-generates payment expectations | Reduce manual entry, ensure payment tracking aligns with lease terms | — Pending |
| Supabase RLS for all data access | Maintain security-first approach from existing codebase patterns | ✓ Good |
| Next.js App Router with server/client split | Modern React patterns, better performance, established in codebase | ✓ Good |

---
*Last updated: 2026-02-15 after initialization*
