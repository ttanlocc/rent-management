/**
 * TanStack Query hooks for Properties
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Property } from '@/lib/types/database'
import { CreatePropertyInput } from '@/lib/validations/property'
import { toast } from 'sonner'

// Extended property type with room count
interface PropertyWithCount extends Property {
    room_count: number
}

// API Response types
interface PropertiesResponse {
    data: {
        properties: PropertyWithCount[]
    }
}

interface PropertyResponse {
    data: Property
}

// Query key factory
export const propertyKeys = {
    all: ['properties'] as const,
    lists: () => [...propertyKeys.all, 'list'] as const,
    list: () => [...propertyKeys.lists()] as const,
    details: () => [...propertyKeys.all, 'detail'] as const,
    detail: (id: string) => [...propertyKeys.details(), id] as const,
}

// Fetch properties list
async function fetchProperties(): Promise<PropertiesResponse> {
    const response = await fetch('/api/properties')

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải danh sách nhà trọ')
    }

    return response.json()
}

// Create property
async function createProperty(data: CreatePropertyInput): Promise<PropertyResponse> {
    const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tạo nhà trọ')
    }

    return response.json()
}

// ============================================
// Hooks
// ============================================

export function useProperties() {
    return useQuery({
        queryKey: propertyKeys.list(),
        queryFn: fetchProperties,
    })
}

export function useCreateProperty() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProperty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
            toast.success('Tạo nhà trọ thành công!')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
