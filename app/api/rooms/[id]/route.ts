/**
 * Room Detail API Route
 * GET /api/rooms/[id] - Get room details
 * PUT /api/rooms/[id] - Update room
 * DELETE /api/rooms/[id] - Delete room
 */

import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { updateRoomSchema } from '@/lib/validations/room'
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

        // Get room with property info (RLS will filter by user)
        const { data: room, error } = await supabase
            .from('rooms')
            .select(
                `
        *,
        property:properties!inner(id, name, address, user_id),
        tenant:tenants(id, full_name, phone, is_active)
      `
            )
            .eq('id', id)
            .eq('property.user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return errors.notFound('Phòng')
            }
            return handleSupabaseError(error)
        }

        return createSuccessResponse(room)
    } catch (error) {
        console.error('GET /api/rooms/[id] error:', error)
        return errors.internal()
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

        // Parse and validate body
        const body = await request.json()
        const validatedData = updateRoomSchema.parse(body)

        // Verify room exists and user owns it
        const { data: existingRoom, error: fetchError } = await supabase
            .from('rooms')
            .select(
                `
        id,
        property_id,
        property:properties!inner(user_id)
      `
            )
            .eq('id', id)
            .eq('property.user_id', user.id)
            .single()

        if (fetchError || !existingRoom) {
            return errors.notFound('Phòng')
        }

        // Check for duplicate name if name is being updated
        if (validatedData.name) {
            // Cast existingRoom to access property_id
            const roomPropertyId = (existingRoom as { property_id: string }).property_id

            const { data: duplicateRoom } = await supabase
                .from('rooms')
                .select('id')
                .eq('property_id', roomPropertyId)
                .eq('name', validatedData.name)
                .neq('id', id)
                .single()

            if (duplicateRoom) {
                return errors.conflict('Tên phòng đã tồn tại trong nhà trọ này')
            }
        }

        // Update room
        const updateData = {
            ...validatedData,
            updated_at: new Date().toISOString(),
        }

        const { data: room, error: updateError } = await supabase
            .from('rooms')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return handleSupabaseError(updateError)
        }

        return createSuccessResponse(room)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('PUT /api/rooms/[id] error:', error)
        return errors.internal()
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

        // Verify room exists and user owns it
        const { data: room, error: fetchError } = await supabase
            .from('rooms')
            .select(
                `
        id,
        status,
        property:properties!inner(user_id)
      `
            )
            .eq('id', id)
            .eq('property.user_id', user.id)
            .single()

        if (fetchError || !room) {
            return errors.notFound('Phòng')
        }

        // Cannot delete occupied room
        if (room.status === 'occupied') {
            return errors.validation('Không thể xóa phòng đang có người thuê', {
                status: ['Phòng đang có trạng thái "occupied"'],
            })
        }

        // Check for existing tenants (even if room status is vacant, there might be active tenants)
        const { data: activeTenants } = await supabase
            .from('tenants')
            .select('id')
            .eq('room_id', id)
            .eq('is_active', true)
            .limit(1)

        if (activeTenants && activeTenants.length > 0) {
            return errors.validation('Không thể xóa phòng đang có người thuê', {
                tenants: ['Phòng còn người thuê đang hoạt động'],
            })
        }

        // Delete room
        const { error: deleteError } = await supabase
            .from('rooms')
            .delete()
            .eq('id', id)

        if (deleteError) {
            return handleSupabaseError(deleteError)
        }

        return createSuccessResponse({ deleted: true })
    } catch (error) {
        console.error('DELETE /api/rooms/[id] error:', error)
        return errors.internal()
    }
}
