/**
 * Payment validation schemas using Zod
 * Based on database schema for payments table
 */

import { z } from 'zod'

// Create payment schema (for API POST body)
export const createPaymentSchema = z.object({
    tenant_id: z.string().uuid('Tenant ID không hợp lệ'),
    payment_date: z.string().datetime('Ngày thanh toán không hợp lệ'),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    payment_method: z.enum(['cash', 'bank_transfer', 'check'], 'Phương thức thanh toán không hợp lệ'),
    payment_status: z.enum(['paid_in_full', 'partial_payment', 'late_fee_applied'], 'Trạng thái thanh toán không hợp lệ'),
    transaction_reference: z.string().max(255, 'Mã giao dịch tối đa 255 ký tự').nullable().optional(),
    receipt_url: z.string().url('URL biên lai không hợp lệ').nullable().optional(),
    notes: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').nullable().optional(),
})

// Update payment schema (all fields optional)
export const updatePaymentSchema = z.object({
    tenant_id: z.string().uuid('Tenant ID không hợp lệ').optional(),
    payment_date: z.string().datetime('Ngày thanh toán không hợp lệ').optional(),
    amount: z.number().positive('Số tiền phải lớn hơn 0').optional(),
    payment_method: z.enum(['cash', 'bank_transfer', 'check'], 'Phương thức thanh toán không hợp lệ').optional(),
    payment_status: z.enum(['paid_in_full', 'partial_payment', 'late_fee_applied'], 'Trạng thái thanh toán không hợp lệ').optional(),
    transaction_reference: z.string().max(255, 'Mã giao dịch tối đa 255 ký tự').nullable().optional(),
    receipt_url: z.string().url('URL biên lai không hợp lệ').nullable().optional(),
    notes: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').nullable().optional(),
})

// Payment form schema (for React Hook Form with file upload)
export const paymentFormSchema = z.object({
    tenant_id: z.string().uuid('Tenant ID không hợp lệ'),
    payment_date: z.date('Ngày thanh toán không hợp lệ'),
    amount: z.number('Số tiền phải là số').positive('Số tiền phải lớn hơn 0'),
    payment_method: z.enum(['cash', 'bank_transfer', 'check'], 'Phương thức thanh toán không hợp lệ'),
    payment_status: z.enum(['paid_in_full', 'partial_payment', 'late_fee_applied'], 'Trạng thái thanh toán không hợp lệ'),
    transaction_reference: z.string().max(255, 'Mã giao dịch tối đa 255 ký tự').optional().or(z.literal('')),
    receipt_file: z
        .instanceof(File, { message: 'File không hợp lệ' })
        .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            'Kích thước file tối đa 5MB'
        )
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type),
            'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP) hoặc PDF'
        )
        .nullable()
        .optional(),
    notes: z.string().max(1000, 'Ghi chú tối đa 1000 ký tự').optional().or(z.literal('')),
})

// Payment query schema (for GET query params)
export const paymentQuerySchema = z.object({
    tenant_id: z.string().uuid('Tenant ID không hợp lệ').optional(),
    payment_status: z.enum(['paid_in_full', 'partial_payment', 'late_fee_applied'], 'Trạng thái thanh toán không hợp lệ').optional(),
    start_date: z.string().datetime('Ngày bắt đầu không hợp lệ').optional(),
    end_date: z.string().datetime('Ngày kết thúc không hợp lệ').optional(),
    overdue_only: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().min(1, 'Trang phải lớn hơn 0').default(1),
    limit: z.coerce.number().int().min(1).max(100, 'Giới hạn tối đa 100').default(20),
})

// Type exports
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
export type PaymentFormInput = z.infer<typeof paymentFormSchema>
export type PaymentQueryParams = z.infer<typeof paymentQuerySchema>

// Enum arrays for UI dropdowns
export const PAYMENT_METHODS = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'bank_transfer', label: 'Chuyển khoản' },
    { value: 'check', label: 'Séc' },
] as const

export const PAYMENT_STATUSES = [
    { value: 'paid_in_full', label: 'Đã thanh toán đủ' },
    { value: 'partial_payment', label: 'Thanh toán một phần' },
    { value: 'late_fee_applied', label: 'Phạt trễ hạn' },
] as const
