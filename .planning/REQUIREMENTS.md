# Requirements: Rent Management System

**Defined:** 2026-02-15
**Core Value:** Landlords can see their property's financial status at a glance and track every payment without manual spreadsheets.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Payment Tracking

- [ ] **PAY-01**: User can record payment with date, amount, and payment method (cash/bank/check)
- [ ] **PAY-02**: User can set payment status (paid in full, partial payment, late fee applied)
- [ ] **PAY-03**: User can upload receipt image or enter transaction reference for payment
- [ ] **PAY-04**: User can view payment history for a specific tenant with filtering
- [ ] **PAY-05**: User can edit payment details (amount, date, status, notes)
- [ ] **PAY-06**: User can delete payment record with confirmation
- [ ] **PAY-07**: System visually indicates overdue payments (red highlight, badge)
- [ ] **PAY-08**: User can add notes/memo to payment record

### Lease Management

- [ ] **LEASE-01**: User can create lease with start date, end date, monthly rent amount, and deposit
- [ ] **LEASE-02**: Lease is automatically linked to tenant and room assignment
- [ ] **LEASE-03**: System auto-generates expected monthly payment schedule from lease terms
- [ ] **LEASE-04**: User can view lease terms in tenant detail view
- [ ] **LEASE-05**: User can edit lease terms (dates, rent amount, deposit)
- [ ] **LEASE-06**: System shows lease renewal status (active, expiring soon, expired)
- [ ] **LEASE-07**: User can end lease early with move-out date

### Financial Reporting

- [ ] **FIN-01**: Dashboard widget shows total income collected this month
- [ ] **FIN-02**: Dashboard widget shows pending payments (expected but not received)
- [ ] **FIN-03**: Dashboard widget shows overdue amounts with count of late tenants
- [ ] **FIN-04**: Dashboard widget shows occupancy rate (occupied vs vacant rooms percentage)
- [ ] **FIN-05**: Dashboard widget shows expense tracking total (maintenance, utilities, costs)
- [ ] **FIN-06**: User can view month-over-month income comparison chart
- [ ] **FIN-07**: User can view month-over-month expense comparison chart
- [ ] **FIN-08**: User can filter financial reports by custom date range
- [ ] **FIN-09**: User can export financial data to CSV file

### Expense Tracking

- [ ] **EXP-01**: User can record expense with date, amount, category, and description
- [ ] **EXP-02**: User can categorize expenses (maintenance, utilities, insurance, other)
- [ ] **EXP-03**: User can upload receipt image for expense
- [ ] **EXP-04**: User can view expense history with filtering by category and date
- [ ] **EXP-05**: User can edit and delete expense records

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Payment Features

- **PAY-ADV-01**: Recurring payment templates for common amounts
- **PAY-ADV-02**: Bulk payment entry for multiple tenants at once
- **PAY-ADV-03**: Payment reminders/notifications (automated emails/SMS)
- **PAY-ADV-04**: Payment plan tracking for tenants with payment arrangements

### Advanced Lease Features

- **LEASE-ADV-01**: Lease document generation (PDF contracts)
- **LEASE-ADV-02**: Lease template library (standard terms, clauses)
- **LEASE-ADV-03**: Digital signature integration for lease agreements
- **LEASE-ADV-04**: Lease renewal workflow with automated notifications

### Advanced Reporting

- **FIN-ADV-01**: Tax preparation reports (annual summaries)
- **FIN-ADV-02**: Profit & loss statements
- **FIN-ADV-03**: Cash flow projections
- **FIN-ADV-04**: Custom report builder with multiple filters
- **FIN-ADV-05**: PDF export for financial reports
- **FIN-ADV-06**: Email scheduled reports monthly

### Tenant Portal

- **PORTAL-01**: Tenants can log in to view their payment history
- **PORTAL-02**: Tenants can submit payment records for landlord approval
- **PORTAL-03**: Tenants can view their lease terms
- **PORTAL-04**: Tenants can submit maintenance requests

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Online payment processing (Stripe, PayPal) | Focus is offline payment tracking, not payment collection platform |
| Automated payment reminders | Landlord handles tenant communication directly, system provides data only |
| SMS/Email notifications | Adds complexity, infrastructure costs; manual communication preferred |
| Document generation (contracts, receipts) | Record-keeping focus, not document creation |
| Tenant self-service portal | Landlord-only system for v1, tenants don't need access |
| Mobile native app | Responsive web app sufficient, avoid dual codebase maintenance |
| Multi-language support | Vietnamese only for v1, English can be added later if needed |
| Integration with accounting software (QuickBooks) | Manual CSV export sufficient for tax preparation |
| Automated late fee calculation | Landlord applies late fees manually based on lease terms |
| Bank account reconciliation | Outside scope of rent management, handled by accounting software |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| PAY-06 | Phase 4 | Pending |
| PAY-07 | Phase 4 | Pending |
| PAY-08 | Phase 4 | Pending |
| LEASE-01 | Phase 5 | Pending |
| LEASE-02 | Phase 5 | Pending |
| LEASE-03 | Phase 5 | Pending |
| LEASE-04 | Phase 5 | Pending |
| LEASE-05 | Phase 5 | Pending |
| LEASE-06 | Phase 5 | Pending |
| LEASE-07 | Phase 5 | Pending |
| FIN-01 | Phase 7 | Pending |
| FIN-02 | Phase 7 | Pending |
| FIN-03 | Phase 7 | Pending |
| FIN-04 | Phase 7 | Pending |
| FIN-05 | Phase 7 | Pending |
| FIN-06 | Phase 7 | Pending |
| FIN-07 | Phase 7 | Pending |
| FIN-08 | Phase 7 | Pending |
| FIN-09 | Phase 7 | Pending |
| EXP-01 | Phase 6 | Pending |
| EXP-02 | Phase 6 | Pending |
| EXP-03 | Phase 6 | Pending |
| EXP-04 | Phase 6 | Pending |
| EXP-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29 (100% coverage)
- Unmapped: 0

---
*Requirements defined: 2026-02-15*
*Last updated: 2026-02-15 after roadmap creation*
