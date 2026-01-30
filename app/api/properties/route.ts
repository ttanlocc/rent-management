/**
 * Properties API Route
 * GET /api/properties - List user's properties
 * POST /api/properties - Create a new property
 */

import { NextRequest } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import { createPropertySchema } from '@/lib/validations/property'
import {
    createSuccessResponse,
    handleZodError,
    handleSupabaseError,
    errors,
} from '@/lib/utils/api-error'
import { ZodError } from 'zod'

export async function GET() {
    try {
        const supabase = await createServer()

        // Check auth
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return errors.unauthorized()
        }

        // Get user's properties with room count
        const { data: properties, error } = await supabase
            .from('properties')
            .select(
                `
        *,
        rooms:rooms(count)
      `
            )
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            return handleSupabaseError(error)
        }

        // Transform the count
        const transformedProperties = (properties || []).map((p) => {
            const { rooms, ...rest } = p as { rooms?: { count: number }[] } & Record<string, unknown>
            return {
                ...rest,
                room_count: rooms?.[0]?.count || 0,
            }
        })

        return createSuccessResponse({
            properties: transformedProperties,
        })
    } catch (error) {
        console.error('GET /api/properties error:', error)
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
        const validatedData = createPropertySchema.parse(body)

        // Create property
        const insertData = {
            user_id: user.id,
            name: validatedData.name,
            address: validatedData.address ?? null,
            logo_url: validatedData.logo_url ?? null,
        }

        const { data: property, error: insertError } = await supabase
            .from('properties')
            .insert(insertData)
            .select()
            .single()

        if (insertError) {
            return handleSupabaseError(insertError)
        }

        return createSuccessResponse(property, 201)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        console.error('POST /api/properties error:', error)
        return errors.internal()
    }
}
