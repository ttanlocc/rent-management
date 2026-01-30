/**
 * Tenants API Route
 * GET /api/tenants - List tenants with filtering
 * POST /api/tenants - Create a new tenant
 */

import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { createTenantSchema, tenantQuerySchema } from '@/lib/validations/tenant'
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
        const queryParams = {
            room_id: searchParams.get('room_id') || undefined,
            is_active: searchParams.get('is_active') || undefined,
            search: searchParams.get('search') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 20,
        }

        const validatedParams = tenantQuerySchema.parse(queryParams)
        const { page, limit, room_id, is_active, search } = validatedParams

        // Build query
        // Note: We need to filter tenants belonging to rooms owned by the user (or tenants directly linked to user if we had a user_id on tenants table, but we link via rooms -> properties -> user)
        // However, since we might have tenants not assigned to rooms yet (unlikely in this model but possible), or we want to simplify RLS.
        // Let's assume RLS handles visibility.
        // But for optimization, we can filter by room's property's user_id if needed, but standard RLS is safer.

        let query = supabase
            .from('tenants')
            .select(
                `
                *,
                room:rooms(id, name, property:properties(name))
            `,
                { count: 'exact' }
            )

        // Apply filters
        if (room_id) {
            query = query.eq('room_id', room_id)
        }

        if (is_active) {
            query = query.eq('is_active', is_active === 'true')
        }

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
        }

        // RLS will ensure we only see tenants for rooms we own, BUT
        // tenants table doesn't have user_id directly. It has room_id.
        // So RLS policy must check `room_id -> property -> user_id = auth.uid()`.
        // If a tenant has NO room_id, they might be "orphaned" or filtering is harder.
        // For MVP, assume tenants are always linked to a room OR we need a way to filter properties.
        // If the tenant is not in a room, we might not see them via room relation.
        // Let's rely on the Supabase RLS policies you should have set up.

        // Pagination
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to).order('created_at', { ascending: false })

        const { data: tenants, error, count } = await query

        if (error) {
            return handleSupabaseError(error)
        }

        return createSuccessResponse({
            tenants,
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
        console.error('GET /api/tenants error:', error)
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

        // Parse body
        const body = await request.json()
        const validatedData = createTenantSchema.parse(body)

        // Verify room ownership if room_id is provided
        if (validatedData.room_id) {
            const { data: room, error: roomError } = await supabase
                .from('rooms')
                .select('id, property:properties(user_id)')
                .eq('id', validatedData.room_id)
                .single()

            if (roomError || !room) {
                return errors.notFound('Phòng')
            }

            // Check if user owns the property of this room
            // Cast to any because the relationship type might be tricky if not generated perfectly or if deep nested
            const property = (room as any).property

            if (!property || property.user_id !== user.id) {
                return errors.forbidden('Bạn không có quyền thêm người vào phòng này')
            }
        }

        // Create tenant
        const insertData = {
            full_name: validatedData.full_name,
            phone: validatedData.phone ?? null,
            email: validatedData.email ?? null,
            id_card: validatedData.id_card ?? null,
            room_id: validatedData.room_id ?? null,
            move_in_date: validatedData.move_in_date ?? new Date().toISOString(),
            is_active: validatedData.is_active,
        }

        const { data: tenant, error: insertError } = await supabase
            .from('tenants')
            .insert(insertData)
            .select()
            .single()

        if (insertError) {
            return handleSupabaseError(insertError)
        }

        // Update room status to occupied if room_id provided and tenant is active
        if (validatedData.room_id && validatedData.is_active) {
            await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('id', validatedData.room_id)
        }

        return createSuccessResponse(tenant, 201)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('POST /api/tenants error:', error)
        return errors.internal()
    }
}
