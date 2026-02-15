# Feature Landscape

**Domain:** Property Management - Payment Tracking, Lease Management, Financial Reporting
**Researched:** 2026-02-15
**Confidence:** LOW (based on training data only - verification tools unavailable)

## Research Limitations

**IMPORTANT:** This research was conducted using training data only. WebSearch and documentation verification tools were unavailable. All findings should be considered LOW confidence and validated against:
- Current property management software (Buildium, AppFolio, TenantCloud, Rentec Direct)
- Vietnamese-specific property management solutions
- User interviews with target landlords

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Payment Recording - Basic** | Core workflow: landlords must record cash/bank transfers | Low | Date, amount, tenant, property/room |
| **Payment Status Tracking** | Need to know: paid/partial/pending/overdue | Low | Simple status flags on payment records |
| **Payment Method Selection** | Cash vs bank transfer distinction matters for accounting | Low | Dropdown: Cash, Bank Transfer, Other |
| **Payment History per Tenant** | Landlords need payment track record before renewal | Low | List view filtered by tenant |
| **Receipt Photo Attachment** | Proof of payment is critical for disputes | Medium | File upload, image storage, display |
| **Lease Basic Info** | Define rental agreement: tenant, room, dates, amounts | Low | Form with rent amount, deposit, start/end dates |
| **Active Lease Status** | Know which units are occupied vs vacant | Low | Current/expired status, link to tenant |
| **Deposit Tracking** | Track deposit received, held, returned | Low | Separate from rent payments |
| **Monthly Rent Amount** | Fixed recurring amount for payment schedule | Low | Store with lease, use for payment expectations |
| **Payment Due Dates** | Know when rent is expected each month | Low | Day of month (e.g., 1st, 5th, 15th) |
| **Total Income View** | See how much collected this month/year | Low | Sum of received payments, filter by date range |
| **Outstanding Balance View** | See pending/overdue amounts owed | Medium | Calculate expected vs received per tenant |
| **Occupancy Rate** | Percentage of units rented (key landlord metric) | Low | Occupied rooms / total rooms |
| **Basic Filtering** | Filter payments/leases by date, tenant, status | Low | Standard list filtering |
| **CSV Export** | Landlords use Excel/Google Sheets for tax prep | Low | Export payment/lease data to CSV |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Auto-generated Payment Schedule** | Reduces manual entry: create expected payments when lease created | Medium | Generate monthly payment records based on lease terms |
| **Late Payment Detection** | Automatic flagging saves landlord mental overhead | Medium | Compare due date vs actual payment date |
| **Partial Payment Handling** | Common in Vietnam: tenants pay in installments | Medium | Link multiple payments to single expected payment |
| **Month-over-Month Trends** | Visual insight into business growth/decline | Medium | Chart: income, occupancy, collection rate by month |
| **Payment Reminder Tracking** | Log when landlord contacted tenant (manual reminder) | Low | Notes field: "Called tenant on X date" |
| **Expense Tracking** | Net income = revenue - expenses (repairs, utilities, taxes) | Medium | Separate expense entry: date, category, amount, photo |
| **Multi-room Lease Support** | Some tenants rent multiple rooms (families, businesses) | Medium | Lease can reference multiple rooms |
| **Lease Renewal Workflow** | Guided process: expire old lease, create new with updated terms | Medium | Copy lease data, adjust dates/amounts |
| **Payment Collection Rate** | % of expected rent actually collected (key KPI) | Medium | (Received / Expected) * 100 for period |
| **Overdue Amount by Age** | Categorize: 1-30 days, 31-60 days, 60+ days late | Medium | Aging report for collection prioritization |
| **Receipt Number Auto-generation** | Professional: sequential receipt IDs for bookkeeping | Low | Auto-increment: REC-2026-0001 |
| **Lease Term Templates** | Save common lease configurations (6mo, 1yr, 2yr) | Low | Preset rent, deposit multiplier, duration |
| **Vietnamese Currency Formatting** | Show 5,000,000 VND not 5000000 | Low | Locale-aware number formatting |
| **Payment Notes/Memo** | Context: "Paid late due to holiday", "Includes last month's shortfall" | Low | Text field on payment record |
| **Quick Stats Dashboard** | At-a-glance: total income, pending, overdue, occupancy | Low | Summary cards on main view |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Online Payment Processing** | Out of scope, adds complexity (payment gateway integration, fees, compliance) | Manual entry only - landlords collect outside system |
| **Automated Payment Reminders** | Out of scope, requires SMS/email infrastructure | Provide "last contacted" tracking for manual reminders |
| **Lease Document Generation** | Out of scope, requires legal templates, PDF generation | Store lease terms only - landlords handle paper contracts |
| **Tenant Portal** | Out of scope, doubles complexity (auth, permissions, separate UI) | Landlord-only view - tenants interact via landlord |
| **Utility Billing** | Different domain, complex calculation rules | Keep separate - track as expenses if needed |
| **Maintenance Request Tracking** | Feature creep, needs separate workflow | Phase N concern, not Phase 4 |
| **Multi-property/Portfolio Management** | Target is single landlord, single property | Design assumes one property context |
| **Advanced Accounting (Double-entry, GL)** | Overengineered for target users | Simple in/out tracking, export to accountant |
| **Tenant Screening/Background Checks** | Different lifecycle phase (pre-lease) | Assume tenant already vetted before creation |
| **Automatic Late Fees** | Requires configurable rules, payment modification | Landlord manually adjusts payment amount if needed |
| **Lease Approval Workflows** | No multi-user approval needed for target users | Single landlord = single decision maker |
| **Integration with Banks** | Out of scope, complex API integrations | Manual reconciliation via exported CSV |

## Feature Dependencies

```
Lease Management → Payment Tracking
  (Need lease to define expected payments)

Lease Terms (rent amount, due date) → Auto-generated Payment Schedule
  (Schedule requires lease configuration)

Payment Records → Outstanding Balance Calculation
  (Compare expected vs actual)

Payment Records + Expected Payments → Late Payment Detection
  (Need both to determine lateness)

Payment Records + Expenses → Net Income Reporting
  (Revenue - Expenses)

Partial Payment Support → Payment Status (Partial)
  (Need status field to represent partial payments)

Lease Start/End Dates → Occupancy Rate
  (Active leases = occupied units)

Payment History + Filtering → Month-over-Month Trends
  (Historical data required for trend analysis)

Receipt Photo Attachment → File Storage Infrastructure
  (Need storage system before enabling uploads)
```

## Feature Clusters

### Cluster 1: Payment Recording (Core)
Priority: Must have first
- Payment recording (date, amount, method, status)
- Payment method selection
- Payment history view
- Basic filtering

### Cluster 2: Lease Basics
Priority: Must have first
- Lease creation (tenant, room, dates, rent, deposit)
- Active lease status
- Lease list view

### Cluster 3: Payment-Lease Integration
Priority: After Clusters 1 & 2
- Auto-generated payment schedule
- Outstanding balance calculation
- Late payment detection
- Partial payment handling

### Cluster 4: Financial Reporting
Priority: After payment data accumulates
- Total income view
- Occupancy rate
- Quick stats dashboard
- CSV export

### Cluster 5: Advanced Reporting
Priority: Nice to have
- Month-over-month trends
- Payment collection rate
- Overdue aging report
- Expense tracking (separate net income)

### Cluster 6: Quality-of-Life
Priority: Polish phase
- Receipt photo attachment
- Payment notes/memo
- Receipt number auto-generation
- Lease term templates
- Vietnamese currency formatting
- Lease renewal workflow

## MVP Recommendation

Prioritize these features for minimal viable Phase 4:

### Must Have (Core MVP)
1. **Payment Recording** - Create payment: tenant, amount, date, method (cash/bank), status (paid/partial/pending)
2. **Lease Creation** - Create lease: tenant, room, start/end dates, monthly rent, deposit, payment due day
3. **Auto-generated Payment Schedule** - When lease created, generate expected monthly payments
4. **Payment History** - View all payments for a tenant or property
5. **Outstanding Balance** - Calculate expected vs received per tenant
6. **Basic Dashboard** - Total income (month/year), total pending, total overdue, occupancy rate
7. **CSV Export** - Export payments and leases

### Should Have (Enhanced MVP)
8. **Late Payment Detection** - Flag payments received after due date
9. **Receipt Photo Upload** - Attach photo to payment record
10. **Payment Status Update** - Mark pending → paid, handle partial payments
11. **Lease Status** - Active/expired indication
12. **Deposit Tracking** - Separate deposit from rent in lease record

### Could Have (Future Enhancements)
13. **Month-over-Month Trends** - Chart income, occupancy, collection rate
14. **Expense Tracking** - Record expenses with category, amount, date
15. **Payment Notes** - Add context to payment records
16. **Lease Renewal** - Workflow to create new lease from expiring one
17. **Receipt Number Generation** - Auto-increment receipt IDs
18. **Overdue Aging Report** - Categorize overdue by age buckets

### Won't Have (Anti-features)
- Online payment processing
- Automated reminders
- Document generation
- Tenant portal
- Utility billing

## Defer to Later Phases

| Feature | Reason to Defer | Suggested Phase |
|---------|----------------|-----------------|
| **Expense Tracking** | Adds complexity, need payment foundation first | Phase 5 or 6 |
| **Month-over-Month Trends** | Requires historical data, polish feature | Phase 5 |
| **Payment Collection Rate** | Derived metric, need baseline reporting first | Phase 5 |
| **Overdue Aging Report** | Advanced reporting, need basic overdue view first | Phase 5 |
| **Lease Renewal Workflow** | Edge case, manual workaround acceptable initially | Phase 5 |
| **Multi-room Lease** | Complex edge case, can assign separate leases initially | Phase 6+ |
| **Lease Term Templates** | Nice-to-have, manual entry acceptable | Phase 6+ |

## Vietnamese Context Considerations

Based on target user (Vietnamese landlords, 5-50 units, manual collection):

### Critical for Context
- **Vietnamese Dong (VND) formatting** - Large numbers need proper separators (5,000,000)
- **Cash payment method** - Still dominant in Vietnam, must be first-class option
- **Receipt photos** - Trust/proof culture, physical receipt photos expected
- **Partial payments** - More common than Western markets, tenants negotiate installments
- **Manual bank transfer** - Common alternative to cash, distinct from online payment

### Less Critical (Western-centric)
- **Online payment integration** - Not expected by target users
- **Automatic ACH/direct debit** - Rare in Vietnamese rental market
- **Credit card payments** - Uncommon for residential rent
- **Lease e-signature** - Physical contracts still standard

## Research Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Payment tracking basics | MEDIUM | Standard across all property management systems |
| Lease management basics | MEDIUM | Common patterns well-established |
| Financial reporting features | MEDIUM | Industry-standard KPIs |
| Vietnamese-specific features | LOW | Based on general knowledge, not verified with local users |
| Feature complexity estimates | MEDIUM | Development estimates, not domain-specific |
| Table stakes vs differentiators | LOW | No competitive analysis performed |

## Validation Needed

**CRITICAL:** Before finalizing Phase 4 requirements, validate:

1. **Vietnamese landlord interviews**
   - What payment tracking do they do in Excel/paper now?
   - What reports do they actually look at monthly?
   - How do they handle partial payments in practice?
   - Do they track expenses separately or mixed with income?

2. **Competitive analysis**
   - Review Vietnamese property management tools (if any exist)
   - What features do Buildium, AppFolio, TenantCloud include in basic tiers?
   - What's in free vs paid versions? (Indicates table stakes)

3. **Currency and formatting**
   - Confirm VND formatting preferences
   - Date format: DD/MM/YYYY or YYYY-MM-DD?
   - Decimal handling (VND typically doesn't use decimals)

4. **Payment workflow details**
   - How do landlords currently prove payment received?
   - Do they issue receipts? Handwritten or printed?
   - What information is on a typical receipt?

5. **Reporting priorities**
   - Which reports matter most? (Income, occupancy, overdue?)
   - What timeframes? (Monthly, quarterly, yearly?)
   - What do they export data for? (Tax filing, accountant, personal tracking?)

## Sources

**Training Data Only** - No external verification performed due to tool restrictions.

Recommended verification sources:
- Property management software: Buildium, AppFolio, TenantCloud, Rentec Direct
- Vietnamese property management solutions (research needed)
- User interviews with 5-10 target landlords
- Competitor feature matrices
- Industry reports on property management software requirements

**Next Steps:**
1. Verify table stakes classification with competitive analysis
2. Validate Vietnamese-specific features with target users
3. Confirm complexity estimates with development team
4. Cross-reference with existing room/tenant management schema
