/**
 * TanStack Query hooks for Payments
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PaymentFormInput } from '@/lib/validations/payment'
import { toast } from 'sonner'

// Type for Payment from DB
interface Payment {
    id: string
    tenant_id: string
    payment_date: string
    amount: number
    payment_method: string
    payment_status: string
    receipt_url: string | null
    transaction_reference: string | null
    notes: string | null
    created_at: string
    updated_at: string
    tenant?: {
        id: string
        full_name: string
        room?: { id: string; name: string } | null
    } | null
}

interface PaymentsResponse {
    data: {
        payments: Payment[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
        }
    }
}

interface PaymentResponse {
    data: Payment
}

interface QueryParams {
    tenant_id?: string
    payment_status?: string
    start_date?: string
    end_date?: string
    overdue_only?: string
    page?: number
    limit?: number
}

// Query key factory
export const paymentKeys = {
    all: ['payments'] as const,
    lists: () => [...paymentKeys.all, 'list'] as const,
    list: (params: QueryParams) => [...paymentKeys.lists(), params] as const,
    details: () => [...paymentKeys.all, 'detail'] as const,
    detail: (id: string) => [...paymentKeys.details(), id] as const,
}

// API Functions
async function fetchPayments(params: QueryParams): Promise<PaymentsResponse> {
    const searchParams = new URLSearchParams()
    if (params.tenant_id) searchParams.set('tenant_id', params.tenant_id)
    if (params.payment_status) searchParams.set('payment_status', params.payment_status)
    if (params.start_date) searchParams.set('start_date', params.start_date)
    if (params.end_date) searchParams.set('end_date', params.end_date)
    if (params.overdue_only) searchParams.set('overdue_only', params.overdue_only)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/payments?${searchParams.toString()}`)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải danh sách thanh toán')
    }
    return response.json()
}

async function fetchPayment(id: string): Promise<PaymentResponse> {
    const response = await fetch(`/api/payments/${id}`)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải thông tin thanh toán')
    }
    return response.json()
}

async function createPayment(formData: FormData): Promise<PaymentResponse> {
    const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData,
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể thêm thanh toán')
    }
    return response.json()
}

async function updatePayment({ id, data }: { id: string; data: Partial<Payment> }): Promise<PaymentResponse> {
    const response = await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể cập nhật thanh toán')
    }
    return response.json()
}

async function deletePayment(id: string): Promise<void> {
    const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể xóa thanh toán')
    }
}

// Hooks
export function usePayments(params: QueryParams = {}) {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: () => fetchPayments(params),
    })
}

export function usePayment(id: string) {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: () => fetchPayment(id),
        enabled: !!id,
    })
}

export function useCreatePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createPayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
            toast.success('Thêm thanh toán thành công!')
        },
        onError: (error: Error) => toast.error(error.message),
    })
}

export function useUpdatePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updatePayment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
            queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) })
            toast.success('Cập nhật thanh toán thành công!')
        },
        onError: (error: Error) => toast.error(error.message),
    })
}

export function useDeletePayment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deletePayment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
            toast.success('Xóa thanh toán thành công!')
        },
        onError: (error: Error) => toast.error(error.message),
    })
}

/**
 * Helper function for building FormData for payment creation
 * @param data - Payment data without receipt file
 * @param receiptFile - Optional receipt file
 * @returns FormData ready for API submission
 */
export function buildPaymentFormData(
    data: Omit<PaymentFormInput, 'receipt_file'>,
    receiptFile?: File | null
): FormData {
    const formData = new FormData()
    formData.append('data', JSON.stringify({
        ...data,
        payment_date: data.payment_date instanceof Date
            ? data.payment_date.toISOString()
            : data.payment_date,
    }))
    if (receiptFile) {
        formData.append('receipt', receiptFile)
    }
    return formData
}
