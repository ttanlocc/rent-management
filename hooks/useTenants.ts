/**
 * TanStack Query hooks for Tenants
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TenantFormInput, UpdateTenantInput } from '@/lib/validations/tenant'
import { toast } from 'sonner'

// Type for Tenant from DB
// TODO: Generate this automatically from database.ts, but for now defining it to match return shape
interface Tenant {
    id: string
    full_name: string
    phone: string | null
    email: string | null
    id_card: string | null
    room_id: string | null
    move_in_date: string | null
    move_out_date: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    // Expanded relations
    room?: {
        id: string
        name: string
        property?: {
            name: string
        }
    } | null
}

interface TenantsResponse {
    data: {
        tenants: Tenant[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
        }
    }
}

interface TenantResponse {
    data: Tenant
}

interface QueryParams {
    room_id?: string
    is_active?: string
    search?: string
    page?: number
    limit?: number
}

// Query key factory
export const tenantKeys = {
    all: ['tenants'] as const,
    lists: () => [...tenantKeys.all, 'list'] as const,
    list: (params: QueryParams) => [...tenantKeys.lists(), params] as const,
    details: () => [...tenantKeys.all, 'detail'] as const,
    detail: (id: string) => [...tenantKeys.details(), id] as const,
}

// API Functions
async function fetchTenants(params: QueryParams): Promise<TenantsResponse> {
    const searchParams = new URLSearchParams()
    if (params.room_id) searchParams.set('room_id', params.room_id)
    if (params.is_active) searchParams.set('is_active', params.is_active)
    if (params.search) searchParams.set('search', params.search)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/tenants?${searchParams.toString()}`)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải danh sách người thuê')
    }
    return response.json()
}

async function fetchTenant(id: string): Promise<TenantResponse> {
    const response = await fetch(`/api/tenants/${id}`)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải thông tin người thuê')
    }
    return response.json()
}

async function createTenant(data: TenantFormInput): Promise<TenantResponse> {
    const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể thêm người thuê')
    }
    return response.json()
}

async function updateTenant({ id, data }: { id: string; data: UpdateTenantInput }): Promise<TenantResponse> {
    const response = await fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể cập nhật người thuê')
    }
    return response.json()
}

async function deleteTenant(id: string): Promise<void> {
    const response = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể xóa người thuê')
    }
}

// Hooks
export function useTenants(params: QueryParams = {}) {
    return useQuery({
        queryKey: tenantKeys.list(params),
        queryFn: () => fetchTenants(params),
    })
}

export function useTenant(id: string) {
    return useQuery({
        queryKey: tenantKeys.detail(id),
        queryFn: () => fetchTenant(id),
        enabled: !!id,
    })
}

export function useCreateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: createTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['rooms'] }) // Refresh rooms as status may change
            toast.success('Thêm người thuê thành công!')
        },
        onError: (error: Error) => toast.error(error.message),
    })
}

export function useUpdateTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateTenant,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
            queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: ['rooms'] }) // Refresh rooms
            toast.success('Cập nhật người thuê thành công!')
        },
        onError: (error: Error) => toast.error(error.message),
    })
}

export function useDeleteTenant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: deleteTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
            queryClient.invalidateQueries({ queryKey: ['rooms'] }) // Refresh rooms
            toast.success('Xóa người thuê thành công!')
        },
        onError: (error: Error) => toast.error(error.message),
    })
}
