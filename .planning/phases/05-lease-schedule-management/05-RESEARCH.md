# Phase 05: Lease & Schedule Management - Research

**Researched:** 2026-02-25
**Domain:** Lease agreement management, automated payment schedule generation, date calculations
**Confidence:** HIGH

## Summary

Lease & Schedule Management involves three core capabilities: storing lease agreements (start/end dates, rent amount, deposit), automatically generating expected monthly payment schedules from lease terms, and tracking lease status (active, expiring soon, expired). This phase eliminates manual monthly payment entry by deriving expected payments from lease contracts.

This phase builds on existing patterns from Phase 3 (Tenant Management) and Phase 4 (Payment Tracking), extending the TanStack Query + Next.js API Routes + Supabase stack to handle leases and scheduled payments. The key technical challenge is generating a monthly payment schedule from a date range and keeping it synchronized when lease terms change.

**Primary recommendation:** Use a dedicated `leases` table with foreign keys to `tenants` and `rooms`, store lease status as computed field from date comparison (not stored), create a `lease_payment_schedules` table for generated expected payments, use date-fns for date manipulation (smallest bundle, tree-shakeable, TypeScript-friendly), implement schedule regeneration logic on lease create/update, and leverage PostgreSQL date functions for lease status queries.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.5 | App Router with API routes | Already in project, handles both UI and backend |
| @supabase/supabase-js | ^2.93.1 | Supabase client for database queries | Already in project, provides typed queries with RLS |
| @tanstack/react-query | ^5.90.20 | Server state management with optimistic updates | Already in project, proven pattern for CRUD operations |
| react-hook-form | ^7.71.1 | Form state management | Already in project, integrates with Zod |
| zod | ^4.3.6 | Schema validation and TypeScript types | Already in project, type-safe validation |
| date-fns | ^4.1.0 | Date manipulation and calculations | Industry standard, tree-shakeable, TypeScript support, 2KB gzipped |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | ^2.0.7 | Toast notifications | Already in project, user feedback for mutations |
| lucide-react | ^0.563.0 | Icons (Calendar, AlertCircle, Clock, etc.) | Already in project, consistent iconography |
| shadcn/ui Badge | (included) | Lease status visual indicators (active/expiring/expired) | Already in project, variant system |
| @radix-ui/react-select | ^2.2.6 | Date range presets for filtering | Already in project, accessible selects |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| date-fns | Day.js | Day.js is 2KB but date-fns has better TypeScript support and functional API; date-fns is more suitable for complex date operations |
| date-fns | Temporal API | Temporal is future standard but still Stage 3 proposal, not production-ready in 2026, date-fns is battle-tested |
| Separate schedule table | JSONB array in leases table | Separate table allows better querying, filtering, and joining with actual payments; JSONB harder to query efficiently |
| Computed lease status | Stored status field | Computing status from dates ensures accuracy, no stale data from missed updates; minimal performance cost with proper indexing |
| Schedule regeneration | Versioned schedules | Regeneration simpler for MVP; versioning adds complexity for historical tracking not needed in requirements |

**Installation:**
```bash
npm install date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── leases/
│       ├── route.ts                        # GET (list), POST (create + generate schedule)
│       └── [id]/
│           ├── route.ts                    # GET (detail), PUT (update + regenerate), DELETE
│           └── schedule/
│               └── route.ts                # GET (payment schedule for lease)
hooks/
├── useLeases.ts                            # TanStack Query hooks for lease CRUD
components/
├── leases/
│   ├── LeaseForm.tsx                       # Create/edit lease form with date pickers
│   ├── LeaseCard.tsx                       # Lease summary with status badge
│   ├── LeaseDetailView.tsx                 # Full lease terms + payment schedule
│   ├── PaymentScheduleTable.tsx            # Expected payment schedule display
│   └── LeaseStatusBadge.tsx                # Status indicator (active/expiring/expired)
lib/
├── validations/
│   └── lease.ts                            # Zod schemas for lease CRUD
└── utils/
    ├── lease-status.ts                     # Calculate lease status from dates
    └── schedule-generator.ts               # Generate monthly payment schedule
```

### Pattern 1: Lease with Auto-Generated Payment Schedule
**What:** Create lease record, immediately generate expected monthly payment schedule
**When to use:** Create and update lease operations
**Example:**
```typescript
// Source: Rental property management patterns + date-fns documentation
// lib/utils/schedule-generator.ts
import { addMonths, startOfMonth, isBefore, isAfter } from 'date-fns'

export interface ScheduleEntry {
  due_date: string // ISO date string
  expected_amount: number
  period_start: string
  period_end: string
}

export function generatePaymentSchedule(
  leaseStartDate: string,
  leaseEndDate: string,
  monthlyRent: number
): ScheduleEntry[] {
  const schedule: ScheduleEntry[] = []

  const start = new Date(leaseStartDate)
  const end = new Date(leaseEndDate)

  // Generate payment for each month from start to end
  let currentDate = startOfMonth(start)

  while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
    const periodEnd = addMonths(currentDate, 1)

    schedule.push({
      due_date: currentDate.toISOString(),
      expected_amount: monthlyRent,
      period_start: currentDate.toISOString(),
      period_end: periodEnd.toISOString(),
    })

    currentDate = periodEnd
  }

  return schedule
}

// Usage in API route
const schedule = generatePaymentSchedule(
  validatedData.start_date,
  validatedData.end_date,
  validatedData.monthly_rent
)

// Insert lease first, then insert schedule entries
const { data: lease } = await supabase
  .from('leases')
  .insert({ ...leaseData })
  .select()
  .single()

await supabase
  .from('lease_payment_schedules')
  .insert(
    schedule.map(entry => ({
      lease_id: lease.id,
      ...entry,
    }))
  )
```

### Pattern 2: Lease Status Calculation (Computed Field)
**What:** Calculate lease status from current date vs lease dates without storing
**When to use:** Lease list queries, detail views, status filtering
**Example:**
```typescript
// Source: PostgreSQL date comparison + lease management patterns
// lib/utils/lease-status.ts
import { differenceInDays, isBefore, isAfter } from 'date-fns'

export type LeaseStatus = 'active' | 'expiring_soon' | 'expired'

export function calculateLeaseStatus(
  startDate: string,
  endDate: string,
  expiringThresholdDays: number = 30
): LeaseStatus {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Not started yet or already ended
  if (isBefore(now, start)) {
    return 'active' // Future lease treated as active
  }

  if (isAfter(now, end)) {
    return 'expired'
  }

  // Check if expiring soon (within threshold days)
  const daysUntilExpiry = differenceInDays(end, now)

  if (daysUntilExpiry <= expiringThresholdDays) {
    return 'expiring_soon'
  }

  return 'active'
}

// For PostgreSQL query (server-side filtering)
// app/api/leases/route.ts
// Filter by status using PostgreSQL date functions
if (status === 'expired') {
  query = query.lt('end_date', new Date().toISOString())
} else if (status === 'expiring_soon') {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + 30)

  query = query
    .gte('end_date', new Date().toISOString())
    .lte('end_date', threshold.toISOString())
} else if (status === 'active') {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + 30)

  query = query.gt('end_date', threshold.toISOString())
}
```

### Pattern 3: Schedule Regeneration on Lease Update
**What:** When lease terms change (dates or rent), delete old schedule and regenerate
**When to use:** Lease edit operations that affect payment schedule
**Example:**
```typescript
// Source: Database transaction patterns + schedule generation
// app/api/leases/[id]/route.ts (PUT handler)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServer()
  const { id } = params
  const body = await request.json()
  const validatedData = updateLeaseSchema.parse(body)

  // Check if fields affecting schedule changed
  const scheduleAffectingFields = ['start_date', 'end_date', 'monthly_rent']
  const scheduleChanged = scheduleAffectingFields.some(
    field => field in validatedData
  )

  // Update lease
  const { data: updatedLease, error: updateError } = await supabase
    .from('leases')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) return handleSupabaseError(updateError)

  // Regenerate schedule if necessary
  if (scheduleChanged) {
    // Delete old schedule entries
    await supabase
      .from('lease_payment_schedules')
      .delete()
      .eq('lease_id', id)

    // Generate new schedule
    const newSchedule = generatePaymentSchedule(
      updatedLease.start_date,
      updatedLease.end_date,
      updatedLease.monthly_rent
    )

    // Insert new schedule
    await supabase
      .from('lease_payment_schedules')
      .insert(
        newSchedule.map(entry => ({
          lease_id: id,
          ...entry,
        }))
      )
  }

  return createSuccessResponse(updatedLease)
}
```

### Pattern 4: Lease Detail View with Payment Schedule
**What:** Display lease terms alongside expected payment schedule, compare with actual payments
**When to use:** Tenant detail view, lease management page
**Example:**
```typescript
// Source: Existing tenant detail pattern + financial tracking UX
// components/leases/LeaseDetailView.tsx
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { calculateLeaseStatus } from '@/lib/utils/lease-status'
import { Calendar, DollarSign, FileText } from 'lucide-react'

interface LeaseDetailViewProps {
  lease: {
    id: string
    start_date: string
    end_date: string
    monthly_rent: number
    deposit: number
    tenant: { full_name: string }
    room: { name: string }
  }
  schedule: Array<{
    due_date: string
    expected_amount: number
    period_start: string
    period_end: string
  }>
}

export function LeaseDetailView({ lease, schedule }: LeaseDetailViewProps) {
  const status = calculateLeaseStatus(lease.start_date, lease.end_date)

  const statusConfig = {
    active: { label: 'Đang hoạt động', variant: 'default' as const },
    expiring_soon: { label: 'Sắp hết hạn', variant: 'secondary' as const },
    expired: { label: 'Đã hết hạn', variant: 'outline' as const },
  }

  return (
    <div className="space-y-6">
      {/* Lease Terms */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Hợp đồng thuê</h2>
            <p className="text-sm text-zinc-500">
              {lease.tenant.full_name} • Phòng {lease.room.name}
            </p>
          </div>
          <Badge variant={statusConfig[status].variant}>
            {statusConfig[status].label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Ngày bắt đầu</p>
              <p className="font-medium">{formatDate(lease.start_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Ngày kết thúc</p>
              <p className="font-medium">{formatDate(lease.end_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Tiền thuê hàng tháng</p>
              <p className="font-medium">{formatCurrency(lease.monthly_rent)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Tiền đặt cọc</p>
              <p className="font-medium">{formatCurrency(lease.deposit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Lịch thanh toán dự kiến</h3>
        <div className="space-y-2">
          {schedule.map((entry) => (
            <div
              key={entry.due_date}
              className="flex justify-between items-center p-3 bg-zinc-50 rounded"
            >
              <div>
                <p className="font-medium">{formatDate(entry.due_date)}</p>
                <p className="text-xs text-zinc-500">
                  {formatDate(entry.period_start)} - {formatDate(entry.period_end)}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(entry.expected_amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Pattern 5: Early Lease Termination
**What:** Allow landlord to end lease early by setting move-out date, keeping schedule intact for history
**When to use:** Tenant moves out before lease end date
**Example:**
```typescript
// Source: Lease management workflow patterns
// app/api/leases/[id]/terminate/route.ts
import { z } from 'zod'

const terminateLeaseSchema = z.object({
  move_out_date: z.string().datetime(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServer()
  const body = await request.json()
  const { move_out_date } = terminateLeaseSchema.parse(body)

  // Update tenant's move_out_date
  const { data: lease } = await supabase
    .from('leases')
    .select('tenant_id, end_date')
    .eq('id', params.id)
    .single()

  if (!lease) return errors.notFound('Hợp đồng')

  // Update tenant move_out_date
  await supabase
    .from('tenants')
    .update({
      move_out_date,
      is_active: false,
    })
    .eq('id', lease.tenant_id)

  // Update lease end_date to move_out_date (early termination)
  const { data: updatedLease } = await supabase
    .from('leases')
    .update({ end_date: move_out_date })
    .eq('id', params.id)
    .select()
    .single()

  // Keep schedule entries for history, but they become "cancelled" after move_out_date
  // No deletion needed - status logic will show them as past due but not relevant

  return createSuccessResponse(updatedLease)
}
```

### Anti-Patterns to Avoid
- **Don't store computed lease status** — Calculate from dates on query to avoid stale data; PostgreSQL date functions are fast
- **Don't regenerate schedule on every read** — Generate once on create/update, store in database, query when needed
- **Don't allow overlapping leases for same tenant** — Validate that tenant has no active lease before creating new one
- **Don't hardcode "expiring soon" threshold** — Make it configurable (default 30 days) for different landlord preferences
- **Don't delete schedule entries on lease update** — Archive or version them if historical tracking needed; for MVP, simple delete-and-regenerate is sufficient

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date manipulation and arithmetic | Custom date math with JavaScript Date | date-fns library | Edge cases: DST, leap years, month boundaries, timezone handling; date-fns handles all correctly |
| Payment schedule generation | Manual loop with complex date logic | date-fns addMonths + startOfMonth + comparison functions | Month addition is complex (different month lengths), date-fns tested for all edge cases |
| Lease status calculation | Complex if/else date comparisons | Utility function with date-fns differenceInDays | Consistent logic, reusable, testable; avoids timezone bugs |
| Date range validation | Custom date comparison logic | Zod schema with refinements + date-fns isBefore/isAfter | Type-safe validation at API boundary, prevents invalid date ranges |
| Month iteration | While loop with manual date incrementing | date-fns eachMonthOfInterval or manual with addMonths | eachMonthOfInterval returns array of dates for range, cleaner than imperative loop |

**Key insight:** Date arithmetic is deceptively complex with month boundaries, leap years, and timezones. date-fns provides battle-tested functions that handle edge cases. Schedule generation requires accurate month addition which is non-trivial (Jan 31 + 1 month = Feb 28/29, not Mar 3).

## Common Pitfalls

### Pitfall 1: Month Addition Edge Cases
**What goes wrong:** Adding 1 month to January 31 gives March 3 instead of February 28/29; schedules have wrong due dates
**Why it happens:** JavaScript Date.setMonth() rolls over when day doesn't exist in target month
**How to avoid:** Use date-fns addMonths() which handles overflow correctly, or startOfMonth() to always use first day of month for due dates
**Warning signs:** Schedule entries skip months, due dates appear on unexpected days, February schedules missing

### Pitfall 2: Overlapping Leases for Same Tenant/Room
**What goes wrong:** Tenant has multiple active leases, room shows as occupied by multiple tenants, payment tracking ambiguous
**Why it happens:** No validation preventing new lease creation when active lease exists
**How to avoid:**
- Before creating lease, query for active leases for same tenant OR same room
- Validation: `SELECT * FROM leases WHERE (tenant_id = ? OR room_id = ?) AND end_date >= NOW()`
- Return error if active lease found
**Warning signs:** Duplicate payment schedules, tenant detail shows multiple active leases, room occupancy count > 1

### Pitfall 3: Timezone Handling in Date Comparisons
**What goes wrong:** Lease shows as expired at 5pm instead of midnight; status changes at unexpected times
**Why it happens:** Mixing local time and UTC, comparing Date objects instead of date-only strings
**How to avoid:**
- Store dates as DATE type in PostgreSQL (not TIMESTAMPTZ) when time component not needed
- Use date-only ISO strings (YYYY-MM-DD) for lease dates, not full ISO timestamps
- Normalize to start of day when comparing: `startOfDay(date)` before comparison
- Let PostgreSQL handle date comparisons: `WHERE end_date < CURRENT_DATE`
**Warning signs:** Lease status flips at weird hours, schedule generation off by one day, date filtering includes/excludes wrong records

### Pitfall 4: Not Handling Partial Month Rent
**What goes wrong:** Tenant moves in mid-month but schedule shows full month rent; first payment incorrect
**Why it happens:** Schedule generation assumes full months only, doesn't prorate for partial periods
**How to avoid:**
- For MVP: Document that leases should start on first of month, or landlord manually adjusts first payment
- Future enhancement: Calculate prorated amount for first/last partial months
- Validation hint: Show warning if start_date is not first of month
**Warning signs:** First payment amount disputed by tenant, schedule doesn't match actual agreement

### Pitfall 5: Schedule Regeneration Without Transaction Safety
**What goes wrong:** Old schedule deleted, server error before inserting new schedule, lease has no payment schedule
**Why it happens:** Delete and insert not atomic; network failure or validation error between operations
**How to avoid:**
- Wrap schedule regeneration in database transaction (Supabase does auto-commit per query)
- Generate new schedule entries BEFORE deleting old ones
- On error, rollback both operations
- Alternative: Soft delete old schedule (archived=true), insert new, only delete if successful
**Warning signs:** Leases exist with empty payment schedules, orphaned schedule entries with no lease, schedule count doesn't match lease count

### Pitfall 6: Not Linking Lease to Room and Tenant Properly
**What goes wrong:** Lease created but tenant.room_id still null, room status not updated, inconsistent state
**Why it happens:** Lease creation doesn't update related tenant and room records
**How to avoid:**
- Lease API should verify tenant is assigned to room before creating lease
- Or: Allow creating lease first, then assign tenant to room (lease links both)
- Ensure RLS policies check lease -> tenant -> room -> property -> user chain
- Update room.status to 'occupied' when lease becomes active
**Warning signs:** Lease exists but tenant not in room, room shows vacant but has active lease, navigation broken

## Code Examples

Verified patterns from official sources:

### Database Schema for Leases Table
```sql
-- Source: Rental property database patterns + existing schema conventions
-- Database migration: create_leases_table.sql

CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,

    -- Lease terms
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(15,2) NOT NULL CHECK (monthly_rent > 0),
    deposit DECIMAL(15,2) NOT NULL CHECK (deposit >= 0),

    -- Audit timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT lease_dates_valid CHECK (end_date > start_date),
    CONSTRAINT one_tenant_one_active_lease UNIQUE (tenant_id) -- Prevents overlapping leases for same tenant
);

-- Lease payment schedules (expected payments)
CREATE TABLE lease_payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID REFERENCES leases(id) ON DELETE CASCADE NOT NULL,

    -- Schedule entry details
    due_date DATE NOT NULL,
    expected_amount DECIMAL(15,2) NOT NULL CHECK (expected_amount > 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_payment_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access leases for their properties
CREATE POLICY "Users can view own leases" ON leases
    FOR ALL USING (
        room_id IN (
            SELECT r.id FROM rooms r
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own lease schedules" ON lease_payment_schedules
    FOR ALL USING (
        lease_id IN (
            SELECT l.id FROM leases l
            JOIN rooms r ON l.room_id = r.id
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_leases_room_id ON leases(room_id);
CREATE INDEX idx_leases_dates ON leases(start_date, end_date);
CREATE INDEX idx_leases_active ON leases(end_date) WHERE end_date >= CURRENT_DATE;
CREATE INDEX idx_lease_schedules_lease_id ON lease_payment_schedules(lease_id);
CREATE INDEX idx_lease_schedules_due_date ON lease_payment_schedules(due_date);

-- Trigger to update updated_at
CREATE TRIGGER update_leases_updated_at BEFORE UPDATE ON leases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Validation Schema with Date Rules
```typescript
// Source: Existing validation patterns + lease-specific rules
// lib/validations/lease.ts
import { z } from 'zod'
import { isBefore, isAfter, parseISO } from 'date-fns'

export const createLeaseSchema = z.object({
  tenant_id: z.string().uuid('Tenant ID không hợp lệ'),
  room_id: z.string().uuid('Room ID không hợp lệ'),
  start_date: z.string().refine((date) => {
    // Must be valid date
    const parsed = parseISO(date)
    return !isNaN(parsed.getTime())
  }, 'Ngày bắt đầu không hợp lệ'),
  end_date: z.string().refine((date) => {
    const parsed = parseISO(date)
    return !isNaN(parsed.getTime())
  }, 'Ngày kết thúc không hợp lệ'),
  monthly_rent: z.number().positive('Tiền thuê phải lớn hơn 0'),
  deposit: z.number().min(0, 'Tiền cọc không được âm'),
}).refine(
  (data) => {
    // End date must be after start date
    const start = parseISO(data.start_date)
    const end = parseISO(data.end_date)
    return isAfter(end, start)
  },
  {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['end_date'],
  }
)

export const updateLeaseSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  monthly_rent: z.number().positive().optional(),
  deposit: z.number().min(0).optional(),
}).refine(
  (data) => {
    // If both dates provided, validate range
    if (data.start_date && data.end_date) {
      const start = parseISO(data.start_date)
      const end = parseISO(data.end_date)
      return isAfter(end, start)
    }
    return true
  },
  {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['end_date'],
  }
)

export const leaseFormSchema = z.object({
  tenant_id: z.string().uuid('Tenant ID không hợp lệ'),
  room_id: z.string().uuid('Room ID không hợp lệ'),
  start_date: z.date(), // Form uses Date object
  end_date: z.date(),
  monthly_rent: z.number().positive('Tiền thuê phải lớn hơn 0'),
  deposit: z.number().min(0, 'Tiền cọc không được âm'),
}).refine(
  (data) => isAfter(data.end_date, data.start_date),
  {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['end_date'],
  }
)

export const leaseQuerySchema = z.object({
  tenant_id: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  status: z.enum(['active', 'expiring_soon', 'expired']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>
export type LeaseFormInput = z.infer<typeof leaseFormSchema>
export type LeaseQueryParams = z.infer<typeof leaseQuerySchema>
```

### TanStack Query Hook for Leases
```typescript
// Source: Existing usePayments hook pattern
// hooks/useLeases.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LeaseFormInput } from '@/lib/validations/lease'
import { toast } from 'sonner'

interface Lease {
  id: string
  tenant_id: string
  room_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit: number
  created_at: string
  updated_at: string
  tenant?: {
    id: string
    full_name: string
  }
  room?: {
    id: string
    name: string
  }
}

interface LeaseWithSchedule extends Lease {
  payment_schedule?: Array<{
    id: string
    due_date: string
    expected_amount: number
    period_start: string
    period_end: string
  }>
}

// Query key factory
export const leaseKeys = {
  all: ['leases'] as const,
  lists: () => [...leaseKeys.all, 'list'] as const,
  list: (params: Record<string, any>) => [...leaseKeys.lists(), params] as const,
  details: () => [...leaseKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaseKeys.details(), id] as const,
  schedule: (id: string) => [...leaseKeys.all, 'schedule', id] as const,
}

async function fetchLeases(params: Record<string, any>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value.toString())
  })

  const response = await fetch(`/api/leases?${searchParams.toString()}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Không thể tải danh sách hợp đồng')
  }
  return response.json()
}

async function fetchLease(id: string) {
  const response = await fetch(`/api/leases/${id}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Không thể tải thông tin hợp đồng')
  }
  return response.json()
}

async function fetchLeaseSchedule(id: string) {
  const response = await fetch(`/api/leases/${id}/schedule`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Không thể tải lịch thanh toán')
  }
  return response.json()
}

async function createLease(data: LeaseFormInput) {
  const response = await fetch('/api/leases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      start_date: data.start_date.toISOString(),
      end_date: data.end_date.toISOString(),
    }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Không thể tạo hợp đồng')
  }
  return response.json()
}

async function updateLease({ id, data }: { id: string; data: Partial<LeaseFormInput> }) {
  const response = await fetch(`/api/leases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      start_date: data.start_date ? data.start_date.toISOString() : undefined,
      end_date: data.end_date ? data.end_date.toISOString() : undefined,
    }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Không thể cập nhật hợp đồng')
  }
  return response.json()
}

async function deleteLease(id: string) {
  const response = await fetch(`/api/leases/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Không thể xóa hợp đồng')
  }
}

// Hooks
export function useLeases(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: leaseKeys.list(params),
    queryFn: () => fetchLeases(params),
  })
}

export function useLease(id: string) {
  return useQuery({
    queryKey: leaseKeys.detail(id),
    queryFn: () => fetchLease(id),
    enabled: !!id,
  })
}

export function useLeaseSchedule(id: string) {
  return useQuery({
    queryKey: leaseKeys.schedule(id),
    queryFn: () => fetchLeaseSchedule(id),
    enabled: !!id,
  })
}

export function useCreateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Tạo hợp đồng thành công!')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useUpdateLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateLease,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leaseKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: leaseKeys.schedule(variables.id) })
      toast.success('Cập nhật hợp đồng thành công!')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteLease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Xóa hợp đồng thành công!')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Store lease status in database | Compute status from dates on query | 2026 best practice | No stale data, always accurate, one source of truth |
| JSONB array for payment schedules | Separate schedules table | Always (relational best practice) | Queryable, joinable, better performance for filtering |
| Moment.js for dates | date-fns | 2020+ | Smaller bundle (2KB vs 67KB), tree-shakeable, immutable |
| Version schedules on change | Regenerate schedules | Depends on audit needs | Simpler for MVP, versioning for compliance/audit heavy systems |
| Store dates as TIMESTAMPTZ | Store lease dates as DATE type | PostgreSQL best practice | Avoids timezone issues for date-only fields, clearer semantics |

**Deprecated/outdated:**
- Moment.js: Use date-fns or Day.js (Moment.js is legacy mode, 529KB bundle)
- Storing computed status: Calculate from dates, never store derived data that can go stale
- JavaScript Date arithmetic: Use date-fns for reliability and correctness

## Open Questions

1. **Should we prorate rent for partial months?**
   - What we know: Tenants may move in/out mid-month, requiring prorated rent
   - What's unclear: Vietnamese rental conventions on prorating
   - Recommendation: MVP assumes full-month leases (start on 1st), document limitation. Future enhancement: add proration logic

2. **How to handle lease amendments (rent increases mid-lease)?**
   - What we know: Requirements only cover editing lease terms
   - What's unclear: Whether editing creates new agreement or amends existing
   - Recommendation: MVP allows editing lease (regenerates schedule). Future: Track amendments/history if needed

3. **Should payment schedule link to actual payments?**
   - What we know: Schedule is expected payments, payments table has actual payments
   - What's unclear: Should we link them for reconciliation, or keep separate?
   - Recommendation: Keep separate for MVP (simpler). Future: Add schedule_entry_id FK to payments for automatic matching

4. **Do we need lease document storage (signed PDFs)?**
   - What we know: Requirements don't mention document uploads
   - What's unclear: Landlords may want to store signed contracts
   - Recommendation: Out of scope for MVP. Phase 4 pattern (Supabase Storage) applies if added later

5. **How to handle lease renewals?**
   - What we know: LEASE-06 mentions renewal status display
   - What's unclear: Does landlord create new lease or extend existing?
   - Recommendation: MVP treats renewal as new lease creation. Display "expiring soon" badge prompts action

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns: `/lib/types/database.ts`, `/app/api/payments/route.ts`, `/hooks/usePayments.ts`
- [date-fns documentation](https://date-fns.org/docs/Getting-Started) - Official API reference
- [date-fns TypeScript cheat sheet](https://www.saltycrane.com/cheat-sheets/typescript/date-fns/latest/) - TypeScript usage patterns
- [Supabase Cascade Deletes](https://supabase.com/docs/guides/database/postgres/cascade-deletes) - Foreign key cascade patterns
- [Supabase Range Columns](https://supabase.com/blog/range-columns) - Date range query optimization
- PostgreSQL DATE type documentation - Date-only storage best practices

### Secondary (MEDIUM confidence)
- [Date Range Utilities in TypeScript](https://medium.com/@parmar.tanay14/date-range-utilities-in-typescript-a-developers-guide-04dc88fb582c) - Practical date range patterns
- [Data Model for Leasing Office](https://vertabelo.com/blog/a-data-model-for-a-leasing-office/) - Lease database schema patterns
- [Rental Database Project](https://github.com/ashmitan/Rental-Database-Project) - Real-world rental property schema example
- [date-fns vs dayjs comparison](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries) - Library comparison
- [Supabase date filtering guide](https://www.restack.io/docs/supabase-knowledge-supabase-date-filter-guide) - Query patterns

### Tertiary (LOW confidence)
- [How Companies Track Lease Expiration](https://www.rentana.io/blog/how-do-companies-keep-track-of-expiration-dates-on-leases) - Industry practices
- [Database versioning best practices](https://enterprisecraftsmanship.com/posts/database-versioning-best-practices/) - General schema migration patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - date-fns is industry standard, rest already in project
- Architecture: HIGH - Direct extension of tenant/payment patterns with added schedule generation
- Date handling: HIGH - date-fns is battle-tested, edge cases well-documented
- Schedule generation: MEDIUM - Core logic straightforward, but month boundary edge cases need testing
- Lease status calculation: HIGH - Simple date comparison, well-understood pattern
- Schedule regeneration: MEDIUM - Transaction safety patterns established but Supabase auto-commit per query

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (30 days for stable stack, date patterns unlikely to change)
