/**
 * Tenant validation schemas using Zod
 * Based on database schema for tenants table
 */

import { z } from 'zod'

// Create tenant schema
export const createTenantSchema = z.object({
    full_name: z
        .string()
        .min(1, 'Tên người thuê không được trống')
        .max(100, 'Tên người thuê tối đa 100 ký tự'),
    phone: z
        .string()
        .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ')
        .nullable()
        .optional(),
    email: z.string().email('Email không hợp lệ').nullable().optional(),
    id_card: z.string().nullable().optional(),
    room_id: z.string().uuid('Room ID không hợp lệ').nullable().optional(),
    move_in_date: z.string().datetime().optional(), // ISO string
    is_active: z.boolean().default(true),
})

// Update tenant schema
export const updateTenantSchema = z.object({
    full_name: z
        .string()
        .min(1, 'Tên người thuê không được trống')
        .max(100, 'Tên người thuê tối đa 100 ký tự')
        .optional(),
    phone: z
        .string()
        .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ')
        .nullable()
        .optional(),
    email: z.string().email('Email không hợp lệ').nullable().optional(),
    id_card: z.string().nullable().optional(),
    room_id: z.string().uuid('Room ID không hợp lệ').nullable().optional(),
    move_in_date: z.string().datetime().optional(),
    move_out_date: z.string().datetime().nullable().optional(),
    is_active: z.boolean().optional(),
})

// Tenant Form Schema (without defaults)
export const tenantFormSchema = z.object({
    full_name: z
        .string()
        .min(1, 'Tên người thuê không được trống')
        .max(100, 'Tên người thuê tối đa 100 ký tự'),
    phone: z
        .string()
        .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ')
        .nullable()
        .optional()
        .or(z.literal('')),
    email: z.string().email('Email không hợp lệ').nullable().optional().or(z.literal('')),
    id_card: z.string().nullable().optional().or(z.literal('')),
    room_id: z.string().uuid('Room ID không hợp lệ').nullable().optional(),
    move_in_date: z.date().optional(), // Form usually uses Date object
    is_active: z.boolean(),
})

// Query params schema
export const tenantQuerySchema = z.object({
    room_id: z.string().uuid().optional(),
    is_active: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

// Types
export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
export type TenantFormInput = z.infer<typeof tenantFormSchema>
export type TenantQueryParams = z.infer<typeof tenantQuerySchema>
