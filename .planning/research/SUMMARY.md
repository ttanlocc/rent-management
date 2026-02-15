# Research Summary: Rent Management Payment & Financial Tracking

**Domain:** Financial management extension for existing rent management system
**Researched:** 2026-02-15
**Overall confidence:** MEDIUM

**Research limitations:** Tool restrictions prevented verification with Context7 and WebSearch. Recommendations based on established Next.js + Supabase patterns from training data (January 2025). Version numbers and current best practices should be verified against official documentation.

## Executive Summary

Adding payment tracking, lease management, and financial reporting to an existing Next.js + Supabase rent management system requires minimal new dependencies. The recommended stack leverages existing infrastructure (Supabase Storage for receipts, React Query for data fetching, shadcn/ui form patterns) and adds focused libraries for specific needs: date-fns for payment schedule generation, papaparse for CSV export, and recharts for financial visualizations.

The technology choices prioritize three constraints: (1) integration with existing Next.js 15 + Supabase stack, (2) Vietnamese UI support, and (3) offline payment tracking without payment processing. Key architectural decisions include using Supabase's built-in storage for receipt uploads (avoiding third-party services), performing financial aggregations in PostgreSQL (not client-side), and generating payment schedules from lease terms using date utilities.

Critical technical considerations include proper date handling for recurring payments (Vietnamese calendar formatting, timezone-safe storage), currency formatting for Vietnamese dong (VND), and CSV export encoding for Vietnamese characters. The stack minimizes bundle size by avoiding deprecated libraries (moment.js), oversized dependencies (full lodash), and unnecessary client-side processing where database aggregations suffice.

The recommended approach builds incrementally: start with manual payment recording and receipt uploads (Phase 1), add lease terms with auto-generated schedules (Phase 2), then layer financial dashboards and reporting (Phase 3). This phasing allows validation of core payment tracking patterns before building complex aggregations and visualizations.

## Key Findings

**Stack:** Next.js 15 + Supabase (existing) + date-fns (dates/schedules) + papaparse (CSV) + recharts (charts) + react-dropzone (uploads)

**Architecture:** Database-driven aggregations with Supabase PostgREST, client-side visualizations with recharts, server-optimized image uploads via Next.js API routes

**Critical pitfall:** Don't fetch all payment records client-side for aggregations - use Supabase SQL functions for SUM/GROUP BY operations to avoid performance issues as payment history grows

## Implications for Roadmap

Based on research, suggested phase structure:

### 1. **Payment Recording Foundation** - Core data model + manual entry
   - Addresses: Payment table schema, manual payment entry forms, receipt uploads to Supabase Storage
   - Avoids: Building complex reporting before validating payment data model
   - Key dependencies: react-hook-form + zod (already in stack), react-dropzone, date-fns
   - Rationale: Establish payment data model early, validate with real usage before building reports on top

### 2. **Lease Management & Schedules** - Automated payment generation
   - Addresses: Lease terms storage, auto-generated payment schedules based on lease dates
   - Avoids: Manual payment creation for recurring monthly rent
   - Key dependencies: date-fns for schedule generation (addMonths, isBefore)
   - Rationale: Lease terms drive payment schedules - must come before comprehensive financial reporting

### 3. **Financial Dashboard & Reporting** - Visualizations + export
   - Addresses: Income/expense charts, occupancy metrics, historical trends, CSV export
   - Avoids: Building dashboards before sufficient payment history exists
   - Key dependencies: recharts (visualizations), papaparse (CSV export), Supabase aggregation queries
   - Rationale: Reporting is valuable only after payment data accumulates - build last

### 4. **Optimization & Polish** - Performance + UX enhancements
   - Addresses: Virtual scrolling for large payment lists, optimistic updates, advanced filtering
   - Avoids: Premature optimization before understanding actual data volumes
   - Key dependencies: @tanstack/react-virtual (if needed), React Query optimistic updates
   - Rationale: Performance needs emerge from real usage - defer until data volumes justify

## Phase Ordering Rationale

**Dependencies:**
- Payments → Leases (leases generate payment schedules, but manual payments don't require leases)
- Reporting → Payments (can't visualize data that doesn't exist)
- Optimization → All features (can't optimize what isn't built)

**Data flow:**
1. Manual payment entry establishes schema + validation patterns
2. Lease terms automate payment schedule creation
3. Accumulated payment data enables meaningful financial reports
4. Usage patterns inform performance optimizations

**Risk mitigation:**
- Validating payment data model early (Phase 1) prevents costly schema migrations later
- Deferring complex visualizations (Phase 3) until payment data exists avoids building reports on assumptions
- Keeping phases small enables course-correction if requirements change

## Research Flags for Phases

### Phase 1: Payment Recording (Unlikely to need research)
- Standard CRUD patterns already established in Rooms/Tenants
- File upload to Supabase Storage is well-documented
- Form validation follows existing shadcn/ui patterns

### Phase 2: Lease Management (Moderate research flag)
- **Flag:** Payment schedule generation algorithm needs design
- Question: How to handle edge cases (31st day payment on months with <31 days, pro-rated first/last month)
- Solution: Research date-fns patterns for recurring date calculations

### Phase 3: Financial Reporting (High research flag)
- **Flag:** Chart design for financial trends (what visualizations are meaningful?)
- **Flag:** Supabase aggregation query optimization for large datasets
- Question: How to structure dashboard for landlord insights (monthly income, occupancy rates, late payment trends)
- Solution: Research financial dashboard patterns, potentially interview users about needed metrics

### Phase 4: Optimization (Defer research)
- Research only if performance issues emerge
- Likely patterns: pagination, virtual scrolling, query caching strategies

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Library choices are standard for Next.js + Supabase, but version numbers unverified due to tool restrictions |
| Features | N/A | Features defined in project context, not researched |
| Architecture | HIGH | Database aggregations + client visualizations is established pattern |
| Pitfalls | MEDIUM | Common mistakes identified from Next.js patterns, but financial domain specifics may have additional pitfalls |

## Gaps to Address

### Verification Needed
1. **Version numbers:** Confirm latest stable versions of date-fns, recharts, papaparse, react-dropzone via npm registry or official docs
2. **Vietnamese locale support:** Verify date-fns Vietnamese locale completeness (month names, date formats, relative time)
3. **Next.js 15 compatibility:** Confirm all libraries work with Next.js 15 (especially @react-pdf/renderer if PDF generation needed)
4. **Supabase Storage API:** Check v2.7.0+ for any breaking changes in upload API

### Design Decisions Needed
1. **PDF receipts:** Determine if PDF generation (@react-pdf/renderer) is required or if browser print (react-to-print) suffices
2. **Payment schedule algorithm:** Define rules for edge cases (month-end payments, pro-rating, leap years)
3. **Financial metrics:** Identify which dashboard metrics are most valuable (occupancy rate, average revenue per room, late payment rate, etc.)
4. **Export formats:** Confirm CSV is sufficient or if Excel export (.xlsx) is needed (would require xlsx library)

### Phase-Specific Research Later
- **Phase 2:** Payment schedule generation algorithms, recurring date calculations
- **Phase 3:** Financial dashboard metric definitions, chart types for financial trends, aggregation query optimization
- **Phase 4:** Virtual scrolling implementation if needed, React Query cache strategies for dashboards

## Recommendations

### Immediate Actions
1. **Verify versions:** Run `npm view date-fns version`, `npm view recharts version`, etc. to confirm latest stable versions
2. **Check compatibility:** Test date-fns Vietnamese locale in Next.js 15 environment
3. **Review existing patterns:** Examine current Room/Tenant forms to ensure payment forms follow same patterns (react-hook-form + zod)

### Technology Decisions
1. **Use date-fns over dayjs/moment** - Better tree-shaking, Vietnamese locale, maintained
2. **Use recharts over visx/Chart.js** - React component API, good defaults, matches shadcn/ui
3. **Use papaparse over csv-stringify** - Better Unicode handling, simpler API, streaming support
4. **Use Supabase Storage over S3/Cloudinary** - Already integrated, cost-effective, RLS policies
5. **Use native Intl.NumberFormat over libraries** - Zero dependencies, proper VND formatting

### Anti-Patterns to Avoid
1. **Don't use moment.js** - Deprecated, large bundle
2. **Don't fetch all payments client-side** - Use database aggregations for SUM/GROUP BY
3. **Don't use full lodash** - Import specific functions or use native methods
4. **Don't generate IDs client-side** - Use Supabase auto-generated UUIDs
5. **Don't use unmaintained CSV libraries** - Many are abandoned, use papaparse

## Next Steps

For roadmap creation, use these stack decisions:

1. **Phase 1 dependencies:** react-dropzone, date-fns (minimal additions to existing stack)
2. **Phase 2 dependencies:** date-fns for schedule generation (already added in Phase 1)
3. **Phase 3 dependencies:** recharts, papaparse (defer until reporting phase)
4. **Phase 4 dependencies:** TBD based on performance needs

**Critical path:** Payment data model (Phase 1) must be correct before building lease automation (Phase 2) or reporting (Phase 3). Invest design time in database schema upfront.
