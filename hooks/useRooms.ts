/**
 * TanStack Query hooks for Rooms
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Room, RoomWithTenant } from '@/lib/types/database'
import { RoomFormInput, UpdateRoomInput } from '@/lib/validations/room'
import { toast } from 'sonner'

// API Response types
interface RoomsResponse {
    data: {
        rooms: RoomWithTenant[]
        pagination: {
            page: number
            limit: number
            total: number
            totalPages: number
        }
    }
}

interface RoomResponse {
    data: Room
}

interface QueryParams {
    property_id?: string
    status?: 'vacant' | 'occupied'
    search?: string
    page?: number
    limit?: number
}

// Query key factory
export const roomKeys = {
    all: ['rooms'] as const,
    lists: () => [...roomKeys.all, 'list'] as const,
    list: (params: QueryParams) => [...roomKeys.lists(), params] as const,
    details: () => [...roomKeys.all, 'detail'] as const,
    detail: (id: string) => [...roomKeys.details(), id] as const,
}

// Fetch rooms list
async function fetchRooms(params: QueryParams): Promise<RoomsResponse> {
    const searchParams = new URLSearchParams()

    if (params.property_id) searchParams.set('property_id', params.property_id)
    if (params.status) searchParams.set('status', params.status)
    if (params.search) searchParams.set('search', params.search)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/rooms?${searchParams.toString()}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải danh sách phòng')
    }

    return response.json()
}

// Fetch single room
async function fetchRoom(id: string): Promise<RoomResponse> {
    const response = await fetch(`/api/rooms/${id}`)

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tải thông tin phòng')
    }

    return response.json()
}

// Create room
async function createRoom(data: RoomFormInput): Promise<RoomResponse> {
    const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể tạo phòng')
    }

    return response.json()
}

// Update room
async function updateRoom({
    id,
    data,
}: {
    id: string
    data: UpdateRoomInput
}): Promise<RoomResponse> {
    const response = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể cập nhật phòng')
    }

    return response.json()
}

// Delete room
async function deleteRoom(id: string): Promise<void> {
    const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Không thể xóa phòng')
    }
}

// ============================================
// Hooks
// ============================================

export function useRooms(params: QueryParams = {}) {
    return useQuery({
        queryKey: roomKeys.list(params),
        queryFn: () => fetchRooms(params),
    })
}

export function useRoom(id: string) {
    return useQuery({
        queryKey: roomKeys.detail(id),
        queryFn: () => fetchRoom(id),
        enabled: !!id,
    })
}

export function useCreateRoom() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
            toast.success('Tạo phòng thành công!')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

export function useUpdateRoom() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateRoom,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
            queryClient.invalidateQueries({ queryKey: roomKeys.detail(variables.id) })
            toast.success('Cập nhật phòng thành công!')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}

export function useDeleteRoom() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
            toast.success('Xóa phòng thành công!')
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })
}
