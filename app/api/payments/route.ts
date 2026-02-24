/**
 * Payments API Route
 * GET /api/payments - List payments with filtering
 * POST /api/payments - Create a new payment with optional receipt
 */

import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { createPaymentSchema, paymentQuerySchema } from '@/lib/validations/payment'
import {
    createSuccessResponse,
    handleZodError,
    handleSupabaseError,
    errors,
} from '@/lib/utils/api-error'
import { ZodError } from 'zod'
import { uploadReceipt } from '@/lib/utils/storage'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServer()

        // Check auth
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return errors.unauthorized()
        }

        // Parse query params
        const searchParams = request.nextUrl.searchParams
        const queryParams = {
            tenant_id: searchParams.get('tenant_id') || undefined,
            payment_status: searchParams.get('payment_status') || undefined,
            start_date: searchParams.get('start_date') || undefined,
            end_date: searchParams.get('end_date') || undefined,
            overdue_only: searchParams.get('overdue_only') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 20,
        }

        const validatedParams = paymentQuerySchema.parse(queryParams)
        const { page, limit, tenant_id, payment_status, start_date, end_date, overdue_only } = validatedParams

        // Build query with tenant relation
        let query = supabase
            .from('payments')
            .select(
                `
                *,
                tenant:tenants(id, full_name, room:rooms(id, name))
            `,
                { count: 'exact' }
            )

        // Apply filters
        if (tenant_id) {
            query = query.eq('tenant_id', tenant_id)
        }

        if (payment_status) {
            query = query.eq('payment_status', payment_status)
        }

        if (start_date) {
            query = query.gte('payment_date', start_date)
        }

        if (end_date) {
            query = query.lte('payment_date', end_date)
        }

        if (overdue_only === 'true') {
            query = query.neq('payment_status', 'paid_in_full').lt('payment_date', new Date().toISOString())
        }

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to).order('payment_date', { ascending: false })

        const { data: payments, error, count } = await query

        if (error) {
            return handleSupabaseError(error)
        }

        return createSuccessResponse({
            payments,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: count ? Math.ceil(count / limit) : 0,
            },
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('GET /api/payments error:', error)
        return errors.internal()
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServer()

        // Check auth
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return errors.unauthorized()
        }

        // Parse multipart form data
        const formData = await request.formData()
        const dataField = formData.get('data')
        const receiptFile = formData.get('receipt') as File | null

        if (!dataField) {
            return errors.validation('Missing required field: data')
        }

        // Parse JSON data
        let paymentData
        try {
            paymentData = JSON.parse(dataField.toString())
        } catch (e) {
            return errors.validation('Invalid JSON in data field')
        }

        const validatedData = createPaymentSchema.parse(paymentData)

        // Verify tenant ownership
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id, room:rooms(id, property:properties(id, user_id))')
            .eq('id', validatedData.tenant_id)
            .single()

        if (tenantError || !tenant) {
            return errors.notFound('Người thuê')
        }

        // Check ownership via tenant -> room -> property -> user_id
        const room = (tenant as any).room
        if (!room || !room.property || room.property.user_id !== user.id) {
            return errors.forbidden('Bạn không có quyền tạo thanh toán cho người thuê này')
        }

        // Handle receipt upload if present
        let receiptUrl: string | null = null
        if (receiptFile && receiptFile.size > 0) {
            try {
                // Generate temporary UUID for file naming
                const tempId = crypto.randomUUID()
                receiptUrl = await uploadReceipt(receiptFile, tempId)
            } catch (uploadError) {
                console.error('Receipt upload error:', uploadError)
                return errors.internal('Không thể tải lên biên lai')
            }
        }

        // Insert payment record
        const { data: payment, error: insertError } = await supabase
            .from('payments')
            .insert({
                tenant_id: validatedData.tenant_id,
                payment_date: validatedData.payment_date,
                amount: validatedData.amount,
                payment_method: validatedData.payment_method,
                payment_status: validatedData.payment_status,
                transaction_reference: validatedData.transaction_reference || null,
                receipt_url: receiptUrl,
                notes: validatedData.notes || null,
            })
            .select()
            .single()

        if (insertError) {
            // Cleanup uploaded receipt if insert failed
            if (receiptUrl) {
                const supabaseForDelete = await createServer()
                const urlParts = receiptUrl.split('/receipts/')
                if (urlParts.length >= 2) {
                    const filePath = `receipts/${urlParts[1]}`
                    await supabaseForDelete.storage
                        .from('payment-receipts')
                        .remove([filePath])
                        .catch(console.error)
                }
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
