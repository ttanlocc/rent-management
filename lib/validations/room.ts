/**
 * Room validation schemas using Zod
 * Based on TRD Section 4.5 and database schema
 */

import { z } from 'zod'

// Room status enum
export const roomStatusSchema = z.enum(['vacant', 'occupied'])

// Create room schema (used for API validation)
export const createRoomSchema = z.object({
    property_id: z.string().uuid('Property ID không hợp lệ'),
    name: z
        .string()
        .min(1, 'Tên phòng không được trống')
        .max(100, 'Tên phòng tối đa 100 ký tự'),
    floor: z
        .number()
        .int('Tầng phải là số nguyên')
        .min(1, 'Tầng phải >= 1')
        .default(1),
    area: z
        .number()
        .positive('Diện tích phải > 0')
        .optional()
        .nullable(),
    base_rent: z
        .number()
        .positive('Giá thuê phải > 0'),
    status: roomStatusSchema.default('vacant'),
})

// Form schema (without defaults for react-hook-form compatibility)
export const roomFormSchema = z.object({
    property_id: z.string().uuid('Property ID không hợp lệ'),
    name: z
        .string()
        .min(1, 'Tên phòng không được trống')
        .max(100, 'Tên phòng tối đa 100 ký tự'),
    floor: z
        .number()
        .int('Tầng phải là số nguyên')
        .min(1, 'Tầng phải >= 1'),
    area: z
        .number()
        .positive('Diện tích phải > 0')
        .optional()
        .nullable(),
    base_rent: z
        .number()
        .positive('Giá thuê phải > 0'),
    status: roomStatusSchema,
})

// Update room schema (all fields optional except id)
export const updateRoomSchema = z.object({
    name: z
        .string()
        .min(1, 'Tên phòng không được trống')
        .max(100, 'Tên phòng tối đa 100 ký tự')
        .optional(),
    floor: z
        .number()
        .int('Tầng phải là số nguyên')
        .min(1, 'Tầng phải >= 1')
        .optional(),
    area: z
        .number()
        .positive('Diện tích phải > 0')
        .optional()
        .nullable(),
    base_rent: z
        .number()
        .positive('Giá thuê phải > 0')
        .optional(),
    status: roomStatusSchema.optional(),
})

// Types inferred from schemas
export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type RoomFormInput = z.infer<typeof roomFormSchema>
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>

// Query params schema for listing rooms
export const roomQuerySchema = z.object({
    property_id: z.string().uuid().optional(),
    status: roomStatusSchema.optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type RoomQueryParams = z.infer<typeof roomQuerySchema>

