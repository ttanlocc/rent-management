/**
 * Tenant Detail API Route
 * GET /api/tenants/[id] - Get tenant details
 * PUT /api/tenants/[id] - Update tenant info
 * DELETE /api/tenants/[id] - Delete tenant
 */

import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { updateTenantSchema } from '@/lib/validations/tenant'
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

        // Get tenant details
        // Note: RLS must ensure we only access tenants related to properties owned by user.
        // Assuming tenants are linked to rooms.
        const { data: tenant, error } = await supabase
            .from('tenants')
            .select(
                `
        *,
        room:rooms(
          id, 
          name, 
          base_rent,
          property:properties(id, name, user_id)
        )
      `
            )
            .eq('id', id)
            .single()

        if (error) {
            return handleSupabaseError(error)
        }

        if (!tenant) {
            return errors.notFound('Người thuê')
        }

        // Manual check for ownership if RLS allows reading all tenants but we want to restrict
        // Or if the deep relationship check is needed.
        // Ideally RLS handles this, but let's double check via room->property->user
        const room = (tenant as any).room
        if (room && room.property && room.property.user_id !== user.id) {
            return errors.forbidden()
        }

        return createSuccessResponse(tenant)
    } catch (error) {
        console.error('GET /api/tenants/[id] error:', error)
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
        const validatedData = updateTenantSchema.parse(body)

        // Get existing tenant to check current room and status
        const { data: existingTenant, error: fetchError } = await supabase
            .from('tenants')
            .select('*, room:rooms(property:properties(user_id))')
            .eq('id', id)
            .single()

        if (fetchError || !existingTenant) {
            return errors.notFound('Người thuê')
        }

        // Check ownership
        const currentRoom = (existingTenant as any).room
        // If tenant is in a room, check that room's property owner
        if (currentRoom && currentRoom.property && currentRoom.property.user_id !== user.id) {
            return errors.forbidden('Bạn không có quyền sửa người thuê này')
        }

        // If assigning to a NEW room, verify that new room belongs to user
        if (validatedData.room_id && validatedData.room_id !== existingTenant.room_id) {
            const { data: newRoom } = await supabase
                .from('rooms')
                .select('property:properties(user_id)')
                .eq('id', validatedData.room_id)
                .single()

            const newRoomUserId = (newRoom as any)?.property?.user_id
            if (!newRoom || newRoomUserId !== user.id) {
                return errors.forbidden('Bạn không thể chuyển người thuê sang phòng không thuộc quyền quản lý')
            }
        }

        // Update tenant
        const updateData = {
            ...validatedData,
            updated_at: new Date().toISOString(),
        }

        const { data: updatedTenant, error: updateError } = await supabase
            .from('tenants')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return handleSupabaseError(updateError)
        }

        // Logic for Room Status Updates
        // 1. If moving OUT (active -> inactive) OR removing from room (room_id null)
        // Check old room. If no active tenants left, set to 'vacant'
        const isMovingOut =
            (existingTenant.is_active && validatedData.is_active === false) ||
            (existingTenant.room_id && !validatedData.room_id)

        if ((isMovingOut || (validatedData.room_id && validatedData.room_id !== existingTenant.room_id)) && existingTenant.room_id) {
            // Check remaining active tenants in OLD room
            const { count } = await supabase
                .from('tenants')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', existingTenant.room_id)
                .eq('is_active', true)
                .neq('id', id) // Exclude self if we are still active but just moved rooms

            if (count === 0) {
                await supabase
                    .from('rooms')
                    .update({ status: 'vacant' })
                    .eq('id', existingTenant.room_id)
            }
        }

        // 2. If moving IN (inactive -> active) OR assigning to new room
        // Set NEW room to 'occupied'
        if (
            (validatedData.is_active || (validatedData.is_active === undefined && existingTenant.is_active)) &&
            validatedData.room_id
        ) {
            await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('id', validatedData.room_id)
        }

        return createSuccessResponse(updatedTenant)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('PUT /api/tenants/[id] error:', error)
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

        // Verify existence and ownership
        const { data: tenant, error: fetchError } = await supabase
            .from('tenants')
            .select('room_id, room:rooms(property:properties(user_id))')
            .eq('id', id)
            .single()

        if (fetchError || !tenant) {
            return errors.notFound('Người thuê')
        }

        const room = (tenant as any).room
        if (room && room.property && room.property.user_id !== user.id) {
            return errors.forbidden('Bạn không có quyền xóa người thuê này')
        }

        // Delete tenant
        const { error: deleteError } = await supabase
            .from('tenants')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return handleSupabaseError(deleteError)
        }

        // Check if we need to update room status (vacant)
        if (tenant.room_id) {
            const { count } = await supabase
                .from('tenants')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', tenant.room_id)
                .eq('is_active', true)

            if (count === 0) {
                await supabase
                    .from('rooms')
                    .update({ status: 'vacant' })
                    .eq('id', tenant.room_id)
            }
        }

        return createSuccessResponse({ deleted: true })
    } catch (error) {
        console.error('DELETE /api/tenants/[id] error:', error)
        return errors.internal()
    }
}
