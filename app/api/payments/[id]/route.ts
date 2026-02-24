/**
 * Payment Detail API Route
 * GET /api/payments/[id] - Get payment details
 * PUT /api/payments/[id] - Update payment info
 * DELETE /api/payments/[id] - Delete payment
 */

import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { updatePaymentSchema } from '@/lib/validations/payment'
import {
    createSuccessResponse,
    handleZodError,
    handleSupabaseError,
    errors,
} from '@/lib/utils/api-error'
import { ZodError } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createServer()
        const { id } = await params

        // Check auth
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return errors.unauthorized()
        }

        // Get payment details with tenant relation
        const { data: payment, error } = await supabase
            .from('payments')
            .select(
                `
                *,
                tenant:tenants(
                    id,
                    full_name,
                    room:rooms(
                        id,
                        name,
                        property:properties(id, name, user_id)
                    )
                )
            `
            )
            .eq('id', id)
            .single()

        if (error) {
            return handleSupabaseError(error)
        }

        if (!payment) {
            return errors.notFound('Thanh toán')
        }

        // Check ownership via tenant -> room -> property -> user_id
        const tenant = (payment as any).tenant
        if (!tenant || !tenant.room || !tenant.room.property || tenant.room.property.user_id !== user.id) {
            return errors.forbidden()
        }

        return createSuccessResponse(payment)
    } catch (error) {
        console.error('GET /api/payments/[id] error:', error)
        return errors.internal()
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createServer()
        const { id } = await params

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return errors.unauthorized()
        }

        const body = await request.json()
        const validatedData = updatePaymentSchema.parse(body)

        // Get existing payment to check ownership
        const { data: existingPayment, error: fetchError } = await supabase
            .from('payments')
            .select('*, tenant:tenants(room:rooms(property:properties(user_id)))')
            .eq('id', id)
            .single()

        if (fetchError || !existingPayment) {
            return errors.notFound('Thanh toán')
        }

        // Check ownership
        const tenant = (existingPayment as any).tenant
        if (!tenant || !tenant.room || !tenant.room.property || tenant.room.property.user_id !== user.id) {
            return errors.forbidden('Bạn không có quyền sửa thanh toán này')
        }

        // Update payment
        const { data: updatedPayment, error: updateError } = await supabase
            .from('payments')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return handleSupabaseError(updateError)
        }

        return createSuccessResponse(updatedPayment)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('PUT /api/payments/[id] error:', error)
        return errors.internal()
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const supabase = await createServer()
        const { id } = await params

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return errors.unauthorized()
        }

        // Verify existence and ownership, get receipt_url for cleanup
        const { data: payment, error: fetchError } = await supabase
            .from('payments')
            .select('receipt_url, tenant:tenants(room:rooms(property:properties(user_id)))')
            .eq('id', id)
            .single()

        if (fetchError || !payment) {
            return errors.notFound('Thanh toán')
        }

        const tenant = (payment as any).tenant
        if (!tenant || !tenant.room || !tenant.room.property || tenant.room.property.user_id !== user.id) {
            return errors.forbidden('Bạn không có quyền xóa thanh toán này')
        }

        // Delete receipt from storage if exists
        if (payment.receipt_url) {
            const urlParts = payment.receipt_url.split('/receipts/')
            if (urlParts.length >= 2) {
                const filePath = `receipts/${urlParts[1]}`
                await supabase.storage
                    .from('payment-receipts')
                    .remove([filePath])
                    .catch(console.error) // Don't fail the delete if storage cleanup fails
            }
        }

        // Delete payment record
        const { error: deleteError } = await supabase
            .from('payments')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return handleSupabaseError(deleteError)
        }

        return createSuccessResponse({ deleted: true })
    } catch (error) {
        console.error('DELETE /api/payments/[id] error:', error)
        return errors.internal()
    }
}
