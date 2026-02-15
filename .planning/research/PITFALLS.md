# Domain Pitfalls

**Domain:** Payment tracking and financial reporting for rent management systems
**Researched:** 2026-02-15
**Confidence:** HIGH (based on common Next.js + Supabase + financial data patterns)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Client-Side Financial Aggregations
**What goes wrong:** Fetching all payment records to client, calculating totals with JavaScript reduce/filter instead of database aggregations. Causes performance collapse as payment history grows (1000+ records).

**Why it happens:** Developer convenience - easier to `data.reduce((sum, p) => sum + p.amount, 0)` than write SQL. Works fine with 50 payments, breaks at 5000.

**Consequences:**
- Initial page load fetches 5000+ payment records (multi-second load times)
- Browser memory issues with large datasets
- Unnecessary bandwidth consumption
- CSV export crashes browser
- Dashboard becomes unusable over time

**Prevention:**
```typescript
// ❌ BAD: Client-side aggregation
const { data: allPayments } = await supabase.from('payments').select('*');
const totalIncome = allPayments.reduce((sum, p) => sum + p.amount, 0);

// ✅ GOOD: Database aggregation
const { data } = await supabase
  .from('payments')
  .select('amount.sum()')
  .gte('payment_date', startDate)
  .lte('payment_date', endDate);
const totalIncome = data[0].sum;
```

Use Supabase PostgREST aggregation operators: `sum()`, `count()`, `avg()`. For complex aggregations, create Postgres functions and call via `.rpc()`.

**Detection:** Warning signs:
- `.select('*')` followed by JavaScript aggregation
- Dashboard load time increases over months
- Browser console shows 1000+ row API responses

### Pitfall 2: Naive Payment Schedule Generation (Month-End Edge Cases)
**What goes wrong:** Generating payment schedules from lease terms without handling month-end edge cases. Lease specifies "payment due on 31st of each month" - what happens in February (28/29 days)? System crashes or generates invalid dates.

**Why it happens:** Simple date math: `addMonths(startDate, 1)` without considering target day. Works for day 1-28, breaks for 29-31.

**Consequences:**
- Invalid dates in database (e.g., February 31st)
- Missing payment schedules for short months
- Inconsistent due dates (sometimes 31st, sometimes 28th)
- Database constraints fail on insert

**Prevention:**
```typescript
// ❌ BAD: Naive month addition
const nextPayment = addMonths(new Date(2026, 0, 31), 1); // Feb 31 invalid!

// ✅ GOOD: Explicit day handling
import { addMonths, setDate, lastDayOfMonth, min } from 'date-fns';

function generatePaymentDate(year: number, month: number, targetDay: number): Date {
  const targetDate = new Date(year, month, targetDay);
  const monthEnd = lastDayOfMonth(new Date(year, month, 1));

  // If target day > days in month, use last day of month
  return min([targetDate, monthEnd]);
}

// Payment on 31st → Feb 28/29, Apr 30, etc.
```

**Alternative pattern:** Store payment day as "last day of month" flag instead of day number.

**Detection:** Warning signs:
- Invalid date errors in console
- Missing payments in February/April/June/September/November
- Date validation errors on form submission

### Pitfall 3: Timezone Issues in Payment Date Storage
**What goes wrong:** Storing payment dates as JavaScript Date objects without timezone handling. User enters "payment on January 15" but database stores "2026-01-14T17:00:00Z" (UTC) due to Vietnam timezone (UTC+7). Queries for January 15 miss the payment.

**Why it happens:** JavaScript Date uses local timezone, Postgres TIMESTAMPTZ converts to UTC. Date inputs from forms get interpreted as midnight local time, which becomes previous day in UTC.

**Consequences:**
- Payment appears on wrong date in UI
- Date range queries miss payments on boundaries
- Reports show incorrect daily/weekly totals
- Historical data has subtle date shifts

**Prevention:**
```typescript
// ❌ BAD: Store Date object directly
const paymentDate = new Date(formValues.payment_date); // Local timezone
await supabase.from('payments').insert({ payment_date: paymentDate }); // Converts to UTC

// ✅ GOOD: Use DATE type (not TIMESTAMP) for payment dates
// In Supabase schema
CREATE TABLE payments (
  payment_date DATE NOT NULL,  -- Date-only, no time/timezone
  created_at TIMESTAMPTZ DEFAULT NOW()  -- Timestamp with timezone for record creation
);

// In code: format as ISO date string (YYYY-MM-DD)
import { format } from 'date-fns';
const paymentDate = format(formValues.payment_date, 'yyyy-MM-dd');
await supabase.from('payments').insert({ payment_date: paymentDate });
```

**Rationale:** Payments happen on a date, not a specific time. Use DATE type, not TIMESTAMPTZ, for payment_date/due_date fields.

**Detection:** Warning signs:
- Payments showing up on wrong dates in UI
- Date range filters miss boundary dates
- UTC timestamps in database for date-only fields

### Pitfall 4: Missing Idempotency in Payment Entry
**What goes wrong:** User submits payment form, network is slow, user clicks "Save" again thinking it didn't work. Two identical payment records created. Duplicates inflate financial totals.

**Why it happens:** No idempotency key or duplicate detection. Form submission doesn't disable submit button during async operation.

**Consequences:**
- Duplicate payment records
- Inflated income totals in reports
- Manual cleanup required
- Loss of trust in data accuracy

**Prevention:**
```typescript
// ✅ Pattern 1: Disable button during submission
const [isSubmitting, setIsSubmitting] = useState(false);

async function handleSubmit(data) {
  setIsSubmitting(true);
  try {
    await supabase.from('payments').insert(data);
  } finally {
    setIsSubmitting(false);
  }
}

<Button disabled={isSubmitting}>Save Payment</Button>

// ✅ Pattern 2: Unique constraint on payment records
CREATE UNIQUE INDEX idx_payments_unique
ON payments(tenant_id, payment_date, amount)
WHERE deleted_at IS NULL;  -- Prevent exact duplicates

// ✅ Pattern 3: Optimistic updates with React Query
const mutation = useMutation({
  mutationFn: createPayment,
  onMutate: async (newPayment) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['payments'] });
    // Optimistically update
    queryClient.setQueryData(['payments'], (old) => [...old, newPayment]);
  },
});
```

**Detection:** Warning signs:
- Multiple identical payment records for same date/tenant
- Users report "submit button didn't work" issues
- Inconsistent payment counts after form submissions

### Pitfall 5: File Upload Without Size/Type Validation
**What goes wrong:** Receipt upload accepts any file type/size. User uploads 50MB video file instead of receipt image. Supabase Storage costs spike, storage quota exhausted, uploads fail for legitimate users.

**Why it happens:** Trusting client-side validation only (easily bypassed). No server-side checks before storage.

**Consequences:**
- Storage costs spike unexpectedly
- Large files cause slow page loads (fetching receipts)
- Storage quota exceeded (uploads start failing)
- Security risk (upload executable files, though Supabase doesn't execute)

**Prevention:**
```typescript
// ✅ Client-side validation (UX)
<input
  type="file"
  accept="image/*,application/pdf"  // Hint to file picker
  onChange={handleFileChange}
/>

function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error('File must be under 5MB');
    return;
  }

  // Validate type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Only images and PDFs allowed');
    return;
  }
}

// ✅ Server-side validation (Next.js API route)
// app/api/upload-receipt/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate on server
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Optimize images with sharp before uploading
  if (file.type.startsWith('image/')) {
    const buffer = await file.arrayBuffer();
    const optimized = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload optimized version
    await supabase.storage.from('receipts').upload(path, optimized);
  }
}

// ✅ Supabase Storage bucket limits
-- Set bucket size limit in Supabase dashboard
ALTER TABLE storage.buckets
SET file_size_limit = 5242880;  -- 5MB in bytes
```

**Detection:** Warning signs:
- Unexpected storage costs
- Large files in storage bucket
- Slow receipt preview loads
- Storage quota warnings from Supabase

## Moderate Pitfalls

### Pitfall 6: Not Indexing Query Columns
**What goes wrong:** Querying payments by `tenant_id`, `payment_date` without database indexes. Slow queries as data grows (full table scans).

**Prevention:**
```sql
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_lease ON payments(lease_id);
CREATE INDEX idx_leases_status ON leases(status);
```

Add indexes for all foreign keys and frequently filtered columns.

### Pitfall 7: Hardcoding VND Currency Instead of Using Intl
**What goes wrong:** Hardcoding VND formatting with string concatenation. Breaks if number formatting rules change, doesn't handle edge cases (negative numbers, large amounts).

**Prevention:**
```typescript
// ❌ BAD
const formatted = '₫' + amount.toLocaleString();

// ✅ GOOD
const formatted = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(amount);
```

### Pitfall 8: CSV Export Without UTF-8 BOM for Vietnamese
**What goes wrong:** Exporting CSV with Vietnamese characters, Excel shows garbled text (encoding issues).

**Prevention:**
```typescript
import Papa from 'papaparse';

const csv = Papa.unparse(data);
// Add UTF-8 BOM for Excel compatibility
const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
saveAs(blob, 'payments.csv');
```

### Pitfall 9: Not Handling Decimal Precision for Currency
**What goes wrong:** Using JavaScript `number` for currency calculations, accumulating floating point errors (0.1 + 0.2 = 0.30000000000000004).

**Prevention:**
```typescript
// ✅ Store as DECIMAL in database
CREATE TABLE payments (
  amount DECIMAL(10,2) NOT NULL  -- Exact precision
);

// ✅ Do calculations in database, not JavaScript
SELECT SUM(amount) FROM payments;  -- Exact
// Not: payments.reduce((sum, p) => sum + p.amount, 0)  -- Floating point errors

// ✅ If client-side needed, use integer cents
const amountInCents = Math.round(amount * 100);  // Store as integer
const displayAmount = amountInCents / 100;  // Display
```

### Pitfall 10: Overwriting Receipts on Re-Upload
**What goes wrong:** Using same filename for receipts (e.g., "receipt.jpg"), newer uploads overwrite previous ones. Lost proof of payment.

**Prevention:**
```typescript
// ✅ Generate unique filenames
import { nanoid } from 'nanoid';
const filename = `${paymentId}-${nanoid()}.${extension}`;

// Or use Supabase-generated UUIDs
const { data } = await supabase.storage
  .from('receipts')
  .upload(`${paymentId}/${crypto.randomUUID()}.jpg`, file);
```

## Minor Pitfalls

### Pitfall 11: Not Soft-Deleting Payment Records
**What goes wrong:** Hard deleting payment records (`DELETE FROM payments WHERE id = ?`). Can't recover mistakes, breaks audit trail.

**Prevention:** Add `deleted_at` column, filter in queries:
```sql
ALTER TABLE payments ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_payments_not_deleted ON payments(id) WHERE deleted_at IS NULL;

-- Queries always filter
SELECT * FROM payments WHERE deleted_at IS NULL;
```

### Pitfall 12: Inconsistent Date Formats in UI
**What goes wrong:** Mixing MM/DD/YYYY and DD/MM/YYYY formats in different parts of UI. User confusion.

**Prevention:** Create shared date formatting utility, use consistently:
```typescript
// lib/utils/date.ts
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date: Date | string) =>
  format(new Date(date), 'dd/MM/yyyy', { locale: vi });
```

### Pitfall 13: Not Validating Payment Amount is Positive
**What goes wrong:** Accepting negative payment amounts. Database stores `-5000000`, reports show negative income.

**Prevention:**
```sql
ALTER TABLE payments ADD CONSTRAINT amount_positive CHECK (amount > 0);

-- In Zod schema
const paymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
});
```

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Payment Entry | Client-side aggregations | Use Supabase aggregation functions from start |
| Phase 1: Receipt Upload | No file validation | Implement size/type checks immediately |
| Phase 1: Payment Dates | Timezone issues | Use DATE type, not TIMESTAMPTZ |
| Phase 2: Lease Schedule | Month-end edge cases | Test with 31st day payment, February dates |
| Phase 2: Payment Generation | Duplicate idempotency | Add unique constraints, disable buttons |
| Phase 3: Financial Dashboard | Fetch all data for charts | Aggregate in database, paginate/limit |
| Phase 3: CSV Export | Vietnamese encoding | UTF-8 BOM for Excel compatibility |
| Phase 3: Metrics Calculation | Floating point errors | Use DECIMAL type, calculate in database |

## Testing Checklist for Pitfall Prevention

**Payment Entry:**
- [ ] Submit payment form twice rapidly (duplicate prevention)
- [ ] Enter negative amount (validation)
- [ ] Enter payment date in past/future (acceptance)
- [ ] Upload 10MB file (size limit)
- [ ] Upload .exe file (type validation)

**Payment Schedules:**
- [ ] Lease with payment day = 31 (February handling)
- [ ] Leap year February (29 days)
- [ ] Payment day = 30 (months with 30 days)

**Financial Reports:**
- [ ] Load dashboard with 5000+ payments (performance)
- [ ] Export 1000+ payments to CSV (Vietnamese encoding in Excel)
- [ ] Sum payments with decimal amounts (precision)

**Date Handling:**
- [ ] Payment on month boundary (timezone)
- [ ] Query payments by date range (boundary inclusion)
- [ ] Display dates in different UI contexts (format consistency)

## Common Mistakes Summary

**Top 3 mistakes that cause rewrites:**
1. Client-side aggregations → database aggregations
2. Month-end payment schedule bugs → explicit day handling
3. Timezone date storage issues → DATE type not TIMESTAMPTZ

**Top 3 mistakes that cause data issues:**
1. Duplicate payments → idempotency + unique constraints
2. Floating point currency → DECIMAL type + DB calculations
3. Lost receipts → unique filenames + soft deletes

**Top 3 mistakes that cause poor UX:**
1. No file upload validation → size/type limits
2. Inconsistent date formats → shared utilities
3. Slow dashboard loads → database aggregations

## Sources

**Domain knowledge:** Common pitfalls in financial applications, Next.js + Supabase patterns from training data
**Date handling:** JavaScript Date timezone issues, PostgreSQL DATE vs TIMESTAMPTZ
**Currency handling:** Floating point precision issues, DECIMAL type best practices
**File uploads:** Supabase Storage best practices, image optimization patterns

**Confidence:** HIGH - These are well-documented pitfalls in financial applications and Next.js/Supabase development patterns
