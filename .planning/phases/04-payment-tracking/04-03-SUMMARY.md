---
phase: 04-payment-tracking
plan: 03
subsystem: payments
tags: [ui, react, forms, file-upload, filtering]

dependency-graph:
  requires:
    - 04-01 (payment validation schemas and storage utilities)
    - 04-02 (payment CRUD API and TanStack Query hooks)
    - tenant components (TenantCard, TenantForm, TenantList patterns)
  provides:
    - Payment UI components with overdue highlighting
    - Payments page with CRUD and filtering
    - Receipt upload in payment form
    - Navigation integration for payments
  affects:
    - Dashboard navigation (sidebar and bottom nav updated)
    - Future financial reporting features

tech-stack:
  added:
    - Textarea UI component for notes field
  patterns:
    - Overdue detection and visual indicators (red badge, red border)
    - File upload with FormData in React Hook Form
    - Filter bar with status, tenant, and overdue toggle
    - Modal-based CRUD form pattern

key-files:
  created:
    - components/payments/PaymentCard.tsx
    - components/payments/PaymentList.tsx
    - components/payments/PaymentForm.tsx
    - components/payments/PaymentEmptyState.tsx
    - app/(dashboard)/dashboard/payments/page.tsx
    - components/ui/textarea.tsx
  modified:
    - components/layout/Sidebar.tsx
    - components/layout/BottomNav.tsx

decisions:
  - "PaymentCard uses list layout (space-y-3) instead of grid due to wider content with more info fields"
  - "Overdue detection: payment_status !== 'paid_in_full' AND payment_date < current date"
  - "Red overdue styling: border-red-200, bg-red-50 on card + destructive badge with AlertCircle icon"
  - "Receipt upload uses native file input in React Hook Form with FormData submission"
  - "Edit mode shows existing receipt link with option to replace, not delete-only"
  - "Filter bar uses three controls: status Select, tenant Select, and overdue toggle Button"

metrics:
  duration: "8 minutes"
  completed: "2026-02-24"
---

# Phase 04 Plan 03: Payment UI Components Summary

Complete payment tracking UI with CRUD operations, receipt upload, filtering, and overdue indicators across all components.

## What Was Built

### Task 1: Payment UI Components

Created four payment components following existing tenant component patterns:

**PaymentEmptyState.tsx:**
- Centered empty state with Receipt icon
- Vietnamese heading "Chưa có thanh toán nào"
- "Thêm thanh toán" button with Plus icon
- Matches TenantEmptyState styling

**PaymentCard.tsx (with overdue logic):**
- Displays payment with all details: amount, status, date, method, receipt indicator, notes
- Overdue detection: `payment_status !== 'paid_in_full' && payment_date < now()`
- Red overdue styling: `border-red-200 bg-red-50` classes on Card
- Overdue badge: `<Badge variant="destructive">` with AlertCircle icon + "Quá hạn" text
- Status badge mapping:
  - paid_in_full → "Đã thanh toán" (default variant)
  - partial_payment → "Thanh toán 1 phần" (secondary variant)
  - late_fee_applied → "Phạt trễ hạn" (outline variant)
- Payment method labels: cash → "Tiền mặt", bank_transfer → "Chuyển khoản", check → "Séc"
- Receipt indicator: Receipt icon + "Có biên lai" when receipt_url exists
- Transaction reference display if present
- Notes field with line-clamp-2 truncation
- Edit and Delete action buttons (ghost variant)
- Uses formatCurrency and formatDate from formatters.ts

**PaymentList.tsx:**
- Loading state: 4 skeleton cards (Skeleton component)
- Empty state: renders PaymentEmptyState component
- List layout: `space-y-3` (vertical stacking, not grid, due to wider payment cards)
- Maps payments to PaymentCard components

**PaymentForm.tsx (with file upload):**
- React Hook Form with zodResolver using paymentFormSchema
- Imports PAYMENT_METHODS and PAYMENT_STATUSES for Select dropdowns
- Imports buildPaymentFormData from usePayments for FormData construction
- Form header: Receipt icon + "Thêm thanh toán" / "Sửa thanh toán" heading
- Fields (grid gap-4 sm:grid-cols-2):
  1. Tenant selection (sm:col-span-2): Select with tenant list showing "name - room"
  2. Payment date: Input type="date" with Calendar icon
  3. Amount: Input type="number" with Banknote icon, step="1000"
  4. Payment method: Select with PAYMENT_METHODS options
  5. Payment status: Select with PAYMENT_STATUSES options
  6. Transaction reference: Input text with Hash icon
  7. Receipt upload (sm:col-span-2):
     - Native file input with FileUp icon
     - Accepts image/jpeg, image/png, image/webp, application/pdf
     - Shows selected file name after selection
     - In edit mode: shows current receipt link with "Biên lai hiện tại" + ExternalLink icon
     - Max 5MB indicator in FormDescription
  8. Notes (sm:col-span-2): Textarea with placeholder "Ghi chú thêm..."
- Submit handler: extracts receipt_file from form data, calls buildPaymentFormData, passes FormData to onSubmit
- Footer: Cancel + Submit buttons (Hủy / Lưu thay đổi / Thêm thanh toán)
- All Vietnamese labels with proper diacritics

**Textarea UI component:**
- Created components/ui/textarea.tsx following Input component pattern
- Matches shadcn/ui styling with focus-visible states and aria-invalid handling

### Task 2: Payments Page and Navigation

**app/(dashboard)/dashboard/payments/page.tsx:**
- Follows tenants page pattern exactly
- State management:
  - dialogMode: 'closed' | 'create' | 'edit'
  - selectedPayment: payment object or null
  - statusFilter: string (payment_status value)
  - tenantFilter: string (tenant_id value)
  - overdueOnly: boolean
- Data fetching:
  - useProperties() for property context
  - useTenants({}) for tenant list (form dropdown + filter)
  - usePayments({ payment_status, tenant_id, overdue_only }) with filters
- Mutations: useCreatePayment, useUpdatePayment, useDeletePayment
- Handlers:
  - handleOpenCreate/Edit/CloseDialog for modal state
  - handleSubmit: creates FormData for create, extracts JSON for edit
  - handleDelete: confirms with "Bạn có chắc muốn xóa thanh toán này?" dialog
- Page layout:
  - Header: "Quản lý thanh toán" heading + count subtitle + "Thêm thanh toán" button
  - No property warning: amber Card with AlertTriangle
  - No tenants warning: amber Card suggesting to add tenants
  - Filter bar (flex flex-wrap gap-3):
    - Status Select: "Tất cả trạng thái" + PAYMENT_STATUSES options
    - Tenant Select: "Tất cả khách thuê" + tenant list
    - Overdue toggle: Button with "Chỉ hiện quá hạn" / "Hiển thị tất cả" text
  - PaymentList component with callbacks
  - Create/Edit modal: fixed overlay with Card containing PaymentForm
- Button disabled states when no property or no tenants exist

**Navigation updates:**

**components/layout/Sidebar.tsx:**
- Added Banknote icon import
- Added navigation item: `{ name: 'Thanh toán', href: '/dashboard/payments', icon: Banknote }`
- Positioned after "Người thuê" and before "Điện nước"

**components/layout/BottomNav.tsx:**
- Added Banknote icon import
- Added navigation item: `{ name: 'Thanh toán', href: '/dashboard/payments', icon: Banknote }`
- Same position as Sidebar (after Người thuê, before Điện nước)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing Textarea UI component**
- **Found during:** Task 1 (PaymentForm implementation)
- **Issue:** PaymentForm needs Textarea for notes field, but components/ui/textarea.tsx didn't exist
- **Fix:** Created Textarea component following Input component pattern with same shadcn/ui styling
- **Files created:** components/ui/textarea.tsx
- **Verification:** TypeScript resolves import, form renders correctly
- **Committed in:** 64b99aa (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary UI component for notes field. No scope creep.

## Verification Results

All success criteria verified by human:
- ✓ PAY-01: Payment with date, amount, method recorded successfully
- ✓ PAY-02: Payment status (paid, partial, late fee) selectable and displayed
- ✓ PAY-03: Receipt upload works in payment form
- ✓ PAY-04: Payment history viewable per tenant with filtering
- ✓ PAY-05: Payment editable (amount, date, status, notes)
- ✓ PAY-06: Payment deletable with confirmation dialog
- ✓ PAY-07: Overdue payments show red badge ("Quá hạn") and red border/background
- ✓ PAY-08: Notes/memo field available via Textarea and saved

### Visual Verification
- Payments page accessible at /dashboard/payments
- Navigation shows "Thanh toán" in sidebar and bottom nav with Banknote icon
- Payment form displays all 8 fields correctly
- Overdue indicators (red badge + red card styling) appear correctly
- Receipt upload accepts files and shows file name
- Edit mode shows existing receipt link
- Filters work: status, tenant, and overdue toggle
- Delete confirmation dialog appears
- All Vietnamese text displays with proper diacritics

## Task Commits

Each task was committed atomically:

1. **Task 1: Create payment UI components** - `64b99aa` (feat)
   - PaymentCard, PaymentList, PaymentForm, PaymentEmptyState
   - Created Textarea UI component
2. **Task 2: Create payments page and update navigation** - `9248184` (feat)
   - Payments page with CRUD and filtering
   - Sidebar and BottomNav updates

## Files Created/Modified

**Created:**
- components/payments/PaymentCard.tsx - Individual payment display with overdue highlighting
- components/payments/PaymentList.tsx - Payment list with loading/empty states
- components/payments/PaymentForm.tsx - Create/edit form with receipt upload (17 fields)
- components/payments/PaymentEmptyState.tsx - Empty state UI
- components/ui/textarea.tsx - Textarea UI component for shadcn
- app/(dashboard)/dashboard/payments/page.tsx - Payments page with filters and CRUD

**Modified:**
- components/layout/Sidebar.tsx - Added "Thanh toán" navigation link
- components/layout/BottomNav.tsx - Added "Thanh toán" navigation link

## Technical Highlights

### Overdue Detection Logic
```typescript
const isOverdue = payment.payment_status !== 'paid_in_full' && new Date(payment.payment_date) < new Date()
```
Applied in PaymentCard for conditional styling and badge display.

### Red Overdue Styling
- Card: `className={cn('...', isOverdue && 'border-red-200 bg-red-50')}`
- Badge: `<Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Quá hạn</Badge>`

### Receipt Upload Flow
1. User selects file in PaymentForm
2. File registered in React Hook Form as receipt_file
3. handleSubmit extracts receipt_file from form data
4. buildPaymentFormData creates FormData with JSON data + file
5. API receives multipart FormData and uploads to storage (from plan 04-02)

### Filter Implementation
- Status filter: sets payment_status param in usePayments
- Tenant filter: sets tenant_id param in usePayments
- Overdue toggle: sets overdue_only='true' param when enabled
- All filters work together (AND logic in API)

## Phase 04 Completion

This plan completes Phase 04 - Payment Tracking. All three plans delivered:

**04-01:** Database schema, validation, storage utilities
**04-02:** API routes and TanStack Query hooks
**04-03:** UI components and payments page (this plan)

**Phase 04 outcome:** Landlords can now track payments from tenants with receipt uploads, overdue indicators, and flexible filtering. Manual payment entry (no online processing) as specified in requirements.

## Next Phase Readiness

Phase 04 complete. Payment tracking fully functional with:
- ✓ Data layer (payments table, RLS, indexes)
- ✓ API layer (CRUD endpoints, multipart upload)
- ✓ Hooks layer (TanStack Query with cache management)
- ✓ UI layer (components, page, navigation)
- ✓ Storage layer (receipt uploads to Supabase Storage)

Ready for Phase 05 or other features. Payment tracking can be referenced by future financial reporting features.

## Self-Check: PASSED

### Files Created
```
FOUND: components/payments/PaymentCard.tsx
FOUND: components/payments/PaymentList.tsx
FOUND: components/payments/PaymentForm.tsx
FOUND: components/payments/PaymentEmptyState.tsx
FOUND: components/ui/textarea.tsx
FOUND: app/(dashboard)/dashboard/payments/page.tsx
```

### Files Modified
```
FOUND: components/layout/Sidebar.tsx (contains "Thanh toán" and Banknote import)
FOUND: components/layout/BottomNav.tsx (contains "Thanh toán" and Banknote import)
```

### Commits
```
FOUND: 64b99aa (Task 1: Payment UI components)
FOUND: 9248184 (Task 2: Payments page and navigation)
```

### Human Verification
```
VERIFIED: All PAY-01 through PAY-08 requirements working
VERIFIED: Overdue indicators display correctly
VERIFIED: Receipt upload functional
VERIFIED: Filtering works (status, tenant, overdue)
VERIFIED: Navigation updated in sidebar and bottom nav
```

All verification checks passed. Phase 04-payment-tracking complete.

---
*Phase: 04-payment-tracking*
*Completed: 2026-02-24*
