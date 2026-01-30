/**
 * Property validation schemas using Zod
 */

import { z } from 'zod'

// Create property schema
export const createPropertySchema = z.object({
    name: z
        .string()
        .min(1, 'Tên nhà trọ không được trống')
        .max(255, 'Tên nhà trọ tối đa 255 ký tự'),
    address: z.string().optional().nullable(),
    logo_url: z.string().url('Logo URL không hợp lệ').optional().nullable(),
})

// Update property schema
export const updatePropertySchema = z.object({
    name: z
        .string()
        .min(1, 'Tên nhà trọ không được trống')
        .max(255, 'Tên nhà trọ tối đa 255 ký tự')
        .optional(),
    address: z.string().optional().nullable(),
    logo_url: z.string().url('Logo URL không hợp lệ').optional().nullable(),
})

// Types inferred from schemas
export type CreatePropertyInput = z.infer<typeof createPropertySchema>
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>
