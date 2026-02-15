# Roadmap: Rent Management System

## Overview

This roadmap extends the existing rent management system (Phases 1-3: Auth, Rooms, Tenants) with payment tracking, lease management, expense tracking, and financial reporting capabilities. The four phases deliver landlords complete visibility into their property's financial performance through manual payment recording, automated lease schedules, expense tracking, and comprehensive dashboard analytics.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Authentication** - User accounts with email/password auth
- [x] **Phase 2: Room Management** - CRUD for rooms with status tracking
- [x] **Phase 3: Tenant Management** - CRUD for tenants with room assignments
- [ ] **Phase 4: Payment Tracking** - Manual payment entry with receipt uploads and history
- [ ] **Phase 5: Lease & Schedule Management** - Lease terms with auto-generated payment schedules
- [ ] **Phase 6: Expense Tracking** - Record and categorize property expenses
- [ ] **Phase 7: Financial Reporting** - Dashboard widgets with trends and CSV export

## Phase Details

### Phase 1: Authentication (COMPLETE)
**Goal**: Users can securely access their accounts
**Depends on**: Nothing (first phase)
**Status**: Complete
**Requirements**: Shipped in initial codebase

### Phase 2: Room Management (COMPLETE)
**Goal**: Users can manage rental property rooms
**Depends on**: Phase 1
**Status**: Complete
**Requirements**: Shipped in initial codebase

### Phase 3: Tenant Management (COMPLETE)
**Goal**: Users can manage tenants and room assignments
**Depends on**: Phase 2
**Status**: Complete
**Requirements**: Shipped in initial codebase

### Phase 4: Payment Tracking
**Goal**: Landlords can manually record and track all tenant payments with receipt evidence
**Depends on**: Phase 3 (tenants must exist to receive payments)
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, PAY-08
**Success Criteria** (what must be TRUE):
  1. Landlord can create payment record with date, amount, payment method, and link to tenant
  2. Landlord can upload receipt image or reference for any payment
  3. Landlord can view complete payment history for any tenant with filtering
  4. Landlord can edit or delete payment records with confirmation
  5. System visually highlights overdue payments with red indicators/badges
**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md — Data foundation: migration, types, validations, storage utility
- [ ] 04-02-PLAN.md — API routes and TanStack Query hooks for payment CRUD
- [ ] 04-03-PLAN.md — UI components, payments page, and navigation updates

### Phase 5: Lease & Schedule Management
**Goal**: Lease terms automatically generate expected payment schedules, eliminating manual monthly entry
**Depends on**: Phase 3 (leases require tenant and room assignment)
**Requirements**: LEASE-01, LEASE-02, LEASE-03, LEASE-04, LEASE-05, LEASE-06, LEASE-07
**Success Criteria** (what must be TRUE):
  1. Landlord can create lease with start/end dates, monthly rent, deposit, linked to tenant and room
  2. Lease automatically generates expected monthly payment schedule from start to end date
  3. Landlord can view lease terms and payment schedule in tenant detail view
  4. Landlord can edit lease terms (dates, rent amount) and schedule updates automatically
  5. System shows lease renewal status (active, expiring soon, expired)
**Plans**: TBD

Plans:
- [ ] TBD (determined during /gsd:plan-phase 5)

### Phase 6: Expense Tracking
**Goal**: Landlords can record and categorize property expenses to track total costs
**Depends on**: Phase 1 (requires user authentication and data isolation)
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04, EXP-05
**Success Criteria** (what must be TRUE):
  1. Landlord can create expense record with date, amount, category (maintenance/utilities/insurance/other), and description
  2. Landlord can upload receipt image for expense
  3. Landlord can view expense history filtered by category and date range
  4. Landlord can edit and delete expense records
**Plans**: TBD

Plans:
- [ ] TBD (determined during /gsd:plan-phase 6)

### Phase 7: Financial Reporting & Dashboard
**Goal**: Landlords see financial performance at a glance through dashboard widgets with historical trends
**Depends on**: Phase 4 (payments), Phase 6 (expenses)
**Requirements**: FIN-01, FIN-02, FIN-03, FIN-04, FIN-05, FIN-06, FIN-07, FIN-08, FIN-09
**Success Criteria** (what must be TRUE):
  1. Dashboard shows total income collected this month, pending payments, overdue amounts with tenant count
  2. Dashboard shows occupancy rate (occupied vs vacant rooms) and total expenses this month
  3. Dashboard displays month-over-month income and expense comparison charts
  4. Landlord can filter all financial reports by custom date range
  5. Landlord can export financial data (income, expenses, payments) to CSV file
**Plans**: TBD

Plans:
- [ ] TBD (determined during /gsd:plan-phase 7)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication | - | Complete | (shipped in initial codebase) |
| 2. Room Management | - | Complete | (shipped in initial codebase) |
| 3. Tenant Management | - | Complete | (shipped in initial codebase) |
| 4. Payment Tracking | 0/3 | Planned | - |
| 5. Lease & Schedule Management | 0/TBD | Not started | - |
| 6. Expense Tracking | 0/TBD | Not started | - |
| 7. Financial Reporting & Dashboard | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-15*
*Last updated: 2026-02-15*
