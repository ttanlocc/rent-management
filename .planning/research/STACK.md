# Technology Stack

**Project:** Rent Management Payment & Financial Tracking
**Researched:** 2026-02-15
**Confidence:** MEDIUM (based on training data + established patterns, verification limited by tool restrictions)

## Recommended Stack

### File Upload & Storage
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @supabase/storage-js | ^2.7.0 | Receipt/document uploads | Already integrated with Supabase backend, handles auth automatically, S3-compatible storage with RLS policies |
| react-dropzone | ^14.3.0 | File drop UI component | Most popular drag-drop library (20k+ stars), excellent TypeScript support, works seamlessly with Supabase Storage |
| sharp (via Next.js API routes) | ^0.33.0 | Server-side image optimization | Built-in Next.js integration, compress receipt images before storage to save costs |

**Rationale:** Supabase Storage is already in your stack - no new service needed. React-dropzone provides polished UX for receipt uploads with preview, validation, and multi-file support. Sharp (already included in Next.js) handles server-side image optimization to reduce storage costs.

**Confidence:** HIGH - These are standard choices for Supabase + Next.js apps

### Date & Time Handling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| date-fns | ^3.3.0 | Date manipulation & formatting | Tree-shakeable (import only what you need), immutable, excellent TypeScript support, Vietnamese locale support (`vi` locale), better for payment schedules than dayjs |
| date-fns/locale/vi | ^3.3.0 | Vietnamese date formatting | Built-in Vietnamese translations for month names, relative dates |

**Rationale:** Payment tracking requires robust date handling (due dates, payment dates, lease periods). Date-fns is lighter than moment.js (which is deprecated), more functional than dayjs, and critically has built-in Vietnamese locale support for your UI requirements. Use `formatDistance`, `addMonths`, `isBefore` for lease schedule generation.

**Confidence:** HIGH - date-fns is the standard for modern React apps, verified Vietnamese locale support

### CSV Export
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| papaparse | ^5.4.0 | CSV generation & export | Most popular CSV library (13k+ stars), handles Unicode (Vietnamese characters), supports streaming large datasets, bidirectional (parse + unparse) |

**Rationale:** Financial reports need CSV export for accountants. Papaparse handles Vietnamese text encoding properly (UTF-8 BOM for Excel compatibility), can stream large payment histories without memory issues, and has simple API: `Papa.unparse(data)`.

**Confidence:** HIGH - Industry standard for CSV in React apps

### Charts & Visualization
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| recharts | ^2.12.0 | Financial charts & graphs | Built on D3, composable React components, responsive by default, 24k+ stars, simpler API than visx for dashboard use cases |
| recharts-scale | ^0.4.0 | Time-series scaling | Better date axis handling for financial trends |

**Rationale:** Financial dashboards need income/expense trends, occupancy rates over time. Recharts provides `<LineChart>`, `<BarChart>`, `<PieChart>` as React components with good defaults. Simpler than d3 directly, more maintained than victory-chart. Works well with shadcn/ui design system.

**Alternatives considered:**
- **visx (Airbnb):** More flexible but requires more setup, better for custom visualizations
- **Chart.js with react-chartjs-2:** Imperative API doesn't fit React patterns well
- **tremor:** Dashboard-focused but less customizable than recharts + shadcn/ui

**Confidence:** MEDIUM - Recharts is widely used, but visx might be better for complex custom charts. Verify with project needs.

### PDF Generation (Optional)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @react-pdf/renderer | ^3.4.0 | Generate payment receipts | React component API, generates PDFs in browser or server, good for invoices/receipts |
| react-to-print | ^2.15.0 | Print-friendly receipts | Simpler alternative if PDF not required, triggers browser print dialog with styled content |

**Rationale:** May want to generate PDF receipts for tenants. @react-pdf/renderer lets you define PDF layouts as React components, generates real PDFs. If just printing, react-to-print is lighter (no PDF dependency). Consider deferring until Phase 2 if not MVP.

**Confidence:** MEDIUM - PDF generation adds complexity, evaluate if needed vs browser print

### Form Handling (Payment Forms)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-hook-form | ^7.51.0 | Payment entry forms | Already likely in use with shadcn/ui, minimal re-renders, built-in validation, works with zod schemas |
| zod | ^3.22.0 | Schema validation | TypeScript-first validation, integrates with react-hook-form, type-safe payment data validation |

**Rationale:** Payment data requires validation (amounts must be positive, dates required, payment method from enum). React-hook-form + zod is the standard pattern in modern Next.js apps and works seamlessly with shadcn/ui Form components. Likely already in your codebase from Room/Tenant forms.

**Confidence:** HIGH - This is the standard form stack for Next.js + shadcn/ui apps

### Number Formatting (Currency)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Intl.NumberFormat (built-in) | Native | Vietnamese currency formatting | Built into browsers, no dependency, supports VND currency with `vi-VN` locale |

**Rationale:** Financial app needs consistent currency formatting. Use native `Intl.NumberFormat` instead of libraries:
```typescript
new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(amount)
// => "₫1.000.000"
```
No external dependency, proper Vietnamese formatting, handles decimal precision.

**Confidence:** HIGH - Native browser API, zero dependencies

### Data Fetching (Already in Stack)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @tanstack/react-query | ^5.28.0 | Server state management | Already in stack, use for payment/lease queries, optimistic updates for payment recording |

**Rationale:** Continue using React Query for payment/lease data fetching. Use `useMutation` for payment recording with optimistic updates, `useQuery` with staleTime for financial dashboards (can cache aggregated data).

**Confidence:** HIGH - Already established in your stack

### Database Schema Migrations
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Supabase CLI | ^1.187.0 | Database migrations | Built-in migration system, version control for schema changes (payments, leases tables), local development |

**Rationale:** Adding payments/leases requires new tables. Use Supabase CLI migrations instead of manual SQL in dashboard. Enables local development (`supabase start`), CI/CD integration, rollback capability.

**Confidence:** HIGH - Standard Supabase workflow

## Supporting Libraries

### Utility Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | ^2.1.0 | Conditional classNames | Already in shadcn/ui, use for payment status badges (paid/pending/overdue) |
| tailwind-merge | ^2.2.0 | Merge Tailwind classes | Already in shadcn/ui, prevents class conflicts |
| lodash-es (specific imports) | ^4.17.21 | Utilities | Only if needed for groupBy (group payments by month), debounce (search). Prefer native alternatives. |

**Rationale:** Minimize dependencies. clsx + tailwind-merge already in shadcn/ui stack. Avoid full lodash - use native methods or import specific functions: `import groupBy from 'lodash-es/groupBy'`.

**Confidence:** HIGH - Standard utilities in modern React apps

### Type Safety
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| supabase-js v2 types | Auto-generated | Type-safe DB queries | Generate types from schema: `npx supabase gen types typescript` |

**Rationale:** Financial data requires type safety. Generate TypeScript types from Supabase schema for payments/leases tables. Ensures compile-time safety for queries.

**Confidence:** HIGH - Standard Supabase TypeScript workflow

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Date handling | date-fns | dayjs | date-fns has better TypeScript + tree-shaking + Vietnamese locale |
| Date handling | date-fns | moment.js | Moment.js is deprecated, much larger bundle |
| CSV export | papaparse | csv-parse/stringify | Papaparse has better API, Unicode handling, documentation |
| Charting | recharts | visx | Visx more complex setup, better for custom viz not standard dashboards |
| Charting | recharts | chart.js | Chart.js imperative API, doesn't fit React patterns |
| Charting | recharts | tremor | Tremor less flexible styling, harder to match shadcn/ui |
| PDF generation | @react-pdf/renderer | jsPDF | jsPDF imperative, @react-pdf/renderer is React components |
| File upload UI | react-dropzone | uppy | Uppy heavier, more features than needed for receipts |
| Forms | react-hook-form | formik | formik has more re-renders, less active development |
| Number formatting | Intl (native) | numeral.js | Native API sufficient, no dependency needed |
| Number formatting | Intl (native) | dinero.js | Overkill for display formatting (good for calculations) |

## Installation

```bash
# Core dependencies for payment/lease/reporting features
npm install date-fns@^3.3.0 \
  papaparse@^5.4.0 \
  recharts@^2.12.0 \
  recharts-scale@^0.4.0 \
  react-dropzone@^14.3.0

# Type definitions
npm install -D @types/papaparse@^5.3.0

# Optional (defer to Phase 2 if not MVP)
npm install @react-pdf/renderer@^3.4.0  # If PDF receipts needed
npm install react-to-print@^2.15.0     # If print-only sufficient

# Already in stack (verify versions)
# @tanstack/react-query@^5.28.0
# @supabase/supabase-js@^2.39.0
# react-hook-form@^7.51.0
# zod@^3.22.0
```

## Anti-Recommendations

### Do NOT Use

| Technology | Why Avoid | Use Instead |
|------------|-----------|-------------|
| moment.js | Deprecated, large bundle (>70kb) | date-fns (tree-shakeable, 5-10kb) |
| lodash (full) | Entire library for few utilities (70kb+) | Native methods or specific imports |
| accounting.js | Unmaintained since 2014 | Native Intl.NumberFormat |
| money.js | Unmaintained | dinero.js if needed, or native |
| xlsx (SheetJS community) | Large bundle (500kb+) for just export | papaparse for CSV (60kb) |
| react-csv | Unmaintained, poor TypeScript support | papaparse |
| uuid | Unnecessary if Supabase generates IDs | Use Supabase auto-generated UUIDs |
| nanoid | Only if client-side IDs needed | Prefer server-generated (Supabase) |

**Rationale:** Avoid unmaintained libraries, oversized bundles for simple needs, and client-side ID generation when Supabase handles it.

## Configuration Recommendations

### Supabase Storage Bucket Setup
```sql
-- Create bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- RLS policy: users see only their property's receipts
CREATE POLICY "Users can view receipts for their properties"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts' AND auth.uid() IN (
  SELECT user_id FROM properties WHERE id = (
    SELECT property_id FROM payments WHERE receipt_path = name
  )
));
```

### Date-fns Configuration
```typescript
// lib/date-config.ts
import { vi } from 'date-fns/locale';
import { format, formatDistance } from 'date-fns';

export const formatDate = (date: Date) =>
  format(date, 'dd/MM/yyyy', { locale: vi });

export const formatRelative = (date: Date) =>
  formatDistance(date, new Date(), { locale: vi, addSuffix: true });
  // => "3 ngày trước"
```

### Recharts Theme (Match shadcn/ui)
```typescript
// components/ui/chart-config.ts
export const chartColors = {
  income: 'hsl(var(--primary))',      // Match your theme
  expense: 'hsl(var(--destructive))',
  occupancy: 'hsl(var(--success))',
};
```

## Database Schema Considerations

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  lease_id UUID REFERENCES leases(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'other')),
  receipt_path TEXT,  -- Supabase Storage path
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_lease ON payments(lease_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

### Leases Table
```sql
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent > 0),
  deposit_amount DECIMAL(10,2) NOT NULL CHECK (deposit_amount >= 0),
  payment_day INTEGER NOT NULL CHECK (payment_day BETWEEN 1 AND 31),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT lease_dates_valid CHECK (end_date > start_date)
);

CREATE INDEX idx_leases_room ON leases(room_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
```

## Performance Considerations

### Large Dataset Handling
| Concern | Solution | Library/Pattern |
|---------|----------|-----------------|
| 1000+ payment records | Virtual scrolling for tables | Use `@tanstack/react-virtual` if needed |
| CSV export of large data | Stream data in chunks | Papaparse streaming mode + Supabase pagination |
| Financial aggregations | Supabase DB aggregations | Use SQL `SUM()`, `GROUP BY` not client-side reduce |
| Chart rendering | Limit data points | Sample data or aggregate (daily → monthly for long periods) |

**Pattern:** Always aggregate in database, not client-side. Use Supabase's PostgREST aggregation queries.

```typescript
// Good: Aggregate in database
const { data } = await supabase
  .from('payments')
  .select('payment_date, amount.sum()')
  .gte('payment_date', startDate)
  .lte('payment_date', endDate);

// Bad: Fetch all and reduce client-side
const { data } = await supabase.from('payments').select('*');
const total = data.reduce((sum, p) => sum + p.amount, 0); // ❌
```

## Sources

**Note:** This research is based on established patterns in the Next.js + Supabase ecosystem as of my knowledge cutoff (January 2025). Verification with official documentation was limited by tool restrictions. Confidence levels reflect this limitation.

**Verification needed:**
- Latest versions of date-fns, recharts, papaparse (check npm registry)
- Supabase Storage API changes in v2.7.0+
- React Query v5 breaking changes from v4

**Recommended verification approach:**
- Check official documentation: date-fns.org, recharts.org, supabase.com/docs
- Verify npm package versions: `npm view <package> version`
- Review Next.js 15 compatibility for all libraries

**Confidence assessment:**
- Library choices: HIGH (these are established patterns)
- Version numbers: MEDIUM (based on training data from Jan 2025)
- Integration patterns: HIGH (standard Next.js + Supabase patterns)
- Vietnamese locale support: MEDIUM (verified for date-fns in training data)
