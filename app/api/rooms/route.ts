/**
 * Rooms API Route
 * GET /api/rooms - List rooms for current user's properties
 * POST /api/rooms - Create a new room
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { createRoomSchema, roomQuerySchema } from '@/lib/validations/room'
import {
    createSuccessResponse,
    handleZodError,
    handleSupabaseError,
    errors,
} from '@/lib/utils/api-error'
import { ZodError } from 'zod'

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
        const queryParams = roomQuerySchema.parse({
            property_id: searchParams.get('property_id') || undefined,
            status: searchParams.get('status') || undefined,
            search: searchParams.get('search') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 20,
        })

        // Build query
        let query = supabase
            .from('rooms')
            .select(
                `
        *,
        property:properties!inner(id, name, user_id)
      `,
                { count: 'exact' }
            )
            .eq('property.user_id', user.id)

        // Filter by property_id if provided
        if (queryParams.property_id) {
            query = query.eq('property_id', queryParams.property_id)
        }

        // Filter by status if provided
        if (queryParams.status) {
            query = query.eq('status', queryParams.status)
        }

        // Search by room name
        if (queryParams.search) {
            query = query.ilike('name', `%${queryParams.search}%`)
        }

        // Pagination
        const from = (queryParams.page - 1) * queryParams.limit
        const to = from + queryParams.limit - 1
        query = query.range(from, to).order('created_at', { ascending: false })

        const { data: rooms, error, count } = await query

        if (error) {
            return handleSupabaseError(error)
        }

        return createSuccessResponse({
            rooms: rooms || [],
            pagination: {
                page: queryParams.page,
                limit: queryParams.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / queryParams.limit),
            },
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('GET /api/rooms error:', error)
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

        // Parse and validate body
        const body = await request.json()
        const validatedData = createRoomSchema.parse(body)

        // Verify user owns the property
        const { data: property, error: propertyError } = await supabase
            .from('properties')
            .select('id')
            .eq('id', validatedData.property_id)
            .eq('user_id', user.id)
            .single()

        if (propertyError || !property) {
            return errors.forbidden()
        }

        // Check for duplicate room name in the same property
        const { data: existingRoom } = await supabase
            .from('rooms')
            .select('id')
            .eq('property_id', validatedData.property_id)
            .eq('name', validatedData.name)
            .single()

        if (existingRoom) {
            return errors.conflict('Tên phòng đã tồn tại trong nhà trọ này')
        }

        // Create room
        const insertData = {
            property_id: validatedData.property_id,
            name: validatedData.name,
            floor: validatedData.floor,
            area: validatedData.area ?? null,
            base_rent: validatedData.base_rent,
            status: validatedData.status,
        }

        const { data: room, error: insertError } = await supabase
            .from('rooms')
            .insert(insertData)
            .select()
            .single()

        if (insertError) {
            return handleSupabaseError(insertError)
        }

        return createSuccessResponse(room, 201)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('POST /api/rooms error:', error)
        return errors.internal()
    }
}
