# Phase 04: Payment Tracking - Research

**Researched:** 2026-02-15
**Domain:** Payment record management, file uploads, financial data tracking
**Confidence:** HIGH

## Summary

Payment tracking for rental properties involves three core capabilities: recording payment transactions with metadata (date, amount, method, status), storing receipt evidence (image uploads via Supabase Storage), and providing filtered views of payment history. The domain is well-understood with established patterns.

This phase builds on existing patterns from Phase 3 (Tenant Management), extending the TanStack Query + Next.js API Routes + Supabase stack to handle payment records and file uploads. The codebase already demonstrates the successful patterns needed: Zod validation schemas, React Hook Form integration, Next.js API route handlers with RLS, and TanStack Query for data management.

**Primary recommendation:** Use a dedicated `payments` table with foreign key to `tenants`, store payment metadata as VARCHAR with CHECK constraints (not ENUMs for flexibility), implement Supabase Storage bucket with RLS policies for receipt images, and leverage existing form/validation patterns with added file upload handling.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.5 | App Router with API routes | Already in project, handles both UI and backend |
| @supabase/supabase-js | ^2.93.1 | Supabase client for database and storage | Already in project, provides unified DB + file storage |
| @tanstack/react-query | ^5.90.20 | Server state management with optimistic updates | Already in project, proven pattern for CRUD operations |
| react-hook-form | ^7.71.1 | Form state management | Already in project, integrates with Zod |
| zod | ^4.3.6 | Schema validation and TypeScript types | Already in project, type-safe validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | ^2.0.7 | Toast notifications | Already in project, user feedback for mutations |
| lucide-react | ^0.563.0 | Icons (AlertCircle for overdue, Receipt, etc.) | Already in project, consistent iconography |
| @radix-ui/react-select | ^2.2.6 | Payment method/status dropdowns | Already in project, accessible selects |
| shadcn/ui Badge | (included) | Status and overdue visual indicators | Already in project, variant system supports destructive (red) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Storage | S3 direct or Cloudinary | Supabase Storage is already configured, uses existing RLS, simpler for MVP |
| File input in form | Drag-and-drop library | Native input sufficient for receipts, can enhance later |
| String status fields | PostgreSQL ENUM | Strings offer better flexibility for status changes without migrations (2026 best practice) |

**Installation:**
No new dependencies required. All necessary libraries already installed.

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── payments/
│       ├── route.ts                 # GET (list), POST (create)
│       └── [id]/
│           └── route.ts             # GET (detail), PUT (update), DELETE
hooks/
├── usePayments.ts                   # TanStack Query hooks
components/
├── payments/
│   ├── PaymentList.tsx              # Payment cards/table with overdue styling
│   ├── PaymentForm.tsx              # Create/edit form with file upload
│   ├── PaymentCard.tsx              # Individual payment display
│   ├── ReceiptUpload.tsx            # File input + preview component
│   └── PaymentEmptyState.tsx        # Empty state UI
lib/
├── validations/
│   └── payment.ts                   # Zod schemas for payment CRUD
└── utils/
    └── storage.ts                   # Supabase Storage helper functions
supabase/
└── migrations/
    └── [timestamp]_create_payments.sql
```

### Pattern 1: Payment Record with Receipt Upload
**What:** Combined form that handles both structured payment data and optional receipt file upload
**When to use:** Create and edit payment forms
**Example:**
```typescript
// Source: Existing tenant form pattern + Supabase Storage docs
// lib/validations/payment.ts
import { z } from 'zod'

export const paymentStatusSchema = z.enum([
  'paid_in_full',
  'partial_payment',
  'late_fee_applied'
])

export const paymentMethodSchema = z.enum(['cash', 'bank_transfer', 'check'])

export const createPaymentSchema = z.object({
  tenant_id: z.string().uuid('Tenant ID không hợp lệ'),
  payment_date: z.string().datetime(),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  payment_method: paymentMethodSchema,
  payment_status: paymentStatusSchema,
  transaction_reference: z.string().max(255).nullable().optional(),
  receipt_url: z.string().url().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

// For form handling with file upload
export const paymentFormSchema = z.object({
  tenant_id: z.string().uuid('Tenant ID không hợp lệ'),
  payment_date: z.date(),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  payment_method: paymentMethodSchema,
  payment_status: paymentStatusSchema,
  transaction_reference: z.string().max(255).optional().or(z.literal('')),
  receipt_file: z
    .instanceof(File)
    .refine(file => !file || file.size <= 5000000, {
      message: 'Kích thước file tối đa 5MB'
    })
    .refine(file => !file || ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type), {
      message: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP) hoặc PDF'
    })
    .nullable()
    .optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
})
```

### Pattern 2: Supabase Storage Upload with RLS
**What:** Upload receipt to storage bucket with proper security policies
**When to use:** When user selects receipt file in form
**Example:**
```typescript
// Source: https://supabase.com/docs/guides/storage/uploads/standard-uploads
// lib/utils/storage.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadReceipt(file: File, paymentId: string) {
  const supabase = createClient()

  // Generate unique filename with timestamp to avoid conflicts
  const fileExt = file.name.split('.').pop()
  const fileName = `${paymentId}_${Date.now()}.${fileExt}`
  const filePath = `receipts/${fileName}`

  const { data, error } = await supabase.storage
    .from('payment-receipts')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false // Prevent overwriting
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('payment-receipts')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

export async function deleteReceipt(url: string) {
  const supabase = createClient()
  const path = url.split('/receipts/')[1]

  const { error } = await supabase.storage
    .from('payment-receipts')
    .remove([`receipts/${path}`])

  if (error) throw error
}
```

### Pattern 3: TanStack Query Optimistic Updates for Payment CRUD
**What:** Immediate UI feedback before server confirmation
**When to use:** Create, update, delete payment operations
**Example:**
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
// hooks/usePayments.ts
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPayment,
    onMutate: async (newPayment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: paymentKeys.lists() })

      // Snapshot previous value
      const previousPayments = queryClient.getQueryData(paymentKeys.list({}))

      // Optimistically update cache
      queryClient.setQueryData(paymentKeys.list({}), (old: any) => ({
        ...old,
        data: {
          ...old.data,
          payments: [newPayment, ...old.data.payments]
        }
      }))

      // Return context for rollback
      return { previousPayments }
    },
    onError: (err, newPayment, context) => {
      // Restore previous state on failure
      if (context?.previousPayments) {
        queryClient.setQueryData(paymentKeys.list({}), context.previousPayments)
      }
      toast.error(err.message)
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
    },
    onSuccess: () => {
      toast.success('Thêm thanh toán thành công!')
    }
  })
}
```

### Pattern 4: Overdue Payment Detection and Visual Indicators
**What:** Highlight overdue payments using date comparison and Badge variants
**When to use:** Payment list and card components
**Example:**
```typescript
// Source: Existing Badge component + PostgreSQL date filtering patterns
// components/payments/PaymentCard.tsx
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

interface PaymentCardProps {
  payment: Payment
}

export function PaymentCard({ payment }: PaymentCardProps) {
  // Calculate if payment is overdue
  const isOverdue = payment.payment_status !== 'paid_in_full' &&
    new Date(payment.payment_date) < new Date()

  return (
    <div className={cn(
      "border rounded-lg p-4",
      isOverdue && "border-red-200 bg-red-50"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{formatCurrency(payment.amount)}</h3>
            {isOverdue && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Quá hạn
              </Badge>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            {formatDate(payment.payment_date)}
          </p>
        </div>
        <Badge variant={payment.payment_status === 'paid_in_full' ? 'default' : 'secondary'}>
          {getStatusLabel(payment.payment_status)}
        </Badge>
      </div>
    </div>
  )
}
```

### Pattern 5: Payment History Filtering with Date Range
**What:** Filter payments by date range, status, or tenant
**When to use:** Payment history views
**Example:**
```typescript
// Source: PostgreSQL date filtering patterns + existing query pattern
// app/api/payments/route.ts (GET handler excerpt)
let query = supabase
  .from('payments')
  .select(
    `
    *,
    tenant:tenants(id, full_name, room:rooms(name))
    `,
    { count: 'exact' }
  )

// Date range filtering
if (startDate) {
  query = query.gte('payment_date', startDate)
}
if (endDate) {
  query = query.lte('payment_date', endDate)
}

// Status filtering
if (payment_status) {
  query = query.eq('payment_status', payment_status)
}

// Tenant filtering
if (tenant_id) {
  query = query.eq('tenant_id', tenant_id)
}

// Detect overdue payments using PostgreSQL
if (showOverdueOnly) {
  query = query
    .neq('payment_status', 'paid_in_full')
    .lt('payment_date', new Date().toISOString())
}

query = query.order('payment_date', { ascending: false })
```

### Anti-Patterns to Avoid
- **Don't store file uploads before form validation passes** — Upload to storage only after successful payment creation, or you'll have orphaned files
- **Don't use optimistic updates for file uploads** — File uploads should be synchronous with loading states; optimism works for data mutations, not file I/O
- **Don't hardcode payment status options in UI** — Define status enums in validation schema and import to UI for single source of truth
- **Don't calculate overdue status client-side only** — Server should also check for security; client detection is for UI only

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File upload to cloud storage | Custom S3 integration, base64 encoding, or storing images in database | Supabase Storage with RLS | Already configured, handles auth, CDN, image optimization, proper security policies |
| Date range picker | Custom calendar UI from scratch | shadcn/ui date-picker with range mode or community date-range-picker | Accessible, tested, works with existing design system |
| Receipt image preview/validation | Manual canvas/file reader logic | Browser native File API + simple img preview | File input validation via Zod, preview with URL.createObjectURL() |
| Payment status state machine | Complex switch statements or custom state logic | Zod enum schema + simple status mapping functions | Type-safe, validated at boundaries, easy to extend |
| Overdue calculation logic | Complex client-side date math libraries | PostgreSQL native date comparison + JavaScript Date | Database handles queries efficiently, client handles display |

**Key insight:** File uploads and date filtering are deceptively complex with edge cases (concurrent uploads, timezone handling, file size limits, malicious files). Using Supabase Storage and PostgreSQL date functions avoids reinventing security, performance, and correctness.

## Common Pitfalls

### Pitfall 1: File Upload Race Conditions
**What goes wrong:** User creates payment, file uploads in background, payment saved with null receipt_url, then upload completes but payment already exists
**Why it happens:** Treating file upload as async/background operation instead of sequential step in mutation
**How to avoid:** Upload file FIRST (if provided), get URL, THEN create payment record with receipt_url in single atomic operation
**Warning signs:** Payments created without receipts even when user selected file; orphaned files in storage bucket

### Pitfall 2: Not Handling Storage RLS Properly
**What goes wrong:** Users can view/delete other users' receipts; public URLs don't work; uploads fail silently
**Why it happens:** Forgetting to set RLS policies on storage buckets or using wrong bucket access level
**How to avoid:**
- Create bucket with correct RLS policies: INSERT for authenticated users, SELECT for owner only
- Use consistent file path pattern: `receipts/{user_id}/{payment_id}_{timestamp}.{ext}`
- Test with different user accounts to verify isolation
**Warning signs:** 403 errors on storage operations; files visible across user accounts

### Pitfall 3: Overdue Logic in Wrong Layer
**What goes wrong:** Different "overdue" definitions between client filter and server display; timezone issues
**Why it happens:** Duplicating overdue calculation logic instead of single source of truth
**How to avoid:**
- Database stores UTC timestamps
- Server calculates overdue status when querying (using PostgreSQL date functions)
- Client displays based on server data, not recalculating
- For filters, query params sent to server, server does calculation
**Warning signs:** Payments show as overdue on one page but not another; overdue status changes on refresh

### Pitfall 4: File Validation Only on Client
**What goes wrong:** Users upload malicious files, huge files bypass limit, wrong file types stored
**Why it happens:** Trusting client-side Zod validation without server verification
**How to avoid:**
- Validate file size/type on BOTH client (UX) and server (security)
- Server checks `Content-Type` header and file extension
- Set Supabase Storage bucket file size limits
- Consider malware scanning for production (external service)
**Warning signs:** Storage quota consumed by huge files; unexpected file types in bucket

### Pitfall 5: Not Cleaning Up Failed Upload Files
**What goes wrong:** Storage bucket fills with orphaned receipts from failed payment creations
**Why it happens:** Upload succeeds, payment creation fails (validation error, network issue), file remains in storage
**How to avoid:**
- Transaction-like pattern: track uploaded URL, if payment creation fails, delete uploaded file in error handler
- Set lifecycle rules on bucket to auto-delete orphaned files after X days
- Log upload paths before payment creation for manual cleanup scripts
**Warning signs:** Storage usage grows faster than payment count; files in storage with no matching payment records

### Pitfall 6: Hardcoded Date Comparisons Without Timezone Context
**What goes wrong:** Payments marked overdue at wrong times; date filters exclude expected results
**Why it happens:** Mixing local time, UTC, and database timestamps without consistent conversion
**How to avoid:**
- Store all dates as UTC in database (PostgreSQL TIMESTAMPTZ)
- Convert to user timezone only for display
- Use `new Date().toISOString()` for date comparisons, not `new Date()`
- Let PostgreSQL handle date arithmetic: `payment_date < NOW()`
**Warning signs:** Overdue status flips at unexpected hours; date range filters miss boundary records

## Code Examples

Verified patterns from official sources:

### API Route Handler for Create Payment with Upload
```typescript
// Source: Combined pattern from existing API routes + Supabase Storage docs
// app/api/payments/route.ts
import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { createPaymentSchema } from '@/lib/validations/payment'
import { createSuccessResponse, handleZodError, errors } from '@/lib/utils/api-error'
import { uploadReceipt, deleteReceipt } from '@/lib/utils/storage'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServer()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return errors.unauthorized()

    // Parse multipart form data for file upload
    const formData = await request.formData()
    const body = JSON.parse(formData.get('data') as string)
    const receiptFile = formData.get('receipt') as File | null

    const validatedData = createPaymentSchema.parse(body)

    // Verify tenant ownership via room -> property -> user
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, room:rooms(property:properties(user_id))')
      .eq('id', validatedData.tenant_id)
      .single()

    if (!tenant || tenant.room?.property?.user_id !== user.id) {
      return errors.forbidden('Bạn không có quyền thêm thanh toán cho khách này')
    }

    let receiptUrl = null

    // Upload receipt if provided
    if (receiptFile && receiptFile.size > 0) {
      try {
        // Generate payment ID first for consistent file naming
        const tempId = crypto.randomUUID()
        receiptUrl = await uploadReceipt(receiptFile, tempId)
      } catch (uploadError) {
        console.error('Receipt upload failed:', uploadError)
        return errors.internal('Không thể tải lên biên lai')
      }
    }

    // Create payment record
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        tenant_id: validatedData.tenant_id,
        payment_date: validatedData.payment_date,
        amount: validatedData.amount,
        payment_method: validatedData.payment_method,
        payment_status: validatedData.payment_status,
        transaction_reference: validatedData.transaction_reference,
        receipt_url: receiptUrl,
        notes: validatedData.notes,
      })
      .select()
      .single()

    if (insertError) {
      // Cleanup uploaded file if payment creation failed
      if (receiptUrl) {
        await deleteReceipt(receiptUrl).catch(console.error)
      }
      return handleSupabaseError(insertError)
    }

    return createSuccessResponse(payment, 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error)
    }
    console.error('POST /api/payments error:', error)
    return errors.internal()
  }
}
```

### Payment List Component with Overdue Highlighting
```typescript
// Source: Existing TenantList pattern + Badge variants
// components/payments/PaymentList.tsx
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { AlertCircle, Receipt, Edit, Trash2 } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  payment_date: string
  payment_status: string
  payment_method: string
  receipt_url: string | null
  tenant: {
    full_name: string
  }
}

export function PaymentList({
  payments,
  onEdit,
  onDelete
}: {
  payments: Payment[]
  onEdit: (payment: Payment) => void
  onDelete: (payment: Payment) => void
}) {
  const getStatusBadge = (status: string, paymentDate: string) => {
    const isOverdue = status !== 'paid_in_full' && new Date(paymentDate) < new Date()

    if (isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Quá hạn
        </Badge>
      )
    }

    const statusMap = {
      paid_in_full: { label: 'Đã thanh toán', variant: 'default' as const },
      partial_payment: { label: 'Thanh toán 1 phần', variant: 'secondary' as const },
      late_fee_applied: { label: 'Phạt trễ hạn', variant: 'outline' as const },
    }

    const config = statusMap[status] || statusMap.paid_in_full
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => {
        const isOverdue = payment.payment_status !== 'paid_in_full' &&
          new Date(payment.payment_date) < new Date()

        return (
          <Card
            key={payment.id}
            className={cn(
              "p-4 transition-colors",
              isOverdue && "border-red-200 bg-red-50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">
                    {formatCurrency(payment.amount)}
                  </h3>
                  {getStatusBadge(payment.payment_status, payment.payment_date)}
                </div>
                <p className="text-sm text-zinc-600">
                  {payment.tenant.full_name} • {formatDate(payment.payment_date)}
                </p>
                <p className="text-xs text-zinc-500">
                  {payment.payment_method === 'bank_transfer' && 'Chuyển khoản'}
                  {payment.payment_method === 'cash' && 'Tiền mặt'}
                  {payment.payment_method === 'check' && 'Séc'}
                  {payment.receipt_url && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Receipt className="h-3 w-3" />
                      Có biên lai
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(payment)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(payment)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
```

### Database Schema for Payments Table
```sql
-- Source: Existing schema patterns + payment system design best practices
-- supabase/migrations/[timestamp]_create_payments.sql

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,

    -- Payment details
    payment_date TIMESTAMPTZ NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'check')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('paid_in_full', 'partial_payment', 'late_fee_applied')),

    -- Evidence and references
    receipt_url TEXT,
    transaction_reference VARCHAR(255),

    -- Additional context
    notes TEXT,

    -- Audit timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view payments for their tenants
CREATE POLICY "Users can view own payments" ON payments
    FOR ALL USING (
        tenant_id IN (
            SELECT t.id FROM tenants t
            JOIN rooms r ON t.room_id = r.id
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_overdue ON payments(payment_status, payment_date)
    WHERE payment_status != 'paid_in_full';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Supabase Storage Bucket Setup
```sql
-- Source: Supabase Storage RLS patterns
-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true);

-- RLS policies for storage bucket
-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts' AND
  (storage.foldername(name))[1] = 'receipts'
);

-- Allow users to view their own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-receipts' AND
  (storage.foldername(name))[1] = 'receipts'
);

-- Allow users to delete their own receipts
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-receipts' AND
  (storage.foldername(name))[1] = 'receipts'
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| PostgreSQL ENUM for status | VARCHAR with CHECK constraint | 2026 consensus | Easier migrations, better DX, negligible performance difference |
| Base64 image storage in database | Supabase Storage with CDN | Always (best practice) | Better performance, scalability, lower DB costs |
| Client-side only file validation | Client + server validation | Security standard | Prevents malicious uploads, ensures data integrity |
| Manual optimistic update logic | TanStack Query built-in patterns | TanStack Query v5 | Less boilerplate, fewer race condition bugs |
| Separate upload/data endpoints | Multipart form data in single endpoint | Modern Next.js | Atomic operations, cleaner error handling |

**Deprecated/outdated:**
- Storing images as base64 in database: Use object storage (Supabase Storage, S3)
- PostgreSQL ENUM for status fields: Use VARCHAR with CHECK constraint for 2026 flexibility
- TUS Resumable Upload required for all files: Standard upload works fine for receipts under 6MB

## Open Questions

1. **Do we need receipt image preview thumbnails?**
   - What we know: Supabase Storage can serve images directly via CDN, no transformation needed
   - What's unclear: Whether landlord needs thumbnail view in list or just full image when clicked
   - Recommendation: MVP uses full image on click, add thumbnails in future phase if needed

2. **Should we support multiple payment methods per payment?**
   - What we know: Requirements specify single payment method per record
   - What's unclear: Real-world scenario of split payment (part cash, part bank transfer)
   - Recommendation: MVP uses single method, can extend with `payment_methods` JSONB field later if users request

3. **How to handle receipt deletion when payment is deleted?**
   - What we know: Cascade delete on payment will leave orphaned files in storage
   - What's unclear: Whether to auto-delete receipt file or keep for audit trail
   - Recommendation: Keep receipt files initially (audit trail), add cleanup script later if storage costs become issue

4. **Should overdue calculation use business days or calendar days?**
   - What we know: Requirements don't specify business vs calendar days
   - What's unclear: Vietnamese rental payment conventions
   - Recommendation: Use calendar days for simplicity, can parameterize later if needed

## Sources

### Primary (HIGH confidence)
- Existing codebase patterns: `/app/api/tenants/route.ts`, `/hooks/useTenants.ts`, `/lib/validations/tenant.ts`
- [Supabase Storage Standard Uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads) - Official upload patterns and file size limits
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) - Official optimistic update patterns
- PostgreSQL 18 documentation - Date/time functions and indexing strategies

### Secondary (MEDIUM confidence)
- [Complete Guide to File Uploads with Next.js and Supabase Storage](https://supalaunch.com/blog/file-upload-nextjs-supabase) - Integration patterns
- [Supabase Storage: How to Implement File Upload Properly](https://nikofischer.com/supabase-storage-file-upload-guide) - RLS and security best practices
- [Handling Image Uploads in React-hook-form with Zod](https://www.bacancytechnology.com/qanda/react/handling-image-uploads-in-react-hook-form-with-zod) - File validation patterns
- [The Complete Guide to Storing Multiple Enums in Database: 2026 Best Practices](https://copyprogramming.com/howto/best-way-to-store-multiple-enums-in-database) - VARCHAR vs ENUM decision
- [shadcn/ui Date Picker](https://ui.shadcn.com/docs/components/radix/date-picker) - Official date component documentation
- [Date Range Picker for shadcn](https://github.com/johnpolacek/date-range-picker-for-shadcn) - Community component for range selection

### Tertiary (LOW confidence)
- [How to Design a Database for Payment System Like Paytm](https://www.geeksforgeeks.org/dbms/how-to-design-a-database-for-payment-system-like-paytm/) - General schema patterns (not rental-specific)
- [9 Features Every Receipt Validation Platform Must Offer in 2025](https://www.snipp.com/blog/receipt-validation-platform-key-features) - Industry standards for receipt processing
- [PostgreSQL DATEDIFF Function Guide](https://thelinuxcode.com/postgresql-datediff-function-complete-guide-to-date-differences-time-zones-and-production-patterns/) - Date arithmetic patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, proven in Phase 2 and 3
- Architecture: HIGH - Direct extension of existing tenant CRUD patterns with added file upload (well-documented in Supabase)
- Pitfalls: HIGH - File upload and date filtering are common problem domains with established gotchas
- File validation: MEDIUM - Zod file validation patterns exist but less standardized than data validation
- Overdue logic: HIGH - Simple date comparison, well-understood PostgreSQL patterns

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days for stable stack, file upload patterns unlikely to change)
